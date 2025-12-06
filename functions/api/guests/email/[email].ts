/**
 * Cloudflare Pages Function: GET /api/guests/email/[email]
 * Get guest by email
 */
import * as d1 from '../../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const email = context.params.email as string;
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email parameter is required' }), { status: 400 });
    }

    if (context.request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const guest = await d1.getGuestByEmail(email);
    
    if (!guest) {
      return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(guest), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get guest by email error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
