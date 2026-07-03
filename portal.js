const PORTAL_API = 'https://parsing-portal.buhle-1ce.workers.dev'; // Update if your worker URL is different

// ============================================
// AUTH CHECK & USER DATA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
  if (!token) {
    window.location.href = 'account.html';
    return;
  }

  const userName = localStorage.getItem('parsing_auth_name') || 'User';
  const userEmail = localStorage.getItem('parsing_auth_email') || '';

  // Update UI with user data
  document.getElementById('portalUserName').textContent = userName;
  document.getElementById('welcomeName').textContent = userName;
  document.getElementById('settingsName').value = userName;
  
  // Set Avatar Initial
  const initial = userName.charAt(0).toUpperCase();
  document.getElementById('userAvatar').textContent = initial;

  if(userEmail) {
    document.getElementById('portalUserEmail').textContent = userEmail;
    document.getElementById('settingsEmail').value = userEmail;
  }

  // Pre-fill contact info in application form
  document.getElementById('contactName').value = userName;
  document.getElementById('contactEmail').value = userEmail;

  // Load dynamic data from database
  loadDashboardStats();
  loadApplications();
  loadPayments();

  // Initialize UI interactions
  setupNavigation();
  setupForms();
});

// ============================================
// API CALLS
// ============================================
function getHeaders() {
  const token = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${PORTAL_API}/api/dashboard`, { headers: getHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    
    document.getElementById('statActiveServices').textContent = data.activeServices || 0;
    document.getElementById('statPendingApps').textContent = data.pendingApps || 0;
    document.getElementById('statTotalSpent').textContent = `R${(data.totalSpent || 0).toLocaleString()}`;
    document.getElementById('paymentTotalPaid').textContent = `R${(data.totalSpent || 0).toLocaleString()}`;
  } catch (e) { console.error('Failed to load stats', e); }
}

async function loadApplications() {
  const container = document.getElementById('applicationsList');
  try {
    const res = await fetch(`${PORTAL_API}/api/applications`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    
    if (!data.applications || data.applications.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding: 4rem 1rem;">You haven\'t applied for any services yet.<br><br><button class="btn btn-primary" onclick="navigateToSection(\'apply\')">Apply for a Service</button></div>';
      return;
    }

    container.innerHTML = data.applications.map(app => `
      <div class="service-card">
        <div class="service-header">
          <div class="service-info">
            <h3>${app.project_name}</h3>
            <p>${app.service_type} • Order #${app.id}</p>
          </div>
          <span class="service-status ${app.status === 'pending' ? 'active' : 'completed'}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
        </div>
        <div class="service-details">
          <div class="detail-item">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">${new Date(app.created_at).toLocaleDateString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Budget:</span>
            <span class="detail-value">${app.budget || 'Not specified'}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="empty-state" style="color:#ef4444;">Failed to load services.</div>';
  }
}

async function loadPayments() {
  const tbody = document.getElementById('paymentsTableBody');
  try {
    const res = await fetch(`${PORTAL_API}/api/payments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    
    if (!data.payments || data.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No transactions found.</td></tr>';
      return;
    }

    tbody.innerHTML = data.payments.map(p => `
      <tr>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
        <td>${p.description}</td>
        <td>R${p.amount.toLocaleString()}</td>
        <td><span class="status-badge success">${p.status}</span></td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state" style="color:#ef4444;">Failed to load payments.</td></tr>';
  }
}

// ============================================
// FORM HANDLERS
// ============================================
function setupForms() {
  // Application Form
  document.getElementById('applicationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const body = {
      service_type: document.getElementById('serviceType').value,
      project_name: document.getElementById('projectName').value,
      description: document.getElementById('description').value,
      timeline: document.getElementById('timeline').value,
      budget: document.getElementById('budget').value,
      contact_name: document.getElementById('contactName').value,
      contact_email: document.getElementById('contactEmail').value,
      contact_phone: document.getElementById('contactPhone').value,
      company_name: document.getElementById('companyName').value
    };

    try {
      const res = await fetch(`${PORTAL_API}/api/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('Application submitted successfully! We will review it within 24 hours.');
        e.target.reset();
        // Re-fill contact info after reset
        document.getElementById('contactName').value = localStorage.getItem('parsing_auth_name') || '';
        document.getElementById('contactEmail').value = localStorage.getItem('parsing_auth_email') || '';
        
        loadApplications();
        loadDashboardStats();
        navigateToSection('services');
      } else {
        alert('Failed to submit application.');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
    }
  });

  // Payment Form
  document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const description = document.getElementById('paymentDescription').value;

    try {
      const res = await fetch(`${PORTAL_API}/api/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, description })
      });

      if (res.ok) {
        alert('Payment successful!');
        e.target.reset();
        closePaymentModal();
        loadPayments();
        loadDashboardStats();
      } else {
        alert('Payment failed.');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Complete Payment';
    }
  });
}

// ============================================
// UI NAVIGATION
// ============================================
function setupNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');

  if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
  if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSection(link.dataset.section);
    });
  });
}

function navigateToSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
  
  document.getElementById('sidebar')?.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPaymentModal() { document.getElementById('paymentModal')?.classList.add('active'); }
function closePaymentModal() { document.getElementById('paymentModal')?.classList.remove('active'); }

document.getElementById('paymentModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'paymentModal') closePaymentModal();
});

function logoutUser() {
  localStorage.removeItem('parsing_auth_token');
  sessionStorage.removeItem('parsing_auth_token');
  localStorage.removeItem('parsing_auth_name');
  localStorage.removeItem('parsing_auth_email');
  window.location.href = 'account.html';
}

// Export for HTML onclick attributes
window.navigateToSection = navigateToSection;
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.logoutUser = logoutUser;
