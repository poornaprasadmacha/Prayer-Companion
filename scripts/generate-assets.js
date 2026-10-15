const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// 1. LANDING HERO PREVIEW (Mobile Mockup Artwork)
const heroPreviewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 620" width="100%" height="100%">
  <defs>
    <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="screenBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#EFF6FF"/>
    </linearGradient>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#023E8A"/>
      <stop offset="100%" stop-color="#0077B6"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#023E8A" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Outer Phone Body -->
  <rect x="15" y="10" width="350" height="600" rx="42" fill="url(#phoneBody)" filter="url(#softShadow)"/>
  <rect x="17" y="12" width="346" height="596" rx="40" fill="none" stroke="#334155" stroke-width="2"/>

  <!-- Screen Container -->
  <rect x="25" y="20" width="330" height="580" rx="34" fill="url(#screenBg)"/>
  <clipPath id="screenClip">
    <rect x="25" y="20" width="330" height="580" rx="34"/>
  </clipPath>

  <g clip-path="url(#screenClip)">
    <!-- Notch / Dynamic Island -->
    <rect x="145" y="28" width="90" height="20" rx="10" fill="#0F172A"/>
    <circle cx="215" cy="38" r="4" fill="#1E293B"/>

    <!-- App Header -->
    <rect x="25" y="20" width="330" height="74" fill="#FFFFFF"/>
    <line x1="25" y1="94" x2="355" y2="94" stroke="#E2E8F0" stroke-width="1"/>
    
    <!-- Header Brand -->
    <circle cx="55" cy="68" r="14" fill="#023E8A"/>
    <!-- Cross icon -->
    <path d="M55 60 v16 M49 65 h12" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <text x="76" y="73" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="700" fill="#023E8A">Prayerly</text>
    
    <!-- Header Actions -->
    <rect x="270" y="55" width="70" height="26" rx="13" fill="#F0F7FF" stroke="#BAE6FD" stroke-width="1"/>
    <text x="305" y="72" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#023E8A" text-anchor="middle">Synced ✓</text>

    <!-- Content Area -->
    <!-- Daily Scripture Card -->
    <g transform="translate(40, 108)">
      <rect width="300" height="96" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="0" y="0" width="5" height="96" rx="2" fill="#023E8A"/>
      <text x="16" y="24" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#023E8A" letter-spacing="0.5">TODAY'S SCRIPTURE &#8226; 1 THESS 5:16-18</text>
      <text x="16" y="46" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#1E293B">"Rejoice always, pray without ceasing,</text>
      <text x="16" y="64" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#1E293B">give thanks in all circumstances..."</text>
      <text x="16" y="84" font-family="'Inter', sans-serif" font-size="10.5" font-weight="600" fill="#64748B">Tap for meditation reflection &#8594;</text>
    </g>

    <!-- Streak Badge -->
    <g transform="translate(40, 216)">
      <rect width="300" height="42" rx="10" fill="#FFFBEB" stroke="#FEF3C7" stroke-width="1"/>
      <circle cx="24" cy="21" r="10" fill="url(#goldGrad)"/>
      <text x="24" y="25" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">★</text>
      <text x="42" y="25" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#B45309">7 Day Prayer Streak</text>
      <text x="284" y="25" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#D97706" text-anchor="end">Faithful</text>
    </g>

    <!-- Section Title: Today's Prayers -->
    <text x="42" y="280" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#0F172A">To Pray Today (2 remaining)</text>

    <!-- Prayer Card 1 -->
    <g transform="translate(40, 292)">
      <rect width="300" height="114" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <!-- Category Tag -->
      <rect x="14" y="12" width="76" height="20" rx="10" fill="#F0F7FF"/>
      <text x="52" y="26" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#023E8A" text-anchor="middle">Family Health</text>
      <text x="286" y="25" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#94A3B8" text-anchor="end">Today</text>
      
      <text x="14" y="50" font-family="'Inter', sans-serif" font-size="13.5" font-weight="600" fill="#0F172A">Healing &amp; Peace for Parents</text>
      <text x="14" y="68" font-family="'Inter', sans-serif" font-size="11.5" font-weight="400" fill="#64748B">Grant complete recovery and strength...</text>
      
      <!-- Card Footer Actions -->
      <line x1="14" y1="80" x2="286" y2="80" stroke="#F1F5F9" stroke-width="1"/>
      <rect x="14" y="86" width="86" height="22" rx="6" fill="#023E8A"/>
      <text x="57" y="101" font-family="'Inter', sans-serif" font-size="10.5" font-weight="600" fill="#FFFFFF" text-anchor="middle">✓ I Prayed</text>
      <text x="286" y="101" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#64748B" text-anchor="end">Remind 08:00 AM</text>
    </g>

    <!-- Prayer Card 2 (Prayed State) -->
    <g transform="translate(40, 416)">
      <rect width="300" height="74" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <circle cx="26" cy="37" r="10" fill="#10B981"/>
      <path d="M22 37 l3 3 l6 -6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="46" y="34" font-family="'Inter', sans-serif" font-size="12.5" font-weight="600" fill="#334155">Guidance in Work Decisions</text>
      <text x="46" y="50" font-family="'Inter', sans-serif" font-size="10.5" font-weight="500" fill="#10B981">Prayed Today &#8226; Rested in God</text>
    </g>

    <!-- Bottom App Navigation Bar -->
    <rect x="25" y="536" width="330" height="64" fill="#FFFFFF"/>
    <line x1="25" y1="536" x2="355" y2="536" stroke="#E2E8F0" stroke-width="1"/>
    
    <!-- Tab 1: Prayers (Active) -->
    <circle cx="68" cy="558" r="14" fill="#F0F7FF"/>
    <path d="M68 551 v14 M63 555 h10" stroke="#023E8A" stroke-width="2" stroke-linecap="round"/>
    <text x="68" y="584" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#023E8A" text-anchor="middle">Prayers</text>
    
    <!-- Tab 2: Companions -->
    <path d="M136 555 a4 4 0 1 0 0 -8 a4 4 0 0 0 0 8 z M128 565 c0 -4 4 -6 8 -6 s8 2 8 6" stroke="#94A3B8" stroke-width="1.8" fill="none"/>
    <text x="136" y="584" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8" text-anchor="middle">Companions</text>
    
    <!-- Tab 3: Thanks -->
    <path d="M204 553 c-2 -3 -6 -3 -8 0 c-2 3 0 7 8 11 c8 -4 10 -8 8 -11 c-2 -3 -6 -3 -8 0" stroke="#94A3B8" stroke-width="1.8" fill="none"/>
    <text x="204" y="584" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8" text-anchor="middle">Thanks</text>
    
    <!-- Tab 4: More -->
    <circle cx="268" cy="559" r="2" fill="#94A3B8"/>
    <circle cx="274" cy="559" r="2" fill="#94A3B8"/>
    <circle cx="280" cy="559" r="2" fill="#94A3B8"/>
    <text x="274" y="584" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8" text-anchor="middle">More</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'landing-hero-preview.svg'), heroPreviewSvg.trim(), 'utf8');

