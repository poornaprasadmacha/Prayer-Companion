/**
 * Prayer Companion - Admin Dashboard Module
 * Handles server-side administrative allowlist verification,
 * aggregated statistics, user management, privacy-conscious prayer point
 * inspection, email delivery monitoring, community moderation, and audit logs.
 */

const Admin = {
  currentSubTab: 'overview',
  adminEmail: 'poornaprasad12344@gmail.com',
  cachedUsers: [],

  isAdminUser() {
    return Auth.isLoggedIn() && (Auth.getUserEmail() || '').toLowerCase() === this.adminEmail.toLowerCase();
  },

  async init() {
    this.bindEvents();
    if (this.isAdminUser()) {
      await this.loadOverview();
    }
  },

  bindEvents() {
    document.querySelectorAll('[data-admin-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subTab = e.currentTarget.getAttribute('data-admin-tab');
        this.switchSubTab(subTab);
      });
    });

    // Users search & filter
    const userSearchInput = document.getElementById('admin-user-search');
    if (userSearchInput) {
      userSearchInput.addEventListener('input', () => {
        clearTimeout(this.userDebounce);
        this.userDebounce = setTimeout(() => this.loadUsers(1), 300);
      });
    }

    const userStatusSelect = document.getElementById('admin-user-status-filter');
    if (userStatusSelect) {
      userStatusSelect.addEventListener('change', () => this.loadUsers(1));
    }

    const exportUsersBtn = document.getElementById('btn-admin-export-users');
    if (exportUsersBtn) {
      exportUsersBtn.addEventListener('click', () => this.exportUsersCsv());
    }

    // Prayer points filters
    const ppCategoryFilter = document.getElementById('admin-pp-category-filter');
    if (ppCategoryFilter) {
      ppCategoryFilter.addEventListener('change', () => this.loadPrayerPoints(1));
    }

    const ppStatusFilter = document.getElementById('admin-pp-status-filter');
    if (ppStatusFilter) {
      ppStatusFilter.addEventListener('change', () => this.loadPrayerPoints(1));
    }

    const ppEmailFilter = document.getElementById('admin-pp-email-filter');
    if (ppEmailFilter) {
      ppEmailFilter.addEventListener('input', () => {
        clearTimeout(this.ppDebounce);
        this.ppDebounce = setTimeout(() => this.loadPrayerPoints(1), 300);
      });
    }

    // Email logs filter
    const emailLogStatus = document.getElementById('admin-email-status-filter');
    if (emailLogStatus) {
      emailLogStatus.addEventListener('change', () => this.loadEmailLogs(1));
    }

    // Admin test email button
    const testEmailBtn = document.getElementById('btn-admin-test-email');
    if (testEmailBtn) {
      testEmailBtn.addEventListener('click', () => this.sendAdminTestEmail());
    }
  },

  switchSubTab(subTabName) {
    this.currentSubTab = subTabName;

    document.querySelectorAll('[data-admin-tab]').forEach(btn => {
      if (btn.getAttribute('data-admin-tab') === subTabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-subpanel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`admin-panel-${subTabName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    switch (subTabName) {
      case 'overview':
        this.loadOverview();
        break;
      case 'users':
        this.loadUsers(1);
        break;
      case 'prayer_stats':
        this.loadPrayerStats();
        break;
      case 'prayer_points':
        this.loadPrayerPoints(1);
        break;
      case 'email_reminders':
        this.loadEmailLogs(1);
        break;
      case 'moderation':
        this.loadModeration();
        break;
      case 'audit_logs':
        this.loadAuditLogs(1);
        break;
    }
  },

  /**
   * Check access & render access denied state if not authorized
   */
  checkAccess() {
    const accessDenied = document.getElementById('admin-access-denied');
    const adminContent = document.getElementById('admin-content-container');

    if (!this.isAdminUser()) {
      if (accessDenied) accessDenied.style.display = 'block';
      if (adminContent) adminContent.style.display = 'none';
      return false;
    }

    if (accessDenied) accessDenied.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    return true;
  },

  /**
   * 1. Overview Tab
   */
  async loadOverview() {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_overview',
          token: Auth.token
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error || 'Failed to fetch overview stats.');

      const s = res.stats;
      // Populate overview cards
      this.setVal('adm-stat-total-users', s.users.total);
      this.setVal('adm-stat-new-users-today', s.users.new_today);
      this.setVal('adm-stat-users-7d', s.users.last_7_days);

      this.setVal('adm-stat-active-prayers', s.prayers.total_active);
      this.setVal('adm-stat-prayers-today', s.prayers.created_today);
      this.setVal('adm-stat-prayed-today', s.prayers.prayed_today);
      this.setVal('adm-stat-answered', s.prayers.total_answered);

      this.setVal('adm-stat-thanksgiving', s.thanksgiving.total);

      this.setVal('adm-stat-morning-reminders', s.reminders.morning_enabled);
      this.setVal('adm-stat-evening-reminders', s.reminders.evening_enabled);
      this.setVal('adm-stat-emails-sent-today', s.reminders.emails_sent_today);
      this.setVal('adm-stat-emails-failed-today', s.reminders.emails_failed_today);

      this.setVal('adm-stat-comm-requests', s.community.total_requests);
      this.setVal('adm-stat-comm-active', s.community.active_requests);
      this.setVal('adm-stat-comm-commitments', s.community.total_commitments);
      this.setVal('adm-stat-comm-reports', s.community.pending_reports);
    } catch (err) {
      UI.toast('Admin Overview Error: ' + err.message, 'error');
    }
  },

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== undefined ? val : '0';
  },

  /**
   * 2. Users Management Tab
   */
  async loadUsers(page = 1) {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    const searchInput = document.getElementById('admin-user-search');
    const search = searchInput ? searchInput.value : '';

    const statusSelect = document.getElementById('admin-user-status-filter');
    const status = statusSelect ? statusSelect.value : 'all';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_users',
          token: Auth.token,
          page: page,
          limit: 20,
          search: search,
          status: status
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      this.cachedUsers = res.users;
      const tbody = document.getElementById('admin-users-tbody');
      if (!tbody) return;

      if (res.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #718096; padding: 20px;">No users found.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.users.map(u => `
        <tr>
          <td><strong>${UI.escape(u.email)}</strong></td>
          <td>${new Date(u.created_at).toLocaleDateString()}</td>
          <td>${u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A'}</td>
          <td style="text-align: center;">${u.active_prayers}</td>
          <td style="text-align: center;">${u.answered_prayers}</td>
          <td style="text-align: center;">${u.thanksgiving_entries}</td>
          <td>
            <span class="badge ${u.morning_reminder ? 'badge-category' : 'badge-priority-low'}">Morning: ${u.morning_reminder ? 'On' : 'Off'}</span>
            <span class="badge ${u.evening_reminder ? 'badge-category' : 'badge-priority-low'}">Evening: ${u.evening_reminder ? 'On' : 'Off'}</span>
          </td>
          <td>
            <span class="badge ${u.status === 'active' ? 'badge-answered' : 'badge-priority-high'}">${u.status}</span>
          </td>
        </tr>
      `).join('');

      const countEl = document.getElementById('admin-users-count');
      if (countEl) countEl.textContent = `Showing ${res.users.length} of ${res.total} users (Page ${res.page} of ${res.total_pages})`;
    } catch (err) {
      UI.toast('Failed to load users: ' + err.message, 'error');
    }
  },

  exportUsersCsv() {
    if (!this.cachedUsers || this.cachedUsers.length === 0) {
      UI.toast('No users data to export.', 'warning');
      return;
    }

    const headers = ['Email', 'Registration_Date', 'Last_Active', 'Active_Prayers', 'Answered_Prayers', 'Thanksgiving_Entries', 'Morning_Email', 'Evening_Email', 'Timezone', 'Status'];
    const rows = this.cachedUsers.map(u => [
      `"${u.email}"`,
      `"${u.created_at}"`,
      `"${u.last_login || ''}"`,
      u.active_prayers,
      u.answered_prayers,
      u.thanksgiving_entries,
      u.morning_reminder,
      u.evening_reminder,
      `"${u.timezone}"`,
      `"${u.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-companion-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    UI.toast('Users report exported to CSV', 'success');
  },

  /**
   * 3. Prayer Statistics & Trends Tab
   */
  async loadPrayerStats() {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_prayer_stats',
          token: Auth.token
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      const t = res.trends;

      // Status distribution
      this.setVal('adm-dist-active', t.status_distribution.active);
      this.setVal('adm-dist-archived', t.status_distribution.archived);
      this.setVal('adm-dist-answered', t.status_distribution.answered);

      // Render category breakdown list
      const catListEl = document.getElementById('admin-categories-breakdown');
      if (catListEl) {
        catListEl.innerHTML = Object.entries(t.categories).map(([cat, count]) => `
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color); font-size: 13px;">
            <span>${UI.escape(cat)}</span>
            <strong style="color: #023E8A;">${count}</strong>
          </div>
        `).join('');
      }

      // Render 14-day time series table/bar
      const chartEl = document.getElementById('admin-trends-chart');
      if (chartEl && t.time_series) {
        chartEl.innerHTML = t.time_series.map(d => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #EDF2F7;">
            <span style="font-weight: 500; width: 90px;">${d.date.substring(5)}</span>
            <div style="flex: 1; display: flex; gap: 8px; align-items: center;">
              <span style="background: #EBF8FF; color: #023E8A; padding: 2px 6px; border-radius: 4px;">Created: ${d.created}</span>
              <span style="background: #E6FFFA; color: #008080; padding: 2px 6px; border-radius: 4px;">Prayed: ${d.prayed}</span>
              <span style="background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 4px;">Answered: ${d.answered}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      UI.toast('Failed to load prayer stats: ' + err.message, 'error');
    }
  },

  /**
   * 4. Privacy-Conscious Prayer Points Viewer
   */
  async loadPrayerPoints(page = 1) {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    const email = document.getElementById('admin-pp-email-filter')?.value || '';
    const category = document.getElementById('admin-pp-category-filter')?.value || 'all';
    const status = document.getElementById('admin-pp-status-filter')?.value || 'all';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_prayer_points',
          token: Auth.token,
          email: email,
          category: category,
          status: status,
          page: page,
          limit: 20
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      const tbody = document.getElementById('admin-pp-tbody');
      if (!tbody) return;

      if (res.prayer_points.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #718096; padding: 20px;">No prayer points matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.prayer_points.map(p => `
        <tr>
          <td>${UI.escape(p.user_email)}</td>
          <td><strong>${UI.escape(p.title)}</strong></td>
          <td><span class="badge badge-category">${UI.escape(p.category)}</span></td>
          <td>${p.person_name ? UI.escape(p.person_name) : '-'}</td>
          <td><span class="badge badge-priority-${(p.priority || 'medium').toLowerCase()}">${p.priority}</span></td>
          <td><span class="badge ${p.status === 'active' ? 'badge-answered' : 'badge-person'}">${p.status}</span></td>
        </tr>
      `).join('');

      const countEl = document.getElementById('admin-pp-count');
      if (countEl) countEl.textContent = `Showing ${res.prayer_points.length} of ${res.total} records`;
    } catch (err) {
      UI.toast('Failed to load prayer points: ' + err.message, 'error');
    }
  },

  /**
   * 5. Email Reminders Monitoring Tab
   */
  async loadEmailLogs(page = 1) {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    const statusFilter = document.getElementById('admin-email-status-filter')?.value || 'all';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_email_logs',
          token: Auth.token,
          status: statusFilter,
          page: page,
          limit: 25
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      const tbody = document.getElementById('admin-email-tbody');
      if (!tbody) return;

      if (res.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #718096; padding: 20px;">No delivery logs found.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.logs.map(l => `
        <tr>
          <td>${new Date(l.sent_at).toLocaleString()}</td>
          <td>${UI.escape(l.user_email)}</td>
          <td><span class="badge badge-category">${l.email_type}</span></td>
          <td>
            <span class="badge ${l.status === 'sent' ? 'badge-answered' : 'badge-priority-high'}">${l.status}</span>
          </td>
          <td style="font-size: 11px; color: #718096;">${l.error_message ? UI.escape(l.error_message) : 'Success'}</td>
        </tr>
      `).join('');
    } catch (err) {
      UI.toast('Failed to load email logs: ' + err.message, 'error');
    }
  },

  /**
   * 6. Community Moderation Tab
   */
  async loadModeration() {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_moderation_reports',
          token: Auth.token
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      const listEl = document.getElementById('admin-moderation-list');
      if (!listEl) return;

      if (res.reports.length === 0) {
        listEl.innerHTML = `<div class="empty-state-card"><p>No pending community moderation reports.</p></div>`;
        return;
      }

      listEl.innerHTML = res.reports.map(r => `
        <div class="prayer-card" style="margin-bottom: 12px; border: 1px solid var(--border-light);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span class="badge ${r.status === 'pending' ? 'badge-priority-high' : 'badge-answered'}">Status: ${r.status}</span>
            <span style="font-size: 11px; color: #718096;">Reported: ${new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          <h4 style="color: #023E8A; margin: 4px 0;">Target: ${UI.escape(r.target_title)}</h4>
          <p style="font-size: 13px; color: #4A5568; margin-bottom: 10px;"><strong>Reason:</strong> ${UI.escape(r.reason)}</p>
          <div style="display: flex; gap: 8px;">
            ${r.request_id ? `
              <button class="btn btn-secondary btn-sm" onclick="Admin.moderate('hide_request', '${r.request_id}', '', '${r.report_id}')">Hide Request</button>
              <button class="btn btn-secondary btn-sm" onclick="Admin.moderate('restore_request', '${r.request_id}', '', '${r.report_id}')">Restore Request</button>
            ` : ''}
            <button class="btn btn-primary btn-sm" onclick="Admin.moderate('resolve_report', '', '', '${r.report_id}')">Mark Resolved</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      UI.toast('Failed to load moderation: ' + err.message, 'error');
    }
  },

  async moderate(action, requestId, messageId, reportId) {
    const apiUrl = Auth.getApiUrl();
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_moderate_content',
          token: Auth.token,
          moderation_action: action,
          request_id: requestId,
          message_id: messageId,
          report_id: reportId
        })
      });

      const res = await response.json();
      if (res.success) {
        UI.toast('Moderation action completed', 'success');
        this.loadModeration();
      }
    } catch (err) {
      UI.toast('Error: ' + err.message, 'error');
    }
  },

  /**
   * 7. Audit Logs Tab
   */
  async loadAuditLogs(page = 1) {
    if (!this.checkAccess()) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_get_audit_logs',
          token: Auth.token,
          page: page,
          limit: 25
        })
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      const tbody = document.getElementById('admin-audit-tbody');
      if (!tbody) return;

      if (res.audits.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #718096; padding: 20px;">No audit events logged yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = res.audits.map(a => `
        <tr>
          <td>${new Date(a.timestamp).toLocaleString()}</td>
          <td>${UI.escape(a.admin_email)}</td>
          <td><span class="badge badge-category">${UI.escape(a.action)}</span></td>
          <td style="font-size: 12px;">${UI.escape(a.details)}</td>
        </tr>
      `).join('');
    } catch (err) {
      UI.toast('Failed to load audit logs: ' + err.message, 'error');
    }
  },

  async sendAdminTestEmail() {
    const apiUrl = Auth.getApiUrl();
    try {
      UI.toast('Sending test reminder to administrator...', 'info');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'admin_send_test_email',
          token: Auth.token
        })
      });
      const res = await response.json();
      if (res.success) {
        UI.toast(res.message, 'success');
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      UI.toast('Test email failed: ' + err.message, 'error');
    }
  }
};

window.Admin = Admin;
