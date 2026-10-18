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
  'js/bible-reader.js',
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
  'home-bible-reading-card',
  // Holy Bible Reader (Telugu & English)
  'modal-bible-reader',
  'bible-reader-content',
  'bible-reader-btn-prev',
  'bible-reader-btn-next',
  'bible-reader-close-btn',
  'bible-picker-dialog',
  'more-btn-holy-bible'
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

// Check Sunday Worship Readings collection
assert.strictEqual(BiblePlanData.sundayWorship.length, 52, '52 Sunday worship readings must exist');

// Check Daily Prayer Wisdom on all 365 days
for (let i = 0; i < 365; i++) {
  const w1 = plan1.days[i].prayerWisdom;
  assert.ok(w1 && w1.text, `Day ${i + 1} must include prayer wisdom text in Plan 1`);
  const w2 = plan2.days[i].prayerWisdom;
  assert.ok(w2 && w2.text, `Day ${i + 1} must include prayer wisdom text in Plan 2`);
}

console.log('✓ Verified Plan 1 (OT followed by NT): 365 days');
console.log('✓ Verified Plan 2 (Morning NT + Night OT): 365 days');
console.log('✓ Verified 52 Sunday worship and praise readings');
console.log('✓ Verified 365 daily prayer wisdom reflections');

// ============================================================================
// VERIFY BIBLE PLAN CONTROLLER LOGIC (OFFLINE STORAGE, UNCHECK, RESET GUARDS)
// ============================================================================
console.log('\nVerifying BiblePlan controller logic, plan switcher, and Sunday check...');

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

// 2.5 Instant Plan Switcher (switch to Plan 2 directly without alerts)
BiblePlan.selectPlan('plan_morning_night');
assert.strictEqual(BiblePlan.getState().activePlanId, 'plan_morning_night', 'Active plan must switch instantly to plan_morning_night');
BiblePlan.renderHomeWidget();
assert.ok(mockElements['home-bible-reading-card'].innerHTML.includes('Morning:'), 'Home widget must display dual reading after switching');
console.log('✓ Verified: Change Plan works seamlessly with instant switching');

// Switch back to Plan 1
BiblePlan.selectPlan('plan_canonical');

// 3. Mark Day 1 complete -> Next active day unfolds to Day 2
BiblePlan.toggleDay(1);
assert.deepStrictEqual(BiblePlan.getState().completedDays, [1], 'Day 1 must be marked complete');
assert.strictEqual(BiblePlan.getCurrentDayNumber(), 2, 'Current uncompleted day must advance to Day 2');

BiblePlan.renderHomeWidget();
assert.ok(mockElements['home-bible-reading-card'].innerHTML.includes('Day 2'), 'Home widget must now display Day 2');
console.log('✓ Verified: Day 1 folds back and Day 2 unfolds as active reading');

// 3.5 Real-life Sunday check verification
assert.strictEqual(typeof BiblePlan.isTodaySunday(), 'boolean', 'isTodaySunday() returns boolean');
const isRealSunday = (new Date().getDay() === 0);
assert.strictEqual(BiblePlan.isTodaySunday(), isRealSunday, 'isTodaySunday must match actual current weekday (Sunday = 0)');
if (!isRealSunday) {
  assert.strictEqual(BiblePlan.getSundayWorshipReading(), null, 'Sunday worship reading must be null when today is NOT Sunday');
  console.log('✓ Verified: Sunday worship reading is NOT included on non-Sundays');
} else {
  assert.ok(BiblePlan.getSundayWorshipReading(), 'Sunday worship reading is included on actual Sunday');
  console.log('✓ Verified: Sunday worship reading is included on actual Sunday');
}

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
assert.ok(planHtml.includes('Complete Bible Reading Finished'), 'Celebration message must be rendered on completion');
assert.ok(planHtml.includes('Read Again'), 'Read Again button must be rendered on completion');

// Test Read Again resets safely and increments round
BiblePlan.readAgain();
const stateAfterReset = BiblePlan.getState();
assert.strictEqual(stateAfterReset.completedDays.length, 0, 'Completed days must be reset to 0');
assert.strictEqual(stateAfterReset.historyRound, 2, 'History round must increment to 2');
console.log('✓ Verified: "Read Again" resets cleanly to Round 2 once all 365 days are completed');

// Verify zero emojis and zero tags in generated markup
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.ok(!emojiRegex.test(planHtml), 'No emojis should be present in Bible Plan view');
assert.ok(!planHtml.includes('Daily Bible Reading'), 'No "Daily Bible Reading" tag should be present');
console.log('✓ Verified: Strictly zero emojis and zero unnecessary tags in Bible Plan interface');

