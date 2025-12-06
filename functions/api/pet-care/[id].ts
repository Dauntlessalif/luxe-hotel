/**
 * Cloudflare Pages Function: GET/PUT/DELETE /api/pet-care/[id]
 */
import * as d1 from '../d1';

export const onRequest = async (context: any): Promise<Response> => {
  try {
    // Initialize D1 connection
    d1.setD1Database(context.env.DB);

    const id = context.params.id as string;
    
    if (context.request.method === 'GET') {
      const request = await d1.getPetCareRequestById(id);
      if (!request) {
        return new Response(JSON.stringify({ error: 'Pet care request not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(request), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'PUT') {
      const { status } = await context.request.json();
      const updatedRequest = await d1.updatePetCareRequestStatus(id, status);
      if (!updatedRequest) {
        return new Response(JSON.stringify({ error: 'Pet care request not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(updatedRequest), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (context.request.method === 'DELETE') {
      const success = await d1.deletePetCareRequest(id);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Pet care request not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
