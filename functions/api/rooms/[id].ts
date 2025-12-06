/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/rooms/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = parseInt(context.params.id as string);
    
    if (context.request.method === 'GET') {
      const room = await d1.getRoomById(id);
      if (!room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(room), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const roomData = await context.request.json();
      const updatedRoom = await d1.updateRoom(id, roomData);
      if (!updatedRoom) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(updatedRoom), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'DELETE') {
      const success = await d1.deleteRoom(id);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
