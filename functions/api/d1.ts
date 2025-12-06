/**
 * D1 Database Wrapper for Luxe Hotel
 * Provides type-safe database operations for Cloudflare D1
 * Replaces Supabase client functionality
 */

import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: string;
  bed_type: string;
  amenities: string[];
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  room_id: number;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_nights: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingDetails extends Booking {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  room_id: number;
  room_name: string;
  room_price_per_night: number;
  room_capacity: number;
  room_size: string;
  bed_type: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface PetCareRequest {
  id: string;
  booking_id?: string;
  guest_name: string;
  email: string;
  phone: string;
  pet_type: string;
  pet_name: string;
  pet_weight?: number;
  pet_age?: number;
  service_type: 'sitting' | 'walking' | 'grooming' | 'daycare' | 'overnight';
  start_date: string;
  end_date: string;
  special_requirements?: string;
  vaccination_records_url?: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  total_price?: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  guest_id: string;
  room_id: number;
  rating: number;
  title?: string;
  comment: string;
  response?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

// D1 Client Interface
interface D1Database {
  prepare(sql: string): D1Statement;
}

interface D1Statement {
  bind(...params: any[]): D1Statement;
  first<T = any>(column?: string): Promise<T | null>;
  all<T = any>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<void>>;
}

interface D1Result<T> {
  success: boolean;
  results?: T[];
  error?: string;
  meta?: {
    duration: number;
    served_by: string;
    internal_stats?: string;
  };
}

// Global D1 instance (will be injected by Cloudflare Workers)
let db: D1Database;

export function setD1Database(database: D1Database) {
  db = database;
}

export function getD1Database() {
  return db;
}

// ============================================
// ROOMS API
// ============================================

export async function getAllRooms(): Promise<Room[]> {
  const result = await db.prepare('SELECT * FROM rooms ORDER BY price ASC').all<Room>();
  return (result.results || []).map(room => ({
    ...room,
    amenities: typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities,
  }));
}

export async function getRoomById(id: number): Promise<Room | null> {
  const result = await db.prepare('SELECT * FROM rooms WHERE id = ?1').bind(id).first<Room>();
  if (result && typeof result.amenities === 'string') {
    result.amenities = JSON.parse(result.amenities);
  }
  return result || null;
}

export async function createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
  const amenitiesJson = typeof room.amenities === 'string' ? room.amenities : JSON.stringify(room.amenities);
  const now = new Date().toISOString();
  
  const result = await db
    .prepare(
      `INSERT INTO rooms (name, description, price, capacity, size, bed_type, amenities, image_url, available, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
    )
    .bind(room.name, room.description, room.price, room.capacity, room.size, room.bed_type, amenitiesJson, room.image_url || null, room.available ? 1 : 0, now, now)
    .run();

  return getRoomById(result.meta?.duration || 0) as Promise<Room>;
}

export async function updateRoom(id: number, room: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>): Promise<Room | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(room)) {
    if (value !== undefined) {
      updates.push(`${key} = ?${paramCount}`);
      if (key === 'amenities') {
        values.push(typeof value === 'string' ? value : JSON.stringify(value));
      } else if (key === 'available') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
      paramCount++;
    }
  }

  updates.push(`updated_at = ?${paramCount}`);
  values.push(new Date().toISOString());

  values.push(id);

  if (updates.length > 1) {
    await db
      .prepare(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?${paramCount + 1}`)
      .bind(...values)
      .run();
  }

  return getRoomById(id);
}

export async function deleteRoom(id: number): Promise<boolean> {
  await db.prepare('DELETE FROM rooms WHERE id = ?1').bind(id).run();
  return true;
}

