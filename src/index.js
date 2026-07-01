export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route authentication requests to your authcallback worker
    if (path.startsWith('/auth/')) {
      const authUrl = `https://authcallback.buhle-1ce.workers.dev${path}${url.search}`;
      return fetch(authUrl, request);
    }

    // Serve static files from your repository
    return env.ASSETS.fetch(request);
  }
};
