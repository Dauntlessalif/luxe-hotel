/**
 * Cloudflare Pages Function: GET /api/rooms/[id]/availability
 * Check room availability for a given date range
 */
import * as d1 from '../../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const roomId = parseInt(context.params.id as string);
    const url = new URL(context.request.url);
    const checkIn = url.searchParams.get('checkIn');
    const checkOut = url.searchParams.get('checkOut');

    if (!checkIn || !checkOut) {
      return new Response(JSON.stringify({ error: 'checkIn and checkOut query parameters are required' }), { status: 400 });
    }

    // Check if room exists
    const room = await d1.getRoomById(roomId);
    if (!room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }

    // Check availability
    const available = await d1.checkRoomAvailability(roomId, checkIn, checkOut);

    return new Response(JSON.stringify({ available, roomId, checkIn, checkOut }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};

