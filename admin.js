<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Parsing User Portal - Manage your services and payments" />
  <title>User Portal | Parsing</title>
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="portal.css" />
  <style>
    /* Quick fix for the logo area to match other pages */
    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .nav-favicon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      object-fit: cover;
    }
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #F0F0E0, #F4A0B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: rgba(240, 240, 224, 0.5);
      font-size: 0.9375rem;
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <img src="favicon.ico" alt="Parsing Logo" class="nav-favicon" />
        <span class="logo-text">Parsing</span>
      </div>
      <button class="sidebar-close" id="sidebarClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <a href="#dashboard" class="nav-link active" data-section="dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Dashboard
      </a>
      <a href="#services" class="nav-link" data-section="services">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        My Services
      </a>
      <a href="#apply" class="nav-link" data-section="apply">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M2 12h20"></path>
        </svg>
        Apply for Service
      </a>
      <a href="#payments" class="nav-link" data-section="payments">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        Payments
      </a>
      <a href="#progress" class="nav-link" data-section="progress">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        Track Progress
      </a>
      <a href="#settings" class="nav-link" data-section="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Settings
      </a>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" onclick="logoutUser()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Header -->
    <header class="top-header">
      <button class="menu-toggle" id="menuToggle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="header-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search services, payments..." />
      </div>

      <div class="header-actions">
        <button class="notification-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notification-badge">0</span>
        </button>

        <div class="user-profile">
          <div class="avatar" id="userAvatar">U</div>
          <div class="user-info">
            <span class="user-name" id="portalUserName">User</span>
            <span class="user-email" id="portalUserEmail">user@example.com</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard Section -->
    <section id="dashboard" class="section active">
      <div class="section-header">
        <h1 class="section-title">Welcome back, <span id="welcomeName">User</span>!</h1>
        <p class="section-subtitle">Here's an overview of your account.</p>
      </div>

      <!-- Stats Grid (Cleared) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">0</span>
            <span class="stat-label">Active Services</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">0</span>
            <span class="stat-label">Pending Applications</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">R0</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">—</span>
            <span class="stat-label">Avg. Progress</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity (Cleared) -->
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div class="activity-list">
            <div class="empty-state">No recent activity to display.</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div class="quick-actions">
            <button class="action-btn" onclick="navigateToSection('apply')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h20"></path>
              </svg>
              Apply for Service
            </button>
            <button class="action-btn" onclick="navigateToSection('payments')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Make Payment
            </button>
            <button class="action-btn" onclick="navigateToSection('progress')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Track Progress
            </button>
            <button class="action-btn" onclick="navigateToSection('services')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section (Cleared) -->
    <section id="services" class="section">
      <div class="section-header">
        <h1 class="section-title">My Services</h1>
        <p class="section-subtitle">Manage and track all your active services.</p>
      </div>
      <div class="card">
        <div class="empty-state" style="padding: 4rem 1rem;">
          You haven't purchased any services yet.
          <br><br>
          <button class="btn btn-primary" onclick="navigateToSection('apply')">Apply for a Service</button>
        </div>
      </div>
    </section>

    <!-- Apply Section (Kept form structure, cleared values) -->
    <section id="apply" class="section">
      <div class="section-header">
        <h1 class="section-title">Apply for Service</h1>
        <p class="section-subtitle">Choose from our range of professional services.</p>
      </div>

      <div class="apply-container">
        <div class="application-form-container">
          <form id="applicationForm" class="application-form">
            <div class="form-section">
              <h3>Service Details</h3>
              <div class="form-group">
                <label for="serviceType">Service Type *</label>
                <select id="serviceType" required>
                  <option value="">Select a service</option>
                  <option value="static-website">Static Website - R500</option>
                  <option value="dynamic-website">Dynamic Website - R1,200</option>
                  <option value="social-starter">Social Media Starter - R3,500/mo</option>
                  <option value="social-growth">Social Media Growth - R5,500/mo</option>
                  <option value="social-premium">Social Media Premium - R7,500/mo</option>
                  <option value="seo">SEO Package - R200</option>
                  <option value="advertising">Advertising Package - R140</option>
                </select>
              </div>

              <div class="form-group">
                <label for="projectName">Project Name *</label>
                <input type="text" id="projectName" placeholder="e.g., Company Website Redesign" required />
              </div>

              <div class="form-group">
                <label for="description">Project Description *</label>
                <textarea id="description" rows="5" placeholder="Describe your project requirements..." required></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Submit Application</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Payments Section (Cleared) -->
    <section id="payments" class="section">
      <div class="section-header">
        <h1 class="section-title">Payments</h1>
        <p class="section-subtitle">Manage your payments and view transaction history.</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Transaction History</h3>
        </div>
        <div class="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="transactionsBody">
              <!-- Empty by default -->
            </tbody>
          </table>
          <div id="noTransactionsMsg" class="empty-state">No transactions found.</div>
        </div>
      </div>
    </section>

    <!-- Progress Section (Cleared) -->
    <section id="progress" class="section">
      <div class="section-header">
        <h1 class="section-title">Track Progress</h1>
        <p class="section-subtitle">Monitor the status of your ongoing projects.</p>
      </div>
      <div class="card">
        <div class="empty-state">No active projects to track.</div>
      </div>
    </section>

    <!-- Settings Section (Cleared) -->
    <section id="settings" class="section">
      <div class="section-header">
        <h1 class="section-title">Account Settings</h1>
        <p class="section-subtitle">Manage your account preferences.</p>
      </div>

      <div class="settings-grid">
        <div class="card">
          <h3>Profile Information</h3>
          <form class="settings-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="settingsName" value="" placeholder="Your Name" />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="settingsEmail" value="" placeholder="your@email.com" />
            </div>
            <button type="button" class="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </section>
  </main>

  <script src="portal.js"></script>
  <script>
    // ============================================
    // PORTAL AUTH & USER DATA LOGIC
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Check if user is logged in
      const token = localStorage.getItem('parsing_auth_token') || sessionStorage.getItem('parsing_auth_token');
      if (!token) {
        // Redirect to login if no token
        window.location.href = 'account.html';
        return;
      }

      // 2. Fetch user data from localStorage
      const userName = localStorage.getItem('parsing_auth_name') || 'User';
      const userEmail = localStorage.getItem('parsing_auth_email') || ''; // You can store this during login if needed
      const userProvider = localStorage.getItem('parsing_auth_provider') || 'email';

      // 3. Update UI with user data
      document.getElementById('portalUserName').textContent = userName;
      document.getElementById('welcomeName').textContent = userName;
      document.getElementById('settingsName').value = userName;
      
      // Set Avatar Initial
      const initial = userName.charAt(0).toUpperCase();
      document.getElementById('userAvatar').textContent = initial;

      // If you stored email during login, uncomment below:
      // if(userEmail) {
      //   document.getElementById('portalUserEmail').textContent = userEmail;
      //   document.getElementById('settingsEmail').value = userEmail;
      // } else {
      //   document.getElementById('portalUserEmail').style.display = 'none';
      // }
    });

    function logoutUser() {
      localStorage.removeItem('parsing_auth_token');
      sessionStorage.removeItem('parsing_auth_token');
      localStorage.removeItem('parsing_auth_name');
      localStorage.removeItem('parsing_auth_provider');
      localStorage.removeItem('parsing_auth_email');
      window.location.href = 'account.html';
    }
  </script>
</body>
</html>
