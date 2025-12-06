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

  // Get room by ID
  async getRoomById(id: number) {
    const response = await fetch(`/api/rooms/${id}`);
    if (!response.ok) throw new Error('Failed to fetch room');
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
    const response = await fetch('/api/guests/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(guestData)
    });
    if (!response.ok) throw new Error('Failed to upsert guest');
    return response.json();
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
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
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

  // Cancel booking
  async cancelBooking(bookingId: string) {
    return this.updateBookingStatus(bookingId, 'cancelled');
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
// CONTACT MESSAGES API
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
    const response = await fetch(`/api/pet-care/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
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
