/**
 * Cloudflare Pages Function: POST /api/auth/admin-signin
 */
import { handleAdminSignin } from './handlers';

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  return handleAdminSignin(context.request, context.env);
};
