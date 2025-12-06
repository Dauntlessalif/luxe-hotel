/**
 * Cloudflare Pages Function: GET/POST /api/contact-messages
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method === 'GET') {
      const messages = await d1.getAllContactMessages();
      return new Response(JSON.stringify(messages), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'POST') {
      const messageData = await context.request.json();
      const newMessage = await d1.createContactMessage(messageData);
      return new Response(JSON.stringify(newMessage), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
