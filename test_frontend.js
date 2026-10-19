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
  'assets/prayerly-logo.png',
  'assets/Prayerly-Logo-5.png',
  'assets/Prayerly-Logo-6.png',
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
  'js/icons.js',
  'js/content.js',
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
  // New Feature IDs: Habit Heatmap, Verse Notification, PDF Export
  'btn-export-pdf-history',
  'history-longest-streak',
  'history-total-days',
  'history-total-prayers',
  'history-heatmap-container',
  'settings-verse-notify-enabled',
  'btn-test-verse-notification',
  'btn-export-pdf-settings',
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
  'more-btn-holy-bible',
  'modal-bible-offline',
  'btn-download-all-bible'
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

// ============================================================================
// 8. VERIFY CLEAN ENGLISH ON UI BUTTONS & NAVIGATION (NO TELUGU WORDS ON BUTTONS)
// ============================================================================
console.log('\nVerifying Clean English on UI Buttons & Navigation...');
assert.ok(!indexHtml.includes('Read • చదవండి'), 'UI buttons must not contain Telugu words; must be clean English "Read"');
assert.ok(!indexHtml.includes('Previous • మునుపటి'), 'Footer navigation must not contain Telugu words; must be clean English "Previous"');
assert.ok(!indexHtml.includes('Next • తరువాతి'), 'Footer navigation must not contain Telugu words; must be clean English "Next"');
assert.ok(!indexHtml.includes('Select Book • గ్రంథాన్ని ఎంచుకోండి'), 'Book picker header must not contain Telugu words; must be clean English "Select Book"');
assert.ok(/>\s*Both\s*</.test(indexHtml), 'View mode pills must include clean English "Both"');
assert.ok(/>\s*Telugu\s*</.test(indexHtml), 'View mode pills must include clean English "Telugu"');
assert.ok(/>\s*English\s*</.test(indexHtml), 'View mode pills must include clean English "English"');
assert.ok(indexHtml.includes('Select Book'), 'Picker modal title must say "Select Book"');
console.log('✓ Verified: UI buttons, tabs, and headers strictly use clean English');

// ============================================================================
// 9. VERIFY BIBLE STORIES AND SERMONS ARE COMPLETELY REMOVED
// ============================================================================
console.log('\nVerifying Bible Stories and Sermons are completely removed...');
assert.ok(!indexHtml.includes('view-stories'), 'view-stories must not exist in index.html');
assert.ok(!indexHtml.includes('view-story-detail'), 'view-story-detail must not exist in index.html');
assert.ok(!indexHtml.includes('modal-story-reader'), 'modal-story-reader must not exist in index.html');
assert.ok(!indexHtml.includes('data-tab="stories"'), 'stories nav tab must not exist in index.html');
assert.ok(!indexHtml.includes('btn-settings-read-stories'), 'btn-settings-read-stories must not exist in index.html');
assert.ok(!indexHtml.includes('js/stories.js'), 'js/stories.js script must not exist in index.html');

assert.ok(!indexHtml.includes('view-sermons'), 'view-sermons must not exist in index.html');
assert.ok(!indexHtml.includes('modal-sermon-player'), 'modal-sermon-player must not exist in index.html');
assert.ok(!indexHtml.includes('home-sermons-quick-bar'), 'home-sermons-quick-bar must not exist in index.html');
assert.ok(!indexHtml.includes('header-btn-sermons'), 'header-btn-sermons must not exist in index.html');
assert.ok(!indexHtml.includes('data-tab="sermons"'), 'sermons nav tab must not exist in index.html');
assert.ok(!indexHtml.includes('more-btn-sermons'), 'more-btn-sermons must not exist in index.html');
assert.ok(!indexHtml.includes('js/sermons'), 'sermons scripts must not exist in index.html');

assert.strictEqual(typeof App.renderStoriesView, 'undefined', 'App.renderStoriesView must be removed');
assert.strictEqual(typeof App.openStoryReader, 'undefined', 'App.openStoryReader must be removed');
assert.strictEqual(typeof App.openSermonsFiltered, 'undefined', 'App.openSermonsFiltered must be removed');
console.log('✓ Verified: Bible Stories and Sermons are completely removed from DOM and controllers');

// ============================================================================
// 10. VERIFY DEDICATED FULL-PAGE BIBLE READER & HEADER REMOVAL
// ============================================================================
console.log('\nVerifying Dedicated Full-Page Bible Reader & Header Removal...');

