const WORKER_URL = 'https://parsing-auth.buhle-1ce.workers.dev';
let compressedImageData = null;
let currentApplicationId = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('parsing_auth_token');
  if (!token) { window.location.href = 'account.html'; return; }

  // Decode JWT to verify admin
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.is_admin) {
      alert('Access denied. Admin only.');
      window.location.href = 'portal.html';
      return;
    }
    document.getElementById('adminUserName').textContent = payload.name || 'Administrator';
    document.getElementById('adminAvatar').textContent = (payload.name || 'A').charAt(0).toUpperCase();
    document.getElementById('adminSettingsName').value = payload.name || '';
    document.getElementById('adminSettingsEmail').value = payload.email || '';
  } catch (e) {
    window.location.href = 'account.html';
    return;
  }

  // Navbar navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (sectionId) navigateToAdminSection(sectionId);
    });
  });

  // Mobile menu
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
  });
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
  });

  // Load data
  loadAdminStats();
  loadAdminArticles();
  loadAdminApplications();
  loadAdminUsers();
  loadAdminPayments();
  loadAdminMessages();

  // Article form
  document.getElementById('createArticleForm').addEventListener('submit', handleArticleSubmit);
  document.getElementById('artCoverImage').addEventListener('change', handleImageUpload);
  document.getElementById('adminSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Settings saved!');
  });
});

function navigateToAdminSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('active');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('parsing_auth_token')}`
  };
}

async function loadAdminStats() {
  try {
    const res = await fetch(`${WORKER_URL}/api/admin/stats`, { headers: getHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('stat-totalUsers').textContent = data.totalUsers || 0;
    document.getElementById('stat-activeServices').textContent = data.activeServices || 0;
    document.getElementById('stat-pendingApps').textContent = data.pendingApps || 0;
    document.getElementById('stat-revenue').textContent = `R${(data.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('appCount').textContent = data.pendingApps || 0;
  } catch (e) { console.error(e); }
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800, MAX_HEIGHT = 600;
      let width = img.width, height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      compressedImageData = canvas.toDataURL('image/jpeg', 0.7);
      const preview = document.getElementById('coverImagePreview');
      preview.src = compressedImageData;
      preview.style.display = 'block';
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

async function handleArticleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('publishArticleBtn');
  btn.disabled = true; btn.textContent = 'Publishing...';
  const payload = {
    title: document.getElementById('artTitle').value,
    author_initials: document.getElementById('artInitials').value,
    author_surname: document.getElementById('artSurname').value,
    topic: document.getElementById('artTopic').value,
    excerpt: document.getElementById('artExcerpt').value,
    content: document.getElementById('artContent').value,
    cover_image: compressedImageData
  };
  try {
    const res = await fetch(`${WORKER_URL}/api/articles`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('Article published!');
      e.target.reset();
      document.getElementById('coverImagePreview').style.display = 'none';
      compressedImageData = null;
      loadAdminArticles();
      loadAdminStats();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Failed'));
    }
  } catch (err) { alert('Network error.'); }
  finally { btn.disabled = false; btn.textContent = 'Publish Article'; }
}

async function loadAdminArticles() {
  const container = document.getElementById('adminArticlesList');
  try {
    const res = await fetch(`${WORKER_URL}/api/articles/admin`, { headers: getHeaders() });
    const data = await res.json();
    document.getElementById('articleCount').textContent = data.articles?.length || 0;
    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = '<div class="empty-state">No articles yet.</div>';
      return;
    }
    container.innerHTML = data.articles.map(art => `
      <div style="display:flex; gap:1.5rem; padding:1.5rem; border-bottom:1px solid var(--border-color); align-items:center;">
        ${art.cover_image ? `<img src="${art.cover_image}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" />` : '<div style="width:100px; height:70px; background:var(--bg-card); border-radius:8px;"></div>'}
        <div style="flex:1;">
          <h4 style="color:var(--cream); margin-bottom:0.25rem;">${art.title}</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);">By ${art.author_initials} ${art.author_surname} • ${art.topic}</p>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteArticle(${art.id})">Delete</button>
      </div>
    `).join('');
  } catch (e) { container.innerHTML = '<div class="empty-state">Failed to load.</div>'; }
}

async function deleteArticle(id) {
  if (!confirm('Delete this article?')) return;
  await fetch(`${WORKER_URL}/api/articles/${id}`, { method: 'DELETE', headers: getHeaders() });
  loadAdminArticles();
}