// 2. COMPLETED PRAYERS BANNER GRAPHIC (Replaces "All Prayer Points Completed Today!")
const completedBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 120" width="100%" height="100%">
  <defs>
    <linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4"/>
      <stop offset="50%" stop-color="#ECFDF5"/>
      <stop offset="100%" stop-color="#F0F9FF"/>
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#D1FAE5"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <style>
      .banner-bg { fill: url(#compGrad); stroke: #BBF7D0; }
      .title-text { fill: #065F46; }
      .sub-text { fill: #047857; }
      @media (prefers-color-scheme: dark) {
        .banner-bg { fill: #064E3B; stroke: #047857; }
        .title-text { fill: #F0FDF4; }
        .sub-text { fill: #A7F3D0; }
      }
    </style>
  </defs>

  <rect class="banner-bg" width="680" height="120" rx="14" stroke-width="1.2"/>

  <g transform="translate(30, 22)">
    <circle cx="38" cy="38" r="38" fill="url(#circleGrad)"/>
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
    <text class="title-text" x="0" y="55" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" letter-spacing="-0.4px">
      All Prayer Points Completed!
    </text>
    <text class="sub-text" x="0" y="80" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="500">
      Rest in God's peace today &#8226; All petitions have been lifted in faith
    </text>
  </g>

  <g transform="translate(600, 60)">
    <circle r="25" fill="url(#badgeGrad)"/>
    <circle r="29" fill="none" stroke="#34D399" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M-8 0 l5 6 l12 -12" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'prayers-completed.svg'), completedBannerSvg.trim(), 'utf8');

// 3. LANDING FEATURE CARDS GRAPHICS
const featureJournalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <circle cx="40" cy="40" r="38" fill="#F0F7FF" stroke="#BAE6FD" stroke-width="1.5"/>
  <rect x="24" y="20" width="32" height="40" rx="4" fill="#023E8A"/>
  <line x1="32" y1="20" x2="32" y2="60" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.6"/>
  <line x1="38" y1="28" x2="48" y2="28" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
  <line x1="38" y1="36" x2="48" y2="36" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
  <line x1="38" y1="44" x2="45" y2="44" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'feature-journal.svg'), featureJournalSvg.trim(), 'utf8');

const featureCompanionSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <circle cx="40" cy="40" r="38" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.5"/>
  <!-- Two figures united in prayer -->
  <circle cx="32" cy="30" r="7" fill="#059669"/>
  <path d="M20 54 c0 -7 5 -12 12 -12 s12 5 12 12" fill="#059669"/>
  <circle cx="48" cy="30" r="7" fill="#023E8A"/>
  <path d="M36 54 c0 -7 5 -12 12 -12 s12 5 12 12" fill="#023E8A" fill-opacity="0.85"/>
  <path d="M40 24 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" fill="#D97706"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'feature-companion.svg'), featureCompanionSvg.trim(), 'utf8');

const featureThanksgivingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <circle cx="40" cy="40" r="38" fill="#FFFBEB" stroke="#FEF3C7" stroke-width="1.5"/>
  <!-- Glowing Heart with praise star -->
  <path d="M40 54 c-8 -6 -16 -12 -16 -20 a9 9 0 0 1 16 -5 a9 9 0 0 1 16 5 c0 8 -8 14 -16 20 z" fill="#D97706"/>
  <polygon points="40 22 42 27 47 28 43 32 44 37 40 34 36 37 37 32 33 28 38 27" fill="#FDE68A"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'feature-thanksgiving.svg'), featureThanksgivingSvg.trim(), 'utf8');

const featureCloudSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <circle cx="40" cy="40" r="38" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
  <!-- Cloud with Shield -->
  <path d="M52 48 a10 10 0 0 0 -2 -19 a14 14 0 0 0 -24 -3 a10 10 0 0 0 -2 22 z" fill="#023E8A" fill-opacity="0.15" stroke="#023E8A" stroke-width="2"/>
  <path d="M40 38 l8 3 v6 c0 6 -4 10 -8 12 c-4 -2 -8 -6 -8 -12 v-6 z" fill="#023E8A"/>
  <path d="M37 46 l2 2 l4 -4" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
fs.writeFileSync(path.join(assetsDir, 'feature-cloud.svg'), featureCloudSvg.trim(), 'utf8');

console.log('All custom visual vector assets created successfully!');
