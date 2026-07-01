// src/index.js - Main Worker Router
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route authentication requests to auth worker
    if (path.startsWith('/auth/')) {
      const authUrl = `https://parsing-auth.buhle-1ce.workers.dev${path}${url.search}`;
      return fetch(authUrl, request);
    }

    // Serve static files (HTML, CSS, JS, images)
    return env.ASSETS.fetch(request);
  }
};
