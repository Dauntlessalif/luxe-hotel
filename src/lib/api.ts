import { 
  GuestInsert, 
  BookingInsert, 
  ContactMessageInsert, 
  PetCareRequestInsert,
  Booking,
  Guest,
  Room,
  BookingDetail
} from './database.types';

// ============================================
// ROOMS API
// ============================================

export const roomsApi = {
  // Get all rooms
  async getAllRooms() {
    const response = await fetch('/api/rooms');
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  },

  // Alias for getAllRooms
  async getAll() {
    return this.getAllRooms();
  },

  // Get room by ID
  async getRoomById(id: number) {
    const response = await fetch(`/api/rooms/${id}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },

  // Create a new room
  async createRoom(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roomData)
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  // Update room
  async updateRoom(id: number, roomData: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roomData)
    });
    if (!response.ok) throw new Error('Failed to update room');
    return response.json();
  },

  // Delete room
  async deleteRoom(id: number) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete room');
    return response.json();
  },

  // Check room availability for date range
  async checkAvailability(roomId: number, checkIn: string, checkOut: string) {
    const response = await fetch(`/api/rooms/${roomId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (!response.ok) throw new Error('Failed to check availability');
    const data = await response.json();
    return data.available;
  },

  // Get available rooms for date range
  async getAvailableRooms(checkIn: string, checkOut: string) {
    const response = await fetch(`/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (!response.ok) throw new Error('Failed to fetch available rooms');
    return response.json();
  }
};

// ============================================
// GUESTS API
// ============================================

export const guestsApi = {
  // Get all guests
  async getAll() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch guests');
    return response.json();
  },

  // Create a new guest
  async create(guestData: GuestInsert) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(guestData)
    });
    if (!response.ok) throw new Error('Failed to create guest');
    return response.json();
  },

  // Update guest
  async update(id: string, guestData: Partial<GuestInsert>) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(guestData)
    });
    if (!response.ok) throw new Error('Failed to update guest');
    return response.json();
  },

  // Create or get guest by email
  async createOrGetGuest(guestData: GuestInsert) {
    const token = localStorage.getItem('auth_token');
    
    // First, try to get existing guest by email
    try {
      const getResponse = await fetch(`/api/guests/email/${encodeURIComponent(guestData.email)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getResponse.ok) {
        return getResponse.json();
      }
    } catch (error) {
      console.log('Guest not found, creating new one');
    }
    
    // If guest doesn't exist, create a new one
    const createResponse = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(guestData)
    });
    
    if (!createResponse.ok) throw new Error('Failed to create guest');
    return createResponse.json();
  },

  // Get guest by email
  async getGuestByEmail(email: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/guests/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch guest');
    return response.json();
  }
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsApi = {
  // Create a new booking
  async createBooking(bookingData: BookingInsert) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  // Get all bookings with details
  async getAllBookings() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Alias for getAllBookings
  async getAll() {
    return this.getAllBookings();
  },

  // Get booking by ID
  async getBookingById(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  // Get bookings by guest email
  async getBookingsByEmail(email: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/bookings/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: Booking['status']) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  // Alias for updateBookingStatus
  async updateStatus(bookingId: string, status: string) {
    return this.updateBookingStatus(bookingId, status as Booking['status']);
  },

  // Cancel booking
  async cancelBooking(bookingId: string) {
    return this.updateBookingStatus(bookingId, 'cancelled');
  },

  // Delete booking
  async deleteBooking(bookingId: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return response.json();
  },

  // Alias for deleteBooking
  async delete(bookingId: string) {
    return this.deleteBooking(bookingId);
  },

  // Get upcoming bookings
  async getUpcomingBookings() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/bookings/upcoming', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming bookings');
    return response.json();
  },

  // Get bookings for specific date range
  async getBookingsByDateRange(startDate: string, endDate: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/bookings/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  }
};

// ============================================
// PET CARE REQUESTS API
// ============================================

export const petCareApi = {
  // Create a pet care request
  async createRequest(requestData: PetCareRequestInsert) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/pet-care', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) throw new Error('Failed to create request');
    return response.json();
  },

  // Get all pet care requests
  async getAllRequests() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/pet-care', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  // Alias for getAllRequests
  async getAll() {
    return this.getAllRequests();
  },

  // Create alias
  async create(requestData: PetCareRequestInsert) {
    return this.createRequest(requestData);
  },

  // Get pet care requests by email
  async getRequestsByEmail(email: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/pet-care/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  // Update request status
  async updateRequestStatus(
    requestId: string, 
    status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  ) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/pet-care/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Alias for updateRequestStatus
  async updateStatus(requestId: string, status: string) {
    return this.updateRequestStatus(requestId, status as any);
  }
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsApi = {
  // Get all reviews
  async getAll() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/reviews', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // Create a new review
  async create(reviewData: any) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  // Get review by ID
  async getById(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/reviews/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch review');
    return response.json();
  },

  // Update review
  async update(id: string, reviewData: any) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  },

  // Update review status
  async updateStatus(id: string, status: string, response?: string) {
    const token = localStorage.getItem('auth_token');
    const fetchResponse = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, response })
    });
    if (!fetchResponse.ok) throw new Error('Failed to update review status');
    return fetchResponse.json();
  },

  // Delete review
  async delete(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.json();
  }
};

// ============================================
// CONTACT MESSAGES API (Extended)
// ============================================

export const contactMessagesApi = {
  // Create a contact message
  async createMessage(messageData: ContactMessageInsert) {
    const response = await fetch('/api/contact-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error('Failed to create message');
    return response.json();
  },

  // Get all messages
  async getAllMessages() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/contact-messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // Alias for getAllMessages
  async getAll() {
    return this.getAllMessages();
  },

  // Get message by ID
  async getById(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/contact-messages/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch message');
    return response.json();
  },

  // Update message status
  async updateMessageStatus(id: string, status: 'new' | 'read' | 'replied' | 'archived') {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/contact-messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Alias for updateMessageStatus
  async updateStatus(id: string, status: string) {
    return this.updateMessageStatus(id, status as any);
  },

  // Delete message
  async deleteMessage(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/contact-messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  },

  // Alias for deleteMessage
  async delete(id: string) {
    return this.deleteMessage(id);
  },

  // Get messages by status
  async getMessagesByStatus(status: 'new' | 'read' | 'replied' | 'archived') {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/contact-messages/status/${status}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate nights between dates
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate total price
export function calculateTotalPrice(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Validate date range
export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  return checkInDate >= today && checkOutDate > checkInDate;
}