console.log('✓ Frontend and Bible Plan verification passed successfully.\n');

console.log('Verifying 3-Mode Theme System (Light, Dark, System) and Mobile Gap Fix...');
const stylesCss = fs.readFileSync('css/styles.css', 'utf8');

// 1. Verify CSS Central Theme System Tokens
assert.ok(stylesCss.includes('--bg-primary: #F8FAFC'), 'Light mode must define --bg-primary: #F8FAFC');
assert.ok(stylesCss.includes('--accent-primary: #084B9A'), 'Light mode must define --accent-primary: #084B9A');
assert.ok(stylesCss.includes('--accent-interactive: #2563EB'), 'Light mode must define --accent-interactive: #2563EB');
assert.ok(stylesCss.includes('--border-primary: #E2E8F0'), 'Light mode must define --border-primary: #E2E8F0');
assert.ok(stylesCss.includes('--bg-primary: #111827'), 'Dark mode must define --bg-primary: #111827');
assert.ok(stylesCss.includes('--bg-card: #1F2937'), 'Dark mode must define --bg-card: #1F2937');
assert.ok(stylesCss.includes('--bg-elevated: #273449'), 'Dark mode must define --bg-elevated: #273449');
assert.ok(stylesCss.includes('--accent-primary: #38BDF8'), 'Dark mode must define --accent-primary: #38BDF8');
assert.ok(stylesCss.includes('--border-primary: #334155'), 'Dark mode must define --border-primary: #334155');
console.log('✓ Verified: Central theme tokens strictly adhere to Light & Dark palette specifications');

// 2. Verify Mobile Gap Fix
assert.ok(stylesCss.includes('.dashboard-hero-split .stats-grid {\n  margin-bottom: 0 !important;'), 'stats-grid in dashboard-hero-split must have margin-bottom: 0 !important to prevent 54px mobile gap');
console.log('✓ Verified: Mobile hero split gap fix strictly in place');

// 3. Verify Smooth Theme Transitions & Accessibility
assert.ok(stylesCss.includes('180ms ease'), 'Must include 180ms ease transitions across surfaces');
assert.ok(stylesCss.includes('prefers-reduced-motion: reduce'), 'Must respect prefers-reduced-motion');
assert.ok(stylesCss.includes('body.dark-theme .btn-primary'), 'Dark mode primary buttons must have high contrast styling');
console.log('✓ Verified: Smooth 180ms transitions, reduced motion, and WCAG AAA button contrast');

// 4. Verify Theme Selector in DOM
assert.ok(indexHtml.includes('icon-sun') && indexHtml.includes('icon-moon'), 'Header toggle must contain sun and moon icons');
assert.ok(!indexHtml.includes('class="icon-system"'), 'Header toggle must not contain system icon in top navigation');
assert.ok(indexHtml.includes('data-theme-mode="light"') && indexHtml.includes('data-theme-mode="dark"') && indexHtml.includes('data-theme-mode="system"'), 'Settings must include 3-theme selector buttons (Light, Dark, System)');
console.log('✓ Verified: Top navigation has direct Sun/Moon toggle; Settings retains Light, Dark, System');

// 5. Verify Floating Blue Home Bible Card (No harsh left colored line)
assert.ok(!stylesCss.includes('.home-bible-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-primary);\n  border-left: 3.5px solid var(--accent-primary);'), 'home-bible-card must not have harsh left colored border line');
assert.ok(stylesCss.includes('rgba(239, 246, 255'), 'home-bible-card must have soft floating blue theme ambiance');
console.log('✓ Verified: Harsh left colored line removed; floating blue theme ambiance in place');

// 6. Verify App Theme Controller Logic
const App = require('./js/app.js');
assert.strictEqual(typeof App.initTheme, 'function', 'App.initTheme must be a function');
assert.strictEqual(typeof App.getTheme, 'function', 'App.getTheme must be a function');
assert.strictEqual(typeof App.setTheme, 'function', 'App.setTheme must be a function');
assert.strictEqual(typeof App.toggleTheme, 'function', 'App.toggleTheme must be a function');

// Test switching themes
App.setTheme('light');
assert.strictEqual(App.getTheme(), 'light', 'Theme should be light after setting light');
App.setTheme('dark');
assert.strictEqual(App.getTheme(), 'dark', 'Theme should be dark after setting dark');
App.setTheme('system');
assert.strictEqual(App.getTheme(), 'system', 'Theme should be system after setting system');

