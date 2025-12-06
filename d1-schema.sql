-- Luxe Hotel Database Schema for Cloudflare D1 (SQLite)
-- Migrated from Supabase PostgreSQL

-- ============================================
-- ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL,
    size TEXT NOT NULL,
    bed_type TEXT NOT NULL,
    amenities TEXT NOT NULL DEFAULT '[]', -- JSON array stored as TEXT
    image_url TEXT,
    available BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    CHECK (price > 0),
    CHECK (capacity > 0)
);

-- ============================================
-- GUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    country TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    total_nights INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    special_requests TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    CHECK (check_out_date > check_in_date),
    CHECK (number_of_guests > 0),
    CHECK (total_nights > 0),
    CHECK (total_price > 0)
);

CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================
-- PET CARE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pet_care_requests (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    pet_type TEXT NOT NULL,
    pet_name TEXT NOT NULL,
    pet_weight DECIMAL(5, 2),
    pet_age INTEGER,
    service_type TEXT NOT NULL CHECK (service_type IN ('sitting', 'walking', 'grooming', 'daycare', 'overnight')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    special_requirements TEXT,
    vaccination_records_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
    total_price DECIMAL(10, 2),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_pet_care_booking_id ON pet_care_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_pet_care_status ON pet_care_requests(status);
CREATE INDEX IF NOT EXISTS idx_pet_care_dates ON pet_care_requests(start_date, end_date);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    response TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ============================================
-- USERS/AUTH TABLE (For JWT-based auth)
-- ============================================
CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_admin BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

-- ============================================
-- SESSIONS TABLE (For JWT token management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================

-- SQLite trigger for rooms
CREATE TRIGGER IF NOT EXISTS update_rooms_updated_at 
AFTER UPDATE ON rooms
FOR EACH ROW
BEGIN
  UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for guests
CREATE TRIGGER IF NOT EXISTS update_guests_updated_at 
AFTER UPDATE ON guests
FOR EACH ROW
BEGIN
  UPDATE guests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for bookings
CREATE TRIGGER IF NOT EXISTS update_bookings_updated_at 
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for contact_messages
CREATE TRIGGER IF NOT EXISTS update_contact_messages_updated_at 
AFTER UPDATE ON contact_messages
FOR EACH ROW
BEGIN
  UPDATE contact_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for pet_care_requests
CREATE TRIGGER IF NOT EXISTS update_pet_care_requests_updated_at 
AFTER UPDATE ON pet_care_requests
FOR EACH ROW
BEGIN
  UPDATE pet_care_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for reviews
CREATE TRIGGER IF NOT EXISTS update_reviews_updated_at 
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SQLite trigger for auth_users
CREATE TRIGGER IF NOT EXISTS update_auth_users_updated_at 
AFTER UPDATE ON auth_users
FOR EACH ROW
BEGIN
  UPDATE auth_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for booking details with guest and room information
CREATE VIEW IF NOT EXISTS booking_details AS
SELECT 
    b.id as booking_id,
    b.check_in_date,
    b.check_out_date,
    b.number_of_guests,
    b.total_nights,
    b.total_price,
    b.status as booking_status,
    b.special_requests,
    b.created_at as booked_at,
    g.id as guest_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.address,
    r.id as room_id,
    r.name as room_name,
    r.price as room_price_per_night,
    r.capacity as room_capacity,
    r.size as room_size,
    r.bed_type
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN rooms r ON b.room_id = r.id;

-- View for room availability summary
CREATE VIEW IF NOT EXISTS room_availability_summary AS
SELECT 
    r.id as room_id,
    r.name as room_name,
    r.price,
    r.capacity,
    r.available,
    COUNT(CASE WHEN b.status NOT IN ('cancelled', 'checked_out') 
          AND b.check_out_date >= DATE('now') THEN 1 END) as active_bookings,
    MAX(CASE WHEN b.status NOT IN ('cancelled', 'checked_out') 
          AND b.check_out_date >= DATE('now') THEN b.check_out_date END) as next_available_date
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id
GROUP BY r.id, r.name, r.price, r.capacity, r.available;

-- ============================================
-- INITIAL ROOM DATA
-- ============================================
INSERT OR IGNORE INTO rooms (id, name, description, price, capacity, size, bed_type, amenities, image_url, available) VALUES
(1, 'Presidential Suite', 'Indulge in the ultimate luxury experience with our Presidential Suite featuring panoramic city views, separate living area, and premium amenities.', 899.00, 4, '1,200 sq ft', 'King Bed', '["Free Wi-Fi", "Valet Parking", "Coffee Maker", "Room Service", "Mini Bar", "City View"]', '/assets/suite-room.jpg', 1),
(2, 'Deluxe Room', 'Spacious and elegantly appointed with modern amenities, perfect for business travelers and couples seeking comfort and style.', 399.00, 2, '450 sq ft', 'Queen Bed', '["Free Wi-Fi", "Coffee Maker", "Room Service", "Work Desk"]', '/assets/deluxe-room.jpg', 1),
(3, 'Standard Room', 'Comfortable and stylish accommodation with all essential amenities for a pleasant stay at an excellent value.', 249.00, 2, '300 sq ft', 'Double Bed', '["Free Wi-Fi", "Coffee Maker", "Daily Housekeeping"]', '/assets/standard-room.jpg', 1),
(4, 'Family Suite', 'Perfect for families with spacious layout, multiple bedrooms, and family-friendly amenities.', 549.00, 6, '800 sq ft', 'Two Queen Beds + Sofa Bed', '["Free Wi-Fi", "Kitchen", "Family Activities", "Game Room Access"]', '/assets/family-suite.jpg', 1),
(5, 'Ocean View Room', 'Breathtaking ocean views with balcony access and premium beach amenities.', 599.00, 2, '500 sq ft', 'King Bed', '["Free Wi-Fi", "Ocean View", "Balcony", "Beach Access", "Telescope"]', '/assets/ocean-view.jpg', 1),
(6, 'Garden Cottage', 'Intimate cottage with private garden and outdoor seating.', 449.00, 2, '400 sq ft', 'Queen Bed', '["Free Wi-Fi", "Private Garden", "Outdoor Seating", "Nature View"]', '/assets/garden-cottage.jpg', 1),
(7, 'Business Class Room', 'Designed for corporate travelers with high-speed Wi-Fi, work desk, and meeting facilities.', 359.00, 2, '420 sq ft', 'Queen Bed', '["High-Speed Wi-Fi", "Executive Desk", "Conference Phone", "Business Center"]', '/assets/business-room.jpg', 1),
(8, 'Luxury Penthouse', 'Top-floor luxury with 360-degree views, private elevator, and exclusive amenities.', 1299.00, 4, '1,600 sq ft', 'Two King Beds', '["Private Elevator", "360° Views", "Jacuzzi", "Chef Kitchen", "Smart Home"]', '/assets/penthouse.jpg', 1),
(9, 'Honeymoon Suite', 'Romance-filled suite with canopy bed, jacuzzi, and sunset views - perfect for special occasions.', 749.00, 2, '600 sq ft', 'King Bed', '["Canopy Bed", "Jacuzzi", "Sunset View", "Champagne Service", "Romantic Setup"]', '/assets/honeymoon-suite.jpg', 1);
