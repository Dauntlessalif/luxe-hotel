/**
 * Cloudflare Pages Function: GET /api/dashboard/stats
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    if (context.request.method === 'GET') {
      const stats = await d1.getDashboardStats();
      return new Response(JSON.stringify(stats), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