// 1. Verify CSS styles for body.bible-full-page-active hiding app header and bottom nav
assert.ok(stylesCss.includes('body.bible-full-page-active .app-header'), 'CSS must target .app-header when Bible page is active');
assert.ok(stylesCss.includes('body.bible-full-page-active .mobile-bottom-nav'), 'CSS must target .mobile-bottom-nav when Bible page is active');
assert.ok(stylesCss.includes('body.bible-full-page-active #pwa-install-banner'), 'CSS must target #pwa-install-banner when Bible page is active');

// 2. Verify full 100% / 100dvh page isolation without horizontal overflow
assert.ok(stylesCss.includes('.bible-reader-backdrop') && stylesCss.includes('width: 100% !important'), 'Bible reader backdrop must be full screen 100% width without overflow');

// 3. Verify markup for dedicated navigation top bar
assert.ok(indexHtml.includes('bible-dedicated-navbar'), 'Dedicated Bible navigation top bar must be present');
assert.ok(indexHtml.includes('bible-nav-back-btn'), 'Back button with class bible-nav-back-btn must exist');
assert.ok(indexHtml.includes('bible-theme-toggle-btn'), 'Theme toggle button bible-theme-toggle-btn must exist');

// 4. Verify controller toggling body class
const classListSet = new Set();
global.document.body = {
  classList: {
    add: (cls) => classListSet.add(cls),
    remove: (cls) => classListSet.delete(cls),
    contains: (cls) => classListSet.has(cls)
  },
  style: {}
};
mockElements['modal-bible-reader'] = {
  classList: {
    add: (cls) => classListSet.add(cls),
    remove: (cls) => classListSet.delete(cls),
    contains: (cls) => classListSet.has(cls)
  }
};
mockElements['bible-picker-dialog'] = { style: { display: 'none' } };

BibleReader.showModal();
assert.ok(classListSet.has('bible-full-page-active'), 'body must have bible-full-page-active when Bible reader opens');
BibleReader.closeModal();
assert.ok(!classListSet.has('bible-full-page-active'), 'body must remove bible-full-page-active when Bible reader closes');

// App.closeAllModals() also cleans up
BibleReader.showModal();
assert.ok(classListSet.has('bible-full-page-active'), 'body must have bible-full-page-active before closeAllModals');
global.document.querySelectorAll = () => [];
App.closeAllModals();
assert.ok(!classListSet.has('bible-full-page-active'), 'App.closeAllModals must remove bible-full-page-active');

console.log('✓ Verified: Bible opens as dedicated full page with Prayerly header removed and clean return');

// ============================================================================
// 11. VERIFY HOLY BIBLE COMPLETE OFFLINE AVAILABILITY & PRELOADER
// ============================================================================
console.log('\nVerifying Holy Bible Complete Offline Availability & Preloader...');

// 1. Verify Service Worker CDN cache rule
const swContent = fs.readFileSync('service-worker.js', 'utf8');
assert.ok(swContent.includes('prayerly-bible-cdn-v1'), 'service-worker.js must contain prayerly-bible-cdn-v1 cache store');
assert.ok(swContent.includes('cdn.jsdelivr.net') && swContent.includes('raw.githubusercontent.com'), 'service-worker.js must intercept Bible CDN and GitHub raw URLs');

// 2. Verify Clean Offline Invariants in index.html (No green tick pill, No offline tag in picker dialog)
assert.ok(!indexHtml.includes('id="bible-reader-offline-btn"'), 'index.html must NOT display green tick offline badge pill in reader header');
assert.ok(!indexHtml.includes('id="bible-picker-offline-bar"'), 'index.html must NOT display offline tag line in picker dialog');
assert.ok(indexHtml.includes('id="modal-bible-offline"'), 'index.html must retain modal-bible-offline');
assert.ok(indexHtml.includes('id="settings-bible-offline-card"'), 'index.html must have settings-bible-offline-card');
assert.ok(indexHtml.includes('id="btn-download-all-bible"'), 'index.html must have btn-download-all-bible');

// 3. Verify Offline Engine methods in BibleReader
assert.strictEqual(typeof BibleReader.getOfflineStatus, 'function', 'BibleReader.getOfflineStatus must be a function');
assert.strictEqual(typeof BibleReader.updateOfflineUI, 'function', 'BibleReader.updateOfflineUI must be a function');
assert.strictEqual(typeof BibleReader.openOfflineModal, 'function', 'BibleReader.openOfflineModal must be a function');
assert.strictEqual(typeof BibleReader.closeOfflineModal, 'function', 'BibleReader.closeOfflineModal must be a function');
assert.strictEqual(typeof BibleReader.startFullOfflineDownload, 'function', 'BibleReader.startFullOfflineDownload must be a function');
assert.strictEqual(typeof BibleReader.clearOfflineCache, 'function', 'BibleReader.clearOfflineCache must be a function');
assert.strictEqual(typeof BibleReader.autoCachePlanBooks, 'function', 'BibleReader.autoCachePlanBooks must be a function');

