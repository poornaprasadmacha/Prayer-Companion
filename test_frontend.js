/**
 * Automated Verification of Frontend Files and DOM Elements
 */

const fs = require('fs');
const assert = require('assert');

console.log('Verifying frontend files and DOM binding integrity...');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const scripts = [
  'css/styles.css',
  'manifest.json',
  'service-worker.js',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/Prayerly.svg',
  'assets/Prayerly.png',
  'assets/daily-devotional.jpg',
  'assets/no-active-prayers.png',
  'assets/no-active-prayers-dark.png',
  'assets/answered-prayers.png',
  'assets/pray-for-others.png',
  'assets/thanksgiving.png',
  'assets/onboarding-step1.svg',
  'assets/onboarding-step2.svg',
  'assets/onboarding-step3.svg',
  'assets/onboarding-step4.svg',
  'assets/stories/story-hannah.svg',
  'assets/stories/story-elijah.svg',
  'assets/stories/story-daniel.svg',
  'assets/stories/story-gethsemane.svg',
  'assets/stories/story-nehemiah.svg',
  'assets/stories/story-paul-silas.svg',
  'assets/stories/story-solomon.svg',
  'assets/stories/story-hezekiah.svg',
  'js/icons.js',
  'js/content.js',
  'js/stories.js',
  'js/voice.js',
  'js/db.js',
  'js/auth.js',
  'js/sync.js',
  'js/tracking.js',
  'js/prayers.js',
  'js/community.js',
  'js/answered.js',
  'js/thanksgiving.js',
  'js/admin.js',
  'js/settings.js',
  'js/notifications.js',
  'js/bible-plan-data.js',
  'js/bible-plan.js',
  'js/app.js'
];

scripts.forEach(file => {
  assert.ok(fs.existsSync(file), `File ${file} must exist`);
  console.log(`✓ Verified file: ${file}`);
});

