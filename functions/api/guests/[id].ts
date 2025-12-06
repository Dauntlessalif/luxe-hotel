/**
 * Cloudflare Pages Function: GET/PUT /api/guests/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const guest = await d1.getGuestById(id);
      if (!guest) {
        return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(guest), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const guestData = await context.request.json();
      const updatedGuest = await d1.updateGuest(id, guestData);
      if (!updatedGuest) {
        return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(updatedGuest), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