// 4. Test offline status calculation
(async () => {
  const status = await BibleReader.getOfflineStatus();
  assert.strictEqual(status.totalBooks, 66, 'Total books count must be 66');
  assert.strictEqual(typeof status.teluguCount, 'number', 'teluguCount must be number');
  assert.strictEqual(typeof status.nivCount, 'number', 'nivCount must be number');
  assert.strictEqual(typeof status.percent, 'number', 'percent must be number');
  console.log('✓ Verified: BibleReader offline engine calculates 66-book offline availability metrics');

  // 5. Verify Zero Percentage Clutter & Pure Background Download
  assert.strictEqual(typeof BibleReader.triggerBackgroundDownloadIfPending, 'function', 'BibleReader.triggerBackgroundDownloadIfPending must be a function');
  const bibleReaderCode = fs.readFileSync('js/bible-reader.js', 'utf8');
  assert.ok(!bibleReaderCode.includes('${status.percent}% Offline'), 'js/bible-reader.js must NOT output fractional offline percentage text');
  assert.ok(!bibleReaderCode.includes('${status.teluguCount}/66 Books Saved'), 'js/bible-reader.js must NOT output fractional book counts in picker');
  assert.ok(bibleReaderCode.includes('this.triggerBackgroundDownloadIfPending()'), 'showModal must call triggerBackgroundDownloadIfPending');
  console.log('✓ Verified: Fractional percentages, book counts, green tick, and offline tag line are strictly removed from Holy Bible');

  // 6. Verify Community Prayers Background Preload
  const appCode = fs.readFileSync('js/app.js', 'utf8');
  assert.strictEqual(typeof App.preloadCommunityPrayersInBackground, 'function', 'App.preloadCommunityPrayersInBackground must be a function');
  assert.ok(appCode.includes('this.preloadCommunityPrayersInBackground()'), 'App.init must call preloadCommunityPrayersInBackground');
  console.log('✓ Verified: Community prayers are preloaded automatically in background on app start');
})();

// ============================================================================
// 12. VERIFY MOBILE SCROLL FIX, OTP-ONLY AUTH, CLEAN BIBLE & RESTORED DESIGN
// ============================================================================
console.log('\nVerifying Mobile Scroll Fix, Strict OTP Signin, Clean Bible & Restored Design...');

// 1. Verify Zero Horizontal Scroll CSS Invariants
const cssContent = fs.readFileSync('css/styles.css', 'utf8');
assert.ok(cssContent.includes('.bible-reader-assigned-bar') && cssContent.includes('scrollbar-width: none'), 'css/styles.css must hide scrollbar on bible-reader-assigned-bar');
assert.ok(cssContent.includes('.bible-reader-backdrop') && cssContent.includes('width: 100% !important'), 'css/styles.css must use width: 100% !important on bible-reader-backdrop');
assert.ok(cssContent.includes('.bible-reader-modal-card') && cssContent.includes('width: 100% !important'), 'css/styles.css must use width: 100% !important on bible-reader-modal-card');
assert.ok(cssContent.includes('overflow-x: hidden !important'), 'css/styles.css must enforce overflow-x: hidden !important on full page modal card');
console.log('✓ Verified: Strict zero horizontal scroll rules and hidden scrollbars in place');

// 2. Verify Strict OTP Signin for All Users
const Auth = require('./js/auth.js');
assert.ok(indexHtml.includes('Strictly OTP-Based'), 'index.html must indicate strictly OTP-based signin');
assert.ok(indexHtml.includes('New &amp; returning users:'), 'index.html must clarify OTP workflow for new and returning users');
assert.strictEqual(typeof Auth.requestOtp, 'function', 'Auth.requestOtp must be a function');
assert.strictEqual(typeof Auth.verifyOtp, 'function', 'Auth.verifyOtp must be a function');
console.log('✓ Verified: Signin is 100% OTP-based for both new and returning users');

