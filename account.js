document.addEventListener('DOMContentLoaded', () => {
  // Toggle between Login and Signup
  const toggleSlider = document.getElementById('toggleSlider');
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update slider position
      if (tab === 'signup') {
        toggleSlider.classList.add('signup');
      } else {
        toggleSlider.classList.remove('signup');
      }

      // Update active states
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Switch forms with animation
      if (tab === 'signup') {
        loginForm.classList.remove('active');
        setTimeout(() => {
          signupForm.classList.add('active');
        }, 100);
      } else {
        signupForm.classList.remove('active');
        setTimeout(() => {
          loginForm.classList.add('active');
        }, 100);
      }
    });
  });

  // Password Toggle
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // ============================================
  // REAL API INTEGRATION
  // ============================================
  const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev';

  // Login Form Submission
  document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.querySelector('.remember-me input[type="checkbox"]').checked;

    btn.classList.add('loading-state');
    btn.disabled = true;

    try {
      const response = await fetch(`${WORKER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        if (remember) {
          localStorage.setItem('parsing_auth_token', data.token);
        } else {
          sessionStorage.setItem('parsing_auth_token', data.token);
        }
        localStorage.setItem('parsing_auth_name', data.user.name);
        localStorage.setItem('parsing_auth_provider', 'email');

        btn.classList.remove('loading-state');
        btn.disabled = false;
        
        showSuccessMessage('Login successful!');
        setTimeout(() => {
          handleOAuthSuccess(data.user.name, 'email');
        }, 500);
      } else {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        showErrorMessage(data.error || 'Login failed');
      }
    } catch (error) {
      btn.classList.remove('loading-state');
      btn.disabled = false;
      showErrorMessage('Network error. Please try again.');
    }
  });

  // Signup Form Submission
  document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Client-side validation
    if (password !== confirmPassword) {
      showErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      showErrorMessage('Password must be at least 8 characters');
      return;
    }

    btn.classList.add('loading-state');
    btn.disabled = true;

    try {
      const response = await fetch(`${WORKER_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          email_notifications: true,
          remember: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('parsing_auth_token', data.token);
        localStorage.setItem('parsing_auth_name', data.user.name);
        localStorage.setItem('parsing_auth_provider', 'email');

        btn.classList.remove('loading-state');
        btn.disabled = false;
        
        showSuccessMessage('Account created successfully!');
        setTimeout(() => {
          handleOAuthSuccess(data.user.name, 'email');
        }, 500);
      } else {
        btn.classList.remove('loading-state');
        btn.disabled = false;
        showErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      btn.classList.remove('loading-state');
      btn.disabled = false;
      showErrorMessage('Network error. Please try again.');
    }
  });

  // ============================================
  // GITHUB OAUTH
  // ============================================
  const githubBtn = document.getElementById('githubLoginBtn');
  if (githubBtn) {
    githubBtn.addEventListener('click', () => {
      window.location.href = `${WORKER_URL}/auth/github`;
    });
  }

  // Check if returning from OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const provider = urlParams.get('provider');
  const name = urlParams.get('name');
  const error = urlParams.get('error');

  if (error) {
    showErrorMessage(`Authentication failed: ${error}`);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (token && provider && name) {
    localStorage.setItem('parsing_auth_token', token);
    localStorage.setItem('parsing_auth_provider', provider);
    localStorage.setItem('parsing_auth_name', decodeURIComponent(name));
    window.history.replaceState({}, document.title, window.location.pathname);
    handleOAuthSuccess(decodeURIComponent(name), provider);
  }

  // Check existing session
  const existingToken = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
  if (existingToken) {
    verifyToken(existingToken);
  }

  // Create floating particles
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      container.appendChild(particle);
    }
  }
  createParticles();

  // Input focus effects
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.parentElement.classList.remove('focused');
      }
    });
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================
const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev';

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

function handleOAuthSuccess(name, provider) {
  const card = document.querySelector('.account-card');
  if (!card) return;

  card.innerHTML = `
    <div style="text-align: center; padding: 2rem 0;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #F07080, #F05090); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; font-weight: 800; color: #0A0A0A; box-shadow: 0 10px 30px rgba(240, 112, 128, 0.4);">
        ${name.charAt(0).toUpperCase()}
      </div>
      <h2 style="color: #F0F0E0; font-family: 'Space Grotesk', sans-serif; font-size: 1.75rem; margin-bottom: 0.5rem;">Welcome, ${name}!</h2>
      <p style="color: rgba(240, 240, 224, 0.7); margin-bottom: 0.5rem; font-size: 1rem;">Signed in with ${provider === 'github' ? 'GitHub' : 'Email'}</p>
      <p style="color: #10b981; font-weight: 600; margin-bottom: 2rem; font-size: 0.9375rem;">✓ Authentication Successful</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="portal.html" style="padding: 0.875rem 2rem; background: linear-gradient(135deg, #F07080, #F05090); border-radius: 12px; color: #0A0A0A; font-weight: 700; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(240, 112, 128, 0.4);">
          Go to Portal
        </a>
        <button onclick="logout()" style="padding: 0.875rem 2rem; background: rgba(64, 64, 64, 0.3); border: 1px solid rgba(64, 64, 64, 0.5); border-radius: 12px; color: #F0F0E0; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          Logout
        </button>
      </div>
    </div>
  `;
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${WORKER_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      handleOAuthSuccess(data.user.name, data.user.provider || 'email');
    } else {
      localStorage.removeItem('parsing_auth_token');
      sessionStorage.removeItem('parsing_auth_token');
      localStorage.removeItem('parsing_auth_provider');
      localStorage.removeItem('parsing_auth_name');
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }
}

function logout() {
  const token = localStorage.getItem('parsing_auth_token');
  if (token) {
    fetch(`${WORKER_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(console.error);
  }

  localStorage.removeItem('parsing_auth_token');
  sessionStorage.removeItem('parsing_auth_token');
  localStorage.removeItem('parsing_auth_provider');
  localStorage.removeItem('parsing_auth_name');
  localStorage.removeItem('parsing_session_id');

  window.location.reload();
}
