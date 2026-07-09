document.addEventListener('DOMContentLoaded', () => {
    // Toggle between Login and Signup
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    if (registerBtn) registerBtn.addEventListener('click', () => container.classList.add("active"));
    if (loginBtn) loginBtn.addEventListener('click', () => container.classList.remove("active"));

    // Create particles background
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }
});

const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev'; // Update if your worker URL changes
const ADMIN_EMAIL = 'admin@peer-2-peer.co.za';

// Helper to redirect based on user role
function redirectUser(userData) {
    // Check if the worker explicitly flagged them as admin, or if their email matches the admin email
    if (userData.is_admin || (userData.email && userData.email.toLowerCase() === ADMIN_EMAIL)) {
        window.location.href = 'admin.html'; // Redirect to Admin Portal
    } else {
        window.location.href = 'portal.html'; // Redirect to User Portal
    }
}

// ============================================
// LOGIN FORM
// ============================================
document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    btn.classList.add('loading-state');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    
    try {
        const response = await fetch(`${WORKER_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, remember: true })
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('parsing_auth_token', data.token);
            localStorage.setItem('parsing_auth_name', data.user.name);
            localStorage.setItem('parsing_auth_email', data.user.email);
            redirectUser(data.user); // Smart Redirect
        } else {
            alert(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

// ============================================
// SIGNUP FORM
// ============================================
document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    btn.classList.add('loading-state');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Registering...';
    
    try {
        const response = await fetch(`${WORKER_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, email_notifications: true, remember: true })
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('parsing_auth_token', data.token);
            localStorage.setItem('parsing_auth_name', data.user.name);
            localStorage.setItem('parsing_auth_email', data.user.email);
            redirectUser(data.user); // Smart Redirect
        } else {
            alert(data.error || 'Registration failed.');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

// ============================================
// GITHUB OAUTH
// ============================================
const githubBtn = document.getElementById('githubLoginBtn');
if (githubBtn) {
    githubBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `${WORKER_URL}/auth/github`;
    });
}

// Handle OAuth Return (When redirected back from GitHub)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const name = urlParams.get('name');
const provider = urlParams.get('provider');

if (token && name) {
    localStorage.setItem('parsing_auth_token', token);
    localStorage.setItem('parsing_auth_name', decodeURIComponent(name));
    
    if (provider === 'github') {
        try {
            // Decode the JWT payload to check for admin status
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            redirectUser(payload);
        } catch (e) { window.location.href = 'portal.html'; }
    } else {
        window.location.href = 'portal.html';
    }
    window.history.replaceState({}, document.title, window.location.pathname);
}

// ============================================
// SESSION CHECK ON LOAD
// ============================================
const existingToken = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
if (existingToken) {
    fetch(`${WORKER_URL}/auth/verify`, { headers: { 'Authorization': `Bearer ${existingToken}` } })
    .then(r => r.json())
    .then(data => {
        if (data.user) {
            redirectUser(data.user); // Auto-redirect if already logged in
        } else {
            localStorage.removeItem('parsing_auth_token');
            sessionStorage.removeItem('parsing_auth_token');
        }
    })
    .catch(() => {
        localStorage.removeItem('parsing_auth_token');
        sessionStorage.removeItem('parsing_auth_token');
    });
}