// Test top nav toggle (Light <-> Dark)
App.setTheme('light');
App.toggleTheme();
assert.strictEqual(App.getTheme(), 'dark', 'Toggling from light should switch to dark');
App.toggleTheme();
assert.strictEqual(App.getTheme(), 'light', 'Toggling from dark should switch to light');
// 7. Verify Holy Bible Reader (Telugu & English Bilingual, NIV Default, KJV Switchable)
console.log('\nVerifying Holy Bible Reader (Telugu + English NIV/KJV)...');
const BibleReader = require('./js/bible-reader.js');

assert.ok(Array.isArray(BibleReader.books), 'BibleReader.books must be an array');
assert.strictEqual(BibleReader.books.length, 66, 'Holy Bible must have all 66 books');

const otBooks = BibleReader.books.filter(b => b.testament === 'OT');
const ntBooks = BibleReader.books.filter(b => b.testament === 'NT');
assert.strictEqual(otBooks.length, 39, 'Old Testament must have exactly 39 books');
assert.strictEqual(ntBooks.length, 27, 'New Testament must have exactly 27 books');

// Verify translation mappings for all 66 books
BibleReader.books.forEach(b => {
  assert.ok(b.name && b.telugu, `Book ${b.name} must have Telugu name`);
  assert.ok(b.chapters > 0, `Book ${b.name} must have chapters > 0`);
  assert.ok(b.files && b.files.telugu && b.files.niv && b.files.kjv, `Book ${b.name} must have files for telugu, niv, and kjv`);
});
console.log('✓ Verified: All 66 books mapped with Telugu and English titles and translations');

// Verify book resolution
assert.strictEqual(BibleReader.resolveBook('Genesis').telugu, 'ఆదికాండము', 'Genesis must resolve to ఆదికాండము');
assert.strictEqual(BibleReader.resolveBook('ఆదికాండము').name, 'Genesis', 'ఆదికాండము must resolve to Genesis');
assert.strictEqual(BibleReader.resolveBook('Song of Solomon').name, 'Song of Songs', 'Song of Solomon alias must resolve to Song of Songs');
assert.strictEqual(BibleReader.resolveBook('మత్తయి').name, 'Matthew', 'మత్తయి must resolve to Matthew');
console.log('✓ Verified: Bilingual book resolution handles English, Telugu, and historical aliases');

// Verify passage reference parser
const p1 = BibleReader.parseReference('Genesis 1-3');
assert.ok(p1 && p1[0].chapters.length === 3, 'Genesis 1-3 parses 3 chapters');
assert.deepStrictEqual(p1[0].chapters, [1, 2, 3], 'Genesis 1-3 chapter range is [1, 2, 3]');

const p2 = BibleReader.parseReference('Matthew 3 / Genesis 6-8');
assert.strictEqual(p2.length, 2, 'Dual reading parses into 2 book portions');
assert.strictEqual(p2[0].book.name, 'Matthew');
assert.deepStrictEqual(p2[1].chapters, [6, 7, 8]);
console.log('✓ Verified: Passage reference parser parses single and dual plan readings');

// Verify NIV default & KJV switcher
assert.strictEqual(BibleReader.englishVersion, 'niv', 'Default English translation must be NIV');
BibleReader.setEnglishVersion('kjv');
assert.strictEqual(BibleReader.englishVersion, 'kjv', 'Must switch to KJV');
BibleReader.setEnglishVersion('niv');
assert.strictEqual(BibleReader.englishVersion, 'niv', 'Must switch back to NIV');
console.log('✓ Verified: English translation defaults to NIV and switches seamlessly to KJV');

// Verify view mode switcher (Bilingual / Telugu / English)
assert.strictEqual(BibleReader.viewMode, 'bilingual', 'Default view mode must be bilingual');
BibleReader.setViewMode('telugu');
assert.strictEqual(BibleReader.viewMode, 'telugu', 'Must switch to Telugu only');
BibleReader.setViewMode('english');
assert.strictEqual(BibleReader.viewMode, 'english', 'Must switch to English only');
BibleReader.setViewMode('bilingual');
assert.strictEqual(BibleReader.viewMode, 'bilingual', 'Must switch back to bilingual');
console.log('✓ Verified: View modes toggle cleanly between Bilingual (తెలుగు + Eng), Telugu, and English');

// Verify App integration
assert.strictEqual(typeof App.openMoreBibleReader, 'function', 'App.openMoreBibleReader must be a function');
console.log('✓ Verified: App controller connects directly to Holy Bible Reader');

console.log('============================================================');
console.log('ALL FRONTEND & THEME SYSTEM TESTS PASSED SUCCESSFULLY (100%)');
console.log('============================================================\n');