export async function checkRoomAvailability(roomId: number, checkInDate: string, checkOutDate: string): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE room_id = ?1 
       AND status NOT IN ('cancelled') 
       AND (
           (check_in_date <= ?2 AND check_out_date > ?2) OR
           (check_in_date < ?3 AND check_out_date >= ?3) OR
           (check_in_date >= ?2 AND check_out_date <= ?3)
       )`
    )
    .bind(roomId, checkInDate, checkOutDate)
    .first<{ count: number}>();

  return !result || result.count === 0;
}

// ============================================
// GUESTS API
// ============================================

export async function getAllGuests(): Promise<Guest[]> {
  const result = await db.prepare('SELECT * FROM guests ORDER BY created_at DESC').all<Guest>();
  return result.results || [];
}

export async function getGuestById(id: string): Promise<Guest | null> {
  const result = await db.prepare('SELECT * FROM guests WHERE id = ?1').bind(id).first<Guest>();
  return result || null;
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  const result = await db.prepare('SELECT * FROM guests WHERE email = ?1').bind(email).first<Guest>();
  return result || null;
}

export async function createGuest(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>, guestId?: string): Promise<Guest> {
  const id = guestId || uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO guests (id, first_name, last_name, email, phone, address, city, country, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
    )
    .bind(id, guest.first_name, guest.last_name, guest.email, guest.phone, guest.address, guest.city || null, guest.country || null, now, now)
    .run();

  return getGuestById(id) as Promise<Guest>;
}

export async function updateGuest(id: string, guest: Partial<Omit<Guest, 'id' | 'created_at' | 'updated_at'>>): Promise<Guest | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Filter out 'id' from guest object if present to prevent PK updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...guestData } = guest as any;

  for (const [key, value] of Object.entries(guestData)) {
    if (value !== undefined) {
      updates.push(`${key} = ?${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  updates.push(`updated_at = ?${paramCount}`);
  values.push(new Date().toISOString());
  values.push(id);

  if (updates.length > 1) {
    await db
      .prepare(`UPDATE guests SET ${updates.join(', ')} WHERE id = ?${paramCount + 1}`)
      .bind(...values)
      .run();
  }

  return getGuestById(id);
}

export async function upsertGuest(email: string, guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Guest> {
  // 1. Try to find by ID if provided
  if (guestData.id) {
    const existingGuestById = await getGuestById(guestData.id);
    if (existingGuestById) {
      return updateGuest(existingGuestById.id, guestData) as Promise<Guest>;
    }
  }

  // 2. Try to find by Email
  const existingGuest = await getGuestByEmail(email);

  if (existingGuest) {
    return updateGuest(existingGuest.id, guestData) as Promise<Guest>;
  }

  // 3. Create new
  return createGuest(guestData, guestData.id);
}

// ============================================
// BOOKINGS API
// ============================================

export async function getAllBookings(): Promise<BookingDetails[]> {
  const result = await db
    .prepare('SELECT * FROM booking_details ORDER BY check_in_date DESC')
    .all<BookingDetails>();
  return result.results || [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const result = await db.prepare('SELECT * FROM bookings WHERE id = ?1').bind(id).first<Booking>();
  return result || null;
}

export async function getBookingDetailsById(id: string): Promise<BookingDetails | null> {
  const result = await db.prepare('SELECT * FROM booking_details WHERE booking_id = ?1').bind(id).first<BookingDetails>();
  return result || null;
}

export async function getBookingsByGuestId(guestId: string): Promise<BookingDetails[]> {
  const result = await db
    .prepare('SELECT * FROM booking_details WHERE guest_id = ?1 ORDER BY check_in_date DESC')
    .bind(guestId)
    .all<BookingDetails>();
  return result.results || [];
}

export async function getUpcomingBookings(): Promise<BookingDetails[]> {
  const result = await db
    .prepare(
      `SELECT * FROM booking_details 
       WHERE check_in_date >= DATE('now') 
       AND status NOT IN ('cancelled', 'checked_out')
       ORDER BY check_in_date ASC`
    )
    .all<BookingDetails>();
  return result.results || [];
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO bookings (id, room_id, guest_id, check_in_date, check_out_date, number_of_guests, total_nights, total_price, status, special_requests, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
    )
    .bind(id, booking.room_id, booking.guest_id, booking.check_in_date, booking.check_out_date, booking.number_of_guests, booking.total_nights, booking.total_price, booking.status || 'pending', booking.special_requests || null, now, now)
    .run();

  return getBookingById(id) as Promise<Booking>;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
  const now = new Date().toISOString();

  await db
    .prepare('UPDATE bookings SET status = ?1, updated_at = ?2 WHERE id = ?3')
    .bind(status, now, id)
    .run();

  return getBookingById(id);
}

export async function cancelBooking(id: string): Promise<Booking | null> {
  return updateBookingStatus(id, 'cancelled');
}

export async function deleteBooking(id: string): Promise<boolean> {
  await db.prepare('DELETE FROM bookings WHERE id = ?1').bind(id).run();
  return true;
}

export async function getBookingsByDateRange(startDate: string, endDate: string): Promise<BookingDetails[]> {
  const result = await db
    .prepare(
      `SELECT * FROM booking_details 
       WHERE check_in_date >= ?1 AND check_out_date <= ?2 
       ORDER BY check_in_date ASC`
    )
    .bind(startDate, endDate)
    .all<BookingDetails>();
  return result.results || [];
}

// ============================================
// CONTACT MESSAGES API
// ============================================

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const result = await db
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC')
    .all<ContactMessage>();
  return result.results || [];
}

export async function getContactMessagesByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
  const result = await db
    .prepare('SELECT * FROM contact_messages WHERE status = ?1 ORDER BY created_at DESC')
    .bind(status)
    .all<ContactMessage>();
  return result.results || [];
}

