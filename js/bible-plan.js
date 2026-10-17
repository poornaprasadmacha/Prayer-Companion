/**
 * Prayer Companion - 365-Day Bible Reading Plan Module
 * 
 * Features:
 * - Plan 1: Canonical / Chronological (OT then NT from provided PDF)
 * - Plan 2: Morning NT + Night OT (Balanced daily dual walk)
 * - Sunday Worship & Praise Scripture spotlight on every 7th day
 * - Day 1 to Day 365 numbering (no calendar guilt)
 * - Progressive folding: Completed days fold into a collapsible drawer; active day unfolds
 * - Beautiful Daily Prayer Wisdom Box connecting Scripture to prayer
 * - Home Screen Widget (STRICT: Only displayed if a plan is chosen)
 * - Read Again button (STRICT: Never displayed until all 365 days are completed)
 * - 100% Offline-capable & auto-syncing
 * - Strictly NO emojis, strictly NO box-shadows (minimal, executive design)
 */

const BiblePlan = {
  STORAGE_KEY: 'PRAYERLY_BIBLE_PLAN_STATE_V1',

  getState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            activePlanId: parsed.activePlanId || null,
            completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
            startedAt: parsed.startedAt || null,
            lastCompletedAt: parsed.lastCompletedAt || null,
            folderExpanded: !!parsed.folderExpanded,
            historyRound: parsed.historyRound || 1
          };
        }
      }
    } catch (e) {
      console.warn('Error reading Bible Plan state:', e);
    }

    return {
      activePlanId: null,
      completedDays: [],
      startedAt: null,
      lastCompletedAt: null,
      folderExpanded: false,
      historyRound: 1
    };
  },

  async saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      // Save to AppDB settings store if available
      if (typeof AppDB !== 'undefined' && AppDB.put) {
        AppDB.put('settings', { key: 'bible_plan_state', value: state }).catch(() => {});
      }
      // Broadcast change event
      window.dispatchEvent(new CustomEvent('bible-plan-changed', { detail: state }));
    } catch (e) {
      console.warn('Error saving Bible Plan state:', e);
    }
  },

  getActivePlan() {
    const state = this.getState();
    if (!state.activePlanId || typeof BiblePlanData === 'undefined') return null;
    return BiblePlanData.plans.find(p => p.id === state.activePlanId) || null;
  },

  getCurrentDayNumber() {
    const state = this.getState();
    if (state.completedDays.length === 0) return 1;
    // Find lowest uncompleted day from 1 to 365
    for (let d = 1; d <= 365; d++) {
      if (!state.completedDays.includes(d)) return d;
    }
    return 365; // All 365 completed
  },

  isAllCompleted() {
    const state = this.getState();
    return state.completedDays.length >= 365;
  },

  async selectPlan(planId) {
    const state = this.getState();
    state.activePlanId = planId;
    if (!state.startedAt) {
      state.startedAt = new Date().toISOString();
    }
    await this.saveState(state);
    if (typeof UI !== 'undefined' && UI.toast) {
      const plan = BiblePlanData.plans.find(p => p.id === planId);
      UI.toast(`Selected: ${plan ? plan.name : 'Bible Reading Plan'}`, 'success');
    }
    this.render();
    this.renderHomeWidget();
  },

  async switchPlanPrompt() {
    const state = this.getState();
    const currentPlan = this.getActivePlan();
    const otherPlanId = (state.activePlanId === 'plan_canonical') ? 'plan_morning_night' : 'plan_canonical';
    const otherPlan = BiblePlanData.plans.find(p => p.id === otherPlanId);

    const proceed = confirm(
      `Switch to "${otherPlan.name}"?\n\nYour completed days (${state.completedDays.length}/365) will be preserved for the new plan schedule.`
    );
    if (proceed) {
      await this.selectPlan(otherPlanId);
    }
  },

  async toggleDay(dayNum) {
    const state = this.getState();
    const idx = state.completedDays.indexOf(dayNum);

    if (idx >= 0) {
      // Remove day
      state.completedDays.splice(idx, 1);
    } else {
      // Add day
      state.completedDays.push(dayNum);
      state.completedDays.sort((a, b) => a - b);
      state.lastCompletedAt = new Date().toISOString();
    }

    await this.saveState(state);

    if (typeof UI !== 'undefined' && UI.toast) {
      if (idx < 0) {
        if (state.completedDays.length === 365) {
          UI.toast('Congratulations! You have completed the entire Bible!', 'success');
        } else {
          UI.toast(`Day ${dayNum} marked as completed`, 'success');
        }
      } else {
        UI.toast(`Day ${dayNum} marked as uncompleted`, 'info');
      }
    }

    this.render();
    this.renderHomeWidget();
  },

  async toggleFolder() {
    const state = this.getState();
    state.folderExpanded = !state.folderExpanded;
    await this.saveState(state);
    this.render();
  },

  async readAgain() {
    const state = this.getState();
    // STRICT GUARD: Must have completed all 365 days
    if (state.completedDays.length < 365) {
      console.warn('Read Again is strictly locked until all 365 days are completed.');
      return;
    }

    const confirmed = confirm(
      'Congratulations on completing the entire Bible in 365 days!\n\nWould you like to reset your progress and begin your next round of Bible reading?'
    );

    if (confirmed) {
      state.historyRound = (state.historyRound || 1) + 1;
      state.completedDays = [];
      state.startedAt = new Date().toISOString();
      state.lastCompletedAt = null;
      state.folderExpanded = false;
      await this.saveState(state);

      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast(`Round ${state.historyRound} started! Keep reading the Word of God.`, 'success');
      }

      this.render();
      this.renderHomeWidget();
    }
  },

  // =========================================================================
  // VIEW RENDERER (Full view in #view-bible-plan)
  // =========================================================================

  render() {
    const container = document.getElementById('view-bible-plan');
    if (!container) return;

    const state = this.getState();
    const activePlan = this.getActivePlan();

    // 1. If NO plan is chosen yet: Render Plan Selection Screen
    if (!activePlan) {
      container.innerHTML = this.renderPlanSelectionHtml();
      return;
    }

    // 2. Plan is chosen: Render Plan Dashboard
    container.innerHTML = this.renderPlanDashboardHtml(activePlan, state);
  },

  renderPlanSelectionHtml() {
    const plans = (typeof BiblePlanData !== 'undefined' && BiblePlanData.plans) ? BiblePlanData.plans : [];

    return `
      <div class="bible-plan-container">
        
        <!-- Header -->
        <div class="bible-plan-top-bar">
          <button class="bible-plan-back-btn" onclick="App.switchTab('dashboard')" aria-label="Back to Dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Home</span>
          </button>
          <div class="bible-plan-header-title">365-Day Bible Reading</div>
        </div>

        <!-- Hero Intro Card -->
        <div class="bible-plan-intro-card">
          <div class="bible-plan-intro-badge">Personal Devotional Journey</div>
          <h2 class="bible-plan-intro-title">Read the Complete Bible in One Year</h2>
          <p class="bible-plan-intro-desc">
            Choose a reading schedule designed for your spiritual rhythm. No calendar dates or guilt — simply read Day by Day at your own pace, with dedicated Sunday worship scriptures and daily prayer wisdom.
          </p>
        </div>

        <!-- Plan Selection Options Grid -->
        <div class="bible-plan-cards-grid">
          ${plans.map(p => `
            <div class="bible-plan-choice-card">
              <div class="bible-plan-choice-header">
                <span class="bible-plan-pill">${p.badge}</span>
                <span class="bible-plan-pill-sub">${p.totalDays} Days</span>
              </div>
              <h3 class="bible-plan-choice-name">${p.name}</h3>
              <p class="bible-plan-choice-desc">${p.description}</p>
              
              <div class="bible-plan-features-list">
                <div class="bible-plan-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--primary);">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Numbered Day 1 to Day 365 (progress without calendar pressure)</span>
                </div>
                <div class="bible-plan-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--primary);">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Dedicated Sunday Worship & Praise scripture on every 7th day</span>
                </div>
                <div class="bible-plan-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--primary);">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Daily prayer wisdom box connecting Scripture to prayer</span>
                </div>
                <div class="bible-plan-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--primary);">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Works 100% offline with automatic cloud backup</span>
                </div>
              </div>

              <button class="btn btn-primary bible-plan-select-btn" onclick="BiblePlan.selectPlan('${p.id}')">
                Select This Reading Plan
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  renderPlanDashboardHtml(plan, state) {
    const currentDayNum = this.getCurrentDayNumber();
    const currentDayData = plan.days.find(d => d.day === currentDayNum) || plan.days[0];
    const completedCount = state.completedDays.length;
    const percent = Math.round((completedCount / 365) * 100);
    const isCompletedAll = (completedCount >= 365);
    const completedDaysSet = new Set(state.completedDays);

    // Completed days for folded drawer
    const completedDaysList = plan.days.filter(d => completedDaysSet.has(d.day));

    // Upcoming days preview (next 4 uncompleted days after currentDayNum)
    const upcomingDaysList = plan.days
      .filter(d => d.day > currentDayNum && !completedDaysSet.has(d.day))
      .slice(0, 4);

    return `
      <div class="bible-plan-container">
        
        <!-- Header -->
        <div class="bible-plan-top-bar">
          <button class="bible-plan-back-btn" onclick="App.switchTab('dashboard')" aria-label="Back to Dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Home</span>
          </button>
          <div class="bible-plan-header-title">365-Day Bible Reading</div>
          <button class="bible-plan-switch-btn" onclick="BiblePlan.switchPlanPrompt()" title="Switch Reading Plan">
            <span>Change Plan</span>
          </button>
        </div>

        <!-- Plan Progress Banner -->
        <div class="bible-plan-progress-card">
          <div class="bible-plan-progress-header">
            <div>
              <span class="bible-plan-pill">${plan.badge}</span>
              <h2 class="bible-plan-active-title">${plan.name}</h2>
              ${state.historyRound > 1 ? `<span class="bible-plan-round-badge">Round ${state.historyRound}</span>` : ''}
            </div>
            <div class="bible-plan-progress-stat">
              <span class="bible-plan-stat-num">${completedCount}</span>
              <span class="bible-plan-stat-denom">/ 365</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="bible-plan-bar-wrapper">
            <div class="bible-plan-bar-fill" style="width: ${percent}%;"></div>
          </div>
          <div class="bible-plan-bar-labels">
            <span>${percent}% completed</span>
            <span>${365 - completedCount} days remaining</span>
          </div>
        </div>

        <!-- CELEBRATION & READ AGAIN (STRICTLY ONLY WHEN 365/365 ARE COMPLETED) -->
        ${isCompletedAll ? `
          <div class="bible-plan-completed-celebration-card">
            <div class="bible-plan-celebration-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: #16A34A; margin-bottom: 8px;">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="9 12 12 15 16 10"/>
              </svg>
              <h3 class="bible-plan-celebration-title">Complete Bible Reading Finished!</h3>
            </div>
            <p class="bible-plan-celebration-desc">
              "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105<br><br>
              You have faithfully read through all 365 days of the Holy Bible. May the Scriptures continue to dwell richly within your heart, guiding every prayer and step of your life.
            </p>
            <div class="bible-plan-celebration-actions">
              <!-- STRICT REQUIREMENT: Only shown when whole Bible is completed -->
              <button class="btn btn-primary bible-plan-read-again-btn" onclick="BiblePlan.readAgain()">
                Read Again (Start New Round)
              </button>
            </div>
          </div>
        ` : ''}

        <!-- ACTIVE DAY CARD (UNFOLDED) -->
        ${!isCompletedAll ? `
          <div class="bible-plan-active-day-card">
            <div class="bible-plan-day-top-row">
              <div class="bible-plan-day-badge-col">
                <span class="bible-plan-day-number-badge">Day ${currentDayData.day}</span>
                <span class="bible-plan-day-category">${currentDayData.category}</span>
              </div>
              <div class="bible-plan-day-action">
                <button class="btn btn-primary bible-plan-mark-btn" onclick="BiblePlan.toggleDay(${currentDayData.day})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 6px;">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Mark Day ${currentDayData.day} Completed</span>
                </button>
              </div>
            </div>

            <!-- Scripture References Box -->
            <div class="bible-plan-reading-box">
              <span class="bible-plan-reading-label">Today's Scripture Reading</span>
              
              ${currentDayData.morning ? `
                <div class="bible-plan-dual-reading-row">
                  <div class="bible-plan-sub-reading-card">
                    <span class="bible-plan-sub-tag">Morning • New Testament</span>
                    <strong class="bible-plan-sub-passage">${currentDayData.morning}</strong>
                  </div>
                  <div class="bible-plan-sub-reading-card">
                    <span class="bible-plan-sub-tag">Night • Old Testament</span>
                    <strong class="bible-plan-sub-passage">${currentDayData.night}</strong>
                  </div>
                </div>
              ` : `
                <div class="bible-plan-canonical-reading-row">
                  <strong class="bible-plan-main-passage">${currentDayData.reading}</strong>
                </div>
              `}
            </div>

            <!-- SUNDAY WORSHIP & PRAISE SPOTLIGHT (IF SUNDAY) -->
            ${currentDayData.isSunday && currentDayData.worshipReading ? `
              <div class="bible-plan-worship-spotlight-card">
                <div class="bible-plan-worship-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: var(--primary);">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span class="bible-plan-worship-label">Lord's Day Worship & Praise Reading</span>
                </div>
                <div class="bible-plan-worship-content">
                  <strong class="bible-plan-worship-passage">${currentDayData.worshipReading}</strong>
                  <div class="bible-plan-worship-theme">Theme: ${currentDayData.worshipTheme}</div>
                  <p class="bible-plan-worship-verse">"${currentDayData.worshipVerse}"</p>
                </div>
              </div>
            ` : ''}

            <!-- DAILY PRAYER WISDOM BOX -->
            <div class="bible-plan-prayer-wisdom-card">
              <div class="bible-plan-wisdom-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: var(--navy-900);">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span class="bible-plan-wisdom-title">Daily Prayer Wisdom</span>
              </div>
              <p class="bible-plan-wisdom-text">"${currentDayData.prayerWisdom.text}"</p>
              <div class="bible-plan-wisdom-theme">— ${currentDayData.prayerWisdom.theme}</div>
            </div>

          </div>
        ` : ''}

        <!-- COMPLETED DAYS FOLDED DRAWER (ACCORDION) -->
        ${completedCount > 0 ? `
          <div class="bible-plan-folded-drawer">
            <button class="bible-plan-folder-toggle" onclick="BiblePlan.toggleFolder()">
              <div class="bible-plan-folder-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span class="bible-plan-folder-title">Completed Days (${completedCount} of 365)</span>
              </div>
              <div class="bible-plan-folder-right">
                <span class="bible-plan-folder-hint">${state.folderExpanded ? 'Fold back' : 'View folded'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bible-plan-folder-chevron ${state.folderExpanded ? 'rotated' : ''}" style="width: 16px; height: 16px;">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </button>

            ${state.folderExpanded ? `
              <div class="bible-plan-folded-content">
                <div class="bible-plan-history-table">
                  ${completedDaysList.map(d => `
                    <div class="bible-plan-history-row">
                      <div class="bible-plan-history-info">
                        <span class="bible-plan-history-day">Day ${d.day}</span>
                        <span class="bible-plan-history-reading">${d.reading}</span>
                        ${d.isSunday ? `<span class="bible-plan-history-sunday">Worship: ${d.worshipReading}</span>` : ''}
                      </div>
                      <button class="bible-plan-history-uncheck-btn" onclick="BiblePlan.toggleDay(${d.day})" title="Mark as unread">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #16A34A;">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Completed</span>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- UPCOMING DAYS PREVIEW -->
        ${upcomingDaysList.length > 0 ? `
          <div class="bible-plan-upcoming-card">
            <div class="bible-plan-upcoming-header">
              <span class="bible-plan-upcoming-title">Upcoming Scripture Portions</span>
              <span class="bible-plan-upcoming-sub">Next readings ahead</span>
            </div>
            <div class="bible-plan-upcoming-list">
              ${upcomingDaysList.map(d => `
                <div class="bible-plan-upcoming-row">
                  <div class="bible-plan-upcoming-left">
                    <span class="bible-plan-upcoming-day">Day ${d.day}</span>
                    <span class="bible-plan-upcoming-passage">${d.reading}</span>
                  </div>
                  <span class="bible-plan-upcoming-cat">${d.category}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  // =========================================================================
  // HOME SCREEN / DASHBOARD INTEGRATION
  // STRICT RULE: If the user has NOT chosen a plan, DO NOT display it!
  // =========================================================================

  renderHomeWidget() {
    const cardEl = document.getElementById('home-bible-reading-card');
    if (!cardEl) return;

    const state = this.getState();
    const activePlan = this.getActivePlan();

    // STRICT CHECK: If user has not chosen a plan, do NOT display on Home screen
    if (!activePlan || !state.activePlanId) {
      cardEl.style.display = 'none';
      cardEl.innerHTML = '';
      return;
    }

    const currentDayNum = this.getCurrentDayNumber();
    const currentDayData = activePlan.days.find(d => d.day === currentDayNum) || activePlan.days[0];
    const isCompletedAll = (state.completedDays.length >= 365);
    const percent = Math.round((state.completedDays.length / 365) * 100);

    cardEl.style.display = 'block';

    if (isCompletedAll) {
      cardEl.innerHTML = `
        <div class="home-bible-widget-card">
          <div class="home-bible-widget-header">
            <div class="home-bible-widget-brand">
              <span class="home-bible-tag">Bible Reading</span>
              <strong class="home-bible-plan-name">${activePlan.name}</strong>
            </div>
            <span class="home-bible-day-pill">365 / 365 Completed</span>
          </div>
          <p class="home-bible-desc" style="margin: 8px 0;">
            Congratulations! You have completed all 365 days of the Bible. Open your reading plan to view your full journey.
          </p>
          <div class="home-bible-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.switchTab('bible-plan')">
              Open Reading Plan &rarr;
            </button>
          </div>
        </div>
      `;
      return;
    }

    cardEl.innerHTML = `
      <div class="home-bible-widget-card">
        <div class="home-bible-widget-header">
          <div class="home-bible-widget-brand">
            <span class="home-bible-tag">Daily Bible Reading</span>
            <strong class="home-bible-plan-name">${activePlan.shortName || activePlan.name}</strong>
          </div>
          <span class="home-bible-day-pill">Day ${currentDayData.day} of 365</span>
        </div>

        <div class="home-bible-reading-content">
          <div class="home-bible-passage-row">
            ${currentDayData.morning ? `
              <div class="home-bible-dual-row">
                <div class="home-bible-dual-item">
                  <span class="home-bible-mini-label">Morning</span>
                  <strong class="home-bible-mini-text">${currentDayData.morning}</strong>
                </div>
                <div class="home-bible-dual-item">
                  <span class="home-bible-mini-label">Night</span>
                  <strong class="home-bible-mini-text">${currentDayData.night}</strong>
                </div>
              </div>
            ` : `
              <div class="home-bible-canonical-item">
                <span class="home-bible-mini-label">${currentDayData.category}</span>
                <strong class="home-bible-main-text">${currentDayData.reading}</strong>
              </div>
            `}
          </div>

          ${currentDayData.isSunday && currentDayData.worshipReading ? `
            <div class="home-bible-sunday-spotlight">
              <span class="home-bible-sunday-tag">Sunday Worship:</span>
              <span class="home-bible-sunday-passage">${currentDayData.worshipReading}</span>
            </div>
          ` : ''}

          <div class="home-bible-wisdom-snippet">
            <span class="home-bible-wisdom-label">Prayer Wisdom:</span>
            <span class="home-bible-wisdom-quote">"${currentDayData.prayerWisdom.text.substring(0, 110)}..."</span>
          </div>
        </div>

        <div class="home-bible-actions">
          <button class="btn btn-primary btn-sm home-bible-mark-btn" onclick="BiblePlan.toggleDay(${currentDayData.day})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 5px;">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Mark Day ${currentDayData.day} Read</span>
          </button>
          <button class="btn btn-secondary btn-sm home-bible-open-btn" onclick="App.switchTab('bible-plan')">
            Open Plan &rarr;
          </button>
        </div>
      </div>
    `;
  },

  init() {
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.render();
        this.renderHomeWidget();
      }
    });

    // Initial render of home widget
    this.renderHomeWidget();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BiblePlan;
}
