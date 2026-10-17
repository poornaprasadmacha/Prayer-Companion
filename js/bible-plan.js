/**
 * Prayer Companion - 365-Day Bible Reading Plan Module
 * 
 * Clean, Professional, Minimalist & Dignified:
 * - 2 Plans: "OT followed by NT" and "Morning NT + Night OT"
 * - Real-life Sunday check (Worship reading displayed on actual Sundays)
 * - Numbered Day 1 to Day 365
 * - Progressive folding: Completed days fold into collapsible drawer; next day unfolds
 * - Quiet Daily Prayer Wisdom Box
 * - Smooth instant plan switching (zero broken prompts)
 * - Read Again strictly locked until all 365 days are completed
 * - Strictly NO tags/pills, NO emojis, NO background color tints, NO rounded corners
 * - 100% Offline-first & synced
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
      if (typeof AppDB !== 'undefined' && AppDB.put) {
        AppDB.put('settings', { key: 'bible_plan_state', value: state }).catch(() => {});
      }
      window.dispatchEvent(new CustomEvent('bible-plan-changed', { detail: state }));
    } catch (e) {
      console.warn('Error saving Bible Plan state:', e);
    }
  },

  getActivePlan() {
    const state = this.getState();
    if (!state.activePlanId || typeof BiblePlanData === 'undefined') return null;
    return BiblePlanData.plans.find(p => p.id === state.activePlanId) || BiblePlanData.plans[0];
  },

  getCurrentDayNumber() {
    const state = this.getState();
    if (state.completedDays.length === 0) return 1;
    for (let d = 1; d <= 365; d++) {
      if (!state.completedDays.includes(d)) return d;
    }
    return 365;
  },

  isAllCompleted() {
    const state = this.getState();
    return state.completedDays.length >= 365;
  },

  isTodaySunday() {
    return new Date().getDay() === 0;
  },

  getSundayWorshipReading() {
    if (!this.isTodaySunday()) return null;
    if (typeof BiblePlanData === 'undefined' || !BiblePlanData.sundayWorship || BiblePlanData.sundayWorship.length === 0) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(dayOfYear / 7) % BiblePlanData.sundayWorship.length;
    return BiblePlanData.sundayWorship[weekIdx];
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
      UI.toast(`Switched to: ${plan ? (plan.shortName || plan.name) : 'Bible Plan'}`, 'info');
    }
    this.render();
    this.renderHomeWidget();
  },

  async toggleDay(dayNum) {
    const state = this.getState();
    const idx = state.completedDays.indexOf(dayNum);

    if (idx >= 0) {
      state.completedDays.splice(idx, 1);
    } else {
      state.completedDays.push(dayNum);
      state.completedDays.sort((a, b) => a - b);
      state.lastCompletedAt = new Date().toISOString();
    }

    await this.saveState(state);

    if (typeof UI !== 'undefined' && UI.toast) {
      if (idx < 0) {
        if (state.completedDays.length === 365) {
          UI.toast('All 365 days completed! Glory to God.', 'success');
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

    state.historyRound = (state.historyRound || 1) + 1;
    state.completedDays = [];
    state.startedAt = new Date().toISOString();
    state.lastCompletedAt = null;
    state.folderExpanded = false;
    await this.saveState(state);

    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast(`Round ${state.historyRound} started.`, 'success');
    }

    this.render();
    this.renderHomeWidget();
  },

  // =========================================================================
  // MAIN VIEW RENDERER
  // =========================================================================

  render() {
    const container = document.getElementById('view-bible-plan');
    if (!container) return;

    const state = this.getState();
    const activePlan = this.getActivePlan();

    // 1. If NO plan is chosen yet: Render Clean Plan Selection Screen
    if (!state.activePlanId || !activePlan) {
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
        <!-- Top Bar -->
        <div class="bible-plan-top-bar">
          <button class="bible-plan-back-btn" onclick="App.switchTab('dashboard')" aria-label="Back to Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Home</span>
          </button>
          <div class="bible-plan-header-title">Bible Reading Plan</div>
          <div style="width: 60px;"></div>
        </div>

        <!-- Minimal Subtitle -->
        <p class="bible-plan-sub-lead">Select your reading plan to begin.</p>

        <!-- Two Clean Choice Cards -->
        <div class="bible-plan-cards-grid">
          ${plans.map(p => `
            <div class="bible-plan-choice-card">
              <h3 class="bible-plan-choice-name">${p.shortName || p.name}</h3>
              <p class="bible-plan-choice-desc">
                ${p.id === 'plan_canonical' 
                  ? 'Genesis to Revelation with Psalms and Proverbs.' 
                  : 'Morning New Testament, Evening Old Testament.'}
              </p>
              <button class="btn btn-primary bible-plan-select-btn" onclick="BiblePlan.selectPlan('${p.id}')">
                Select Plan
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
    const isCompletedAll = (completedCount >= 365);
    const completedDaysSet = new Set(state.completedDays);
    const sundayWorship = this.getSundayWorshipReading();

    const completedDaysList = plan.days.filter(d => completedDaysSet.has(d.day));
    const upcomingDaysList = plan.days
      .filter(d => d.day > currentDayNum && !completedDaysSet.has(d.day))
      .slice(0, 3);

    return `
      <div class="bible-plan-container">
        
        <!-- Top Bar -->
        <div class="bible-plan-top-bar">
          <button class="bible-plan-back-btn" onclick="App.switchTab('dashboard')" aria-label="Back to Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Home</span>
          </button>
          <div class="bible-plan-header-title">Bible Reading</div>
          <div style="width: 60px;"></div>
        </div>

        <!-- Plan Switcher Tabs (Instant 1-Click Switching) -->
        <div class="bible-plan-tab-switch">
          <button class="bible-plan-tab-item ${state.activePlanId === 'plan_canonical' ? 'active' : ''}" onclick="BiblePlan.selectPlan('plan_canonical')">
            OT then NT
          </button>
          <button class="bible-plan-tab-item ${state.activePlanId === 'plan_morning_night' ? 'active' : ''}" onclick="BiblePlan.selectPlan('plan_morning_night')">
            Morning NT + Night OT
          </button>
        </div>

        <!-- Clean Progress Header -->
        <div class="bible-plan-progress-row">
          <div>
            <span class="bible-plan-progress-main">Day ${currentDayNum} of 365</span>
            ${state.historyRound > 1 ? `<span class="bible-plan-round-text">Round ${state.historyRound}</span>` : ''}
          </div>
          <div class="bible-plan-progress-counter">
            ${completedCount} of 365 completed
          </div>
        </div>

        <!-- Minimal 3px Progress Line -->
        <div class="bible-plan-progress-line">
          <div class="bible-plan-progress-fill" style="width: ${(completedCount / 365) * 100}%;"></div>
        </div>

        <!-- CELEBRATION & READ AGAIN (STRICTLY ONLY WHEN 365/365 ARE COMPLETED) -->
        ${isCompletedAll ? `
          <div class="bible-plan-completed-celebration-card">
            <h3 class="bible-plan-celebration-title">Complete Bible Reading Finished</h3>
            <p class="bible-plan-celebration-desc">
              "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105<br><br>
              You have read through the entire Bible.
            </p>
            <button class="btn btn-primary bible-plan-read-again-btn" onclick="BiblePlan.readAgain()">
              Read Again
            </button>
          </div>
        ` : ''}

        <!-- ACTIVE DAY CARD (UNFOLDED) -->
        ${!isCompletedAll ? `
          <div class="bible-plan-active-day-card">
            <div class="bible-plan-day-top-row">
              <span class="bible-plan-day-title">Day ${currentDayData.day}</span>
              <button class="btn btn-primary btn-sm bible-plan-mark-btn" onclick="BiblePlan.toggleDay(${currentDayData.day})">
                Mark as Read
              </button>
            </div>

            <!-- Scripture Portion -->
            <div class="bible-plan-reading-box">
              ${currentDayData.morning ? `
                <div class="bible-plan-dual-box">
                  <div class="bible-plan-dual-col">
                    <span class="bible-plan-reading-lead">Morning (NT)</span>
                    <strong class="bible-plan-passage-text">${currentDayData.morning}</strong>
                  </div>
                  <div class="bible-plan-dual-col">
                    <span class="bible-plan-reading-lead">Night (OT)</span>
                    <strong class="bible-plan-passage-text">${currentDayData.night}</strong>
                  </div>
                </div>
              ` : `
                <strong class="bible-plan-passage-text">${currentDayData.reading}</strong>
              `}
            </div>

            <!-- SUNDAY WORSHIP (ONLY DISPLAYED ON ACTUAL SUNDAYS!) -->
            ${sundayWorship ? `
              <div class="bible-plan-sunday-worship-card">
                <span class="bible-plan-sunday-lead">Sunday Worship Reading</span>
                <strong class="bible-plan-sunday-passage">${sundayWorship.passage}</strong>
                <p class="bible-plan-sunday-verse">"${sundayWorship.verse}"</p>
              </div>
            ` : ''}

            <!-- DAILY PRAYER WISDOM BOX -->
            <div class="bible-plan-prayer-box">
              <p class="bible-plan-prayer-text">"${currentDayData.prayerWisdom.text}"</p>
            </div>
          </div>
        ` : ''}

        <!-- COMPLETED DAYS FOLDED DRAWER -->
        ${completedCount > 0 ? `
          <div class="bible-plan-folded-drawer">
            <button class="bible-plan-folder-toggle" onclick="BiblePlan.toggleFolder()">
              <span>Completed (${completedCount})</span>
              <span class="bible-plan-folder-hint">${state.folderExpanded ? 'Fold back' : 'View'}</span>
            </button>

            ${state.folderExpanded ? `
              <div class="bible-plan-folded-content">
                ${completedDaysList.map(d => `
                  <div class="bible-plan-history-row">
                    <div>
                      <strong>Day ${d.day}</strong>: ${d.reading}
                    </div>
                    <button class="bible-plan-uncheck-btn" onclick="BiblePlan.toggleDay(${d.day})" title="Mark unread">
                      Undo
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- UPCOMING PREVIEW -->
        ${upcomingDaysList.length > 0 ? `
          <div class="bible-plan-upcoming-card">
            <div class="bible-plan-upcoming-title">Upcoming</div>
            ${upcomingDaysList.map(d => `
              <div class="bible-plan-upcoming-row">
                <span>Day ${d.day}</span>
                <strong>${d.reading}</strong>
              </div>
            `).join('')}
          </div>
        ` : ''}

      </div>
    `;
  },

  // =========================================================================
  // HOME SCREEN WIDGET
  // STRICT: Only visible if a plan is active. No background colors.
  // =========================================================================

  renderHomeWidget() {
    const cardEl = document.getElementById('home-bible-reading-card');
    if (!cardEl) return;

    const state = this.getState();
    const activePlan = this.getActivePlan();

    // STRICT CHECK: If user has not chosen a plan, hide completely
    if (!activePlan || !state.activePlanId) {
      cardEl.style.display = 'none';
      cardEl.innerHTML = '';
      return;
    }

    const currentDayNum = this.getCurrentDayNumber();
    const currentDayData = activePlan.days.find(d => d.day === currentDayNum) || activePlan.days[0];
    const isCompletedAll = (state.completedDays.length >= 365);
    const sundayWorship = this.getSundayWorshipReading();

    cardEl.style.display = 'block';

    if (isCompletedAll) {
      cardEl.innerHTML = `
        <div class="home-bible-card">
          <div class="home-bible-header">
            <span class="home-bible-title">Bible Reading Completed</span>
            <span class="home-bible-plan-label">365 / 365</span>
          </div>
          <p class="home-bible-desc">You have completed all 365 days of the Bible.</p>
          <div class="home-bible-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.switchTab('bible-plan')">
              Open Plan &rarr;
            </button>
          </div>
        </div>
      `;
      return;
    }

    const readingText = currentDayData.morning 
      ? `Morning: ${currentDayData.morning} &bull; Night: ${currentDayData.night}` 
      : currentDayData.reading;

    cardEl.innerHTML = `
      <div class="home-bible-card">
        <div class="home-bible-header">
          <span class="home-bible-title">Bible Reading &bull; Day ${currentDayData.day}</span>
          <span class="home-bible-plan-label">${activePlan.shortName || activePlan.name}</span>
        </div>

        <div class="home-bible-reading-row">
          <strong class="home-bible-passage">${readingText}</strong>
        </div>

        ${sundayWorship ? `
          <div class="home-bible-sunday-row">
            <span class="home-bible-sunday-badge">Sunday Worship:</span> <strong>${sundayWorship.passage}</strong>
          </div>
        ` : ''}

        <div class="home-bible-prayer-row">
          "${currentDayData.prayerWisdom.text}"
        </div>

        <div class="home-bible-actions">
          <button class="btn btn-primary btn-sm" onclick="BiblePlan.toggleDay(${currentDayData.day})">
            Mark as Read
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.switchTab('bible-plan')">
            Open Plan &rarr;
          </button>
        </div>
      </div>
    `;
  },

  init() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.render();
        this.renderHomeWidget();
      }
    });

    this.renderHomeWidget();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BiblePlan;
}