const requiredIds = [
  'user-email-badge',
  'sync-status-indicator',
  'pwa-install-banner',
  'btn-pwa-dismiss',
  'btn-pwa-install',
  'nav-admin-btn',
  'mobile-nav-admin-btn',
  // Dashboard
  'view-dashboard',
  'dashboard-greeting',
  'dashboard-date',
  'btn-copy-verse',
  'daily-verse-text',
  'daily-verse-ref',
  'daily-quote-text',
  'daily-quote-author',
  'stat-total-active',
  'stat-prayed-today',
  'stat-unprayed-today',
  'stat-answered',
  'btn-quick-add',
  'dashboard-prayers-container',
  'dashboard-empty-state',
  // Prayers
  'view-prayers',
  'prayer-search-input',
  'prayer-category-filter',
  'prayers-list-container',
  'prayers-empty-state',
  // Community
  'view-community',
  'community-search-input',
  'community-category-filter',
  'community-requests-container',
  'community-empty-state',
  // Answered
  'view-answered',
  'answered-list-container',
  'answered-empty-state',
  // Thanksgiving
  'view-thanksgiving',
  'btn-add-thanksgiving',
  'thanksgiving-list-container',
  'thanksgiving-empty-state',
  // History
  'view-history',
  'history-streak-count',
  'history-calendar-chart',
  'history-date-picker',
  'history-date-prayers',
  // Admin Dashboard
  'view-admin',
  'admin-access-denied',
  'admin-content-container',
  'btn-admin-test-email',
  'admin-panel-overview',
  'adm-stat-total-users',
  'adm-stat-new-users-today',
  'adm-stat-users-7d',
  'adm-stat-active-prayers',
  'adm-stat-prayers-today',
  'adm-stat-prayed-today',
  'adm-stat-answered',
  'adm-stat-thanksgiving',
  'adm-stat-morning-reminders',
  'adm-stat-evening-reminders',
  'adm-stat-emails-sent-today',
  'adm-stat-emails-failed-today',
  'adm-stat-comm-requests',
  'adm-stat-comm-active',
  'adm-stat-comm-commitments',
  'adm-stat-comm-reports',
  'admin-panel-users',
  'btn-admin-export-users',
  'admin-user-search',
  'admin-user-status-filter',
  'admin-users-count',
  'admin-users-tbody',
  'admin-panel-prayer_stats',
  'adm-dist-active',
  'adm-dist-archived',
  'adm-dist-answered',
  'admin-categories-breakdown',
  'admin-trends-chart',
  'admin-panel-prayer_points',
  'admin-pp-email-filter',
  'admin-pp-category-filter',
  'admin-pp-status-filter',
  'admin-pp-count',
  'admin-pp-tbody',
  'admin-panel-email_reminders',
  'admin-email-status-filter',
  'admin-email-tbody',
  'admin-panel-moderation',
  'admin-moderation-list',
  'admin-panel-audit_logs',
  'admin-audit-tbody',
  // Settings
  'view-settings',
  'settings-user-email',
  'settings-auth-status',
  'btn-switch-account',
  'btn-sign-out',
  'settings-api-url',
  'btn-test-connection',
  'btn-manual-sync',
  'settings-timezone',
  'settings-morning-enabled',
  'settings-morning-time',
  'settings-evening-enabled',
  'settings-evening-time',
  'btn-save-settings',
  'btn-test-email',
  'btn-export-data',
  'btn-clear-cache',
  'btn-delete-account',
  // Modals
  'modal-auth',
  'auth-step-email',
  'auth-step-otp',
  'auth-email-input',
  'auth-error-msg',
  'btn-send-otp',
  'btn-continue-local',
  'auth-display-email',
  'auth-otp-input',
  'btn-verify-otp',
  'modal-prayer',
  'prayer-modal-title',
  'prayer-form-title',
  'prayer-form-category',
  'prayer-form-person',
  'prayer-form-priority',
  'prayer-form-desc',
  'prayer-form-reminder',
  'btn-save-prayer',
  'modal-share-companion',
  'share-form-title',
  'share-form-desc',
  'share-form-name',
  'share-form-anon',
  'share-form-allow-enc',
  'btn-confirm-share-companion',
  'modal-encouragement',
  'encouragement-messages-list',
  'encouragement-msg-input',
  'btn-send-encouragement',
  'modal-report',
  'report-reason-select',
  'btn-submit-report',
  'modal-answered',
  'answered-prayer-title',
  'answered-form-date',
  'answered-form-testimony',
  'btn-save-answered',
  'modal-thanksgiving',
  'thanksgiving-modal-title',
  'tg-form-title',
  'tg-form-category',
  'tg-form-date',
  'tg-form-desc',
  'btn-save-thanksgiving',
  // Guided Onboarding
  'modal-onboarding',
  'onboarding-step-badge',
  'btn-skip-onboarding',
  'onboarding-slide-0',
  'onboarding-slide-1',
  'onboarding-slide-2',
  'onboarding-slide-3',
  'btn-onboarding-prev',
  'btn-onboarding-next',
  'btn-onboarding-finish',
  'btn-settings-guided-tour',
  'btn-manual-guided-tour',
  // New Feature IDs: Habit Heatmap, Stories, Verse Notification, PDF Export
  'btn-export-pdf-history',
  'history-longest-streak',
  'history-total-days',
  'history-total-prayers',
  'history-heatmap-container',
  'view-stories',
  'story-search-input',
  'story-category-filter',
  'stories-grid-container',
  'stories-empty-state',
  'modal-story-reader',
  'story-reader-modal-title',
  'story-reader-hero-wrap',
  'story-reader-img',
  'story-reader-category',
  'story-reader-scripture',
  'story-reader-title',
  'story-reader-summary',
  'story-reader-content',
  'story-reader-takeaway',
  'story-reader-application',
  'btn-story-pray-now',
  'settings-verse-notify-enabled',
  'btn-test-verse-notification',
  'btn-export-pdf-settings',
  'btn-settings-read-stories',
  'printable-prayer-summary',
  // 365-Day Bible Reading Plan
  'view-bible-plan',
  'home-bible-reading-card'
];

