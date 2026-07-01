// src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Route authentication requests to your authcallback worker
    if (path.startsWith('/auth/')) {
      const authUrl = `https://authcallback.buhle-1ce.workers.dev${path}${url.search}`;
      return fetch(authUrl, request);
    }

    // 2. Serve static files (HTML, CSS, JS, Images)
    // The ASSETS binding automatically handles serving index.html for the root URL '/'
    return env.ASSETS.fetch(request);
  }
};
