/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/bookings/[id]
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

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const booking = await d1.getBookingDetailsById(id);
      if (!booking) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(transformBooking(booking)), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const { status, ...data } = await context.request.json();
      
      // If updating status specifically, use updateBookingStatus
      if (status && Object.keys(data).length === 0) {
        const updatedBooking = await d1.updateBookingStatus(id, status);
        if (!updatedBooking) {
          return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
        }
        return new Response(JSON.stringify(updatedBooking), { status: 200 });
      }
      
      // Otherwise update full booking (if function exists)
      return new Response(JSON.stringify({ error: 'General booking update not implemented' }), { status: 501 });
    }

    if (context.request.method === 'DELETE') {
      const success = await d1.deleteBooking(id);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
