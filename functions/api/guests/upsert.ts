/**
 * Cloudflare Pages Function: POST /api/guests/upsert
 * Create or update a guest by email
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const guestData = await context.request.json();
    
    if (!guestData.email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const guest = await d1.upsertGuest(guestData.email, {
      id: guestData.id,
      first_name: guestData.first_name,
      last_name: guestData.last_name,
      email: guestData.email,
      phone: guestData.phone,
      address: guestData.address,
      city: guestData.city,
      country: guestData.country,
    });

    return new Response(JSON.stringify(guest), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upsert guest error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