async function loadAdminApplications() {
  const tbody = document.getElementById('applicationsTableBody');
  try {
    const res = await fetch(`${WORKER_URL}/api/admin/applications`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.applications || data.applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No applications.</td></tr>';
      return;
    }
    tbody.innerHTML = data.applications.map(app => `
      <tr>
        <td>#${app.id}</td>
        <td>${app.user_name || 'Unknown'}</td>
        <td>${app.service_type}</td>
        <td>${new Date(app.created_at).toLocaleDateString()}</td>
        <td>${app.budget || '-'}</td>
        <td><span class="status-badge ${app.status}">${app.status}</span></td>
        <td><button class="btn btn-primary btn-sm" onclick="openApplicationModal(${app.id}, '${app.user_name}', '${app.service_type}', '${app.project_name}', '${(app.description||'').replace(/'/g, "\\'")}', '${app.budget||''}', ${app.user_id})">Review</button></td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Failed to load.</td></tr>'; }
}

function openApplicationModal(id, user, service, project, desc, budget, userId) {
  currentApplicationId = id;
  currentUserId = userId;
  document.getElementById('modalBody').innerHTML = `
    <p><strong>User:</strong> ${user}</p>
    <p><strong>Service:</strong> ${service}</p>
    <p><strong>Project:</strong> ${project}</p>
    <p><strong>Description:</strong> ${desc}</p>
    <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
    <div class="form-group" style="margin-top:1rem;">
      <label>Admin Message (sent to user)</label>
      <textarea id="adminReplyMessage" rows="3" placeholder="Optional message to user..."></textarea>
    </div>
  `;
  document.getElementById('applicationModal').classList.add('active');
}

function closeApplicationModal() {
  document.getElementById('applicationModal').classList.remove('active');
}

document.getElementById('approveBtn').addEventListener('click', async () => {
  if (!currentApplicationId) return;
  const message = document.getElementById('adminReplyMessage')?.value || '';
  await fetch(`${WORKER_URL}/api/admin/applications/${currentApplicationId}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ status: 'approved', admin_message: message })
  });
  closeApplicationModal();
  loadAdminApplications();
  loadAdminStats();
  loadAdminMessages();
});

document.getElementById('rejectBtn').addEventListener('click', async () => {
  if (!currentApplicationId) return;
  const message = document.getElementById('adminReplyMessage')?.value || '';
  await fetch(`${WORKER_URL}/api/admin/applications/${currentApplicationId}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ status: 'rejected', admin_message: message })
  });
  closeApplicationModal();
  loadAdminApplications();
  loadAdminStats();
  loadAdminMessages();
});

async function loadAdminUsers() {
  const tbody = document.getElementById('usersTableBody');
  try {
    const res = await fetch(`${WORKER_URL}/api/admin/users`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No users.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Failed to load.</td></tr>'; }
}

async function loadAdminPayments() {
  const tbody = document.getElementById('paymentsTableBody');
  try {
    const res = await fetch(`${WORKER_URL}/api/admin/payments`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.payments || data.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No payments.</td></tr>';
      return;
    }
    tbody.innerHTML = data.payments.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td>${p.user_name || 'Unknown'}</td>
        <td>R${(p.amount || 0).toLocaleString()}</td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
        <td><span class="status-badge ${p.status}">${p.status}</span></td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load.</td></tr>'; }
}

async function loadAdminMessages() {
  const container = document.getElementById('adminMessagesList');
  try {
    const res = await fetch(`${WORKER_URL}/api/admin/messages`, { headers: getHeaders() });
    const data = await res.json();
    document.getElementById('msgCount').textContent = data.messages?.length || 0;
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = '<div class="empty-state">No messages.</div>';
      return;
    }
    container.innerHTML = data.messages.map(m => `
      <div style="padding:1rem; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <strong style="color:var(--coral-pink);">${m.subject || 'Message'}</strong>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${new Date(m.created_at).toLocaleString()}</span>
        </div>
        <p style="color:var(--cream); margin-bottom:0.5rem;">${m.content}</p>
        <p style="font-size:0.8rem; color:var(--text-secondary);">From: ${m.user_name || 'Admin'} ${m.is_admin_sender ? '(Admin)' : '(User)'}</p>
        ${!m.is_admin_sender ? `<button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="replyToUser(${m.sender_id}, '${(m.subject||'').replace(/'/g, "\\'")}')">Reply</button>` : ''}
      </div>
    `).join('');
  } catch (e) { container.innerHTML = '<div class="empty-state">Failed to load.</div>'; }
}

function replyToUser(userId, subject) {
  const reply = prompt('Your reply:');
  if (!reply) return;
  fetch(`${WORKER_URL}/api/admin/messages`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ recipient_id: userId, content: reply, subject: 'Re: ' + subject })
  }).then(() => {
    alert('Reply sent!');
    loadAdminMessages();
  });
}

function adminLogout() {
  localStorage.removeItem('parsing_auth_token');
  localStorage.removeItem('parsing_auth_name');
  window.location.href = 'account.html';
}
