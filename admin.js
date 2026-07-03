// Mock Data
const applicationsData = [
  {
    id: 'APP-001',
    applicant: 'Sarah Johnson',
    email: 'sarah@techcorp.co.za',
    service: 'Social Media Growth',
    date: 'June 28, 2026',
    budget: 'R5,500/mo',
    status: 'pending',
    description: 'Looking to grow our TikTok and Instagram presence. We need 3 posts per week including Reels and monthly analytics.'
  },
  {
    id: 'APP-002',
    applicant: 'TechCorp Ltd',
    email: 'info@techcorp.co.za',
    service: 'Dynamic Website',
    date: 'June 27, 2026',
    budget: 'R1,200',
    status: 'pending',
    description: 'Need a dynamic website with CMS for our blog and product listings. Must be mobile responsive.'
  },
  {
    id: 'APP-003',
    applicant: 'Mike Peters',
    email: 'mike.p@gmail.com',
    service: 'SEO Package',
    date: 'June 26, 2026',
    budget: 'R200',
    status: 'pending',
    description: 'Want to improve our search rankings for local keywords in Johannesburg.'
  },
  {
    id: 'APP-004',
    applicant: 'Lisa Mokoena',
    email: 'lisa.m@startup.co.za',
    service: 'Static Website',
    date: 'June 25, 2026',
    budget: 'R500',
    status: 'pending',
    description: 'Simple portfolio website for my photography business. Need gallery and contact form.'
  }
];

// Navigation
function navigateToSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    }
  });

  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }

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

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const parent = this.parentElement;
    parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    // In a real app, this would filter the table
    console.log('Filter:', this.dataset.filter);
  });
});

// Render Applications Table
function renderApplicationsTable(filter = 'all') {
  const tbody = document.querySelector('#applicationsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filteredData = filter === 'all' 
    ? applicationsData 
    : applicationsData.filter(app => app.status === filter);

  filteredData.forEach(app => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${app.id}</td>
      <td>
        <div class="user-cell">
          <div class="avatar small">${app.applicant.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <div>${app.applicant}</div>
            <div style="font-size: 0.8125rem; color: rgba(240,240,224,0.5);">${app.email}</div>
          </div>
        </div>
      </td>
      <td>${app.service}</td>
      <td>${app.date}</td>
      <td>${app.budget}</td>
      <td><span class="status-badge ${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
      <td>
        <button class="btn-icon" onclick="viewApplication('${app.id}')" title="View Details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// View Application Modal
function viewApplication(appId) {
  const app = applicationsData.find(a => a.id === appId);
  if (!app) return;

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Application ID</span>
      <span class="detail-value">${app.id}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Applicant Name</span>
      <span class="detail-value">${app.applicant}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email Address</span>
      <span class="detail-value">${app.email}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Service Requested</span>
      <span class="detail-value">${app.service}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Budget</span>
      <span class="detail-value">${app.budget}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Date Submitted</span>
      <span class="detail-value">${app.date}</span>
    </div>
    <div class="detail-row" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
      <span class="detail-label">Project Description</span>
      <p style="color: var(--cream); line-height: 1.6; margin-top: 0.5rem;">${app.description}</p>
    </div>
  `;

  // Update modal buttons
  document.getElementById('approveBtn').onclick = () => approveApplication(appId);
  document.getElementById('rejectBtn').onclick = () => rejectApplication(appId);

  document.getElementById('applicationModal').classList.add('active');
}

function closeApplicationModal() {
  document.getElementById('applicationModal').classList.remove('active');
}

function approveApplication(appId) {
  const app = applicationsData.find(a => a.id === appId);
  if (app) {
    app.status = 'approved';
    renderApplicationsTable();
    closeApplicationModal();
    alert(`Application ${appId} approved successfully!`);
  }
}

function rejectApplication(appId) {
  const app = applicationsData.find(a => a.id === appId);
  if (app) {
    app.status = 'rejected';
    renderApplicationsTable();
    closeApplicationModal();
    alert(`Application ${appId} rejected.`);
  }
}

// Close modal on outside click
document.getElementById('applicationModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'applicationModal') {
    closeApplicationModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderApplicationsTable();
  
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
// ============================================
// ADMIN ARTICLES MANAGEMENT
// ============================================
const ADMIN_API = 'https://parsing-auth.buhle-1ce.workers.dev';

function getAdminToken() {
  return localStorage.getItem('parsing_auth_token') || localStorage.getItem('parsing_token');
}

// Create Article
document.getElementById('createArticleForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = getAdminToken();
  if (!token) { alert('Please login first'); return; }

  const body = {
    title: document.getElementById('artTitle').value,
    author_initials: document.getElementById('artInitials').value,
    author_surname: document.getElementById('artSurname').value,
    topic: document.getElementById('artTopic').value,
    excerpt: document.getElementById('artExcerpt').value,
    content: document.getElementById('artContent').value
  };

  try {
    const res = await fetch(`${ADMIN_API}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      alert('Article published successfully!');
      e.target.reset();
      loadAdminArticles();
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  } catch { alert('Network error'); }
});

// Load Admin Articles
async function loadAdminArticles() {
  const container = document.getElementById('adminArticlesList');
  if (!container) return;
  const token = getAdminToken();
  if (!token) return;

  try {
    const res = await fetch(`${ADMIN_API}/api/articles/admin`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem;">No articles yet.</p>';
      return;
    }

    container.innerHTML = `<div class="table-responsive"><table class="data-table">
      <thead><tr><th>Title</th><th>Author</th><th>Topic</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${data.articles.map(a => `<tr>
        <td>${a.title}</td>
        <td>${a.author_initials}. ${a.author_surname}</td>
        <td>${a.topic}</td>
        <td>${new Date(a.published_at).toLocaleDateString()}</td>
        <td>
          <button class="btn-icon" onclick="deleteArticle(${a.id})" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>`).join('')}</tbody></table></div>`;
  } catch { container.innerHTML = '<p style="color:#ef4444;">Failed to load articles.</p>'; }
}

async function deleteArticle(id) {
  if (!confirm('Delete this article?')) return;
  const token = getAdminToken();
  await fetch(`${ADMIN_API}/api/articles/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  loadAdminArticles();
}

// Load on init
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadAdminArticles, 500);
});

// Export for global access
window.navigateToSection = navigateToSection;
window.viewApplication = viewApplication;
window.closeApplicationModal = closeApplicationModal;
