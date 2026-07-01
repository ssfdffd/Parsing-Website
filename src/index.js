// Parsing Website Worker - Routes static files and auth requests

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Route authentication requests to authcallback worker
    if (path.startsWith('/auth/')) {
      // Forward to your auth worker
      const authUrl = `https://authcallback.buhle-1ce.workers.dev${path}${url.search}`;
      return fetch(authUrl, request);
    }
    
    // Serve static files from your repo
    // Map URLs to actual files
    let filePath = path === '/' ? '/index.html' : path;
    
    // Remove leading slash for asset lookup
    const assetPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    try {
      // Try to get the file from the worker's assets
      const response = await env.ASSETS.fetch(new URL(assetPath, request.url));
      
      if (response.status === 404) {
        // File not found, serve 404
        return new Response('Not Found', { status: 404 });
      }
      
      return response;
      
    } catch (error) {
      console.error('Error serving file:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};