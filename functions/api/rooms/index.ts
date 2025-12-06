/**
 * Cloudflare Pages Function: GET/POST /api/rooms
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method === 'GET') {
      const rooms = await d1.getAllRooms();
      return new Response(JSON.stringify(rooms), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'POST') {
      const roomData = await context.request.json();
      const newRoom = await d1.createRoom(roomData);
      return new Response(JSON.stringify(newRoom), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
