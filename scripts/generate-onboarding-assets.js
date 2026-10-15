const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// 1. Step 1: Daily Focus & Devotional Scripture
const step1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <defs>
    <linearGradient id="s1-bg" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="s1-glow" x1="200" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0284C7" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="s1-book" x1="120" y1="70" x2="280" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <style>
      .halo-pulse {
        animation: s1Pulse 3.5s ease-in-out infinite;
        transform-origin: 200px 110px;
      }
      .ribbon-sway {
        animation: s1Sway 4s ease-in-out infinite;
        transform-origin: 200px 75px;
      }
      .line-shimmer {
        animation: s1Shimmer 2.5s ease-in-out infinite alternate;
      }
      @keyframes s1Pulse {
        0%, 100% { transform: scale(0.96); opacity: 0.45; }
        50% { transform: scale(1.08); opacity: 0.85; }
      }
      @keyframes s1Sway {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
      @keyframes s1Shimmer {
        0% { opacity: 0.4; }
        100% { opacity: 0.95; }
      }
    </style>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#s1-bg)" />
  <circle cx="200" cy="110" r="85" fill="url(#s1-glow)" class="halo-pulse" />

  <!-- Open Bible / Devotional Notebook -->
  <g transform="translate(0, 5)">
    <!-- Book Shadows / Cover Pages -->
    <path d="M110 168 C 150 164, 185 167, 200 174 C 215 167, 250 164, 290 168 L 296 82 C 255 78, 220 81, 200 89 C 180 81, 145 78, 104 82 Z" fill="#023E8A" opacity="0.6" />
    <path d="M114 165 C 152 161, 186 164, 200 171 C 214 164, 248 161, 286 165 L 292 80 C 253 76, 219 79, 200 87 C 181 79, 147 76, 108 80 Z" fill="#E2E8F0" />
    
    <!-- Top White Pages -->
    <path d="M118 162 C 154 158, 187 161, 200 168 C 213 161, 246 158, 282 162 L 288 78 C 251 74, 218 77, 200 85 C 182 77, 149 74, 112 78 Z" fill="url(#s1-book)" />

    <!-- Center Spine Crease -->
    <line x1="200" y1="85" x2="200" y2="168" stroke="#CBD5E1" stroke-width="2" />

    <!-- Scripture Text Lines (Left Page) -->
    <line x1="130" y1="98" x2="185" y2="98" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" class="line-shimmer" />
    <line x1="130" y1="110" x2="185" y2="110" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
    <line x1="130" y1="122" x2="175" y2="122" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" class="line-shimmer" />
    <line x1="130" y1="134" x2="180" y2="134" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
    <line x1="130" y1="146" x2="165" y2="146" stroke="#0284C7" stroke-width="2" stroke-linecap="round" />

    <!-- Scripture Text Lines (Right Page) -->
    <line x1="215" y1="98" x2="270" y2="98" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
    <line x1="215" y1="110" x2="265" y2="110" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" class="line-shimmer" />
    <line x1="215" y1="122" x2="270" y2="122" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
    <line x1="215" y1="134" x2="255" y2="134" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" class="line-shimmer" />
    <line x1="215" y1="146" x2="260" y2="146" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />

    <!-- Satin Bookmark Ribbon -->
    <path d="M200 84 Q 198 120, 203 150 Q 206 172, 201 185 L 195 180 L 191 188 L 197 150 Q 198 120, 200 84 Z" fill="#0284C7" class="ribbon-sway" />
  </g>

  <!-- Golden Cross Accent -->
  <g transform="translate(193, 40)">
    <circle cx="7" cy="7" r="14" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5" />
    <path d="M7 2 V 12 M4 5 H 10" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
  </g>

  <!-- Bottom Title Badge -->
  <rect x="90" y="200" width="220" height="24" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
  <text x="200" y="216" text-anchor="middle" fill="#38BDF8" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">
    DAILY INSPIRATION &amp; SCRIPTURE
  </text>
</svg>`;

// 2. Step 2: "I Prayed" Focus Flow (Prayed requests fold down into Prayed Today)
const step2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <defs>
    <linearGradient id="s2-bg" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <style>
      .tap-cursor {
        animation: s2Tap 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      .btn-pray-anim {
        animation: s2BtnColor 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      .card-slide-down {
        animation: s2CardMove 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      .prayed-folded-badge {
        animation: s2BadgePulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      @keyframes s2Tap {
        0%, 20% { transform: translate(250px, 85px) scale(1); opacity: 0; }
        30% { transform: translate(250px, 85px) scale(1); opacity: 1; }
        38% { transform: translate(248px, 82px) scale(0.85); opacity: 1; }
        48% { transform: translate(250px, 85px) scale(1); opacity: 1; }
        65%, 100% { transform: translate(250px, 95px) scale(1); opacity: 0; }
      }
      @keyframes s2BtnColor {
        0%, 35% { fill: #2563EB; }
        42%, 100% { fill: #556B2F; }
      }
      @keyframes s2CardMove {
        0%, 40% { transform: translateY(0); opacity: 1; }
        55% { transform: translateY(35px) scale(0.96); opacity: 0.85; }
        70%, 100% { transform: translateY(68px) scale(0.92); opacity: 0; }
      }
      @keyframes s2BadgePulse {
        0%, 55% { transform: scale(1); opacity: 0.7; }
        65% { transform: scale(1.04); opacity: 1; }
        75%, 100% { transform: scale(1); opacity: 1; }
      }
    </style>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#s2-bg)" />

  <!-- Active Upper Request Card (Animated to slide down once prayed) -->
  <g class="card-slide-down">
    <g transform="translate(60, 30)">
      <rect width="280" height="68" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
      
      <!-- Category Tag & Priority -->
      <rect x="14" y="12" width="70" height="14" rx="4" fill="rgba(56, 189, 248, 0.15)" />
      <text x="49" y="22" text-anchor="middle" fill="#38BDF8" font-family="'Inter', sans-serif" font-size="9" font-weight="600">FAMILY</text>

      <text x="14" y="44" fill="#F8FAFC" font-family="'Inter', sans-serif" font-size="13" font-weight="700">Health &amp; Peace for Family</text>
      <text x="14" y="58" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="10.5">Focusing on complete physical healing</text>

      <!-- I Prayed Interactive Button -->
      <rect x="200" y="20" width="66" height="28" rx="6" class="btn-pray-anim" />
      <path d="M210 34 L 214 38 L 222 30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="238" y="38" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="10.5" font-weight="700">Prayed</text>
    </g>
  </g>

  <!-- Simulating Tap Finger / Gesture -->
  <g class="tap-cursor">
    <circle cx="16" cy="16" r="14" fill="rgba(56, 189, 248, 0.25)" />
    <circle cx="16" cy="16" r="6" fill="#38BDF8" />
  </g>

  <!-- Downward Flow Arrow indicator -->
  <g transform="translate(190, 112)">
    <circle cx="10" cy="10" r="14" fill="#0F172A" stroke="#334155" stroke-width="1" />
    <path d="M10 4 V 14 M6 10 L 10 14 L 14 10" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Folded Section: Prayed Today (Drops down and collapses) -->
  <g transform="translate(60, 142)" class="prayed-folded-badge" style="transform-origin: 200px 160px;">
    <rect width="280" height="42" rx="8" fill="#13231B" stroke="#556B2F" stroke-width="1.2" />
    <path d="M78 163 L 83 160 L 78 157 Z" fill="#84CC16" />
    <text x="94" y="166" fill="#C5DC98" font-family="'Inter', sans-serif" font-size="12" font-weight="700">
      Prayed Today (1)
    </text>
    <rect x="204" y="152" width="62" height="20" rx="10" fill="rgba(132, 204, 22, 0.15)" />
    <text x="235" y="165" text-anchor="middle" fill="#A3E635" font-family="'Inter', sans-serif" font-size="9.5" font-weight="600">
      FOLDED
    </text>
  </g>

  <!-- Bottom Clarification Label -->
  <rect x="65" y="200" width="270" height="24" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
  <text x="200" y="216" text-anchor="middle" fill="#A3E635" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="0.4">
    PRAYED MOVES DOWN &#8226; CLEAR FOCUS
  </text>
</svg>`;

// 3. Step 3: Answered Prayers & Thanksgiving Testimony
const step3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <defs>
    <linearGradient id="s3-bg" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="s3-gold" x1="140" y1="60" x2="260" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <style>
      .star-glow {
        animation: s3Sparkle 3s ease-in-out infinite;
        transform-origin: 200px 75px;
      }
      .testimony-card-anim {
        animation: s3Float 4s ease-in-out infinite;
      }
      @keyframes s3Sparkle {
        0%, 100% { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
        50% { transform: scale(1.15) rotate(180deg); opacity: 1; }
      }
      @keyframes s3Float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    </style>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#s3-bg)" />

  <!-- Radiance Aura -->
  <circle cx="200" cy="95" r="70" fill="rgba(245, 158, 11, 0.12)" />

  <!-- Answered Prayer Testimony Card -->
  <g class="testimony-card-anim">
    <g transform="translate(70, 40)">
      <rect width="260" height="135" rx="12" fill="#1E293B" stroke="#D97706" stroke-width="1.5" />
      
      <!-- Answered Pill Badge -->
      <rect x="16" y="14" width="88" height="20" rx="10" fill="rgba(245, 158, 11, 0.18)" stroke="#F59E0B" stroke-width="1" />
      <circle cx="26" cy="24" r="3" fill="#FBBF24" />
      <text x="60" y="28" text-anchor="middle" fill="#FBBF24" font-family="'Inter', sans-serif" font-size="10.5" font-weight="700">ANSWERED</text>
      
      <text x="16" y="56" fill="#F8FAFC" font-family="'Inter', sans-serif" font-size="13" font-weight="700">Miraculous Job Breakthrough</text>
      <text x="16" y="72" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="10.5">Answered on October 14, 2026</text>

      <!-- Testimony Quote Container -->
      <rect x="16" y="84" width="228" height="38" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1" />
      <path d="M26 94 Q 24 99, 29 101" stroke="#F59E0B" stroke-width="2" fill="none" />
      <text x="34" y="99" fill="#CBD5E1" font-family="'Inter', sans-serif" font-size="10" font-style="italic">
        "God opened doors beyond what I asked or thought."
      </text>
      <text x="34" y="112" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="9">
        — Added to Thanksgiving Journal
      </text>
    </g>
  </g>

  <!-- Sparkle Graphic on Top Corner -->
  <g transform="translate(190, 22)" class="star-glow">
    <path d="M10 0 L 12.5 7.5 L 20 10 L 12.5 12.5 L 10 20 L 7.5 12.5 L 0 10 L 7.5 7.5 Z" fill="#FBBF24" />
  </g>

  <!-- Bottom Title Badge -->
  <rect x="75" y="200" width="250" height="24" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
  <text x="200" y="216" text-anchor="middle" fill="#FBBF24" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="0.4">
    CELEBRATE &amp; RECORD GOD'S ANSWERS
  </text>
</svg>`;

// 4. Step 4: Companions Intercession & Cloud Sync
const step4Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="none">
  <defs>
    <linearGradient id="s4-bg" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <style>
      .cloud-sync-anim {
        animation: s4Sync 3.5s ease-in-out infinite;
      }
      .signal-line {
        animation: s4Signal 2.5s linear infinite;
        stroke-dasharray: 6 4;
      }
      .node-pulse {
        animation: s4Node 2s ease-in-out infinite alternate;
      }
      @keyframes s4Sync {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes s4Signal {
        to { stroke-dashoffset: -20; }
      }
      @keyframes s4Node {
        0% { transform: scale(0.95); opacity: 0.8; }
        100% { transform: scale(1.08); opacity: 1; }
      }
    </style>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#s4-bg)" />

  <!-- Cloud Synchronization Hub (Top Center) -->
  <g class="cloud-sync-anim" transform="translate(160, 30)">
    <rect width="80" height="50" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
    <!-- Cloud Icon -->
    <path d="M30 33 H 52 A 7 7 0 0 0 52 19 A 11 11 0 0 0 31 23 A 7 7 0 0 0 30 33 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" stroke-width="1.5" />
    <!-- Small Sync Arrow -->
    <path d="M37 28 L 41 24 L 45 28 M41 25 V 31" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Anonymous Fellowship Connections -->
  <!-- Left Believer Node -->
  <g transform="translate(60, 110)">
    <rect width="115" height="60" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.2" />
    <circle cx="26" cy="30" r="14" fill="#0F172A" stroke="#38BDF8" stroke-width="1.2" />
    <path d="M26 23 A 4 4 0 1 1 26 31 A 4 4 0 1 1 26 23 M18 40 C 18 35, 22 34, 26 34 C 30 34, 34 35, 34 40" stroke="#38BDF8" stroke-width="1.2" fill="none" />
    <text x="48" y="27" fill="#F8FAFC" font-family="'Inter', sans-serif" font-size="11" font-weight="700">Poorna</text>
    <text x="48" y="41" fill="#38BDF8" font-family="'Inter', sans-serif" font-size="9" font-weight="600">Praying for you</text>
  </g>

  <!-- Right Believer Node (Companion) -->
  <g transform="translate(225, 110)">
    <rect width="115" height="60" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.2" />
    <circle cx="26" cy="30" r="14" fill="#0F172A" stroke="#A855F7" stroke-width="1.2" />
    <path d="M26 23 A 4 4 0 1 1 26 31 A 4 4 0 1 1 26 23 M18 40 C 18 35, 22 34, 26 34 C 30 34, 34 40" stroke="#A855F7" stroke-width="1.2" fill="none" />
    <text x="48" y="27" fill="#F8FAFC" font-family="'Inter', sans-serif" font-size="11" font-weight="700">Anonymous</text>
    <text x="48" y="41" fill="#A855F7" font-family="'Inter', sans-serif" font-size="9" font-weight="600">Companion</text>
  </g>

  <!-- Connecting Intercession Rays -->
  <path d="M175 140 C 190 140, 210 140, 225 140" stroke="#38BDF8" stroke-width="2" class="signal-line" />
  <path d="M117 110 C 140 90, 160 85, 175 80" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />
  <path d="M282 110 C 260 90, 240 85, 225 80" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />

  <!-- Shield Badge at Center -->
  <g transform="translate(186, 126)" class="node-pulse" style="transform-origin: 200px 140px;">
    <circle cx="14" cy="14" r="13" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5" />
    <path d="M14 6 L 21 9 V 15 C 21 19, 17 22, 14 23 C 11 22, 7 19, 7 15 V 9 Z" fill="rgba(56, 189, 248, 0.25)" stroke="#38BDF8" stroke-width="1.2" />
  </g>

  <!-- Bottom Title Badge -->
  <rect x="70" y="200" width="260" height="24" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
  <text x="200" y="216" text-anchor="middle" fill="#38BDF8" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="0.4">
    100% PRIVATE &#8226; LOCAL &amp; CLOUD SYNC
  </text>
</svg>`;

fs.writeFileSync(path.join(ASSETS_DIR, 'onboarding-step1.svg'), step1Svg);
fs.writeFileSync(path.join(ASSETS_DIR, 'onboarding-step2.svg'), step2Svg);
fs.writeFileSync(path.join(ASSETS_DIR, 'onboarding-step3.svg'), step3Svg);
fs.writeFileSync(path.join(ASSETS_DIR, 'onboarding-step4.svg'), step4Svg);

console.log('Successfully generated all 4 animated onboarding SVG graphics in assets/ directory.');
