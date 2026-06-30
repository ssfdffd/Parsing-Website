// Navigation
function navigateToSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    }
  });

  // Close mobile menu if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Sidebar toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
  });
}

if (sidebarClose) {
  sidebarClose.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });
}

// Nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.dataset.section;
    navigateToSection(sectionId);
  });
});

// Category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Payment Modal
function showPaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close modal on outside click
document.getElementById('paymentModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'paymentModal') {
    closePaymentModal();
  }
});

// Payment method selection
document.querySelectorAll('.method-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.method-option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    option.querySelector('input').checked = true;
  });
});

// Form submissions
document.getElementById('applicationForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Show success message
  alert('Application submitted successfully! We will review your request and get back to you within 24 hours.');
  
  // Reset form
  e.target.reset();
  
  // Navigate to services page
  navigateToSection('services');
});

document.getElementById('paymentForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Simulate payment processing
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Processing...';
  btn.disabled = true;
  
  setTimeout(() => {
    alert('Payment successful! Your transaction has been processed.');
    closePaymentModal();
    btn.textContent = originalText;
    btn.disabled = false;
    e.target.reset();
  }, 2000);
});

// Toggle password visibility (if needed in settings)
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set default section to dashboard
  navigateToSection('dashboard');
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Animate stats on load
  setTimeout(() => {
    document.querySelectorAll('.stat-value').forEach(stat => {
      stat.style.opacity = '0';
      stat.style.transform = 'translateY(10px)';
      setTimeout(() => {
        stat.style.transition = 'all 0.5s ease';
        stat.style.opacity = '1';
        stat.style.transform = 'translateY(0)';
      }, 100);
    });
  }, 300);
});

// Export for global access
window.navigateToSection = navigateToSection;
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.togglePassword = togglePassword;