requiredIds.forEach(id => {
  const hasId = indexHtml.includes(`id="${id}"`);
  assert.ok(hasId, `DOM Element with id="${id}" must exist in index.html`);
});

console.log(`\n✓ All ${requiredIds.length} critical DOM element IDs verified in index.html!`);

// ============================================================================
// VERIFY BIBLE READING PLAN DATA INTEGRITY
// ============================================================================
console.log('\nVerifying 365-Day Bible Reading Plan data integrity...');

const BiblePlanData = require('./js/bible-plan-data.js');

assert.ok(Array.isArray(BiblePlanData.plans), 'BiblePlanData.plans must be an array');
assert.strictEqual(BiblePlanData.plans.length, 2, 'Exactly 2 Bible reading plans must exist');

const plan1 = BiblePlanData.plans.find(p => p.id === 'plan_canonical');
assert.ok(plan1, 'Plan 1 (plan_canonical) must exist');
assert.strictEqual(plan1.days.length, 365, 'Plan 1 must have exactly 365 days');
assert.strictEqual(plan1.days[0].day, 1, 'Plan 1 must start on Day 1');
assert.strictEqual(plan1.days[364].day, 365, 'Plan 1 must end on Day 365');
assert.ok(plan1.days[0].reading.includes('Genesis'), 'Day 1 must start with Genesis');
assert.ok(plan1.days[364].reading.includes('Revelation'), 'Day 365 must end with Revelation');

const plan2 = BiblePlanData.plans.find(p => p.id === 'plan_morning_night');
assert.ok(plan2, 'Plan 2 (plan_morning_night) must exist');
assert.strictEqual(plan2.days.length, 365, 'Plan 2 must have exactly 365 days');
assert.ok(plan2.days[0].morning, 'Plan 2 must have morning reading');
assert.ok(plan2.days[0].night, 'Plan 2 must have night reading');

// Check Sunday Worship on every 7th day
assert.strictEqual(BiblePlanData.sundayWorship.length, 52, '52 Sunday worship readings must exist');
for (let d = 7; d <= 365; d += 7) {
  assert.strictEqual(plan1.days[d - 1].isSunday, true, `Day ${d} must be flagged as Sunday in Plan 1`);
  assert.ok(plan1.days[d - 1].worshipReading, `Day ${d} must include worship reading in Plan 1`);
  assert.strictEqual(plan2.days[d - 1].isSunday, true, `Day ${d} must be flagged as Sunday in Plan 2`);
  assert.ok(plan2.days[d - 1].worshipReading, `Day ${d} must include worship reading in Plan 2`);
}

// Check Daily Prayer Wisdom on all 365 days
for (let i = 0; i < 365; i++) {
  const w1 = plan1.days[i].prayerWisdom;
  assert.ok(w1 && w1.theme && w1.text, `Day ${i + 1} must include prayer wisdom theme and text in Plan 1`);
  const w2 = plan2.days[i].prayerWisdom;
  assert.ok(w2 && w2.theme && w2.text, `Day ${i + 1} must include prayer wisdom theme and text in Plan 2`);
}

console.log('✓ Verified Plan 1 (Canonical/Thematic): 365 days with Genesis to Revelation sequence');
console.log('✓ Verified Plan 2 (Morning NT + Night OT): 365 days with dual daily portions');
console.log('✓ Verified 52 Sunday worship and praise readings on every 7th day');
console.log('✓ Verified 365 daily prayer wisdom reflections');

// ============================================================================
// VERIFY BIBLE PLAN CONTROLLER LOGIC (OFFLINE STORAGE, UNCHECK, RESET GUARDS)
// ============================================================================
console.log('\nVerifying BiblePlan controller logic and strict completion rules...');

// Mock browser localStorage and DOM
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; }
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {}
};
global.confirm = () => true;

