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
  prayedTodayExpanded: false,
  currentOnboardingStep: 0,

  async init() {
    console.log('Initializing Prayer Companion with Community & Admin...');

    // 1. Bind Global Event Listeners, Theme & PWA early for instant responsiveness
    this.bindEvents();
    this.initTheme();
    this.initPwa();

    // 2. Initialize Database & Auth with safe fallback
    let authState = { isAuthenticated: false, isLocal: true };
    try {
      await initDB();
      authState = await Auth.init();
    } catch (err) {
      console.warn('DB / Auth initialization note:', err);
    }

    // 3. Initialize Background Sync
    try {
      SyncEngine.init();
    } catch (err) {
      console.warn('SyncEngine init note:', err);
    }

    // 4. Initialize Admin Module
    try {
      Admin.init();
    } catch (err) {
      console.warn('Admin init note:', err);
    }

    // 5. Render Local-First Interface Immediately (< 50ms)
    this.renderHeader();
    this.renderDailyScripture();
    await this.renderCurrentView();

    // 6. Seed welcome data on first visit
    try {
      if (Auth.isLocalMode() || !authState.isAuthenticated) {
        await AppDB.seedWelcomeDataIfEmpty(Auth.getUserId());
        await this.renderCurrentView();
      }
    } catch (_) {}

    // 7. If authenticated, trigger background sync
    if (authState && authState.isAuthenticated) {
      try {
        SyncEngine.syncNow();
      } catch (_) {}
    }

    // 8. Check Landing Screen / Welcome Window State
    this.checkLandingState();

    // 9. Multilingual Cycling Brand Title (3s interval, frequent Telugu)
    this.initMultilingualLogoTitle();

    // 10. Start Scripture Verse Notifications Scheduler
    if (typeof VerseNotifications !== 'undefined' && VerseNotifications.startScheduler) {
      VerseNotifications.startScheduler();
    }
  },

  // ==========================================================================
  // NAVIGATION & ROUTING
  // ==========================================================================

  initMultilingualLogoTitle() {
    const brandTitleEl = document.getElementById('brand-title-text');
    const langTickerEl = document.getElementById('brand-lang-ticker');
    const landingLangTickerEl = document.getElementById('landing-lang-ticker');

    // 1. Keep Special Logo text for Prayerly permanently
    if (brandTitleEl) {
      brandTitleEl.textContent = 'Prayerly';
    }

    // 2. Multilingual prayer words cycling next to Prayerly every 3 seconds (frequently repeating Telugu as requested)
    const languages = [
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'பிரார்த்தனை', label: 'Tamil' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'प्रार्थना', label: 'Hindi' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'প্রার্থনা', label: 'Bengali' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'പ്രാർത്ഥന', label: 'Malayalam' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'ಪ್ರಾರ್ಥನೆ', label: 'Kannada' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Oración', label: 'Spanish' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Oratio', label: 'Latin' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Prayer', label: 'English' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Προσευχή', label: 'Greek' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Prière', label: 'French' },
      { word: 'ప్రార్థన', label: 'Telugu' },
      { word: 'Gebet', label: 'German' }
    ];

    let wordIndex = 0;
    const tickerElements = [langTickerEl, landingLangTickerEl].filter(Boolean);
    if (!tickerElements.length) return;

    const updateTicker = () => {
      const item = languages[wordIndex];
      tickerElements.forEach(el => el.classList.add('switching'));
      setTimeout(() => {
        tickerElements.forEach(el => {
          el.textContent = item.word;
          el.title = `${item.label}: ${item.word} (Prayer)`;
          el.classList.remove('switching');
        });
      }, 260);
      wordIndex = (wordIndex + 1) % languages.length;
    };

    // Initial render
    updateTicker();

    // Cycle every 3 seconds
    setInterval(updateTicker, 3000);
  },

  initTheme() {
    const savedTheme = localStorage.getItem('PRAYERLY_THEME') || 'light';
    const isDark = savedTheme === 'dark';
    this.applyTheme(isDark);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    this.initPreferences();
  },

  toggleTheme() {
    const currentlyDark = document.body.classList.contains('dark-theme');
    const nextDark = !currentlyDark;
    this.applyTheme(nextDark);
    localStorage.setItem('PRAYERLY_THEME', nextDark ? 'dark' : 'light');
    const moreNightLabel = document.getElementById('more-nightmode-label');
    if (moreNightLabel) {
      moreNightLabel.textContent = nextDark ? 'Light Mode' : 'Night Mode';
    }
  },

  applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
    const sunIcon = document.querySelector('#theme-toggle-btn .icon-sun');
    const moonIcon = document.querySelector('#theme-toggle-btn .icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'none' : 'inline-flex';
      moonIcon.style.display = isDark ? 'inline-flex' : 'none';
    }
    const moreNightLabel = document.getElementById('more-nightmode-label');
    if (moreNightLabel) {
      moreNightLabel.textContent = isDark ? 'Light Mode' : 'Night Mode';
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0B1120' : '#023E8A');
    }
  },

  initPreferences() {
    // 1. Font Size Scaling
    const savedFontScale = localStorage.getItem('prayerly_font_scale') || 'md';
    this.setTextSize(savedFontScale, false);

    // 2. Theme Accent Color (Default: Classic Navy Blue)
    const savedThemeColor = localStorage.getItem('prayerly_theme_color') || 'navy';
    this.setThemeColor(savedThemeColor, false);
  },

  setTextSize(scale, showToast = false) {
    const validScales = ['sm', 'md', 'lg', 'xl'];
    if (!validScales.includes(scale)) scale = 'md';

    // Remove all previous scale classes
    validScales.forEach(s => document.body.classList.remove(`font-scale-${s}`));
    document.body.classList.add(`font-scale-${scale}`);
    localStorage.setItem('prayerly_font_scale', scale);

    // Update buttons in modal
    document.querySelectorAll('.text-size-btn').forEach(btn => {
      if (btn.getAttribute('data-scale') === scale) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update indicator label
    const indicator = document.getElementById('font-scale-indicator');
    if (indicator) {
      const labels = {
        sm: 'Small (90%)',
        md: 'Default (100%)',
        lg: 'Large (115%)',
        xl: 'X-Large (130%)'
      };
      indicator.textContent = labels[scale] || 'Default (100%)';
    }

    if (showToast && typeof UI !== 'undefined' && UI.toast) {
      UI.toast('Reading text size updated', 'info');
    }
  },

  setThemeColor(color, showToast = false) {
    const validColors = ['navy', 'olive', 'emerald', 'amber', 'purple'];
    if (!validColors.includes(color)) color = 'navy';

    document.documentElement.setAttribute('data-theme-color', color);
    document.body.setAttribute('data-theme-color', color);
    localStorage.setItem('prayerly_theme_color', color);

    // Update meta theme-color tag dynamically for browser chrome & address bars
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const isDark = document.body.classList.contains('dark-theme');
      if (isDark) {
        metaTheme.setAttribute('content', '#0B1120');
      } else {
        const themeHexMap = {
          navy: '#023E8A',
          olive: '#556B2F',
          emerald: '#0F766E',
          amber: '#B45309',
          purple: '#6D28D9'
        };
        metaTheme.setAttribute('content', themeHexMap[color] || '#023E8A');
      }
    }

    // Update buttons in modal
    document.querySelectorAll('.theme-color-dot').forEach(btn => {
      if (btn.getAttribute('data-theme') === color) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (showToast && typeof UI !== 'undefined' && UI.toast) {
      const names = {
        navy: 'Classic Navy',
        olive: 'Olive Green',
        emerald: 'Emerald Forest',
        amber: 'Warm Amber',
        purple: 'Royal Purple'
      };
      UI.toast(`Theme set to ${names[color] || color}`, 'info');
    }
  },

  openMoreMenu() {
    this.closeAllModals();
    const modal = document.getElementById('modal-more-menu');
    if (modal) {
      // Admin link visibility
      const adminLink = document.getElementById('more-link-admin');
      if (adminLink) {
        adminLink.style.display = (typeof Admin !== 'undefined' && Admin.isAdminUser()) ? 'flex' : 'none';
      }

      // Install button visibility (show only if not already installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true ||
                           document.referrer.includes('android-app://') ||
                           localStorage.getItem('PRAYERLY_PWA_INSTALLED') === 'true';
      const moreInstallBtn = document.getElementById('more-btn-install-app');
      if (moreInstallBtn) {
        moreInstallBtn.style.display = !isStandalone ? 'flex' : 'none';
      }

      // Night mode label
      const isDark = document.body.classList.contains('dark-theme');
      const moreNightLabel = document.getElementById('more-nightmode-label');
      if (moreNightLabel) {
        moreNightLabel.textContent = isDark ? 'Light Mode' : 'Night Mode';
      }

      // Ensure active states are visually synced
      const currentScale = localStorage.getItem('prayerly_font_scale') || 'md';
      this.setTextSize(currentScale, false);

      const currentColor = localStorage.getItem('prayerly_theme_color') || 'navy';
      this.setThemeColor(currentColor, false);

      modal.classList.add('active');
    }
  },

  installFromMoreMenu() {
    this.closeAllModals();
    if (this.installPromptEvent) {
      this.installPromptEvent.prompt();
      this.installPromptEvent.userChoice.then((choice) => {
        if (choice && choice.outcome === 'accepted') {
          localStorage.setItem('PRAYERLY_PWA_INSTALLED', 'true');
        }
        this.installPromptEvent = null;
      });
    } else {
      alert('To install Prayerly:\n\n• On iOS / Safari: Tap Share and choose "Add to Home Screen".\n• On Android / Chrome: Tap the browser menu (⋮) and choose "Install app" or "Add to Home screen".\n• On Desktop Chrome/Edge: Click the install icon in the URL address bar.');
    }
  },

  openMoreLink(tab) {
    this.closeAllModals();
    this.switchTab(tab);
  },

  openMoreManual() {
    this.closeAllModals();
    if (typeof Settings !== 'undefined' && Settings.openManualModal) {
      Settings.openManualModal();
    } else {
      const modal = document.getElementById('modal-manual');
      if (modal) modal.classList.add('active');
    }
  },

  openEmailFriendModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-email-friend');
    if (modal) {
      const alertEl = document.getElementById('friend-email-alert');
      if (alertEl) {
        alertEl.style.display = 'none';
        alertEl.textContent = '';
      }

      const emailInput = document.getElementById('friend-email-input');
      const friendNameInput = document.getElementById('friend-name-input');
      const senderNameInput = document.getElementById('friend-sender-name-input');

      if (emailInput) emailInput.value = '';
      if (friendNameInput) friendNameInput.value = '';
      if (senderNameInput && typeof Settings !== 'undefined') {
        senderNameInput.value = Settings.getUserShortName() || '';
      }

      modal.classList.add('active');
      if (emailInput) emailInput.focus();
    }
  },

  async sendEmailToFriend() {
    const emailInput = document.getElementById('friend-email-input');
    const friendNameInput = document.getElementById('friend-name-input');
    const senderNameInput = document.getElementById('friend-sender-name-input');
    const alertEl = document.getElementById('friend-email-alert');
    const sendBtn = document.getElementById('btn-send-friend-email');

    const email = (emailInput ? emailInput.value : '').trim();
    const friendName = (friendNameInput ? friendNameInput.value : '').trim();
    const senderName = (senderNameInput ? senderNameInput.value : '').trim();

    const showAlert = (msg, type = 'error') => {
      if (alertEl) {
        alertEl.textContent = msg;
        alertEl.className = `auth-alert auth-alert-${type}`;
        alertEl.style.display = 'block';
      }
    };

    if (!email || !email.includes('@')) {
      showAlert('Please enter a valid email address for your friend.');
      return;
    }

    try {
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending Invitation...';
      }
      await Settings.sendFriendInvitation(email, friendName, senderName);
      showAlert('Invitation email sent successfully to ' + email + '!', 'success');
      setTimeout(() => {
        this.closeAllModals();
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send Invitation Email';
        }
      }, 1500);
    } catch (err) {
      showAlert(err.message || 'Failed to send email. Please check backend connection.');
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Invitation Email';
      }
    }
  },

  checkLandingState() {
    const landing = document.getElementById('landing-screen');
    if (!landing) return;
    const modeSelected = localStorage.getItem('prayerly_mode_selected') === 'true';
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn();
    if (!modeSelected && !isLoggedIn) {
      landing.style.display = 'flex';
    } else {
      landing.style.display = 'none';
      this.checkOnboardingState();
    }
  },

  startLandingSignIn() {
    const landing = document.getElementById('landing-screen');
    if (landing) landing.style.display = 'none';
    localStorage.setItem('prayerly_mode_selected', 'true');
    this.openAuthModal();
  },

  async startLandingOffline() {
    const landing = document.getElementById('landing-screen');
    if (landing) landing.style.display = 'none';
    localStorage.setItem('prayerly_mode_selected', 'true');
    if (typeof Auth !== 'undefined' && Auth.continueInLocalMode) {
      await Auth.continueInLocalMode();
    }
    this.renderHeader();
    await this.renderCurrentView();
    this.checkOnboardingState();
  },

  // ==========================================================================
  // CLEAR GUIDED ONBOARDING SYSTEM (WITH ANIMATIONS)
  // ==========================================================================

  checkOnboardingState() {
    const landing = document.getElementById('landing-screen');
    if (landing && landing.style.display !== 'none' && landing.style.display !== '') {
      return; // Do not interrupt landing screen selection
    }
    const completed = localStorage.getItem('prayerly_onboarding_completed') === 'true';
    if (!completed) {
      setTimeout(() => {
        this.openOnboarding(0);
      }, 200);
    }
  },

  openOnboarding(step = 0) {
    this.closeAllModals();
    const modal = document.getElementById('modal-onboarding');
    if (!modal) return;
    modal.classList.add('active');
    this.goToOnboardingStep(step);
  },

  goToOnboardingStep(stepIndex) {
    const prevIndex = this.currentOnboardingStep || 0;
    const direction = stepIndex >= prevIndex ? 'forward' : 'back';
    this.updateOnboardingStep(stepIndex, direction);
  },

  updateOnboardingStep(stepIndex, direction = 'forward') {
    const clampedIndex = Math.max(0, Math.min(3, stepIndex));
    this.currentOnboardingStep = clampedIndex;

    // 1. Update Step Badge Pill
    const badge = document.getElementById('onboarding-step-badge');
    if (badge) {
      badge.textContent = `Step ${clampedIndex + 1} of 4`;
    }

    // 2. Update Slides with animated classes
    for (let i = 0; i < 4; i++) {
      const slide = document.getElementById(`onboarding-slide-${i}`);
      if (slide) {
        if (i === clampedIndex) {
          slide.style.display = 'flex';
          slide.classList.remove('active', 'slide-back');
          // Force reflow to reliably trigger keyframe animation
          void slide.offsetWidth;
          slide.classList.add('active');
          if (direction === 'back') {
            slide.classList.add('slide-back');
          }
        } else {
          slide.style.display = 'none';
          slide.classList.remove('active', 'slide-back');
        }
      }
    }

    // 3. Update Stepper Dots
    document.querySelectorAll('.onboarding-dot').forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'), 10);
      if (dotStep === clampedIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // 4. Update Navigation Buttons
    const prevBtn = document.getElementById('btn-onboarding-prev');
    const nextBtn = document.getElementById('btn-onboarding-next');
    const finishBtn = document.getElementById('btn-onboarding-finish');

    if (prevBtn) {
      prevBtn.style.display = clampedIndex > 0 ? 'inline-flex' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = clampedIndex < 3 ? 'inline-flex' : 'none';
    }
    if (finishBtn) {
      finishBtn.style.display = clampedIndex === 3 ? 'inline-flex' : 'none';
    }
  },

  nextOnboardingStep() {
    if (this.currentOnboardingStep < 3) {
      this.updateOnboardingStep(this.currentOnboardingStep + 1, 'forward');
    } else {
      this.completeOnboarding();
    }
  },

  prevOnboardingStep() {
    if (this.currentOnboardingStep > 0) {
      this.updateOnboardingStep(this.currentOnboardingStep - 1, 'back');
    }
  },

  completeOnboarding() {
    localStorage.setItem('prayerly_onboarding_completed', 'true');
    const modal = document.getElementById('modal-onboarding');
    if (modal) modal.classList.remove('active');

    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast('Welcome to Prayerly! Begin your personal prayer journey.', 'success');
    }

    // Guide attention to the "+ Quick Add" button with a gentle spotlight ring
    const quickAddBtn = document.getElementById('btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.classList.add('spotlight-active');
      setTimeout(() => {
        quickAddBtn.classList.remove('spotlight-active');
      }, 3000);
    }
  },

  skipOnboarding() {
    localStorage.setItem('prayerly_onboarding_completed', 'true');
    const modal = document.getElementById('modal-onboarding');
    if (modal) modal.classList.remove('active');
  },

  restartOnboarding() {
    this.openOnboarding(0);
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
      quickAddBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.openPrayerModal();
      };
    }

    // Add Thanksgiving Button
    const addTgBtn = document.getElementById('btn-add-thanksgiving');
    if (addTgBtn) {
      addTgBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.openThanksgivingModal();
      };
    }

    // Header Sign In Button
    const headerSignInBtn = document.getElementById('header-btn-signin');
    if (headerSignInBtn) {
      headerSignInBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.openAuthModal();
      };
    }

    // Switch Account / Sign In button
    const switchAccountBtn = document.getElementById('btn-switch-account');
    if (switchAccountBtn) {
      switchAccountBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.openAuthModal();
      };
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

    // App User Manual Button
    const openManualBtn = document.getElementById('btn-open-manual');
    if (openManualBtn) {
      openManualBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.openManualModal();
      });
    }

    // Story Category Filter
    const storyCatFilter = document.getElementById('story-filter-category');
    if (storyCatFilter) {
      storyCatFilter.addEventListener('change', () => this.renderStoriesView());
    }

    // Story Search Filter
    const storySearch = document.getElementById('story-search-input');
    if (storySearch) {
      storySearch.addEventListener('input', () => {
        clearTimeout(this.storySearchTimer);
        this.storySearchTimer = setTimeout(() => this.renderStoriesView(), 200);
      });
    }

    // Export PDF Buttons
    const exportPdfHistory = document.getElementById('btn-export-pdf-history');
    if (exportPdfHistory) {
      exportPdfHistory.addEventListener('click', () => this.exportWeeklySummaryPdf());
    }

    const exportPdfSettings = document.getElementById('btn-export-pdf-settings');
    if (exportPdfSettings) {
      exportPdfSettings.addEventListener('click', () => this.exportWeeklySummaryPdf());
    }

    // Read Stories Settings Button
    const btnStoriesSettings = document.getElementById('btn-settings-read-stories');
    if (btnStoriesSettings) {
      btnStoriesSettings.addEventListener('click', () => this.switchTab('stories'));
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

    const mobileMoreBtn = document.getElementById('btn-mobile-more');
    if (mobileMoreBtn) {
      if (tabName === 'settings' || tabName === 'history' || tabName === 'stories') {
        mobileMoreBtn.classList.add('active');
      } else {
        mobileMoreBtn.classList.remove('active');
      }
    }

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
      case 'stories':
        await this.renderStoriesView();
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

    const headerBtnSignin = document.getElementById('header-btn-signin');
    const isLoggedIn = Auth.isLoggedIn();

    if (headerBtnSignin) {
      headerBtnSignin.style.display = isLoggedIn ? 'none' : 'inline-flex';
    }

    if (userBadgeEl) {
      if (isLoggedIn || Auth.isLocalMode()) {
        userBadgeEl.style.display = 'inline-flex';
        const email = Auth.getUserEmail() || 'Account';
        userBadgeEl.innerHTML = `
          <span class="user-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span class="user-badge-text">${UI.escape(email)}</span>
        `;
        userBadgeEl.title = 'Account: ' + email + ' (Click to manage account)';
        userBadgeEl.onclick = () => this.switchTab('settings');
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

    const DEFAULT_DEVOTIONAL_IMG = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80';

    if (devotionalImgEl) {
      devotionalImgEl.onerror = () => {
        devotionalImgEl.src = DEFAULT_DEVOTIONAL_IMG;
      };
    }

    // Retrieve daily content directly from Google Sheet Daily_Content
    let sheetContent = null;
    try {
      const cached = localStorage.getItem('PRAYERLY_SHEET_DAILY_CONTENT');
      if (cached) sheetContent = JSON.parse(cached);
    } catch (_) {}

    const content = sheetContent || (typeof getDailyContent === 'function' ? getDailyContent() : null);
    const rawVerseText = content?.verse?.text || '';
    const verseRef = content?.verse?.reference || '';
    const quoteText = content?.quote?.text || '';
    const quoteAuthor = content?.quote?.author || '';

    // Check if the verse_text column contains an image URL (including Google Drive links)
    const imgUrl = (typeof extractImageUrl === 'function') 
      ? extractImageUrl(rawVerseText) 
      : (rawVerseText.startsWith('http') ? rawVerseText : '');

    if (devotionalImgEl) {
      if (imgUrl) {
        devotionalImgEl.src = imgUrl;
        devotionalImgEl.alt = verseRef || 'Daily Devotional Inspiration';
      } else {
        devotionalImgEl.src = DEFAULT_DEVOTIONAL_IMG;
      }
    }

    if (verseTextEl) {
      verseTextEl.textContent = imgUrl ? (quoteText || 'Daily Inspiration') : rawVerseText;
    }
    if (verseRefEl) verseRefEl.textContent = verseRef ? `— ${verseRef}` : '';
    if (quoteTextEl) quoteTextEl.textContent = quoteText;
    if (quoteAuthorEl) quoteAuthorEl.textContent = quoteAuthor ? `— ${quoteAuthor}` : '';

    const copyBtn = document.getElementById('btn-copy-verse');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const textToCopy = imgUrl 
          ? `Daily Inspiration: ${imgUrl}\n${verseRef}\n\nVia Prayerly` 
          : `${rawVerseText}\n${verseRef}\n\nVia Prayerly`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          UI.toast('Daily devotional copied to clipboard', 'success');
        }).catch(() => {
          UI.toast('Unable to access clipboard automatically.', 'warning');
        });
      };
    }

    // Refresh from Google Sheet Daily_Content in background
    if (typeof fetchDailyContentFromSheet === 'function') {
      fetchDailyContentFromSheet().then(item => {
        if (item && item.verse && item.verse.text) {
          const freshRaw = item.verse.text.trim();
          const freshImgUrl = (typeof extractImageUrl === 'function') ? extractImageUrl(freshRaw) : (freshRaw.startsWith('http') ? freshRaw : '');
          if (devotionalImgEl && freshImgUrl && devotionalImgEl.src !== freshImgUrl) {
            devotionalImgEl.src = freshImgUrl;
          }
          if (verseTextEl && !freshImgUrl) {
            verseTextEl.textContent = freshRaw;
          }
          if (verseRefEl && item.verse.reference) {
            verseRefEl.textContent = `— ${item.verse.reference}`;
          }
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

    // Separate into to-pray (unprayed today) and prayed today
    const toPrayPrayers = activePrayers.filter(p => !prayedSet.has(p.prayer_id));
    const prayedPrayers = activePrayers.filter(p => prayedSet.has(p.prayer_id));

    let html = '';

    if (toPrayPrayers.length > 0) {
      html += `
        <div class="prayer-section-group" style="margin-bottom: 16px;">
          <div class="prayer-section-header-sub">
            <span class="prayer-section-title">To Pray Today (${toPrayPrayers.length})</span>
          </div>
          <div class="to-pray-cards-list">
            ${toPrayPrayers.map(p => this.renderPrayerCardHtml(p, false, true)).join('')}
          </div>
        </div>
      `;
    } else {
      // All active prayers completed for today!
      html += `
        <div class="all-prayed-banner-wrapper">
          <img src="assets/prayers-completed.svg?v=19" alt="All Prayer Points Completed!" class="all-prayed-banner-img" onerror="this.onerror=null; this.parentElement.innerHTML=App.getPrayersCompletedBannerSvg();">
        </div>
      `;
    }

    if (prayedPrayers.length > 0) {
      const isExpanded = Boolean(this.prayedTodayExpanded);
      html += `
        <div class="prayer-section-group prayed-section-group" style="margin-top: 14px;">
          <button id="btn-toggle-prayed-today" class="prayer-section-toggle-btn" aria-expanded="${isExpanded ? 'true' : 'false'}">
            <span class="prayer-section-title" style="color: var(--olive-700, #4B6324); display: inline-flex; align-items: center; gap: 8px;">
              <span class="prayed-toggle-arrow" style="display: inline-block; font-size: 11px; transition: transform 0.2s ease; transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};">▶</span>
              <span>Prayed Today (${prayedPrayers.length})</span>
            </span>
            <span class="prayed-toggle-hint">${isExpanded ? 'Tap to collapse' : 'Tap to view'}</span>
          </button>
          <div id="prayed-today-dropdown" class="prayed-cards-list" style="display: ${isExpanded ? 'block' : 'none'}; margin-top: 8px;">
            ${prayedPrayers.map(p => this.renderPrayerCardHtml(p, true, true)).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    this.attachPrayerCardActions(container);
  },

  // ==========================================================================
  // PRAYERS LIST RENDERING
  // ==========================================================================

  getPrayersCompletedBannerSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 120" class="all-prayed-banner-img" style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid var(--border-light); margin: 0 auto;">
        <defs>
          <linearGradient id="compGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F0FDF4"/>
            <stop offset="50%" stop-color="#ECFDF5"/>
            <stop offset="100%" stop-color="#F0F9FF"/>
          </linearGradient>
          <linearGradient id="circleGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF3C7"/>
            <stop offset="100%" stop-color="#D1FAE5"/>
          </linearGradient>
          <linearGradient id="badgeGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
          <style>
            .banner-bg-in { fill: url(#compGradInline); stroke: #BBF7D0; }
            .title-text-in { fill: #065F46; }
            .sub-text-in { fill: #047857; }
            body.dark-theme .banner-bg-in { fill: #064E3B !important; stroke: #047857 !important; }
            body.dark-theme .title-text-in { fill: #F0FDF4 !important; }
            body.dark-theme .sub-text-in { fill: #A7F3D0 !important; }
          </style>
        </defs>
        <rect class="banner-bg-in" width="680" height="120" rx="14" stroke-width="1.2"/>
        <g transform="translate(30, 22)">
          <circle cx="38" cy="38" r="38" fill="url(#circleGradInline)"/>
          <path d="M38 4 v-4 M38 72 v4 M4 38 h-4 M72 38 h4 M14 14 l-3 -3 M62 62 l3 3 M14 62 l-3 3 M62 14 l3 -3" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
          <g transform="translate(13, 16)">
            <path d="M5 34 C13 26, 21 28, 25 31 C29 28, 37 26, 45 34 L45 14 C37 6, 29 8, 25 11 C21 8, 13 6, 5 14 Z" fill="#FFFFFF" stroke="#059669" stroke-width="2" stroke-linejoin="round"/>
            <line x1="25" y1="11" x2="25" y2="31" stroke="#059669" stroke-width="2"/>
            <line x1="11" y1="16" x2="20" y2="15" stroke="#A7F3D0" stroke-width="1.5"/>
            <line x1="11" y1="21" x2="20" y2="20" stroke="#A7F3D0" stroke-width="1.5"/>
            <line x1="30" y1="15" x2="39" y2="16" stroke="#A7F3D0" stroke-width="1.5"/>
            <line x1="30" y1="20" x2="39" y2="21" stroke="#A7F3D0" stroke-width="1.5"/>
            <path d="M25 6 Q27 -2 35 0" stroke="#10B981" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <ellipse cx="32" cy="0" rx="3.5" ry="1.8" transform="rotate(-30 32 0)" fill="#10B981"/>
          </g>
        </g>
        <g transform="translate(130, 0)">
          <text class="title-text-in" x="0" y="55" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" letter-spacing="-0.4px">
            All Prayer Points Completed!
          </text>
          <text class="sub-text-in" x="0" y="80" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="500">
            Rest in God's peace today &#8226; All petitions have been lifted in faith
          </text>
        </g>
        <g transform="translate(600, 60)">
          <circle r="25" fill="url(#badgeGradInline)"/>
          <circle r="29" fill="none" stroke="#34D399" stroke-width="1.5" stroke-dasharray="3 3"/>
          <path d="M-8 0 l5 6 l12 -12" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      </svg>
    `;
  },

  async updatePrayerTabCounts() {
    try {
      const allActive = await Prayers.query({ status: 'active' });
      const prayedSet = await Tracking.getPrayedPrayerIdsForDate();
      const toPrayCount = allActive.filter(p => !prayedSet.has(p.prayer_id)).length;
      const prayedCount = allActive.filter(p => prayedSet.has(p.prayer_id)).length;
      const allCount = allActive.length;
      const archivedPrayers = await Prayers.query({ status: 'archived' });
      const archivedCount = archivedPrayers.length;

      const toPrayPill = document.querySelector('.prayer-status-pill[data-status="to-pray"]');
      const prayedPill = document.querySelector('.prayer-status-pill[data-status="prayed"]');
      const activePill = document.querySelector('.prayer-status-pill[data-status="active"]');
      const archivedPill = document.querySelector('.prayer-status-pill[data-status="archived"]');

      if (toPrayPill) toPrayPill.textContent = `To Pray Today (${toPrayCount})`;
      if (prayedPill) prayedPill.textContent = `Prayed Today (${prayedCount})`;
      if (activePill) activePill.textContent = `All Active (${allCount})`;
      if (archivedPill) archivedPill.textContent = `Archived (${archivedCount})`;
    } catch (_) {}
  },

  async renderPrayersList() {
    const container = document.getElementById('prayers-list-container');
    const emptyState = document.getElementById('prayers-empty-state');
    if (!container) return;

    await this.updatePrayerTabCounts();

    const searchInput = document.getElementById('prayer-search-input');
    const searchQuery = searchInput ? searchInput.value : '';

    const categorySelect = document.getElementById('prayer-category-filter');
    const category = categorySelect ? categorySelect.value : 'all';

    const activePill = document.querySelector('.prayer-status-pill.active');
    const statusTab = activePill ? activePill.getAttribute('data-status') : 'to-pray';

    const prayedSet = await Tracking.getPrayedPrayerIdsForDate();

    let queryStatus = 'active';
    if (statusTab === 'archived') {
      queryStatus = 'archived';
    }

    const prayers = await Prayers.query({
      status: queryStatus,
      category: category,
      searchQuery: searchQuery,
      sortBy: 'newest'
    });

    let displayPrayers = prayers;
    if (statusTab === 'to-pray') {
      displayPrayers = prayers.filter(p => !prayedSet.has(p.prayer_id));
    } else if (statusTab === 'prayed') {
      displayPrayers = prayers.filter(p => prayedSet.has(p.prayer_id));
    }

    if (displayPrayers.length === 0) {
      container.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyMsg = emptyState.querySelector('p');
        if (emptyMsg) {
          if (statusTab === 'to-pray' && prayers.length > 0) {
            emptyMsg.textContent = 'All prayer points prayed for today! Check the "Prayed Today" tab to review.';
          } else if (statusTab === 'prayed') {
            emptyMsg.textContent = 'No prayer points marked as prayed yet today.';
          } else {
            emptyMsg.textContent = 'No prayer points matching your current filter.';
          }
        }
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = displayPrayers.map(p => {
      const isPrayed = prayedSet.has(p.prayer_id);
      return this.renderPrayerCardHtml(p, isPrayed, false);
    }).join('');

    this.attachPrayerCardActions(container);
  },

  renderPrayerCardHtml(prayer, isPrayed, isDashboard = false) {
    const cardStatusClass = isPrayed ? 'card-prayed' : '';
    const hasDesc = Boolean(prayer.description && prayer.description.trim());

    return `
      <div class="prayer-card ${cardStatusClass}" data-id="${prayer.prayer_id}">
        <h3 class="prayer-title">${UI.escape(prayer.title)}</h3>
        ${hasDesc ? `<div class="prayer-desc">${UI.escape(prayer.description.trim())}</div>` : ''}

        <div class="prayer-card-footer">
          <div class="prayer-primary-group">
            <button class="btn btn-pray ${isPrayed ? 'btn-prayed' : ''}" data-action="toggle-pray" data-id="${prayer.prayer_id}" title="${isPrayed ? 'Click to move back to To-Pray' : 'Mark as prayed and move to Prayed list'}">
              <span class="btn-icon">${isPrayed ? Icons.checkCircle : Icons.prayerHands}</span>
              <span>${isPrayed ? 'Prayed ✓' : 'I Prayed'}</span>
            </button>
            <button class="btn btn-secondary btn-sm" title="God Answered This Prayer" data-action="answered" data-id="${prayer.prayer_id}">
              <span class="btn-icon">${Icons.sparkles}</span>
              <span>Answered</span>
            </button>
          </div>

          <div class="card-menu-container">
            <button class="card-menu-btn" data-action="toggle-card-menu" title="More options" aria-label="More options">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
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
    // Dropdown toggle for Prayed Today
    const toggleBtn = parentEl.querySelector('#btn-toggle-prayed-today');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prayedTodayExpanded = !this.prayedTodayExpanded;
        const dropdown = parentEl.querySelector('#prayed-today-dropdown');
        const arrow = toggleBtn.querySelector('.prayed-toggle-arrow');
        const hint = toggleBtn.querySelector('.prayed-toggle-hint');
        if (dropdown) {
          dropdown.style.display = this.prayedTodayExpanded ? 'block' : 'none';
        }
        if (arrow) {
          arrow.style.transform = this.prayedTodayExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
        }
        if (hint) {
          hint.textContent = this.prayedTodayExpanded ? 'Tap to collapse' : 'Tap to view';
        }
        toggleBtn.setAttribute('aria-expanded', this.prayedTodayExpanded ? 'true' : 'false');
      });
    }

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
        if (btn.disabled) return;
        btn.disabled = true;

        if (window.navigator?.vibrate) {
          try { window.navigator.vibrate(15); } catch (_) {}
        }
        const id = e.currentTarget.getAttribute('data-id');
        const card = e.currentTarget.closest('.prayer-card');
        if (card) {
          card.style.transition = 'all 0.22s ease-out';
          card.style.transform = 'scale(0.97) translateY(-4px)';
          card.style.opacity = '0.35';
        }
        try {
          await Tracking.togglePrayedToday(id);
        } catch (err) {
          UI.toast(err.message, 'error');
          if (card) {
            card.style.transform = '';
            card.style.opacity = '';
          }
        } finally {
          btn.disabled = false;
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
        }
      });
    });

    parentEl.querySelectorAll('[data-action="restore"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        closeAllCardMenus();
        const id = e.currentTarget.getAttribute('data-id');
        await Prayers.restore(id);
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
    const search = searchInput ? searchInput.value.trim() : '';
    const isDefaultQuery = (this.communityFilter === 'recent' && this.communityCategory === 'all' && !search && this.communityPage === 1);

    // 1. Instant cache retrieval for seamless, 0ms transitions without loading flicker
    let hasRenderedCache = false;
    if (isDefaultQuery) {
      const cached = await Community.getCachedRequests();
      if (cached && Array.isArray(cached.requests) && cached.requests.length > 0) {
        this.renderCommunityCards(container, emptyState, cached);
        hasRenderedCache = true;
      }
    }

    // Only display loading state if cache is empty or unavailable
    if (!hasRenderedCache && (!container.children.length || container.innerHTML.includes('Join the Prayer'))) {
      container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Loading community prayer requests...</div>`;
    }

    // 2. Fetch fresh data from network in background (or foreground)
    try {
      const data = await Community.getRequests({
        filterType: this.communityFilter,
        category: this.communityCategory,
        search: search,
        page: this.communityPage,
        limit: 15
      });

      // Update UI only if user is still on community view
      if (this.currentTab === 'community') {
        this.renderCommunityCards(container, emptyState, data);
      }
    } catch (err) {
      if (!hasRenderedCache) {
        container.innerHTML = `<div class="empty-state-card" style="color: #DC2626;"><p>Could not load community requests: ${UI.escape(err.message)}</p></div>`;
      } else {
        console.warn('Background community sync note:', err);
      }
    }
  },

  renderCommunityCards(container, emptyState, data) {
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
            <span class="badge badge-person">${UI.escape(r.display_name)}</span>
          </div>
          <div class="prayer-date">${new Date(r.created_at).toLocaleDateString()}</div>
        </div>

        <h3 class="prayer-title">${UI.escape(r.prayer_title)}</h3>
        ${r.shared_description ? `<p class="prayer-desc">${UI.escape(r.shared_description)}</p>` : ''}

        <div class="community-supporters-banner">
          <span class="supporters-badge"><strong>${r.supporters_count}</strong> companion${r.supporters_count === 1 ? '' : 's'} praying</span>
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

    // Edit Community Request
    parentEl.querySelectorAll('[data-action="edit-community-req"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        const cached = await Community.getCachedRequests();
        const reqList = (cached && cached.requests) ? cached.requests : [];
        const req = reqList.find(r => r.request_id === reqId);
        if (req) {
          this.openShareCompanionModal({
            title: req.prayer_title,
            description: req.shared_description,
            category: req.category,
            display_name: req.display_name,
            is_anonymous: req.is_anonymous,
            allow_encouragement: req.allow_encouragement
          }, reqId);
        } else {
          UI.toast('Could not find request details to edit.', 'warning');
        }
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
          <span class="badge badge-answered">Answered</span>
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
          <span class="badge badge-thanksgiving">${UI.escape(e.category || 'Praise')}</span>
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
    const longestStreakEl = document.getElementById('history-longest-streak');
    const totalDaysEl = document.getElementById('history-total-days');
    const totalPrayersEl = document.getElementById('history-total-prayers');
    const heatmapContainer = document.getElementById('history-heatmap-container');
    const calendarEl = document.getElementById('history-calendar-chart');
    const datePickerInput = document.getElementById('history-date-picker');

    // 1. Detailed Streak & Consistency Statistics
    try {
      const stats = await Tracking.getDetailedStreakStats();
      if (streakEl) streakEl.textContent = `${stats.currentStreak} Day${stats.currentStreak === 1 ? '' : 's'}`;
      if (longestStreakEl) longestStreakEl.textContent = `${stats.longestStreak} Day${stats.longestStreak === 1 ? '' : 's'}`;
      if (totalDaysEl) totalDaysEl.textContent = `${stats.totalActiveDays} Day${stats.totalActiveDays === 1 ? '' : 's'}`;
      if (totalPrayersEl) totalPrayersEl.textContent = stats.totalPrayersOffered;
    } catch (_) {
      const streak = await Tracking.getPrayerStreak();
      if (streakEl) streakEl.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
    }

    // 2. Minimalist GitHub-Style Activity Heat-Map (12 Weeks)
    if (heatmapContainer) {
      try {
        const heatmapWeeks = await Tracking.getHeatmapData(12);
        const dayLabels = ['M', '', 'W', '', 'F', '', 'S'];
        let html = '<div class="heatmap-table">';
        html += '<div class="heatmap-weekday-col">';
        dayLabels.forEach(lbl => {
          html += `<span>${lbl}</span>`;
        });
        html += '</div>';

        heatmapWeeks.forEach(week => {
          html += '<div class="heatmap-week-column">';
          html += `<div class="heatmap-month-header">${week.monthLabel || '&nbsp;'}</div>`;
          html += '<div class="heatmap-days-group">';
          week.days.forEach(day => {
            const tooltip = day.isFuture 
              ? `${day.date} (Upcoming)` 
              : `${day.date}: ${day.count} prayer${day.count === 1 ? '' : 's'}`;
            html += `<div class="heatmap-cell level-${day.level}" data-date="${day.date}" title="${tooltip}"></div>`;
          });
          html += '</div></div>';
        });
        html += '</div>';
        heatmapContainer.innerHTML = html;

        // Cell click interactive navigation to load date's prayers
        heatmapContainer.querySelectorAll('.heatmap-cell').forEach(cell => {
          cell.addEventListener('click', (e) => {
            const date = e.currentTarget.getAttribute('data-date');
            if (date && datePickerInput) {
              datePickerInput.value = date;
              this.renderHistoryDatePrayers(date);
            }
          });
        });
      } catch (err) {
        console.warn('Heatmap render error:', err);
      }
    }

    // 3. 14-day Activity Summary (backward compatible)
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

    // 4. Prayers by Date
    const targetDate = datePickerInput ? (datePickerInput.value || Tracking.getLocalDateString()) : Tracking.getLocalDateString();
    if (datePickerInput) {
      if (!datePickerInput.value) {
        datePickerInput.value = targetDate;
      }
      datePickerInput.onchange = () => {
        this.renderHistoryDatePrayers(datePickerInput.value);
      };
    }

    await this.renderHistoryDatePrayers(targetDate);
  },

  async renderHistoryDatePrayers(targetDate) {
    const selectedDatePrayersEl = document.getElementById('history-date-prayers');
    if (!selectedDatePrayersEl) return;
    const dayRecords = await Tracking.getHistoryForDate(targetDate);
    if (dayRecords.length === 0) {
      selectedDatePrayersEl.innerHTML = `<div class="empty-state-card"><p>No recorded prayers for ${targetDate}.</p></div>`;
    } else {
      selectedDatePrayersEl.innerHTML = dayRecords.map(r => `
        <div class="history-record-card">
          <div>
            <div style="font-weight: bold; color: var(--text-primary);">${UI.escape(r.title)}</div>
            <span class="badge badge-category" style="margin-top: 4px;">${UI.escape(r.category || 'General')}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            ${new Date(r.prayed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      `).join('');
    }
  },

  // ==========================================================================
  // BIBLE PRAYER STORIES VIEW
  // ==========================================================================

  filterStories() {
    this.renderStoriesView();
  },

  renderStoriesView() {
    const container = document.getElementById('stories-grid-container');
    const emptyState = document.getElementById('stories-empty-state');
    const categorySelect = document.getElementById('story-category-filter') || document.getElementById('story-filter-category');
    const searchInput = document.getElementById('story-search-input');
    if (!container) return;

    if (typeof BibleStories === 'undefined') return;

    const category = categorySelect ? categorySelect.value : 'all';
    const query = searchInput ? searchInput.value.trim() : '';

    let stories = BibleStories.getAll();
    if (category && category !== 'all') {
      stories = stories.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const searchResults = BibleStories.search(query);
      const searchIds = new Set(searchResults.map(s => s.id));
      stories = stories.filter(s => searchIds.has(s.id));
    }

    if (stories.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = stories.map(story => `
      <div class="story-card" onclick="App.openStoryReader('${story.id}')">
        <div class="story-card-img-wrap">
          <img src="${story.coverImage}" alt="${UI.escape(story.title)}" class="story-card-img" loading="lazy" />
        </div>
        <div class="story-card-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="story-category-tag">${UI.escape(story.category)}</span>
            <span class="story-scripture-citation">${UI.escape(story.scripture)}</span>
          </div>
          <h3 class="story-card-title">${UI.escape(story.title)}</h3>
          <p class="story-card-summary">${UI.escape(story.summary)}</p>
          <div class="story-card-footer">
            <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 500;">Textbook Edition</span>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.openStoryReader('${story.id}')">Read Story &rarr;</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  openStoryReader(storyId) {
    if (typeof BibleStories === 'undefined') return;
    const story = BibleStories.getById(storyId);
    if (!story) return;

    this.closeAllModals();
    const modal = document.getElementById('modal-story-reader');
    if (!modal) return;

    const imgEl = document.getElementById('story-reader-img');
    const catEl = document.getElementById('story-reader-category');
    const scripEl = document.getElementById('story-reader-scripture');
    const titleEl = document.getElementById('story-reader-title');
    const summaryEl = document.getElementById('story-reader-summary');
    const contentEl = document.getElementById('story-reader-content');
    const takeawayEl = document.getElementById('story-reader-takeaway');
    const appEl = document.getElementById('story-reader-application');
    const prayNowBtn = document.getElementById('btn-story-pray-now');

    if (imgEl) {
      imgEl.src = story.coverImage;
      imgEl.alt = story.title;
    }
    if (catEl) catEl.textContent = story.category;
    if (scripEl) scripEl.textContent = story.scripture;
    if (titleEl) titleEl.textContent = story.title;
    if (summaryEl) summaryEl.textContent = story.summary;

    if (contentEl) {
      contentEl.innerHTML = story.narrative.map(p => `<p>${UI.escape(p)}</p>`).join('');
    }
    if (takeawayEl) takeawayEl.textContent = story.takeaway;
    if (appEl) appEl.textContent = story.prayerApplication;

    if (prayNowBtn) {
      prayNowBtn.onclick = () => {
        this.closeAllModals();
        this.openPrayerModal({
          title: `Prayer inspired by ${story.title}`,
          description: `${story.prayerApplication}\n\nClaimed Scripture: ${story.scripture}`,
          category: 'Spiritual Growth',
          priority: 'Medium'
        });
      };
    }

    modal.classList.add('active');
  },

  // ==========================================================================
  // PRINTABLE / PDF WEEKLY PRAYER DIARY SUMMARY
  // ==========================================================================

  async exportWeeklySummaryPdf() {
    const container = document.getElementById('printable-prayer-summary');
    if (!container) return;

    try {
      UI.toast('Preparing printable devotional PDF...', 'info');

      // 1. Gather active prayer requests
      const allActive = await Prayers.query({ status: 'active', sortBy: 'priority' });
      const answeredRecords = await AppDB.getAll('answered_prayers');
      const answeredIdSet = new Set(
        answeredRecords.filter(a => !a.is_deleted).map(a => a.prayer_id)
      );
      const activePrayers = allActive.filter(p => !p.is_deleted && !answeredIdSet.has(p.prayer_id));

      // 2. Gather recent answered prayers
      const activeAnswered = answeredRecords.filter(a => !a.is_deleted);

      // 3. Gather recent thanksgiving records
      const thanksgivingRecords = await Thanksgiving.getAll();
      const activeThanksgiving = thanksgivingRecords.filter(t => !t.is_deleted);

      // 4. Scripture Verse
      const verseTextEl = document.getElementById('daily-verse-text');
      const verseRefEl = document.getElementById('daily-verse-ref');
      const verseText = verseTextEl ? verseTextEl.textContent : 'Rejoice always, pray continually, give thanks in all circumstances.';
      const verseRef = verseRefEl ? verseRefEl.textContent : '— 1 Thessalonians 5:16-18';

      const userEmail = Auth.getUserEmail() || 'Personal Devotions';
      const userName = (typeof Settings !== 'undefined' && Settings.getUserShortName) ? Settings.getUserShortName() : 'Poorna';
      const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      let html = `
        <div class="print-header">
          <div>
            <h1 class="print-title">Prayerly &bull; Weekly Prayer &amp; Devotional Summary</h1>
            <p class="print-subtitle">Personal petitions, answered prayers, and gratitude diary</p>
          </div>
          <div class="print-meta">
            <div><strong>Believer:</strong> ${UI.escape(userName)} (${UI.escape(userEmail)})</div>
            <div><strong>Printed:</strong> ${todayStr}</div>
          </div>
        </div>

        <div class="print-verse-banner">
          <strong>Weekly Scripture Promise:</strong> "${UI.escape(verseText)}" ${UI.escape(verseRef)}
        </div>

        <div class="print-section">
          <h2 class="print-section-title">Active Prayer Petitions (${activePrayers.length})</h2>
          ${activePrayers.length === 0 ? '<p style="font-size: 9.5pt; color: #718096; font-style: italic;">No active petitions recorded.</p>' : ''}
          ${activePrayers.map(p => `
            <div class="print-item">
              <div class="print-checkbox"></div>
              <div class="print-item-content">
                <div class="print-item-title">
                  ${UI.escape(p.title)}
                  <span class="print-item-badge">${UI.escape(p.category || 'General')}</span>
                  <span class="print-item-badge">${UI.escape(p.priority || 'Medium')} Priority</span>
                  ${p.person_name ? `<span class="print-item-badge">For: ${UI.escape(p.person_name)}</span>` : ''}
                </div>
                ${p.description ? `<div class="print-item-desc">${UI.escape(p.description)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="print-section">
          <h2 class="print-section-title">Answered Prayers &amp; Testimonies (${activeAnswered.length})</h2>
          ${activeAnswered.length === 0 ? '<p style="font-size: 9.5pt; color: #718096; font-style: italic;">No answered prayers recorded yet.</p>' : ''}
          ${activeAnswered.slice(0, 10).map(a => `
            <div class="print-item">
              <div style="font-size: 11pt; color: #16A34A; flex-shrink: 0; line-height: 1;">&#10003;</div>
              <div class="print-item-content">
                <div class="print-item-title">${UI.escape(a.prayer_title || 'Prayer Answered')} <span class="print-item-badge">Answered: ${a.date_answered || ''}</span></div>
                ${a.testimony ? `<div class="print-item-desc"><em>Testimony:</em> ${UI.escape(a.testimony)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="print-section">
          <h2 class="print-section-title">Thanksgiving &amp; Gratitude Journal (${activeThanksgiving.length})</h2>
          ${activeThanksgiving.length === 0 ? '<p style="font-size: 9.5pt; color: #718096; font-style: italic;">No gratitude entries recorded.</p>' : ''}
          ${activeThanksgiving.slice(0, 8).map(t => `
            <div class="print-item">
              <div style="font-size: 10pt; color: #D97706; flex-shrink: 0; line-height: 1;">&#9825;</div>
              <div class="print-item-content">
                <div class="print-item-title">${UI.escape(t.title)} <span class="print-item-badge">${UI.escape(t.category || 'Praise')}</span></div>
                ${t.description ? `<div class="print-item-desc">${UI.escape(t.description)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="print-footer">
          <span>Generated with Prayerly &bull; 100% Private Devotional Life</span>
          <span>"The prayer of a righteous person is powerful and effective." — James 5:16</span>
        </div>
      `;

      container.innerHTML = html;
      window.print();
    } catch (err) {
      console.warn('PDF export error:', err);
      UI.toast('Could not generate PDF: ' + err.message, 'error');
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

    // Avatar Initial
    const avatarEl = document.getElementById('settings-avatar-initial');
    if (avatarEl) {
      const name = (Settings.getUserShortName() || Auth.getUserEmail() || 'P').trim();
      avatarEl.textContent = name ? name.charAt(0).toUpperCase() : 'P';
    }

    // Last Sync Display
    const lastSyncEl = document.getElementById('settings-last-sync-time');
    if (lastSyncEl) {
      const lastSyncRaw = localStorage.getItem('prayerly_last_sync_time');
      if (lastSyncRaw) {
        try {
          const d = new Date(lastSyncRaw);
          lastSyncEl.textContent = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (_) {
          lastSyncEl.textContent = lastSyncRaw;
        }
      } else {
        lastSyncEl.textContent = 'Not yet synced';
      }
    }

    if (apiUrlInput) apiUrlInput.value = Auth.getApiUrl();

    const settings = await Settings.getSettings();
    if (timezoneSelect) timezoneSelect.value = settings.timezone || 'Asia/Kolkata';
    if (morningCheck) morningCheck.checked = Boolean(settings.morning_email_enabled);
    if (morningTimeInput) morningTimeInput.value = settings.morning_time || '03:00';
    if (eveningCheck) eveningCheck.checked = Boolean(settings.evening_email_enabled);
    if (eveningTimeInput) eveningTimeInput.value = settings.evening_time || '18:00';

    // Scripture Verse of the Day Notifications Row
    const verseNotifyCheck = document.getElementById('settings-verse-notify-enabled');
    const testVerseBtn = document.getElementById('btn-test-verse-notification');

    if (verseNotifyCheck && typeof VerseNotifications !== 'undefined') {
      verseNotifyCheck.checked = VerseNotifications.isEnabled();
      verseNotifyCheck.onchange = async () => {
        const allowed = await VerseNotifications.setDailyVerseNotification(verseNotifyCheck.checked);
        if (!allowed && verseNotifyCheck.checked) {
          verseNotifyCheck.checked = false;
        }
      };
    }

    if (testVerseBtn && typeof VerseNotifications !== 'undefined') {
      testVerseBtn.onclick = async () => {
        await VerseNotifications.sendDailyVerseNotification(true);
      };
    }

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
        if (avatarEl) {
          avatarEl.textContent = val ? val.charAt(0).toUpperCase() : 'P';
        }
        this.renderHeader();
      };
    }

    if (settingsShareBtn) {
      settingsShareBtn.onclick = () => this.shareApp();
    }

    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const existingSettings = await Settings.getSettings();
        const newSettings = {
          ...existingSettings,
          timezone: timezoneSelect ? timezoneSelect.value : 'Asia/Kolkata',
          morning_email_enabled: morningCheck ? morningCheck.checked : true,
          morning_time: morningTimeInput ? morningTimeInput.value : '03:00',
          evening_email_enabled: eveningCheck ? eveningCheck.checked : true,
          evening_time: eveningTimeInput ? eveningTimeInput.value : '18:00',
          short_name: Settings.getUserShortName() || existingSettings.short_name || ''
        };

        if (apiUrlInput) {
          Auth.setApiUrl(apiUrlInput.value);
        }

        await Settings.saveSettings(newSettings);
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
        localStorage.setItem('prayerly_last_sync_time', new Date().toISOString());
        if (lastSyncEl) {
          const now = new Date();
          lastSyncEl.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
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
          this.switchView('dashboard');
          this.renderHeader();
          this.renderDashboard();
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

  openAuthModal(initialStep = 'email') {
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
    const backEmailBtn = document.getElementById('btn-auth-back-email');
    const resendBtn = document.getElementById('btn-auth-resend-otp');

    const showAlert = (msg, type = 'error') => {
      if (!authError) return;
      if (!msg) {
        authError.style.display = 'none';
        authError.textContent = '';
        return;
      }
      authError.className = `auth-alert auth-alert-${type}`;
      authError.style.display = 'block';
      authError.innerHTML = msg;
    };

    const clearAlert = () => showAlert('');

    const showStep = (step) => {
      clearAlert();
      if (step === 'otp') {
        if (emailStep) emailStep.style.display = 'none';
        if (otpStep) otpStep.style.display = 'block';

        const activeEmail = (emailInput?.value || '').trim() || localStorage.getItem('prayer_last_attempted_email') || '';
        if (displayEmail) displayEmail.textContent = activeEmail;
        if (otpInput) {
          otpInput.value = '';
          setTimeout(() => otpInput.focus(), 120);
        }
      } else {
        if (emailStep) emailStep.style.display = 'block';
        if (otpStep) otpStep.style.display = 'none';
        setTimeout(() => { if (emailInput) emailInput.focus(); }, 120);
      }
    };

    // Pre-fill inputs from storage if available
    const savedName = (typeof Settings !== 'undefined' && Settings.getUserShortName) ? Settings.getUserShortName() : 'Poorna';
    if (nameInput && !nameInput.value) nameInput.value = savedName;
    const lastEmail = localStorage.getItem('prayer_last_attempted_email') || (Auth.currentUser?.email && !Auth.isLocalMode() ? Auth.currentUser.email : 'poornaprasad12344@gmail.com');
    if (emailInput && !emailInput.value) emailInput.value = lastEmail;

    if (backEmailBtn) backEmailBtn.onclick = () => showStep('email');

    // Display modal and activate initial step
    modal.classList.add('active');
    showStep(initialStep);

    // Send OTP Handler
    if (btnSendOtp) {
      btnSendOtp.onclick = async () => {
        clearAlert();
        const email = (emailInput?.value || '').trim();
        const name = nameInput ? (nameInput.value || '').trim() : '';

        if (!email || !email.includes('@')) {
          showAlert('Please enter a valid email address.');
          if (emailInput) emailInput.focus();
          return;
        }

        if (name && typeof Settings !== 'undefined' && Settings.setUserShortName) {
          await Settings.setUserShortName(name);
        }

        localStorage.setItem('prayer_last_attempted_email', email);

        btnSendOtp.disabled = true;
        btnSendOtp.textContent = 'Sending OTP...';

        try {
          await Auth.requestOtp(email, name);
          UI.toast(`Verification code sent to ${email}`, 'success');
          showStep('otp');
        } catch (err) {
          console.warn('requestOtp warning:', err);
          const errMsg = err.message || 'Failed to send verification code.';
          showAlert(errMsg, 'error');
        } finally {
          btnSendOtp.disabled = false;
          btnSendOtp.textContent = 'Send OTP';
        }
      };
    }

    // Resend OTP in Step 2
    if (resendBtn) {
      resendBtn.onclick = async () => {
        const email = (emailInput?.value || '').trim() || localStorage.getItem('prayer_last_attempted_email');
        if (!email) {
          showStep('email');
          return;
        }
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        try {
          await Auth.requestOtp(email, nameInput?.value || '');
          showAlert(`A fresh verification code has been sent to <strong>${UI.escape(email)}</strong>`, 'success');
          UI.toast('Verification code resent!', 'success');
        } catch (err) {
          showAlert(err.message || 'Could not resend code', 'error');
        } finally {
          setTimeout(() => {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
          }, 3000);
        }
      };
    }

    // Verify OTP Handler
    if (btnVerifyOtp) {
      btnVerifyOtp.onclick = async () => {
        clearAlert();
        const email = (emailInput?.value || '').trim() || localStorage.getItem('prayer_last_attempted_email');
        const otp = (otpInput?.value || '').trim().replace(/\D/g, '');
        const name = nameInput ? (nameInput.value || '').trim() : '';

        if (!email) {
          showStep('email');
          return;
        }
        if (!otp || otp.length !== 4) {
          showAlert('Please enter the complete 4-digit verification code.');
          if (otpInput) otpInput.focus();
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
          this.checkOnboardingState();
        } catch (err) {
          console.warn('verifyOtp error:', err);
          showAlert(err.message || 'Invalid verification code. Please check and try again.', 'error');
        } finally {
          btnVerifyOtp.disabled = false;
          btnVerifyOtp.textContent = 'Verify & Sign In';
        }
      };
    }

    // Auto-advance / Enter key on inputs
    if (emailInput) {
      emailInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (btnSendOtp) btnSendOtp.click();
        }
      };
    }

    if (otpInput) {
      otpInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (btnVerifyOtp) btnVerifyOtp.click();
        }
      };
      // Auto verify when 4 digits are typed
      otpInput.oninput = (e) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        e.target.value = cleaned;
        if (cleaned.length === 4) {
          if (btnVerifyOtp) btnVerifyOtp.click();
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
        this.checkOnboardingState();
      };
    }
  },

  openManualModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-manual');
    if (modal) {
      modal.classList.add('active');
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

    const isEdit = existingPrayer && existingPrayer.prayer_id;
    if (isEdit) {
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
      titleInput.value = (existingPrayer && existingPrayer.title) || '';
      descInput.value = (existingPrayer && existingPrayer.description) || '';
      categorySelect.value = (existingPrayer && existingPrayer.category) || 'Personal Life';
      personInput.value = (existingPrayer && existingPrayer.person_name) || '';
      prioritySelect.value = (existingPrayer && existingPrayer.priority) || 'Medium';
      reminderSelect.value = (existingPrayer && existingPrayer.reminder_preference) || 'both';

      if (existingPrayer && (existingPrayer.category !== 'Personal Life' || existingPrayer.priority !== 'Medium')) {
        if (advancedContainer) advancedContainer.style.display = 'block';
        if (toggleAdvBtn) toggleAdvBtn.classList.add('expanded');
      }
    }

    modal.classList.add('active');
    if (titleInput) {
      titleInput.focus();
      titleInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveBtn.click();
        }
      };
    }

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
        if (isEdit) {
          await Prayers.update(existingPrayer.prayer_id, payload);
        } else {
          await Prayers.create(payload);
        }
        modal.classList.remove('active');
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    };
  },

  // Share with Prayer Companions Modal
  openShareCompanionModal(prayer, existingRequestId = null) {
    const modal = document.getElementById('modal-share-companion');
    if (!modal) return;

    const modalTitle = modal.querySelector('.modal-title');
    const titleInput = document.getElementById('share-form-title');
    const descInput = document.getElementById('share-form-desc');
    const nameInput = document.getElementById('share-form-name');
    const anonCheck = document.getElementById('share-form-anon');
    const allowEncCheck = document.getElementById('share-form-allow-enc');
    const submitBtn = document.getElementById('btn-confirm-share-companion');

    if (modalTitle) {
      modalTitle.textContent = existingRequestId ? 'Edit Community Prayer Request' : 'Share with Prayer Companions';
    }

    titleInput.value = prayer.title || prayer.prayer_title || '';
    descInput.value = prayer.description || prayer.shared_description || '';
    nameInput.value = prayer.display_name || '';
    anonCheck.checked = Boolean(prayer.is_anonymous);
    allowEncCheck.checked = prayer.allow_encouragement !== undefined ? Boolean(prayer.allow_encouragement) : true;
    submitBtn.textContent = existingRequestId ? 'Save Changes' : 'Ask Companions to Pray';

    modal.classList.add('active');

    submitBtn.onclick = async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        if (existingRequestId) {
          await Community.updateRequest(existingRequestId, {
            prayer_title: titleInput.value,
            shared_description: descInput.value,
            display_name: nameInput.value,
            is_anonymous: anonCheck.checked,
            category: prayer.category || 'General',
            allow_encouragement: allowEncCheck.checked
          });
          UI.toast('Community prayer request updated!', 'success');
        } else {
          await Community.shareRequest({
            prayer_title: titleInput.value,
            shared_description: descInput.value,
            display_name: nameInput.value,
            is_anonymous: anonCheck.checked,
            category: prayer.category || 'General',
            allow_encouragement: allowEncCheck.checked
          });
          UI.toast('Prayer request shared! Other companions will pray for you.', 'success');
        }

        modal.classList.remove('active');
        if (this.currentView === 'community') {
          await this.renderCommunityView();
        }
      } catch (err) {
        UI.toast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = existingRequestId ? 'Save Changes' : 'Ask Companions to Pray';
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
            <div style="background: var(--bg-hover); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 8px; font-size: 13px;">
              <p style="margin: 0 0 4px 0; color: var(--text-primary);">${UI.escape(m.message_text)}</p>
              <span style="font-size: 11px; color: var(--text-muted);">${new Date(m.created_at).toLocaleDateString()}</span>
            </div>
          `).join('');
        }
      } catch (e) {
        listContainer.innerHTML = '<div style="color: var(--danger);">Could not load messages.</div>';
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

    const localToday = typeof Tracking !== 'undefined' ? Tracking.getLocalDateString() : new Date().toISOString().split('T')[0];

    if (existingRecord) {
      testimonyInput.value = existingRecord.testimony || '';
      dateInput.value = existingRecord.answered_date || localToday;
    } else {
      testimonyInput.value = '';
      dateInput.value = localToday;
    }

    modal.classList.add('active');

    saveBtn.onclick = async () => {
      try {
        if (existingRecord) {
          await Answered.updateTestimony(existingRecord.answered_id, testimonyInput.value);
        } else {
          await Answered.recordAnswer(prayerId, testimonyInput.value, dateInput.value);
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
    const localToday = typeof Tracking !== 'undefined' ? Tracking.getLocalDateString() : new Date().toISOString().split('T')[0];

    if (existingEntry) {
      modalTitle.textContent = 'Edit Thanksgiving Entry';
      titleInput.value = existingEntry.title || '';
      descInput.value = existingEntry.description || '';
      categoryInput.value = existingEntry.category || 'General Praise';
      dateInput.value = existingEntry.entry_date || localToday;
    } else {
      modalTitle.textContent = 'New Thanksgiving Entry';
      titleInput.value = '';
      descInput.value = '';
      categoryInput.value = 'General Praise';
      dateInput.value = localToday;
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
        } else {
          await Thanksgiving.create(payload);
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
        .then(reg => {
          console.log('ServiceWorker registered:', reg.scope);
          if (reg) reg.update();
        })
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
window.openPrayerModal = (existingPrayer) => App.openPrayerModal(existingPrayer);
window.openThanksgivingModal = (existingTg) => App.openThanksgivingModal(existingTg);
window.closeAllModals = () => App.closeAllModals();
