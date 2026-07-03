document.addEventListener('DOMContentLoaded', () => {
    // Toggle between Login and Signup
    const toggleSlider = document.getElementById('toggleSlider');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === 'signup') toggleSlider.classList.add('signup');
            else toggleSlider.classList.remove('signup');
            
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (tab === 'signup') {
                loginForm.classList.remove('active');
                setTimeout(() => signupForm.classList.add('active'), 100);
            } else {
                signupForm.classList.remove('active');
                setTimeout(() => loginForm.classList.add('active'), 100);
            }
        });
    });

    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    // Create particles
    const container = document.getElementById('particles');
    if (container) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            container.appendChild(particle);
        }
    }
});

// ============================================
// REAL API INTEGRATION
// ============================================
const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev';

// Login Form
document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.querySelector('.remember-me input[type="checkbox"]')?.checked || false;
    
    btn.classList.add('loading-state');
    btn.disabled = true;
    
    try {
        // FIX: Removed newline characters from URL
        const response = await fetch(`${WORKER_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, remember })
        });
        const data = await response.json();
        
        if (response.ok) {
            if (remember) localStorage.setItem('parsing_auth_token', data.token);
            else sessionStorage.setItem('parsing_auth_token', data.token);
            localStorage.setItem('parsing_auth_name', data.user.name);
            localStorage.setItem('parsing_auth_email', data.user.email);
            
            // REDIRECT TO PORTAL AFTER SUCCESSFUL LOGIN
            window.location.href = 'portal.html';
        } else {
            btn.classList.remove('loading-state');
            btn.disabled = false;
            alert(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        alert('Network error. Please try again.');
    }
});

// Signup Form
document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    btn.classList.add('loading-state');
    btn.disabled = true;
    
    try {
        // FIX: Removed newline characters from URL
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
            
            // REDIRECT TO PORTAL AFTER SUCCESSFUL SIGNUP
            window.location.href = 'portal.html';
        } else {
            btn.classList.remove('loading-state');
            btn.disabled = false;
            alert(data.error || 'Registration failed.');
        }
    } catch (error) {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        alert('Network error. Please try again.');
    }
});

// GitHub OAuth Button
const githubBtn = document.getElementById('githubLoginBtn');
if (githubBtn) {
    githubBtn.addEventListener('click', () => {
        // FIX: Removed newline characters from URL
        window.location.href = `${WORKER_URL}/auth/github`;
    });
}

// Handle OAuth Return
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const name = urlParams.get('name');
if (token && name) {
    localStorage.setItem('parsing_auth_token', token);
    localStorage.setItem('parsing_auth_name', decodeURIComponent(name));
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = 'portal.html'; 
}

// Check existing session on load
const existingToken = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
if (existingToken) {
    // FIX: Removed newline characters from URL and Header
    fetch(`${WORKER_URL}/auth/verify`, { 
        headers: { 'Authorization': `Bearer ${existingToken}` } 
    })
    .then(r => {
        if (r.ok) {
            window.location.href = 'portal.html'; // Auto-redirect if already logged in
        } else {
            localStorage.removeItem('parsing_auth_token');
            sessionStorage.removeItem('parsing_auth_token');
        }
    })
    .catch(() => {
        console.log('Offline or token invalid');
        localStorage.removeItem('parsing_auth_token');
        sessionStorage.removeItem('parsing_auth_token');
    });
}

function logout() {
    localStorage.removeItem('parsing_auth_token');
    sessionStorage.removeItem('parsing_auth_token');
    localStorage.removeItem('parsing_auth_name');
    localStorage.removeItem('parsing_auth_email');
    window.location.href = 'account.html'; 
}