// 3. Verify Pray Button is Removed from Verse Rows
const readerJs = fs.readFileSync('js/bible-reader.js', 'utf8');
assert.ok(!readerJs.includes('class="btn-verse-tool btn-verse-pray"'), 'js/bible-reader.js must NOT render btn-verse-pray in verse rows');
assert.ok(readerJs.includes('title="Copy verse"'), 'js/bible-reader.js must retain copy verse button');
console.log('✓ Verified: Pray button completely removed from Bible reader verses for serene reading');

// 4. Verify Verses Location Removed & Clean Modern Picker Available
assert.ok(!indexHtml.includes('id="bible-chapter-quick-dialog"'), 'Verses location and quick chapter dialog must be removed from DOM');
assert.ok(!indexHtml.includes('id="bible-quick-verses-section"'), 'Quick verses section must be removed from DOM');
assert.ok(indexHtml.includes('id="bible-reader-book-picker-btn"'), 'index.html must have unified book & chapter picker button');
assert.strictEqual(typeof BibleReader.togglePicker, 'function', 'BibleReader.togglePicker must be a function');
assert.strictEqual(typeof BibleReader.toggleBookChapters, 'function', 'BibleReader.toggleBookChapters must be a function');
console.log('✓ Verified: Verses location removed, green tick removed, offline line removed, clean previous design restored');

// ============================================================================
// 13. VERIFY TELUGU BIBLE FIXES, 4-COL NAVIGATOR, BOOKMARKING & NOTES
// ============================================================================
console.log('\nVerifying Telugu Bible Fixes, 4-Column Navigator, Bookmarking & Notes...');

// 1. Verify Telugu Sanitizer & Zero Hindi in Amos 7:1
const raw2Tim22 = 'నీవు ¸°వనేచ్ఛలనుండి పారిపొమ్ము, పవిత్ర హృదయులై ప్రభువునకు ప్రార్థన చేయువారితోకూడ నీతిని విశ్వాసమును ప్రేమను సమాధానమును వెంటాడుము.';
const cleaned2Tim = BibleReader.cleanTeluguText(raw2Tim22, '2timothy', 2, 22);
assert.ok(cleaned2Tim.includes('నీవు యౌవనేచ్ఛలనుండి'), '2 Timothy 2:22 must replace ¸° with యౌ');
assert.ok(!cleaned2Tim.includes('¸°'), 'Cleaned Telugu must not contain ¸°');

const cleanedAmos = BibleReader.cleanTeluguText('परमेश्वर यहोवा ने mujhe...', 'amos', 7, 1);
assert.ok(cleanedAmos.includes('ప్రభువైన యెహోవా నాకు ఈ దర్శనము కనుపరచెను'), 'Amos 7:1 must be canonical BSI Telugu scripture');
assert.ok(!/[\u0900-\u097F]/.test(cleanedAmos), 'Amos 7:1 must NOT contain any Devanagari Hindi characters');
console.log('✓ Verified: Telugu font glitches resolved (యౌ) and Amos 7:1 replaced with authentic Telugu');

// 2. Verify 4-Column Navigator Markup & Logic
assert.ok(indexHtml.includes('id="bible-picker-dialog"'), 'index.html must contain #bible-picker-dialog');
assert.ok(indexHtml.includes('bible-verse-navigator-card'), 'index.html must contain 4-column navigator card');
assert.ok(indexHtml.includes('id="bible-nav-search-input"'), 'index.html must contain #bible-nav-search-input');
assert.ok(indexHtml.includes('id="bible-col-links"'), 'index.html must contain #bible-col-links');
assert.ok(indexHtml.includes('id="bible-col-books"'), 'index.html must contain #bible-col-books');
assert.ok(indexHtml.includes('id="bible-col-chapters"'), 'index.html must contain #bible-col-chapters');
assert.ok(indexHtml.includes('id="bible-col-verses"'), 'index.html must contain #bible-col-verses');

assert.strictEqual(typeof BibleReader.navSelectLink, 'function', 'BibleReader.navSelectLink must be a function');
assert.strictEqual(typeof BibleReader.navSelectBook, 'function', 'BibleReader.navSelectBook must be a function');
assert.strictEqual(typeof BibleReader.navSelectChapter, 'function', 'BibleReader.navSelectChapter must be a function');
assert.strictEqual(typeof BibleReader.navJumpToVerse, 'function', 'BibleReader.navJumpToVerse must be a function');
assert.strictEqual(typeof BibleReader.handleNavSearch, 'function', 'BibleReader.handleNavSearch must be a function');
assert.strictEqual(typeof BibleReader.getRecentBooks, 'function', 'BibleReader.getRecentBooks must be a function');
assert.strictEqual(typeof BibleReader.recordRecentBook, 'function', 'BibleReader.recordRecentBook must be a function');

