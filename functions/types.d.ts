/**
 * Cloudflare Pages Function Types
 */

interface PagesFunction {
  (context: any): Promise<Response> | Response;
}

declare const PagesFunction: any;
