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
      const bookingData = await context.request.json();
      const newBooking = await d1.createBooking(bookingData);
      return new Response(JSON.stringify(newBooking), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