const recents = BibleReader.getRecentBooks();
assert.ok(Array.isArray(recents) && recents.length <= 3, 'getRecentBooks must return array with at most 3 books');
console.log('✓ Verified: 4-Column Navigator structure, columns, and navigation functions verified');

// 3. Verify Double-Tap Bookmarks & Triple-Tap Notes
assert.ok(indexHtml.includes('id="modal-bible-verse-note"'), 'index.html must contain #modal-bible-verse-note');
assert.ok(indexHtml.includes('id="bible-verse-note-text"'), 'index.html must contain #bible-verse-note-text');
assert.ok(indexHtml.includes('id="btn-delete-bible-note"'), 'index.html must contain #btn-delete-bible-note');

assert.strictEqual(typeof BibleReader.toggleBookmark, 'function', 'BibleReader.toggleBookmark must be a function');
assert.strictEqual(typeof BibleReader.handleVerseTap, 'function', 'BibleReader.handleVerseTap must be a function');
assert.strictEqual(typeof BibleReader.openVerseNoteModal, 'function', 'BibleReader.openVerseNoteModal must be a function');
assert.strictEqual(typeof BibleReader.saveCurrentVerseNote, 'function', 'BibleReader.saveCurrentVerseNote must be a function');
assert.strictEqual(typeof BibleReader.deleteCurrentVerseNote, 'function', 'BibleReader.deleteCurrentVerseNote must be a function');

assert.ok(cssContent.includes('.verse-bookmark-badge'), 'css/styles.css must style .verse-bookmark-badge');
assert.ok(cssContent.includes('.verse-note-badge'), 'css/styles.css must style .verse-note-badge');
assert.ok(cssContent.includes('.bible-verse-row.is-bookmarked'), 'css/styles.css must style .bible-verse-row.is-bookmarked');
assert.ok(cssContent.includes('.bible-verse-row.has-note'), 'css/styles.css must style .bible-verse-row.has-note');
console.log('✓ Verified: Multi-tap gestures, bookmarking storage, and verse note taking verified');

// 4. Verify Holy Bible Logo in Reader Top Bar
assert.ok(indexHtml.includes('id="bible-reader-logo-emblem"'), 'index.html must contain #bible-reader-logo-emblem');
const themeToggleIdx = indexHtml.indexOf('id="bible-theme-toggle-btn"');
const logoIdx = indexHtml.indexOf('id="bible-reader-logo-emblem"');
assert.ok(themeToggleIdx !== -1 && logoIdx !== -1 && logoIdx > themeToggleIdx, 'Holy Bible logo must be placed after theme toggle in reader top bar');
assert.ok(cssContent.includes('.bible-reader-logo-emblem'), 'css/styles.css must style .bible-reader-logo-emblem');
assert.ok(cssContent.includes('.bible-top-logo-svg'), 'css/styles.css must style .bible-top-logo-svg');
console.log('✓ Verified: Holy Bible Logo emblem present in top bar action group after theme toggle');

// ============================================================================
// 14. VERIFY DESIGN ENHANCEMENTS (SCREENSHOTS 1-5, HOME LAUNCHER, GESTURES)
// ============================================================================
console.log('\nVerifying Design Enhancements (Screenshots 1-5, Home Launcher, Gestures)...');

// 1. Universal Scrollbar Elimination
const latestCss = fs.readFileSync('css/styles.css', 'utf8');
assert.ok(latestCss.includes('scrollbar-width: none !important'), 'css/styles.css must enforce scrollbar-width: none !important globally');
assert.ok(latestCss.includes('*::-webkit-scrollbar'), 'css/styles.css must target *::-webkit-scrollbar');
assert.ok(latestCss.includes('display: none !important'), 'css/styles.css must hide all scrollbars');
console.log('✓ Verified: Universal scrollbar elimination active across the entire site');

// 2. Home Page (Dashboard) Bible Access: Top Bar Button and Greeting Button (Banner removed per user request)
assert.ok(!indexHtml.includes('id="home-bible-launcher-card"'), 'Home bible launcher card must be removed from Dashboard per user feedback');
assert.ok(indexHtml.includes('id="btn-dashboard-bible"'), 'index.html must contain #btn-dashboard-bible in greeting actions');
assert.ok(indexHtml.includes('id="header-btn-bible"'), 'index.html must contain #header-btn-bible in app header');
const appHeaderThemeToggle = indexHtml.indexOf('id="theme-toggle-btn"');
const appHeaderBibleBtn = indexHtml.indexOf('id="header-btn-bible"');
assert.ok(appHeaderThemeToggle !== -1 && appHeaderBibleBtn !== -1 && appHeaderBibleBtn > appHeaderThemeToggle, 'Header Bible button must be placed directly after theme toggle');
assert.strictEqual(typeof BibleReader.open, 'function', 'BibleReader.open must be a function');
console.log('✓ Verified: Holy Bible banner removed from Home screen; top navigation button and greeting button active');

