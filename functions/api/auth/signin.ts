/**
 * Cloudflare Pages Function: POST /api/auth/signin
 */
import { handleSignin } from './handlers';

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  return handleSignin(context.request, context.env);
};
