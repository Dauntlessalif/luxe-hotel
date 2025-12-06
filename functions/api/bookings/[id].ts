/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/bookings/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const booking = await d1.getBookingById(id);
      if (!booking) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(booking), { 
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
