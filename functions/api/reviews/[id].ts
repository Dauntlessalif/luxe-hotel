/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/reviews/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const review = await d1.getReviewById(id);
      if (!review) {
        return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(review), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const { status, response } = await context.request.json();
      const updatedReview = await d1.updateReviewStatus(id, status, response);
      if (!updatedReview) {
        return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(updatedReview), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'DELETE') {
      const success = await d1.deleteReview(id);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
