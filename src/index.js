// _worker.js - Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Route /auth/* requests to auth worker
  if (path.startsWith('/auth/')) {
    const authUrl = `https://parsing-auth.buhle-1ce.workers.dev${path}${url.search}`;
    return fetch(authUrl, request);
  }

  // Let Pages serve static files automatically
  return context.next();
}
