/**
 * Cloudflare Pages Function: GET/POST /api/bookings
 */
import * as d1 from '../d1';

// Transform flat booking_details into nested format for frontend
function transformBooking(booking: any) {
  return {
    id: booking.id,
    room_id: booking.room_id,
    guest_id: booking.guest_id,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    number_of_guests: booking.number_of_guests,
    total_nights: booking.total_nights,
    total_price: booking.total_price,
    status: booking.status,
    special_requests: booking.special_requests,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    guests: {
      id: booking.guest_id,
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
    },
    rooms: {
      id: booking.room_id,
      name: booking.room_name,
      price: booking.room_price_per_night,
      capacity: booking.room_capacity,
      size: booking.room_size,
      bed_type: booking.bed_type,
    },
  };
}

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method === 'GET') {
      const bookings = await d1.getAllBookings();
      const transformedBookings = bookings.map(transformBooking);
      return new Response(JSON.stringify(transformedBookings), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'POST') {
      try {
        const bookingData = await context.request.json();
        
        if (!bookingData.room_id || !bookingData.guest_id) {
          return new Response(JSON.stringify({ error: 'Missing required fields: room_id and guest_id' }), { status: 400 });
        }

        const newBooking = await d1.createBooking(bookingData);
        return new Response(JSON.stringify(newBooking), { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('POST booking error:', err);
        throw err;
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
