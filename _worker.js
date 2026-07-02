// _worker.js - Cloudflare Pages Functions Router
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route /auth/* requests to auth worker
    if (path.startsWith('/auth/')) {
      const authUrl = `https://parsing-auth.buhle-1ce.workers.dev${path}${url.search}`;
      return fetch(authUrl, request);
    }

    // Let Pages serve static files automatically
    return env.ASSETS.fetch(request);
  }
};
