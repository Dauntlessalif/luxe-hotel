/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/contact-messages/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const message = await d1.getContactMessageById(id);
      if (!message) {
        return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(message), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const { status } = await context.request.json();
      const updatedMessage = await d1.updateContactMessageStatus(id, status);
      if (!updatedMessage) {
        return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(updatedMessage), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'DELETE') {
      const success = await d1.deleteContactMessage(id);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
