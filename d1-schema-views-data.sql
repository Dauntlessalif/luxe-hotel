-- Views and Initial Data

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
