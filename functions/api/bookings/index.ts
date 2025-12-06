/**
 * Cloudflare Pages Function: GET/POST /api/bookings
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method === 'GET') {
      const bookings = await d1.getAllBookings();
      return new Response(JSON.stringify(bookings), { 
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