export async function createContactMessage(message: Omit<ContactMessage, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ContactMessage> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'new', ?7, ?8)`
    )
    .bind(id, message.name, message.email, message.phone || null, message.subject, message.message, now, now)
    .run();

  return getContactMessageById(id) as Promise<ContactMessage>;
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  const result = await db.prepare('SELECT * FROM contact_messages WHERE id = ?1').bind(id).first<ContactMessage>();
  return result || null;
}

export async function updateContactMessageStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage | null> {
  const now = new Date().toISOString();

  await db
    .prepare('UPDATE contact_messages SET status = ?1, updated_at = ?2 WHERE id = ?3')
    .bind(status, now, id)
    .run();

  return getContactMessageById(id);
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  await db.prepare('DELETE FROM contact_messages WHERE id = ?1').bind(id).run();
  return true;
}

// ============================================
// PET CARE REQUESTS API
// ============================================

export async function getAllPetCareRequests(): Promise<PetCareRequest[]> {
  const result = await db
    .prepare('SELECT * FROM pet_care_requests ORDER BY start_date ASC')
    .all<PetCareRequest>();
  return result.results || [];
}

export async function getPetCareRequestById(id: string): Promise<PetCareRequest | null> {
  const result = await db.prepare('SELECT * FROM pet_care_requests WHERE id = ?1').bind(id).first<PetCareRequest>();
  return result || null;
}

export async function getPetCareRequestsByBookingId(bookingId: string): Promise<PetCareRequest[]> {
  const result = await db
    .prepare('SELECT * FROM pet_care_requests WHERE booking_id = ?1')
    .bind(bookingId)
    .all<PetCareRequest>();
  return result.results || [];
}

export async function createPetCareRequest(request: Omit<PetCareRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PetCareRequest> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO pet_care_requests (id, booking_id, guest_name, email, phone, pet_type, pet_name, pet_weight, pet_age, service_type, start_date, end_date, special_requirements, vaccination_records_url, status, total_price, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)`
    )
    .bind(
      id,
      request.booking_id || null,
      request.guest_name,
      request.email,
      request.phone,
      request.pet_type,
      request.pet_name,
      request.pet_weight || null,
      request.pet_age || null,
      request.service_type,
      request.start_date,
      request.end_date,
      request.special_requirements || null,
      request.vaccination_records_url || null,
      request.status || 'pending',
      request.total_price || null,
      now,
      now
    )
    .run();

  return getPetCareRequestById(id) as Promise<PetCareRequest>;
}

export async function updatePetCareRequestStatus(id: string, status: PetCareRequest['status']): Promise<PetCareRequest | null> {
  const now = new Date().toISOString();

  await db
    .prepare('UPDATE pet_care_requests SET status = ?1, updated_at = ?2 WHERE id = ?3')
    .bind(status, now, id)
    .run();

  return getPetCareRequestById(id);
}

export async function deletePetCareRequest(id: string): Promise<boolean> {
  await db.prepare('DELETE FROM pet_care_requests WHERE id = ?1').bind(id).run();
  return true;
}

// ============================================
// REVIEWS API
// ============================================

export async function getAllReviews(): Promise<Review[]> {
  const result = await db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all<Review>();
  return result.results || [];
}

