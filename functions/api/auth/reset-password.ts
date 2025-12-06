/**
 * Cloudflare Pages Function: POST /api/auth/reset-password
 */
import { handleResetPassword } from './handlers';

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  return handleResetPassword(context.request, context.env);
};