// Mock DOM elements
const mockElements = {
  'view-bible-plan': { innerHTML: '', style: {} },
  'home-bible-reading-card': { innerHTML: '', style: { display: 'none' } }
};
global.document = {
  getElementById: (id) => mockElements[id] || null
};
global.BiblePlanData = BiblePlanData;

const BiblePlan = require('./js/bible-plan.js');

// 1. Initial State (No plan selected)
const initialState = BiblePlan.getState();
assert.strictEqual(initialState.activePlanId, null, 'Initially activePlanId must be null');
assert.strictEqual(initialState.completedDays.length, 0, 'Initially completedDays must be empty');

// Home widget strictly hidden when no plan chosen
BiblePlan.renderHomeWidget();
assert.strictEqual(mockElements['home-bible-reading-card'].style.display, 'none', 'Home widget must be strictly hidden if no plan is chosen');
console.log('✓ Verified: Home screen widget is strictly hidden when no plan is selected');

// 2. Select Plan 1
BiblePlan.selectPlan('plan_canonical');
const stateAfterSelect = BiblePlan.getState();
assert.strictEqual(stateAfterSelect.activePlanId, 'plan_canonical', 'Active plan must be plan_canonical');
assert.strictEqual(BiblePlan.getCurrentDayNumber(), 1, 'Current uncompleted day must start at Day 1');

// Home widget now visible
BiblePlan.renderHomeWidget();
assert.strictEqual(mockElements['home-bible-reading-card'].style.display, 'block', 'Home widget must be displayed once a plan is selected');
assert.ok(mockElements['home-bible-reading-card'].innerHTML.includes('Day 1'), 'Home widget must display Day 1');
console.log('✓ Verified: Home screen widget displays Day 1 when plan is selected');

// 3. Mark Day 1 complete -> Next active day unfolds to Day 2
BiblePlan.toggleDay(1);
assert.deepStrictEqual(BiblePlan.getState().completedDays, [1], 'Day 1 must be marked complete');
assert.strictEqual(BiblePlan.getCurrentDayNumber(), 2, 'Current uncompleted day must advance to Day 2');

BiblePlan.renderHomeWidget();
assert.ok(mockElements['home-bible-reading-card'].innerHTML.includes('Day 2'), 'Home widget must now display Day 2');
console.log('✓ Verified: Day 1 folds back and Day 2 unfolds as active reading');

// 4. Strict Guard: Read Again MUST NOT be allowed when < 365 days
BiblePlan.readAgain();
assert.strictEqual(BiblePlan.getState().completedDays.length, 1, 'Read Again must be strictly ignored when not all 365 days are completed');
console.log('✓ Verified: "Read Again" is strictly guarded and cannot be triggered early');

// 5. Complete all 365 days
const fullState = BiblePlan.getState();
fullState.completedDays = Array.from({ length: 365 }, (_, i) => i + 1);
BiblePlan.saveState(fullState);

assert.strictEqual(BiblePlan.isAllCompleted(), true, 'isAllCompleted() must return true when 365 days completed');

BiblePlan.render();
const planHtml = mockElements['view-bible-plan'].innerHTML;
assert.ok(planHtml.includes('Complete Bible Reading Finished!'), 'Celebration message must be rendered on completion');
assert.ok(planHtml.includes('Read Again (Start New Round)'), 'Read Again button must be rendered on completion');

// Test Read Again resets safely and increments round
BiblePlan.readAgain();
const stateAfterReset = BiblePlan.getState();
assert.strictEqual(stateAfterReset.completedDays.length, 0, 'Completed days must be reset to 0');
assert.strictEqual(stateAfterReset.historyRound, 2, 'History round must increment to 2');
console.log('✓ Verified: "Read Again" resets cleanly to Round 2 once all 365 days are completed');

// Verify zero emojis in generated markup
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.ok(!emojiRegex.test(planHtml), 'No emojis should be present in Bible Plan view');
console.log('✓ Verified: Strictly zero emojis in Bible Plan interface');

console.log('✓ Frontend and Bible Plan verification passed successfully.\n');

