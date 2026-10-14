/**
 * Prayer Companion - Main Application Orchestrator
 * Connects IndexedDB, Sync, Auth, Prayers, Tracking, Answered, Thanksgiving,
 * Community Prayer Companions, Admin Dashboard, and Settings.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await App.init();
});

const App = {
  currentTab: 'dashboard',
  searchDebounceTimer: null,
  installPromptEvent: null,
  communityFilter: 'recent',
  communityCategory: 'all',
  communityPage: 1,

  async init() {
    console.log('Initializing Prayer Companion with Community & Admin...');

    // 1. Initialize Database & Auth
    await initDB();
    const authState = await Auth.init();

    // 2. Initialize Background Sync
    SyncEngine.init();

    // 3. Register Service Worker & PWA Install handler
    this.initPwa();
    this.initTheme();

    // 4. Bind Global Event Listeners & Navigation
    this.bindEvents();

    // 5. Initialize Admin Module
    Admin.init();

    // 6. Render Local-First Interface Immediately (< 50ms)
    this.renderHeader();
    this.renderDailyScripture();
    await this.renderCurrentView();

    // 7. Seed welcome data on first visit
    if (Auth.isLocalMode() || !authState.isAuthenticated) {
      await AppDB.seedWelcomeDataIfEmpty(Auth.getUserId());
      await this.renderCurrentView();
    }

    // 8. If authenticated, trigger sync & check session
    if (authState.isAuthenticated) {
      SyncEngine.syncNow();
    }
  },

  // ==========================================================================
  // NAVIGATION & ROUTING
  // ==========================================================================

  initTheme() {
    const savedTheme = localStorage.getItem('PRAYERLY_THEME') || 'light';
    const isDark = savedTheme === 'dark';
    this.applyTheme(isDark);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentlyDark = document.body.classList.contains('dark-theme');
        const nextDark = !currentlyDark;
        this.applyTheme(nextDark);
        localStorage.setItem('PRAYERLY_THEME', nextDark ? 'dark' : 'light');
      });
    }
  },

  applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    const sunIcon = document.querySelector('#theme-toggle-btn .icon-sun');
    const moonIcon = document.querySelector('#theme-toggle-btn .icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'none' : 'inline-flex';
      moonIcon.style.display = isDark ? 'inline-flex' : 'none';
    }
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Listen for data updates
    window.addEventListener('prayer-data-changed', async () => {
      await this.renderCurrentView();
    });

    // Listen for sync status changes
    window.addEventListener('prayer-sync-status', (e) => {
      this.updateSyncBadge(e.detail.status, e.detail.message);
    });

    // Quick Add Button
    const quickAddBtn = document.getElementById('btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => this.openPrayerModal());
    }

    // Add Thanksgiving Button
    const addTgBtn = document.getElementById('btn-add-thanksgiving');
    if (addTgBtn) {
      addTgBtn.addEventListener('click', () => this.openThanksgivingModal());
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAllModals();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAllModals();
    });

    // Dismiss any open prayer card dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.card-menu-container')) {
        document.querySelectorAll('.card-menu-dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.card-menu-btn.active').forEach(b => b.classList.remove('active'));
      }
    });

    // Search prayers debounce
    const prayerSearchInput = document.getElementById('prayer-search-input');
    if (prayerSearchInput) {
      prayerSearchInput.addEventListener('input', () => {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.renderPrayersList();
        }, 250);
      });
    }

    // Prayers Category & Status Filters
    const categorySelect = document.getElementById('prayer-category-filter');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.renderPrayersList());
    }

    const statusTabs = document.querySelectorAll('.prayer-status-pill');
    statusTabs.forEach(pill => {
      pill.addEventListener('click', (e) => {
        statusTabs.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderPrayersList();
      });
    });

    // Community Filter Buttons
    document.querySelectorAll('[data-community-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-community-filter]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.communityFilter = e.currentTarget.getAttribute('data-community-filter');
        this.communityPage = 1;
        this.renderCommunityView();
      });
    });

    const commCategorySelect = document.getElementById('community-category-filter');
    if (commCategorySelect) {
      commCategorySelect.addEventListener('change', (e) => {
        this.communityCategory = e.currentTarget.value;
        this.communityPage = 1;
        this.renderCommunityView();
      });
    }

    const commSearchInput = document.getElementById('community-search-input');
    if (commSearchInput) {
      commSearchInput.addEventListener('input', () => {
        clearTimeout(this.commDebounce);
        this.commDebounce = setTimeout(() => {
          this.communityPage = 1;
          this.renderCommunityView();
        }, 300);
      });
    }

    // Share App Button
    const shareAppBtn = document.getElementById('btn-share-app');
    if (shareAppBtn) {
      shareAppBtn.addEventListener('click', () => this.shareApp());
    }

    // Short Name changed event
    window.addEventListener('prayer-user-name-changed', () => {
      this.renderHeader();
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update nav links
    document.querySelectorAll('[data-tab]').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update views
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${tabName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderCurrentView();
  },

  async renderCurrentView() {
    switch (this.currentTab) {
      case 'dashboard':
        await this.renderDashboard();
        break;
      case 'prayers':
        await this.renderPrayersList();
        break;
      case 'community':
        await this.renderCommunityView();
        break;
      case 'answered':
        await this.renderAnsweredList();
        break;
      case 'thanksgiving':
        await this.renderThanksgivingList();
        break;
      case 'history':
        await this.renderHistoryView();
        break;
      case 'admin':
        Admin.loadOverview();
        break;
      case 'settings':
        await this.renderSettingsView();
        break;
    }
  },

  // ==========================================================================
  // DASHBOARD RENDERING
  // ==========================================================================

  renderHeader() {
    const greetingEl = document.getElementById('dashboard-greeting');
    const dateEl = document.getElementById('dashboard-date');
    const userBadgeEl = document.getElementById('user-email-badge');
    const adminNavBtn = document.getElementById('nav-admin-btn');
    const adminMobileNavBtn = document.getElementById('mobile-nav-admin-btn');

    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Good day';
    if (hours < 12) greeting = 'Good morning';
    else if (hours < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const shortName = (typeof Settings !== 'undefined' && Settings.getUserShortName) ? Settings.getUserShortName() : 'Poorna';

    if (greetingEl) {
      greetingEl.innerHTML = `${greeting}, <span class="greeting-short-name" id="dashboard-user-name">${UI.escape(shortName)}</span>`;
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    if (userBadgeEl) {
      if (Auth.isLoggedIn()) {
        userBadgeEl.style.display = 'inline-flex';
        userBadgeEl.textContent = Auth.getUserEmail();
        userBadgeEl.title = 'Account: ' + Auth.getUserEmail();
      } else {
        userBadgeEl.style.display = 'none';
      }
    }

    // Show Admin Navigation Button if current user is admin
    const isAdmin = Admin.isAdminUser();
    if (adminNavBtn) adminNavBtn.style.display = isAdmin ? 'inline-block' : 'none';
    if (adminMobileNavBtn) adminMobileNavBtn.style.display = isAdmin ? 'flex' : 'none';
  },

  async promptEditShortName() {
    const current = (typeof Settings !== 'undefined' && Settings.getUserShortName) ? Settings.getUserShortName() : '';
    const newName = prompt('Enter your preferred display name (e.g., Poorna):', current);
    if (newName !== null && newName.trim()) {
      await Settings.setUserShortName(newName.trim());
      UI.toast(`Welcome, ${Settings.getUserShortName()}!`, 'success');
      this.renderHeader();
    }
  },

  async shareApp() {
    if (window.navigator?.vibrate) {
      try { window.navigator.vibrate(15); } catch (_) {}
    }
    const shareUrl = window.location.origin ? (window.location.origin + window.location.pathname) : window.location.href;
    const shareData = {
      title: 'Prayerly',
      text: 'Join me in prayer and thanksgiving with Prayerly — a peaceful, distraction-free prayer app.',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        UI.toast('Prayerly shared successfully', 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      UI.toast('App link copied to clipboard! Share it with friends and family.', 'success');
    } catch (err) {
      UI.toast('Please copy this link: ' + window.location.href, 'info');
    }
  },

  renderDailyScripture() {
    const verseTextEl = document.getElementById('daily-verse-text');
    const verseRefEl = document.getElementById('daily-verse-ref');
    const quoteTextEl = document.getElementById('daily-quote-text');
    const quoteAuthorEl = document.getElementById('daily-quote-author');
    const devotionalImgEl = document.getElementById('daily-devotional-img');

    // Retrieve daily content directly from Google Sheet Daily_Content
    let sheetContent = null;
    try {
      const cached = localStorage.getItem('PRAYERLY_SHEET_DAILY_CONTENT');
      if (cached) sheetContent = JSON.parse(cached);
    } catch (_) {}

    const content = sheetContent || (typeof getDailyContent === 'function' ? getDailyContent() : null);
    const verseText = content?.verse?.text || '';
    const verseRef = content?.verse?.reference || '';
    const quoteText = content?.quote?.text || '';
    const quoteAuthor = content?.quote?.author || '';

    if (verseTextEl) verseTextEl.textContent = verseText;
    if (verseRefEl) verseRefEl.textContent = verseRef ? `— ${verseRef}` : '';
    if (quoteTextEl) quoteTextEl.textContent = quoteText;
    if (quoteAuthorEl) quoteAuthorEl.textContent = quoteAuthor ? `— ${quoteAuthor}` : '';

    // Show quote image directly from verse_text from sheet Daily_Content
    if (devotionalImgEl && verseText) {
      devotionalImgEl.src = verseText.trim();
    }

    const copyBtn = document.getElementById('btn-copy-verse');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const textToCopy = `${verseText}\n\nVia Prayerly`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          UI.toast('Daily devotional copied to clipboard', 'success');
        });
      };
    }

    // Refresh from Google Sheet Daily_Content in background
    if (typeof fetchDailyContentFromSheet === 'function') {
      fetchDailyContentFromSheet().then(item => {
        if (item && item.verse && item.verse.text) {
          const freshImg = item.verse.text.trim();
          if (devotionalImgEl && freshImg && devotionalImgEl.src !== freshImg) {
            devotionalImgEl.src = freshImg;
          }
          if (verseTextEl) verseTextEl.textContent = freshImg;
        }
      }).catch(() => {});
    }
  },

  async renderDashboard() {
    const stats = await Tracking.getTodayStats();
    const totalEl = document.getElementById('stat-total-active');
    const prayedEl = document.getElementById('stat-prayed-today');
    const unprayedEl = document.getElementById('stat-unprayed-today');
    const answeredEl = document.getElementById('stat-answered');

    if (totalEl) totalEl.textContent = stats.totalActive;
    if (prayedEl) prayedEl.textContent = stats.prayedToday;
    if (unprayedEl) unprayedEl.textContent = stats.unprayedToday;
    if (answeredEl) answeredEl.textContent = stats.totalAnswered;

    // Strictly exclude answered prayers from Home page
    const answeredRecords = await AppDB.getAll('answered_prayers');
    const answeredIdSet = new Set(
      answeredRecords.filter(a => !a.is_deleted).map(a => a.prayer_id)
    );

    const allActive = await Prayers.query({ status: 'active', sortBy: 'priority' });
    const activePrayers = allActive.filter(p =>
      p.status === 'active' &&
      p.status !== 'answered' &&
      !p.is_deleted &&
      !answeredIdSet.has(p.prayer_id)
    );

    const prayedSet = await Tracking.getPrayedPrayerIdsForDate();
    const container = document.getElementById('dashboard-prayers-container');
    const emptyState = document.getElementById('dashboard-empty-state');

    if (!container) return;

    if (activePrayers.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = activePrayers.map(p => {
      const isPrayed = prayedSet.has(p.prayer_id);
      return this.renderPrayerCardHtml(p, isPrayed, true);
    }).join('');

    this.attachPrayerCardActions(container);
  },

  // ==========================================================================
  // PRAYERS LIST RENDERING
  // ==========================================================================

  async renderPrayersList() {
    const container = document.getElementById('prayers-list-container');
    const emptyState = document.getElementById('prayers-empty-state');
    if (!container) return;

    const searchInput = document.getElementById('prayer-search-input');
    const searchQuery = searchInput ? searchInput.value : '';

    const categorySelect = document.getElementById('prayer-category-filter');
    const category = categorySelect ? categorySelect.value : 'all';

    const activePill = document.querySelector('.prayer-status-pill.active');
    const status = activePill ? activePill.getAttribute('data-status') : 'active';

    const prayers = await Prayers.query({
      status: status,
      category: category,
      searchQuery: searchQuery,
      sortBy: 'newest'
    });

    const prayedSet = await Tracking.getPrayedPrayerIdsForDate();

    if (prayers.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = prayers.map(p => {
      const isPrayed = prayedSet.has(p.prayer_id);
      return this.renderPrayerCardHtml(p, isPrayed, false);
    }).join('');

    this.attachPrayerCardActions(container);
  },

  renderPrayerCardHtml(prayer, isPrayed, isDashboard = false) {
    const priorityClass = `badge-priority-${(prayer.priority || 'medium').toLowerCase()}`;
    const cardStatusClass = isPrayed ? 'card-prayed' : '';
    const dateFormatted = new Date(prayer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return `
      <div class="prayer-card ${cardStatusClass}" data-id="${prayer.prayer_id}">
        <div class="prayer-card-header">
          <div class="prayer-tags">
            <span class="badge badge-category">${UI.escape(prayer.category)}</span>
            <span class="badge ${priorityClass}">${UI.escape(prayer.priority)}</span>
            ${prayer.person_name ? `<span class="badge badge-person"><span class="badge-icon">${Icons.person}</span> ${UI.escape(prayer.person_name)}</span>` : ''}
          </div>
          <div class="prayer-date">${dateFormatted}</div>
        </div>

        <h3 class="prayer-title">${UI.escape(prayer.title)}</h3>
        ${prayer.description ? `<p class="prayer-desc">${UI.escape(prayer.description)}</p>` : ''}

        <div class="prayer-card-footer">
          <div class="prayer-primary-group" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-pray ${isPrayed ? 'btn-prayed' : ''}" data-action="toggle-pray" data-id="${prayer.prayer_id}">
              <span class="btn-icon">${isPrayed ? Icons.checkCircle : Icons.prayerHands}</span>
              <span>${isPrayed ? 'Prayed' : 'I Prayed'}</span>
            </button>
            <button class="btn btn-secondary btn-sm" title="God Answered This Prayer" data-action="answered" data-id="${prayer.prayer_id}">
              <span class="btn-icon">${Icons.sparkles}</span>
              <span>Answered</span>
            </button>
          </div>

          <div class="card-menu-container">
            <button class="card-menu-btn" data-action="toggle-card-menu" title="More options" aria-label="More options">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 17px; height: 17px;"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
            </button>
            <div class="card-menu-dropdown">
              <button class="card-menu-item" data-action="share-companion" data-id="${prayer.prayer_id}">
                <span class="menu-item-icon">${Icons.share}</span>
                <span>Ask Others to Pray for You</span>
              </button>
              <button class="card-menu-item" data-action="edit" data-id="${prayer.prayer_id}">
                <span class="menu-item-icon">${Icons.edit}</span>
                <span>Edit Prayer</span>
              </button>
              ${prayer.status === 'active'
                ? `<button class="card-menu-item" data-action="archive" data-id="${prayer.prayer_id}"><span class="menu-item-icon">${Icons.archive}</span><span>Archive Prayer</span></button>`
                : `<button class="card-menu-item" data-action="restore" data-id="${prayer.prayer_id}"><span class="menu-item-icon">${Icons.restore}</span><span>Restore to Active</span></button>`}
              <div class="card-menu-divider"></div>
              <button class="card-menu-item item-danger" data-action="delete" data-id="${prayer.prayer_id}">
                <span class="menu-item-icon">${Icons.trash}</span>
                <span>Delete Prayer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachPrayerCardActions(parentEl) {
    const closeAllCardMenus = () => {
      document.querySelectorAll('.card-menu-dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.card-menu-btn.active').forEach(b => b.classList.remove('active'));
    };

    parentEl.querySelectorAll('[data-action="toggle-card-menu"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const container = btn.closest('.card-menu-container');
        const dropdown = container ? container.querySelector('.card-menu-dropdown') : null;
        const isOpen = dropdown && dropdown.classList.contains('open');

        closeAllCardMenus();

        if (dropdown && !isOpen) {
          dropdown.classList.add('open');
          btn.classList.add('active');
        }
      });
    });

    parentEl.querySelectorAll('[data-action="toggle-pray"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        if (window.navigator?.vibrate) {
          try { window.navigator.vibrate(15); } catch (_) {}
        }
        const id = e.currentTarget.getAttribute('data-id');
        const res = await Tracking.togglePrayedToday(id);
        if (res.prayed) {
          UI.toast('Marked as prayed today. Blessed be God!', 'success');
        } else {
          UI.toast('Prayer mark undone.', 'info');
        }
      });
    });

    parentEl.querySelectorAll('[data-action="share-companion"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        const prayer = await Prayers.get(id);
        if (prayer) this.openShareCompanionModal(prayer);
      });
    });

    parentEl.querySelectorAll('[data-action="answered"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        this.openAnsweredModal(id);
      });
    });

    parentEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        const prayer = await Prayers.get(id);
        if (prayer) this.openPrayerModal(prayer);
      });
    });

    parentEl.querySelectorAll('[data-action="archive"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        const ok = await UI.confirm({
          title: 'Archive Prayer',
          message: 'Move this prayer point to your archive? You can restore it anytime.',
          confirmText: 'Archive'
        });
        if (ok) {
          await Prayers.archive(id);
          UI.toast('Prayer point archived', 'info');
        }
      });
    });

    parentEl.querySelectorAll('[data-action="restore"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        await Prayers.restore(id);
        UI.toast('Prayer point restored to active', 'success');
      });
    });

    parentEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        const ok = await UI.confirm({
          title: 'Delete Prayer Point',
          message: 'Are you sure you want to delete this prayer point?',
          confirmText: 'Delete',
          isDestructive: true
        });
        if (ok) {
          await Prayers.delete(id);
          UI.toast('Prayer point deleted', 'info');
        }
      });
    });
  },

  // ==========================================================================
  // COMMUNITY PRAYER COMPANIONS VIEW
  // ==========================================================================

  async renderCommunityView() {
    const container = document.getElementById('community-requests-container');
    const emptyState = document.getElementById('community-empty-state');
    if (!container) return;

    if (!Auth.isLoggedIn()) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">${Icons.users}</div>
          <h3 style="color: var(--navy-900); margin-bottom: 6px; font-weight: 600;">Join the Prayer Companions Community</h3>
          <p style="font-size: 13px; max-width: 420px; margin: 0 auto 16px auto; color: var(--text-secondary);">
            Connect with other believers to lift one another's burdens in prayer. Sign in with your email to view shared requests and commit to pray.
          </p>
          <button class="btn btn-primary" onclick="App.openAuthModal()">Sign In to Pray Together</button>
        </div>
      `;
      if (emptyState) emptyState.style.display = 'none';
      return;
    }

    const searchInput = document.getElementById('community-search-input');
    const search = searchInput ? searchInput.value : '';

    try {
      container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Loading community prayer requests...</div>`;

      const data = await Community.getRequests({
        filterType: this.communityFilter,
        category: this.communityCategory,
        search: search,
        page: this.communityPage,
        limit: 15
      });

      if (!data.requests || data.requests.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      container.innerHTML = data.requests.map(r => `
        <div class="prayer-card community-card ${r.is_committed_by_me ? 'card-committed' : ''}" data-req-id="${r.request_id}">
          <div class="prayer-card-header">
            <div class="prayer-tags">
              <span class="badge badge-category">${UI.escape(r.category || 'General')}</span>
              <span class="badge badge-person"><span class="badge-icon">${Icons.person}</span> ${UI.escape(r.display_name)}</span>
            </div>
            <div class="prayer-date">${new Date(r.created_at).toLocaleDateString()}</div>
          </div>

          <h3 class="prayer-title">${UI.escape(r.prayer_title)}</h3>
          ${r.shared_description ? `<p class="prayer-desc">${UI.escape(r.shared_description)}</p>` : ''}

          <div class="community-supporters-banner">
            <span class="supporters-badge"><span class="badge-icon">${Icons.prayerHands}</span> <strong>${r.supporters_count}</strong> companion${r.supporters_count === 1 ? '' : 's'} praying</span>
          </div>

          <div class="prayer-card-footer">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <button class="btn btn-pray ${r.is_committed_by_me ? 'btn-prayed' : ''}" data-action="toggle-commitment" data-req-id="${r.request_id}">
                <span class="btn-icon">${r.is_committed_by_me ? Icons.checkCircle : Icons.prayerHands}</span>
                <span>${r.is_committed_by_me ? 'I Am Praying' : 'I’ll Pray'}</span>
              </button>
              ${r.allow_encouragement ? `
                <button class="btn btn-secondary btn-sm" data-action="view-encouragements" data-req-id="${r.request_id}">
                  <span class="btn-icon">${Icons.messageSquare}</span>
                  <span>Encourage</span>
                </button>
              ` : ''}
            </div>

            <div class="prayer-action-buttons">
              ${r.is_owner ? `
                <button class="icon-btn" data-action="edit-community-req" data-req-id="${r.request_id}">
                  <span class="btn-icon">${Icons.edit}</span>
                  <span>Edit</span>
                </button>
                <button class="icon-btn icon-btn-danger" data-action="stop-sharing" data-req-id="${r.request_id}" title="Stop sharing this request">
                  <span>Stop</span>
                </button>
              ` : `
                <button class="icon-btn" data-action="report-content" data-req-id="${r.request_id}" title="Report inappropriate content">
                  <span class="btn-icon">${Icons.flag}</span>
                  <span>Report</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `).join('');

      this.attachCommunityCardActions(container);
    } catch (err) {
      container.innerHTML = `<div class="empty-state-card" style="color: #DC2626;"><p>Could not load community requests: ${UI.escape(err.message)}</p></div>`;
    }
  },

  attachCommunityCardActions(parentEl) {
    // "I'll Pray" Commitment Toggle
    parentEl.querySelectorAll('[data-action="toggle-commitment"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (window.navigator?.vibrate) {
          try { window.navigator.vibrate(15); } catch (_) {}
        }
        const reqId = e.currentTarget.getAttribute('data-req-id');
        btn.disabled = true;
        try {
          const res = await Community.toggleCommitment(reqId);
          UI.toast(res.message, res.is_committed ? 'success' : 'info');
          await this.renderCommunityView();
        } catch (err) {
          UI.toast(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // View / Send Encouragements
    parentEl.querySelectorAll('[data-action="view-encouragements"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        this.openEncouragementModal(reqId);
      });
    });

    // Report Content
    parentEl.querySelectorAll('[data-action="report-content"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        this.openReportModal(reqId, '');
      });
    });

    // Stop Sharing
    parentEl.querySelectorAll('[data-action="stop-sharing"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        const ok = await UI.confirm({
          title: 'Stop Sharing Request',
          message: 'Remove this request from the community listing? Existing private records will remain intact.',
          confirmText: 'Stop Sharing',
          isDestructive: true
        });
        if (ok) {
          await Community.deleteRequest(reqId);
          UI.toast('Request removed from community', 'info');
          await this.renderCommunityView();
        }
      });
    });
  },

  // ==========================================================================
  // ANSWERED PRAYERS VIEW
  // ==========================================================================

  async renderAnsweredList() {
    const container = document.getElementById('answered-list-container');
    const emptyState = document.getElementById('answered-empty-state');
    if (!container) return;

    const list = await Answered.getAll();

    if (list.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = list.map(item => `
      <div class="answered-card" data-id="${item.answered_id}">
        <div class="answered-card-header">
          <span class="badge badge-answered"><span class="badge-icon">${Icons.sparkles}</span> God Answered</span>
          <span class="answered-date">Answered on: ${item.answered_date}</span>
        </div>
        <h3 class="prayer-title">${UI.escape(item.prayer_title)}</h3>
        ${item.prayer_description ? `<p class="prayer-desc">${UI.escape(item.prayer_description)}</p>` : ''}
        ${item.testimony ? `
          <div class="testimony-box">
            <strong>Testimony / Thanksgiving:</strong>
            <p style="margin: 4px 0 0 0;">${UI.escape(item.testimony)}</p>
          </div>
        ` : ''}
        <div class="answered-card-footer">
          <button class="btn btn-secondary btn-sm" data-action="restore-answered" data-id="${item.answered_id}">
            Move Back to Active
          </button>
          <button class="btn btn-secondary btn-sm" data-action="edit-testimony" data-id="${item.answered_id}">
            Edit Testimony
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-action="restore-answered"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const ok = await UI.confirm({
          title: 'Restore to Active Prayers',
          message: 'Move this prayer back to active prayer points?',
          confirmText: 'Move to Active'
        });
        if (ok) {
          await Answered.restoreToActive(id);
          UI.toast('Prayer moved back to active list', 'success');
        }
      });
    });

    container.querySelectorAll('[data-action="edit-testimony"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const record = await AppDB.get('answered_prayers', id);
        if (record) this.openAnsweredModal(record.prayer_id, record);
      });
    });
  },

  // ==========================================================================
  // THANKSGIVING JOURNAL VIEW
  // ==========================================================================

  async renderThanksgivingList() {
    const container = document.getElementById('thanksgiving-list-container');
    const emptyState = document.getElementById('thanksgiving-empty-state');
    if (!container) return;

    const entries = await Thanksgiving.query();

    if (entries.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = entries.map(e => `
      <div class="thanksgiving-card" data-id="${e.entry_id}">
        <div class="thanksgiving-header">
          <span class="badge badge-thanksgiving"><span class="badge-icon">${Icons.heart}</span> ${UI.escape(e.category || 'Praise')}</span>
          <span class="thanksgiving-date">${e.entry_date}</span>
        </div>
        <h3 class="thanksgiving-title">${UI.escape(e.title)}</h3>
        ${e.description ? `<p class="thanksgiving-desc">${UI.escape(e.description)}</p>` : ''}
        <div class="thanksgiving-footer">
          <button class="icon-btn" data-action="edit-tg" data-id="${e.entry_id}">
            <span class="btn-icon">${Icons.edit}</span>
            <span>Edit</span>
          </button>
          <button class="icon-btn icon-btn-danger" data-action="delete-tg" data-id="${e.entry_id}">
            <span class="btn-icon">${Icons.trash}</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-action="edit-tg"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const entry = await AppDB.get('thanksgiving', id);
        if (entry) this.openThanksgivingModal(entry);
      });
    });

    container.querySelectorAll('[data-action="delete-tg"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const ok = await UI.confirm({
          title: 'Delete Thanksgiving Entry',
          message: 'Are you sure you want to remove this journal entry?',
          confirmText: 'Delete',
          isDestructive: true
        });
        if (ok) {
          await Thanksgiving.delete(id);
          UI.toast('Entry removed from journal', 'info');
        }
      });
    });
  },

  // ==========================================================================
  // HISTORY VIEW
  // ==========================================================================

  async renderHistoryView() {
    const streakEl = document.getElementById('history-streak-count');
    const calendarEl = document.getElementById('history-calendar-chart');
    const selectedDatePrayersEl = document.getElementById('history-date-prayers');
    const datePickerInput = document.getElementById('history-date-picker');

    const streak = await Tracking.getPrayerStreak();
    if (streakEl) streakEl.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;

    const recentActivity = await Tracking.getRecentDaysActivity(14);
    if (calendarEl) {
      calendarEl.innerHTML = recentActivity.map(item => `
        <div class="history-day-col">
          <div class="history-bar ${item.count > 0 ? 'active' : ''}" style="height: ${Math.min(item.count * 16 + 10, 80)}px;" title="${item.dayLabel}: ${item.count} prayers">
            <span class="bar-count">${item.count}</span>
          </div>
          <span class="history-day-label">${item.dayLabel.split(' ')[0]}</span>
        </div>
      `).join('');
    }

    const targetDate = datePickerInput ? (datePickerInput.value || Tracking.getLocalDateString()) : Tracking.getLocalDateString();
    if (datePickerInput && !datePickerInput.value) {
      datePickerInput.value = targetDate;
      datePickerInput.onchange = () => this.renderHistoryView();
    }

    const dayRecords = await Tracking.getHistoryForDate(targetDate);
    if (selectedDatePrayersEl) {
      if (dayRecords.length === 0) {
        selectedDatePrayersEl.innerHTML = `<div class="empty-state-card"><p>No recorded prayers for this date.</p></div>`;
      } else {
        selectedDatePrayersEl.innerHTML = dayRecords.map(r => `
          <div class="history-record-card">
            <div>
              <div style="font-weight: bold; color: #023E8A;">${UI.escape(r.title)}</div>
              <span class="badge badge-category" style="margin-top: 4px;">${UI.escape(r.category || 'General')}</span>
            </div>
            <div style="font-size: 12px; color: #718096;">
              ${new Date(r.prayed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `).join('');
      }
    }
  },

  // ==========================================================================
  // SETTINGS VIEW
  // ==========================================================================

  async renderSettingsView() {
    const userEmailEl = document.getElementById('settings-user-email');
    const authStatusEl = document.getElementById('settings-auth-status');
    const apiUrlInput = document.getElementById('settings-api-url');
    const timezoneSelect = document.getElementById('settings-timezone');
    const morningCheck = document.getElementById('settings-morning-enabled');
    const morningTimeInput = document.getElementById('settings-morning-time');
    const eveningCheck = document.getElementById('settings-evening-enabled');
    const eveningTimeInput = document.getElementById('settings-evening-time');

    if (userEmailEl) userEmailEl.textContent = Auth.getUserEmail();
    if (authStatusEl) {
      authStatusEl.textContent = Auth.isLoggedIn() ? 'Active Cloud Session' : 'Local / Offline Mode';
    }

    if (apiUrlInput) apiUrlInput.value = Auth.getApiUrl();

    const settings = await Settings.getSettings();
    if (timezoneSelect) timezoneSelect.value = settings.timezone || 'Asia/Kolkata';
    if (morningCheck) morningCheck.checked = Boolean(settings.morning_email_enabled);
    if (morningTimeInput) morningTimeInput.value = settings.morning_time || '03:00';
    if (eveningCheck) eveningCheck.checked = Boolean(settings.evening_email_enabled);
    if (eveningTimeInput) eveningTimeInput.value = settings.evening_time || '18:00';

    // Account Profile: Short Name
    const shortNameInput = document.getElementById('settings-short-name-input');
    const saveShortNameBtn = document.getElementById('btn-save-short-name');
    const settingsShareBtn = document.getElementById('btn-settings-share-app');

    if (shortNameInput && typeof Settings !== 'undefined' && Settings.getUserShortName) {
      shortNameInput.value = Settings.getUserShortName();
    }

    if (saveShortNameBtn && shortNameInput) {
      saveShortNameBtn.onclick = async () => {
        const val = shortNameInput.value.trim();
        await Settings.setUserShortName(val);
        UI.toast(`Preferred name updated to "${Settings.getUserShortName()}"`, 'success');
        this.renderHeader();
      };
    }

    if (settingsShareBtn) {
      settingsShareBtn.onclick = () => this.shareApp();
    }

    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const newSettings = {
          timezone: timezoneSelect ? timezoneSelect.value : 'Asia/Kolkata',
          morning_email_enabled: morningCheck ? morningCheck.checked : true,
          morning_time: morningTimeInput ? morningTimeInput.value : '03:00',
          evening_email_enabled: eveningCheck ? eveningCheck.checked : true,
          evening_time: eveningTimeInput ? eveningTimeInput.value : '18:00'
        };

        if (apiUrlInput) {
          Auth.setApiUrl(apiUrlInput.value);
        }

        await Settings.saveSettings(newSettings);
        UI.toast('Settings saved successfully', 'success');
      };
    }

    const testConnBtn = document.getElementById('btn-test-connection');
    if (testConnBtn) {
      testConnBtn.onclick = async () => {
        try {
          UI.toast('Testing connection to Apps Script backend...', 'info');
          const res = await Settings.testConnection(apiUrlInput.value);
          UI.toast(res.message, 'success');
        } catch (e) {
          UI.toast('Connection failed: ' + e.message, 'error');
        }
      };
    }

    const testEmailBtn = document.getElementById('btn-test-email');
    if (testEmailBtn) {
      testEmailBtn.onclick = async () => {
        try {
          UI.toast('Sending test reminder email...', 'info');
          const res = await Settings.sendTestEmail();
          UI.toast(res.message, 'success');
        } catch (e) {
          UI.toast('Test email failed: ' + e.message, 'error');
        }
      };
    }

    const syncNowBtn = document.getElementById('btn-manual-sync');
    if (syncNowBtn) {
      syncNowBtn.onclick = () => {
        SyncEngine.syncNow();
        UI.toast('Triggered background synchronisation...', 'info');
      };
    }

    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
      exportBtn.onclick = async () => {
        await Settings.exportUserData();
        UI.toast('Data exported to JSON file', 'success');
      };
    }

    const clearCacheBtn = document.getElementById('btn-clear-cache');
    if (clearCacheBtn) {
      clearCacheBtn.onclick = async () => {
        const ok = await UI.confirm({
          title: 'Clear Local Cache',
          message: 'Clear cached prayers on this browser? Your cloud data remains safe and will reload on your next sync.',
          confirmText: 'Clear Cache',
          isDestructive: true
        });
        if (ok) {
          await AppDB.clearAllUserData(Auth.getUserId());
          UI.toast('Local cache cleared', 'info');
          window.location.reload();
        }
      };
    }

    const signInBtn = document.getElementById('btn-switch-account');
    if (signInBtn) {
      signInBtn.onclick = () => {
        this.openAuthModal();
      };
    }

    const signOutBtn = document.getElementById('btn-sign-out');
    if (signOutBtn) {
      signOutBtn.onclick = async () => {
        const ok = await UI.confirm({
          title: 'Sign Out',
          message: 'Do you want to sign out?',
          confirmText: 'Sign Out'
        });
        if (ok) {
          await Auth.logout(false);
          UI.toast('Signed out', 'info');
          this.renderHeader();
          this.openAuthModal();
        }
      };
    }

    const deleteAccountBtn = document.getElementById('btn-delete-account');
    if (deleteAccountBtn) {
      deleteAccountBtn.onclick = async () => {
        const ok = await UI.confirm({
          title: 'Delete Account Permanently',
          message: 'This will permanently remove your account and all prayer data. This action cannot be undone.',
          confirmText: 'Permanently Delete',
          isDestructive: true
        });
        if (ok) {
          await Settings.deleteAccount();
          UI.toast('Account deleted', 'info');
          window.location.reload();
        }
      };
    }
  },

  // ==========================================================================
  // SYNC BADGE INDICATOR
  // ==========================================================================

  updateSyncBadge(status, message) {
    const badge = document.getElementById('sync-status-indicator');
    if (!badge) return;

    badge.className = `sync-badge sync-${status}`;
    badge.style.display = 'none';
    let icon = Icons?.check || '';
    let text = message || 'Synced';

    if (status === 'synced') {
      icon = Icons?.check || '';
      text = 'Synced';
    } else if (status === 'syncing') {
      icon = Icons?.refresh || '';
      text = 'Syncing...';
    } else if (status === 'offline') {
      icon = Icons?.clock || '';
      text = 'Offline';
    } else if (status === 'local') {
      icon = Icons?.download || '';
      text = 'Saved on device';
    } else if (status === 'failed') {
      icon = Icons?.flag || '';
      text = 'Sync failed';
    }

    badge.innerHTML = `<span class="sync-icon">${icon}</span> <span class="sync-text">${text}</span>`;
  },

  // ==========================================================================
  // MODALS
  // ==========================================================================

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
  },

  openAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (!modal) return;

    const emailStep = document.getElementById('auth-step-email');
    const otpStep = document.getElementById('auth-step-otp');
    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const otpInput = document.getElementById('auth-otp-input');
    const btnSendOtp = document.getElementById('btn-send-otp');
    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    const btnContinueLocal = document.getElementById('btn-continue-local');
    const displayEmail = document.getElementById('auth-display-email');
    const authError = document.getElementById('auth-error-msg');

    if (emailStep) emailStep.style.display = 'block';
    if (otpStep) otpStep.style.display = 'none';
    if (authError) authError.textContent = '';
    if (emailInput) emailInput.value = '';
    if (otpInput) otpInput.value = '';
    if (nameInput) {
      nameInput.value = (typeof Settings !== 'undefined' && Settings.getUserShortName) ? Settings.getUserShortName() : '';
    }

    modal.classList.add('active');

    if (btnSendOtp) {
      btnSendOtp.onclick = async () => {
        authError.textContent = '';
        const email = (emailInput.value || '').trim();
        const name = nameInput ? (nameInput.value || '').trim() : '';

        if (!email) {
          authError.textContent = 'Please enter your email.';
          return;
        }

        if (name && typeof Settings !== 'undefined' && Settings.setUserShortName) {
          await Settings.setUserShortName(name);
        }

        btnSendOtp.disabled = true;
        btnSendOtp.textContent = 'Sending Code...';

        try {
          await Auth.requestOtp(email, name);
          if (displayEmail) displayEmail.textContent = email;
          emailStep.style.display = 'none';
          otpStep.style.display = 'block';
          UI.toast('Verification code sent to ' + email, 'success');
          setTimeout(() => {
            if (otpInput) otpInput.focus();
          }, 100);
        } catch (err) {
          authError.textContent = err.message;
        } finally {
          btnSendOtp.disabled = false;
          btnSendOtp.textContent = 'Send Verification Code';
        }
      };
    }

    if (btnVerifyOtp) {
      btnVerifyOtp.onclick = async () => {
        authError.textContent = '';
        const email = (emailInput.value || '').trim();
        const otp = (otpInput.value || '').trim();
        const name = nameInput ? (nameInput.value || '').trim() : '';

        if (!otp) {
          authError.textContent = 'Please enter the 6-digit code.';
          return;
        }

        btnVerifyOtp.disabled = true;
        btnVerifyOtp.textContent = 'Verifying...';

        try {
          await Auth.verifyOtp(email, otp);
          if (name && typeof Settings !== 'undefined' && Settings.setUserShortName) {
            await Settings.setUserShortName(name);
          }
          modal.classList.remove('active');
          UI.toast('Signed in successfully! Welcome to Prayerly.', 'success');
          this.renderHeader();
          await SyncEngine.initialCloudPull();
          await this.renderCurrentView();
        } catch (err) {
          authError.textContent = err.message;
        } finally {
          btnVerifyOtp.disabled = false;
          btnVerifyOtp.textContent = 'Verify & Enter';
        }
      };
    }

    if (btnContinueLocal) {
      btnContinueLocal.onclick = async () => {
        const name = nameInput ? (nameInput.value || '').trim() : '';
        if (name && typeof Settings !== 'undefined' && Settings.setUserShortName) {
          await Settings.setUserShortName(name);
        }
        await Auth.continueInLocalMode();
        modal.classList.remove('active');
        UI.toast('Using Prayerly in Local Mode', 'info');
        this.renderHeader();
        await this.renderCurrentView();
      };
    }
  },

  openPrayerModal(existingPrayer = null) {
    const modal = document.getElementById('modal-prayer');
    if (!modal) return;

    const modalTitle = document.getElementById('prayer-modal-title');
    const titleInput = document.getElementById('prayer-form-title');
    const descInput = document.getElementById('prayer-form-desc');
    const categorySelect = document.getElementById('prayer-form-category');
    const personInput = document.getElementById('prayer-form-person');
    const prioritySelect = document.getElementById('prayer-form-priority');
    const reminderSelect = document.getElementById('prayer-form-reminder');
    const saveBtn = document.getElementById('btn-save-prayer');
    const advancedContainer = document.getElementById('prayer-form-advanced');
    const toggleAdvBtn = document.getElementById('btn-toggle-prayer-advanced');

    // Reset advanced options to collapsed by default
    if (advancedContainer) advancedContainer.style.display = 'none';
    if (toggleAdvBtn) {
      toggleAdvBtn.classList.remove('expanded');
      toggleAdvBtn.onclick = (e) => {
        e.preventDefault();
        const isHidden = advancedContainer.style.display === 'none';
        advancedContainer.style.display = isHidden ? 'block' : 'none';
        toggleAdvBtn.classList.toggle('expanded', isHidden);
      };
    }

    if (existingPrayer) {
      modalTitle.textContent = 'Edit Prayer Point';
      titleInput.value = existingPrayer.title || '';
      descInput.value = existingPrayer.description || '';
      categorySelect.value = existingPrayer.category || 'Personal Life';
      personInput.value = existingPrayer.person_name || '';
      prioritySelect.value = existingPrayer.priority || 'Medium';
      reminderSelect.value = existingPrayer.reminder_preference || 'both';

      // If existing prayer has custom person, non-default category, or priority, expand advanced
      if (existingPrayer.person_name || existingPrayer.category !== 'Personal Life' || existingPrayer.priority !== 'Medium') {
        if (advancedContainer) advancedContainer.style.display = 'block';
        if (toggleAdvBtn) toggleAdvBtn.classList.add('expanded');
      }
    } else {
      modalTitle.textContent = 'New Prayer Point';
      titleInput.value = '';
      descInput.value = '';
      categorySelect.value = 'Personal Life';
      personInput.value = '';
      prioritySelect.value = 'Medium';
      reminderSelect.value = 'both';
    }

    modal.classList.add('active');
    if (titleInput) titleInput.focus();

    saveBtn.onclick = async () => {
      const title = (titleInput.value || '').trim();
      if (!title) {
        UI.toast('Please enter a prayer title.', 'warning');
        return;
      }

      const payload = {
        title: title,
        description: descInput.value,
        category: categorySelect.value,
        person_name: personInput.value,
        priority: prioritySelect.value,
        reminder_preference: reminderSelect.value
      };

      try {
        if (existingPrayer) {
          await Prayers.update(existingPrayer.prayer_id, payload);
          UI.toast('Prayer point updated', 'success');
        } else {
          await Prayers.create(payload);
          UI.toast('Prayer point added', 'success');
        }
        modal.classList.remove('active');
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    };
  },

  // Share with Prayer Companions Modal
  openShareCompanionModal(prayer) {
    const modal = document.getElementById('modal-share-companion');
    if (!modal) return;

    const titleInput = document.getElementById('share-form-title');
    const descInput = document.getElementById('share-form-desc');
    const nameInput = document.getElementById('share-form-name');
    const anonCheck = document.getElementById('share-form-anon');
    const allowEncCheck = document.getElementById('share-form-allow-enc');
    const submitBtn = document.getElementById('btn-confirm-share-companion');

    titleInput.value = prayer.title || '';
    descInput.value = prayer.description || '';
    nameInput.value = '';
    anonCheck.checked = false;
    allowEncCheck.checked = true;

    modal.classList.add('active');

    submitBtn.onclick = async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        await Community.shareRequest({
          prayer_title: titleInput.value,
          shared_description: descInput.value,
          display_name: nameInput.value,
          is_anonymous: anonCheck.checked,
          category: prayer.category || 'General',
          allow_encouragement: allowEncCheck.checked
        });

        modal.classList.remove('active');
        UI.toast('Prayer request shared! Other companions will pray for you.', 'success');
      } catch (err) {
        UI.toast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ask Companions to Pray';
      }
    };
  },

  // Encouragement Messages Modal
  async openEncouragementModal(requestId) {
    const modal = document.getElementById('modal-encouragement');
    if (!modal) return;

    const listContainer = document.getElementById('encouragement-messages-list');
    const msgInput = document.getElementById('encouragement-msg-input');
    const sendBtn = document.getElementById('btn-send-encouragement');

    msgInput.value = '';
    modal.classList.add('active');

    const loadMessages = async () => {
      listContainer.innerHTML = '<div style="color: #718096; padding: 10px;">Loading encouragements...</div>';
      try {
        const res = await Community.getEncouragements(requestId);
        if (res.messages.length === 0) {
          listContainer.innerHTML = '<div style="color: #718096; font-style: italic; padding: 10px;">No messages yet. Be the first to send a word of prayerful encouragement!</div>';
        } else {
          listContainer.innerHTML = res.messages.map(m => `
            <div style="background: #F0F9FF; border-left: 3px solid #008080; border-radius: 4px; padding: 8px 12px; margin-bottom: 8px; font-size: 13px;">
              <p style="margin: 0 0 4px 0; color: #2D3748;">${UI.escape(m.message_text)}</p>
              <span style="font-size: 10px; color: #718096;">${new Date(m.created_at).toLocaleDateString()}</span>
            </div>
          `).join('');
        }
      } catch (e) {
        listContainer.innerHTML = '<div style="color: #DC2626;">Could not load messages.</div>';
      }
    };

    await loadMessages();

    sendBtn.onclick = async () => {
      const text = (msgInput.value || '').trim();
      if (!text) {
        UI.toast('Please enter a short message of encouragement.', 'warning');
        return;
      }
      sendBtn.disabled = true;
      try {
        await Community.sendEncouragement(requestId, text);
        msgInput.value = '';
        UI.toast('Encouragement sent', 'success');
        await loadMessages();
      } catch (err) {
        UI.toast(err.message, 'error');
      } finally {
        sendBtn.disabled = false;
      }
    };
  },

  // Report Modal
  openReportModal(requestId, messageId = '') {
    const modal = document.getElementById('modal-report');
    if (!modal) return;

    const reasonSelect = document.getElementById('report-reason-select');
    const submitBtn = document.getElementById('btn-submit-report');

    modal.classList.add('active');

    submitBtn.onclick = async () => {
      submitBtn.disabled = true;
      try {
        await Community.reportContent(requestId, messageId, reasonSelect.value);
        modal.classList.remove('active');
        UI.toast('Report submitted for moderation review', 'info');
      } catch (err) {
        UI.toast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
      }
    };
  },

  async openAnsweredModal(prayerId, existingRecord = null) {
    const modal = document.getElementById('modal-answered');
    if (!modal) return;

    const prayer = await Prayers.get(prayerId);
    const titleEl = document.getElementById('answered-prayer-title');
    const testimonyInput = document.getElementById('answered-form-testimony');
    const dateInput = document.getElementById('answered-form-date');
    const saveBtn = document.getElementById('btn-save-answered');

    if (titleEl && prayer) {
      titleEl.textContent = prayer.title;
    }

    if (existingRecord) {
      testimonyInput.value = existingRecord.testimony || '';
      dateInput.value = existingRecord.answered_date || new Date().toISOString().split('T')[0];
    } else {
      testimonyInput.value = '';
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');

    saveBtn.onclick = async () => {
      try {
        if (existingRecord) {
          await Answered.updateTestimony(existingRecord.answered_id, testimonyInput.value);
          UI.toast('Testimony updated', 'success');
        } else {
          await Answered.recordAnswer(prayerId, testimonyInput.value, dateInput.value);
          UI.toast('Glory to God! Answered prayer recorded.', 'success');
        }
        modal.classList.remove('active');
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    };
  },

  openThanksgivingModal(existingEntry = null) {
    const modal = document.getElementById('modal-thanksgiving');
    if (!modal) return;

    const modalTitle = document.getElementById('thanksgiving-modal-title');
    const titleInput = document.getElementById('tg-form-title');
    const descInput = document.getElementById('tg-form-desc');
    const categoryInput = document.getElementById('tg-form-category');
    const dateInput = document.getElementById('tg-form-date');
    const saveBtn = document.getElementById('btn-save-thanksgiving');

    if (existingEntry) {
      modalTitle.textContent = 'Edit Thanksgiving Entry';
      titleInput.value = existingEntry.title || '';
      descInput.value = existingEntry.description || '';
      categoryInput.value = existingEntry.category || 'General Praise';
      dateInput.value = existingEntry.entry_date || new Date().toISOString().split('T')[0];
    } else {
      modalTitle.textContent = 'New Thanksgiving Entry';
      titleInput.value = '';
      descInput.value = '';
      categoryInput.value = 'General Praise';
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');

    saveBtn.onclick = async () => {
      const title = (titleInput.value || '').trim();
      if (!title) {
        UI.toast('Please enter a title for your thanksgiving.', 'warning');
        return;
      }

      const payload = {
        title: title,
        description: descInput.value,
        category: categoryInput.value,
        entry_date: dateInput.value
      };

      try {
        if (existingEntry) {
          await Thanksgiving.update(existingEntry.entry_id, payload);
          UI.toast('Thanksgiving entry updated', 'success');
        } else {
          await Thanksgiving.create(payload);
          UI.toast('Thanksgiving recorded', 'success');
        }
        modal.classList.remove('active');
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    };
  },

  initPwa() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('ServiceWorker registered:', reg.scope))
        .catch(err => console.warn('ServiceWorker registration error:', err));
    }

    // Detect if already installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://') ||
                         localStorage.getItem('PRAYERLY_PWA_INSTALLED') === 'true';

    const banner = document.getElementById('pwa-install-banner');
    if (isStandalone && banner) {
      banner.style.display = 'none';
    }

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('PRAYERLY_PWA_INSTALLED', 'true');
      const b = document.getElementById('pwa-install-banner');
      if (b) b.style.display = 'none';
      UI.toast('Prayerly added to Home Screen!', 'success');
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent = e;

      // Never show if running standalone, already installed, or previously dismissed
      if (isStandalone || localStorage.getItem('PRAYERLY_PWA_INSTALLED') === 'true' || localStorage.getItem('PRAYERLY_PWA_DISMISSED') === 'true') {
        return;
      }

      const installBanner = document.getElementById('pwa-install-banner');
      if (installBanner) {
        installBanner.style.display = 'flex';
        const installBtn = document.getElementById('btn-pwa-install');
        if (installBtn) {
          installBtn.onclick = () => {
            if (!this.installPromptEvent) return;
            this.installPromptEvent.prompt();
            this.installPromptEvent.userChoice.then((choice) => {
              if (choice.outcome === 'accepted') {
                localStorage.setItem('PRAYERLY_PWA_INSTALLED', 'true');
                UI.toast('Prayerly added to Home Screen!', 'success');
              }
              installBanner.style.display = 'none';
              this.installPromptEvent = null;
            });
          };
        }
        const dismissBtn = document.getElementById('btn-pwa-dismiss');
        if (dismissBtn) {
          dismissBtn.onclick = () => {
            localStorage.setItem('PRAYERLY_PWA_DISMISSED', 'true');
            installBanner.style.display = 'none';
          };
        }
      }
    });
  }
};

window.App = App;
