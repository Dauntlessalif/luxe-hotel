/**
 * Cloudflare Pages Function: POST /api/auth/update-profile
 */
import { handleUpdateProfile } from './handlers';

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  return handleUpdateProfile(context.request, context.env);
};