export async function getApprovedReviews(): Promise<Review[]> {
  const result = await db
    .prepare('SELECT * FROM reviews WHERE status = ?1 ORDER BY created_at DESC')
    .bind('approved')
    .all<Review>();
  return result.results || [];
}

export async function getReviewsByRoomId(roomId: number): Promise<Review[]> {
  const result = await db
    .prepare('SELECT * FROM reviews WHERE room_id = ?1 ORDER BY created_at DESC')
    .bind(roomId)
    .all<Review>();
  return result.results || [];
}

export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const result = await db.prepare('SELECT * FROM reviews WHERE booking_id = ?1').bind(bookingId).first<Review>();
  return result || null;
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO reviews (id, booking_id, guest_id, room_id, rating, title, comment, response, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
    )
    .bind(id, review.booking_id, review.guest_id, review.room_id, review.rating, review.title || null, review.comment, review.response || null, review.status || 'pending', now, now)
    .run();

  return getReviewById(id) as Promise<Review>;
}

export async function getReviewById(id: string): Promise<Review | null> {
  const result = await db.prepare('SELECT * FROM reviews WHERE id = ?1').bind(id).first<Review>();
  return result || null;
}

export async function updateReviewStatus(id: string, status: Review['status'], response?: string): Promise<Review | null> {
  const now = new Date().toISOString();
  let query = 'UPDATE reviews SET status = ?1, updated_at = ?2';
  const params: any[] = [status, now];

  if (response) {
    query += ', response = ?3';
    params.push(response);
  }

  query += ` WHERE id = ?${params.length + 1}`;
  params.push(id);

  await db.prepare(query).bind(...params).run();

  return getReviewById(id);
}

export async function deleteReview(id: string): Promise<boolean> {
  await db.prepare('DELETE FROM reviews WHERE id = ?1').bind(id).run();
  return true;
}

// ============================================
// STATISTICS API
// ============================================

export async function getDashboardStats() {
  const totalRooms = await db.prepare('SELECT COUNT(*) as count FROM rooms').first<{ count: number }>();
  const availableRooms = await db.prepare('SELECT COUNT(*) as count FROM rooms WHERE available = 1').first<{ count: number }>();
  const totalGuests = await db.prepare('SELECT COUNT(*) as count FROM guests').first<{ count: number }>();
  const totalBookings = await db.prepare('SELECT COUNT(*) as count FROM bookings').first<{ count: number }>();
  
  // Active bookings: confirmed or checked_in status
  const activeBookings = await db.prepare(
    "SELECT COUNT(*) as count FROM bookings WHERE status IN ('confirmed', 'checked_in', 'pending')"
  ).first<{ count: number }>();
  
  const totalRevenue = await db.prepare('SELECT SUM(total_price) as total FROM bookings WHERE status != ?1').bind('cancelled').first<{ total: number }>();
  
  // Messages stats
  const totalMessages = await db.prepare('SELECT COUNT(*) as count FROM contact_messages').first<{ count: number }>();
  const pendingMessages = await db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'new'").first<{ count: number }>();
  
  // Pet care stats
  const totalPetCare = await db.prepare('SELECT COUNT(*) as count FROM pet_care_requests').first<{ count: number }>();
  
  // Reviews stats
  const totalReviews = await db.prepare('SELECT COUNT(*) as count FROM reviews').first<{ count: number }>();
  const pendingReviews = await db.prepare('SELECT COUNT(*) as count FROM reviews WHERE status = ?1').bind('pending').first<{ count: number }>();
  const averageRating = await db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE status = ?1').bind('approved').first<{ avg: number }>();

  return {
    totalRooms: totalRooms?.count || 0,
    availableRooms: availableRooms?.count || 0,
    totalGuests: totalGuests?.count || 0,
    totalBookings: totalBookings?.count || 0,
    activeBookings: activeBookings?.count || 0,
    totalRevenue: totalRevenue?.total || 0,
    totalMessages: totalMessages?.count || 0,
    pendingMessages: pendingMessages?.count || 0,
    totalPetCare: totalPetCare?.count || 0,
    totalReviews: totalReviews?.count || 0,
    pendingReviews: pendingReviews?.count || 0,
    averageRating: averageRating?.avg || 0,
  };
}
