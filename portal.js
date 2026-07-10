const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
  if (!token) { window.location.href = 'account.html'; return; }

  // Check if admin -> redirect to admin
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.is_admin) { window.location.href = 'admin.html'; return; }
  } catch (e) {}

  const userName = localStorage.getItem('parsing_auth_name') || 'User';
  const userEmail = localStorage.getItem('parsing_auth_email') || '';

  // Update UI
  document.getElementById('portalUserName').textContent = userName;
  document.getElementById('welcomeName').textContent = userName;
  document.getElementById('portalUserEmail').textContent = userEmail;
  document.getElementById('settingsName').value = userName;
  document.getElementById('settingsEmail').value = userEmail;
  document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
  
  // Pre-fill contact info
  document.getElementById('contactName').value = userName;
  document.getElementById('contactEmail').value = userEmail;

  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (sectionId) navigateToSection(sectionId);
    });
  });

  // Mobile Menu
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
  });
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
  });

  // Load Data
  loadDashboardStats();
  loadApplications();
  loadPayments();
  loadUpdates();

  // Form Submissions
  document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
  document.getElementById('paymentForm').addEventListener('submit', handlePaymentSubmit);
});

function navigateToSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('active');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token')}`
  };
}

// ============================================
// DATA FETCHING
// ============================================
async function loadDashboardStats() {
  try {
    const res = await fetch(`${WORKER_URL}/api/dashboard`, { headers: getHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('statActiveServices').textContent = data.activeServices || 0;
    document.getElementById('statPendingApps').textContent = data.pendingApps || 0;
    document.getElementById('statTotalSpent').textContent = `R${(data.totalSpent || 0).toLocaleString()}`;
    document.getElementById('paymentTotalPaid').textContent = `R${(data.totalSpent || 0).toLocaleString()}`;
  } catch (e) { console.error('Stats error:', e); }
}

async function loadApplications() {
  const container = document.getElementById('applicationsList');
  try {
    const res = await fetch(`${WORKER_URL}/api/applications`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.applications || data.applications.length === 0) {
      container.innerHTML = '<div class="empty-state">No services yet. <button class="btn btn-primary btn-sm" onclick="navigateToSection(\'apply\')">Apply Now</button></div>';
      return;
    }
    container.innerHTML = data.applications.map(app => `
      <div style="padding:1rem; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <h4 style="color:var(--cream);">${app.project_name}</h4>
          <span class="status-badge ${app.status}">${app.status}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary);">${app.service_type} • Order #${app.id}</p>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Submitted: ${new Date(app.created_at).toLocaleDateString()}</p>
      </div>
    `).join('');
  } catch (e) { container.innerHTML = '<div class="empty-state">Failed to load services.</div>'; }
}

async function loadPayments() {
  const tbody = document.getElementById('paymentsTableBody');
  try {
    const res = await fetch(`${WORKER_URL}/api/payments`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.payments || data.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No transactions.</td></tr>';
      return;
    }
    tbody.innerHTML = data.payments.map(p => `
      <tr>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
        <td>${p.description}</td>
        <td>R${(p.amount || 0).toLocaleString()}</td>
        <td><span class="status-badge ${p.status}">${p.status}</span></td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Failed to load payments.</td></tr>'; }
}

async function loadUpdates() {
  const container = document.getElementById('updatesList');
  try {
    const res = await fetch(`${WORKER_URL}/api/messages`, { headers: getHeaders() });
    const data = await res.json();
    document.getElementById('updatesBadge').textContent = data.messages?.length || 0;
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = '<div class="empty-state">No updates yet. Apply for a service to get started!</div>';
      return;
    }
    container.innerHTML = data.messages.map(m => `
      <div class="update-item ${!m.is_read ? 'unread' : ''}">
        <div class="update-subject">${m.subject || 'Update'}</div>
        <div class="update-content">${m.content}</div>
        <div class="update-meta">${new Date(m.created_at).toLocaleString()} ${m.is_admin_sender ? '• From Admin' : ''}</div>
      </div>
    `).join('');
  } catch (e) { container.innerHTML = '<div class="empty-state">Failed to load updates.</div>'; }
}

// ============================================
// FORM SUBMISSIONS (WITH DETAILED ERROR LOGGING)
// ============================================
async function handleApplicationSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true; 
  btn.textContent = 'Submitting...';
  
  const payload = {
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

  console.log('📤 Submitting Application Payload:', payload);

  try {
    const res = await fetch(`${WORKER_URL}/api/applications`, {
      method: 'POST', 
      headers: getHeaders(), 
      body: JSON.stringify(payload)
    });
    
    const resultData = await res.json();
    console.log('📥 Worker Response:', res.status, resultData);

    if (res.ok) {
      alert('✅ Application submitted successfully!');
      e.target.reset();
      // Restore pre-filled contact info
      document.getElementById('contactName').value = localStorage.getItem('parsing_auth_name') || '';
      document.getElementById('contactEmail').value = localStorage.getItem('parsing_auth_email') || '';
      loadApplications();
      loadDashboardStats();
      navigateToSection('services');
    } else {
      // Show the EXACT error from the worker
      alert('❌ Error: ' + (resultData.error || 'Failed to submit application.'));
    }
  } catch (err) { 
    console.error('💥 Fetch Error:', err);
    alert('💥 Network error: ' + err.message); 
  } finally { 
    btn.disabled = false; 
    btn.textContent = originalText; 
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true; 
  btn.textContent = 'Processing...';
  
  const payload = {
    amount: parseFloat(document.getElementById('paymentAmount').value),
    description: document.getElementById('paymentDescription').value
  };

  console.log('💳 Submitting Payment Payload:', payload);

  try {
    const res = await fetch(`${WORKER_URL}/api/payments`, {
      method: 'POST', 
      headers: getHeaders(), 
      body: JSON.stringify(payload)
    });
    
    const resultData = await res.json();
    console.log('📥 Worker Response:', res.status, resultData);

    if (res.ok) {
      alert('✅ Payment successful!');
      e.target.reset();
      closePaymentModal();
      loadPayments();
      loadDashboardStats();
    } else {
      alert('❌ Error: ' + (resultData.error || 'Payment failed.'));
    }
  } catch (err) { 
    console.error('💥 Fetch Error:', err);
    alert('💥 Network error: ' + err.message); 
  } finally { 
    btn.disabled = false; 
    btn.textContent = originalText; 
  }
}

function showPaymentModal() { document.getElementById('paymentModal').classList.add('active'); }
function closePaymentModal() { document.getElementById('paymentModal').classList.remove('active'); }

function logoutUser() {
  localStorage.removeItem('parsing_auth_token');
  sessionStorage.removeItem('parsing_auth_token');
  localStorage.removeItem('parsing_auth_name');
  localStorage.removeItem('parsing_auth_email');
  window.location.href = 'account.html';
}