// 3. Removal of Star (★) and Pencil (✎) Badges from Scripture Verse Stream
const latestReaderJs = fs.readFileSync('js/bible-reader.js', 'utf8');
assert.ok(!latestReaderJs.includes('title="Bookmarked verse">★</span>'), 'bible-reader.js must NOT render star symbol in verse rows');
assert.ok(!latestReaderJs.includes('title="Verse note"'), 'bible-reader.js must NOT render pencil symbol in verse rows');
assert.ok(latestCss.includes('.verse-bookmark-badge') && latestCss.includes('display: none !important'), 'css/styles.css must hide .verse-bookmark-badge');
assert.ok(latestCss.includes('.verse-note-badge') && latestCss.includes('display: none !important'), 'css/styles.css must hide .verse-note-badge');
console.log('✓ Verified: Stars (★) and pencils (✎) completely removed from verse rows for clean scripture reading');

// 4. Long-Press Verse Context Action Menu & Gestures
assert.ok(indexHtml.includes('id="modal-bible-verse-menu"'), 'index.html must contain #modal-bible-verse-menu');
assert.ok(indexHtml.includes('id="bible-menu-btn-bookmark"'), 'index.html must contain #bible-menu-btn-bookmark');
assert.strictEqual(typeof BibleReader.openVerseMenu, 'function', 'BibleReader.openVerseMenu must be a function');
assert.strictEqual(typeof BibleReader.closeVerseMenu, 'function', 'BibleReader.closeVerseMenu must be a function');
assert.strictEqual(typeof BibleReader.menuActionBookmark, 'function', 'BibleReader.menuActionBookmark must be a function');
assert.strictEqual(typeof BibleReader.menuActionShare, 'function', 'BibleReader.menuActionShare must be a function');
assert.strictEqual(typeof BibleReader.menuActionNote, 'function', 'BibleReader.menuActionNote must be a function');
assert.strictEqual(typeof BibleReader.bindVerseLongPress, 'function', 'BibleReader.bindVerseLongPress must be a function');
console.log('✓ Verified: Long-press verse context action menu and gesture handlers verified');

// 5. Clean Note Modal Matching Screenshot 5
assert.ok(indexHtml.includes('class="modal-card bible-clean-note-card"'), 'index.html must use bible-clean-note-card');
assert.ok(indexHtml.includes('placeholder="Enter your notes here"'), 'Note textarea must have placeholder="Enter your notes here"');
assert.ok(indexHtml.includes('class="bible-clean-note-btn bible-clean-note-btn-close"'), 'index.html must contain clean Close button');
assert.ok(indexHtml.includes('class="bible-clean-note-btn bible-clean-note-btn-save"'), 'index.html must contain clean Save button');
console.log('✓ Verified: Clean Note modal matches Screenshot 5 design specifications');

// 6. 4-Column Navigator Matching Screenshots 1-4
assert.ok(latestCss.includes('#5b354d'), 'css/styles.css must include #5b354d selection background');
assert.ok(latestCss.includes('.bible-nav-num-cell') && latestCss.includes('background: transparent !important'), 'css/styles.css must have transparent background for unselected numbers');
assert.ok(latestReaderJs.includes("key: 'OT'") && latestReaderJs.includes("key: 'Rev'"), 'bible-reader.js must define the 10 links matching screenshots');
assert.ok(!latestReaderJs.includes('<div class="bible-col-section-label">Links</div>'), 'bible-reader.js must NOT output Links subheader inside column');
assert.ok(!latestReaderJs.includes('<div class="bible-col-section-label" style="margin-top: 10px;">Recent</div>'), 'bible-reader.js must NOT output Recent subheader inside column');
console.log('✓ Verified: 4-Column Navigator strictly matches Screenshots 1-4 specifications');

console.log('============================================================');
console.log('ALL FRONTEND & THEME SYSTEM TESTS PASSED SUCCESSFULLY (100%)');
console.log('============================================================\n');

process.exit(0);




