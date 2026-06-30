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

  // Form Submissions
  document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    btn.classList.add('loading-state');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    btn.classList.remove('loading-state');
    alert('Login successful! (Demo only)');
  });

  document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    btn.classList.add('loading-state');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    btn.classList.remove('loading-state');
    alert('Account created successfully! (Demo only)');
  });

  // Create floating particles
  function createParticles() {
    const container = document.getElementById('particles');
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
