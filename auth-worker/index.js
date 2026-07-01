// Parsing Auth Worker - GitHub OAuth Only

async function generateJWT(payload, secret) {
    const encoder = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleGitHubAuth(env) {
    const state = crypto.randomUUID();
    await env.SESSIONS.put(`oauth_state:${state}`, 'github', { expirationTtl: 300 });

    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${env.WORKER_URL || 'https://parsing-auth.buhle-1ce.workers.dev'}/auth/github/callback`,
        scope: 'read:user user:email',
        state: state,
    });

    return Response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`, 302);
}

async function handleGitHubCallback(request, env) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
        return Response.redirect(`${env.FRONTEND_URL}/account.html?error=no_code`, 302);
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Parsing-Auth',
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            return Response.redirect(`${env.FRONTEND_URL}/account.html?error=token_failed`, 302);
        }

        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'User-Agent': 'Parsing-Auth',
            },
        });

        const user = await userResponse.json();

        // Get email
        let email = user.email;
        if (!email) {
            const emails = await fetch('https://api.github.com/user/emails', {
                headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
            }).then(r => r.json());
            email = emails.find(e => e.primary)?.email || emails[0]?.email;
        }

        // Create user data
        const userData = {
            id: `github_${user.id}`,
            provider: 'github',
            name: user.name || user.login,
            email: email,
            avatar: user.avatar_url,
            username: user.login,
        };

        // Generate token
        const token = await generateJWT(userData, env.JWT_SECRET);

        // Store session
        const sessionId = crypto.randomUUID();
        await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(userData), {
            expirationTtl: 7 * 24 * 60 * 60
        });

        // Redirect to frontend
        const redirectUrl = new URL(`${env.FRONTEND_URL}/account.html`);
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('provider', 'github');
        redirectUrl.searchParams.set('name', encodeURIComponent(userData.name));

        return Response.redirect(redirectUrl.toString(), 302);

    } catch (error) {
        console.error('Auth error:', error);
        return Response.redirect(`${env.FRONTEND_URL}/account.html?error=auth_failed`, 302);
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
        }

        if (path === '/auth/github' && request.method === 'GET') {
            return handleGitHubAuth(env);
        }

        if (path === '/auth/github/callback' && request.method === 'GET') {
            return handleGitHubCallback(request, env);
        }

        if (path === '/auth/verify' && request.method === 'GET') {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader?.startsWith('Bearer ')) {
                return jsonResponse({ error: 'No token' }, 401, corsHeaders(request.headers.get('Origin')));
            }

            try {
                const token = authHeader.split(' ')[1];
                const parts = token.split('.');
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

                if (payload.exp < Math.floor(Date.now() / 1000)) {
                    return jsonResponse({ error: 'Token expired' }, 401);
                }

                return jsonResponse({ user: payload }, 200, corsHeaders(request.headers.get('Origin')));
            } catch (e) {
                return jsonResponse({ error: 'Invalid token' }, 401);
            }
        }

        return jsonResponse({ status: 'ok', service: 'Parsing Auth' });
    }
};