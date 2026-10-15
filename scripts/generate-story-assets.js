const fs = require('fs');
const path = require('path');

const STORIES_DIR = path.join(__dirname, '..', 'assets', 'stories');
if (!fs.existsSync(STORIES_DIR)) {
  fs.mkdirSync(STORIES_DIR, { recursive: true });
}

function createTextbookSvg({
  title,
  ref,
  subheading,
  illustrationSvg,
  handwritingText,
  accentColor = '#023E8A'
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 300" fill="none">
  <defs>
    <!-- Textbook Parchment Gradient -->
    <linearGradient id="parchment" x1="0" y1="0" x2="460" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCFAF6" />
      <stop offset="100%" stop-color="#F5EFEB" />
    </linearGradient>
    <linearGradient id="vignette" x1="230" y1="0" x2="230" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#EDE4DC" stop-opacity="0.4" />
    </linearGradient>
    <filter id="etching-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#78350F" flood-opacity="0.1" />
    </filter>
  </defs>

  <!-- Background Plate -->
  <rect width="460" height="300" rx="14" fill="url(#parchment)" />
  <rect x="6" y="6" width="448" height="288" rx="10" fill="url(#vignette)" />

  <!-- Textbook Double Engraved Border -->
  <rect x="12" y="12" width="436" height="276" rx="8" stroke="#D1C2B0" stroke-width="1.5" fill="none" />
  <rect x="16" y="16" width="428" height="268" rx="6" stroke="#9A8470" stroke-width="0.75" stroke-dasharray="4 2" fill="none" />

  <!-- Vintage Corner Filigree Ornaments -->
  <g stroke="#9A8470" stroke-width="1" fill="none">
    <path d="M 22 30 C 22 24, 24 22, 30 22" />
    <circle cx="25" cy="25" r="1.5" fill="#9A8470" />
    <path d="M 438 30 C 438 24, 436 22, 430 22" />
    <circle cx="435" cy="25" r="1.5" fill="#9A8470" />
    <path d="M 22 270 C 22 276, 24 278, 30 278" />
    <circle cx="25" cy="275" r="1.5" fill="#9A8470" />
    <path d="M 438 270 C 438 276, 436 278, 430 278" />
    <circle cx="435" cy="275" r="1.5" fill="#9A8470" />
  </g>

  <!-- Textbook Header Banner -->
  <g transform="translate(230, 36)">
    <text text-anchor="middle" y="0" font-family="'Georgia', serif" font-size="10.5" font-weight="700" letter-spacing="1.5" fill="#8C6D53" text-transform="uppercase">
      &#8226; SACRED SCRIPTURE PRAYER DIARY &#8226;
    </text>
    <line x1="-120" y1="6" x2="120" y2="6" stroke="#C2B29F" stroke-width="0.8" />
  </g>

  <!-- Title & Reference -->
  <text x="230" y="62" text-anchor="middle" font-family="'Georgia', serif" font-size="17" font-weight="700" fill="#2C1A0E" letter-spacing="-0.3">
    ${title}
  </text>
  <text x="230" y="78" text-anchor="middle" font-family="'Georgia', serif" font-size="11" font-style="italic" fill="#785B43">
    ${ref} &#8226; ${subheading}
  </text>

  <!-- Textbook Engraved Illustration Frame -->
  <g transform="translate(30, 90)">
    <rect width="400" height="130" rx="8" fill="#FDFBF8" stroke="#CBB9A5" stroke-width="1.2" />
    <rect x="3" y="3" width="394" height="124" rx="6" fill="#F9F5EF" stroke="#E6DCD1" stroke-width="0.8" />

    <!-- Custom Illustration SVG Elements -->
    ${illustrationSvg}
  </g>

  <!-- Bottom Handwriting Manuscript Box -->
  <g transform="translate(30, 230)">
    <rect width="400" height="48" rx="6" fill="#F4EDE4" stroke="#D8C7B4" stroke-width="0.8" />
    
    <!-- Quill Icon -->
    <path d="M 14 30 Q 18 16, 26 12 Q 22 22, 18 28 Z M 14 30 L 12 36 L 16 32" fill="#8C6D53" opacity="0.75" />

    <!-- Handwriting Script Quote -->
    <text x="36" y="22" font-family="'Georgia', serif" font-style="italic" font-size="11.5" fill="#3D2817">
      "${handwritingText.line1}"
    </text>
    <text x="36" y="38" font-family="'Georgia', serif" font-style="italic" font-size="10.5" fill="#6B4B32">
      ${handwritingText.line2}
    </text>
  </g>
</svg>`;
}

// 1. Hannah's Prayer of Silent Faith
const hannahSvg = createTextbookSvg({
  title: "Hannah's Whispered Prayer of Faith",
  ref: "1 Samuel 1:12-20",
  subheading: "God Hears the Silent Heart",
  handwritingText: {
    line1: "She spoke in her heart; only her lips moved, but her voice was not heard.",
    line2: "The Lord remembered her: 'For this child I prayed, and the Lord granted my petition.'"
  },
  illustrationSvg: `
    <!-- Temple Pillars & Lampstand -->
    <g stroke="#8C6D53" stroke-width="1.2" fill="none" opacity="0.8">
      <rect x="25" y="15" width="22" height="96" rx="2" fill="#F0E6D8" />
      <rect x="353" y="15" width="22" height="96" rx="2" fill="#F0E6D8" />
      <line x1="20" y1="15" x2="52" y2="15" stroke-width="2" />
      <line x1="348" y1="15" x2="380" y2="15" stroke-width="2" />
    </g>

    <!-- Hannah Kneeling in Reverent Intercession -->
    <g transform="translate(195, 30)">
      <!-- Radiance Halo -->
      <circle cx="5" cy="18" r="32" fill="rgba(217, 119, 6, 0.12)" stroke="#E5C397" stroke-dasharray="2 2" />
      
      <!-- Silhouette Kneeling -->
      <path d="M 5 10 A 7 7 0 1 1 5 24 A 7 7 0 1 1 5 10" fill="#6B4B32" />
      <path d="M 3 24 Q -4 42, -12 65 L 22 65 Q 14 42, 7 24 Z" fill="#7D573B" />
      <!-- Hands Clasped to Heart -->
      <path d="M -2 34 Q 4 30, 8 35 Q 4 40, -2 36 Z" fill="#D4AF37" stroke="#6B4B32" stroke-width="0.8" />
      <!-- Incense of Prayer Rising to Heaven -->
      <path d="M 6 4 Q 10 -4, 4 -12 Q -2 -20, 6 -28" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" fill="none" stroke-dasharray="3 2" />
      <path d="M 12 6 Q 18 -2, 12 -10 Q 6 -18, 14 -26" stroke="#D97706" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.7" />
    </g>

    <!-- Eli the High Priest observing -->
    <g transform="translate(90, 42)" opacity="0.75">
      <circle cx="0" cy="12" r="6" fill="#8C6D53" />
      <path d="M -2 18 L -8 52 L 6 52 L 2 18 Z" fill="#A88B74" />
      <text x="-12" y="64" font-family="'Georgia', serif" font-size="8.5" fill="#8C6D53">Eli watching</text>
    </g>

    <text x="290" y="55" font-family="'Georgia', serif" font-size="10" font-weight="700" fill="#6B4B32">Key Principle:</text>
    <text x="290" y="70" font-family="'Georgia', serif" font-size="9" fill="#8C6D53">Pouring out one's soul</text>
    <text x="290" y="83" font-family="'Georgia', serif" font-size="9" fill="#8C6D53">before the Lord in</text>
    <text x="290" y="96" font-family="'Georgia', serif" font-size="9" fill="#8C6D53">unshakable humility.</text>
  `
});

// 2. Elijah on Mount Carmel
const elijahSvg = createTextbookSvg({
  title: "Elijah's Fire on Mount Carmel",
  ref: "1 Kings 18:36-39",
  subheading: "A Bold 63-Word Prayer That Answered with Fire",
  handwritingText: {
    line1: "Lord God of Abraham, Isaac, and Israel, let it be known this day that You are God.",
    line2: "Then the fire of the Lord fell, and consumed the burnt sacrifice... and all the people fell on their faces."
  },
  illustrationSvg: `
    <!-- Stone Altar of Twelve Stones -->
    <g transform="translate(180, 50)">
      <!-- 12 Stones Structure -->
      <rect x="0" y="40" width="40" height="25" rx="3" fill="#A89F91" stroke="#6E6557" stroke-width="1.2" />
      <rect x="-8" y="28" width="56" height="14" rx="2" fill="#BCB3A6" stroke="#6E6557" stroke-width="1" />
      <!-- Water Trench Around Altar -->
      <ellipse cx="20" cy="66" rx="46" ry="8" fill="#DCEBF7" stroke="#7BA4C7" stroke-width="1" />
      
      <!-- Fire Descending from Heaven -->
      <path d="M 20 -25 L 14 15 L 23 5 L 17 28 L 26 22 L 20 40" stroke="#DC2626" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 20 -25 L 16 12 L 24 8 L 18 24 L 22 36" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" fill="none" />
      <circle cx="20" cy="30" r="14" fill="rgba(245, 158, 11, 0.25)" />
    </g>

    <!-- Elijah with Arms Outstretched in Bold Faith -->
    <g transform="translate(90, 48)">
      <circle cx="15" cy="12" r="6" fill="#5B3A29" />
      <path d="M 15 18 L 11 60 L 21 60 Z" fill="#6E4A35" />
      <!-- Raised Hands -->
      <path d="M 15 24 L 2 12 M 15 24 L 28 12" stroke="#5B3A29" stroke-width="2" stroke-linecap="round" />
      <text x="0" y="74" font-family="'Georgia', serif" font-size="8.5" fill="#6B4B32">Elijah's Stand</text>
    </g>

    <!-- Crowd falling on faces -->
    <g transform="translate(300, 75)" opacity="0.8">
      <ellipse cx="20" cy="16" rx="30" ry="6" fill="#8C6D53" />
      <text x="20" y="36" text-anchor="middle" font-family="'Georgia', serif" font-size="9" font-style="italic" fill="#785B43">
        "The Lord, He is God!"
      </text>
    </g>
  `
});

// 3. Daniel's Three-Times-Daily Prayer
const danielSvg = createTextbookSvg({
  title: "Daniel's Uncompromised Prayer Chamber",
  ref: "Daniel 6:10-23",
  subheading: "Three Times Daily Facing Jerusalem",
  handwritingText: {
    line1: "His windows being open in his chamber toward Jerusalem, he kneeled upon his knees",
    line2: "three times a day, and prayed, and gave thanks before his God, as he did aforetime."
  },
  illustrationSvg: `
    <!-- Arched Window Looking toward Jerusalem -->
    <g transform="translate(170, 15)">
      <!-- Chamber Wall & Arch -->
      <path d="M 0 100 L 0 35 Q 30 5, 60 35 L 60 100 Z" fill="#E8DED1" stroke="#8C6D53" stroke-width="1.5" />
      <!-- Window Grate Open to Sky -->
      <path d="M 6 96 L 6 36 Q 30 14, 54 36 L 54 96 Z" fill="#DCEBFA" stroke="#9A8470" stroke-width="1" />
      <line x1="30" y1="12" x2="30" y2="96" stroke="#8C6D53" stroke-width="1" />
      <line x1="6" y1="55" x2="54" y2="55" stroke="#8C6D53" stroke-width="1" />
      <!-- Distant Temple Hill Horizon -->
      <path d="M 10 75 Q 30 65, 50 75" stroke="#D97706" stroke-width="1.5" fill="none" opacity="0.8" />
    </g>

    <!-- Daniel Kneeling in Habitual Consistency -->
    <g transform="translate(100, 50)">
      <circle cx="16" cy="14" r="7" fill="#4A3525" />
      <path d="M 16 21 Q 8 38, 2 56 L 30 56 Q 24 38, 16 21 Z" fill="#5E4330" />
      <path d="M 14 30 L 26 26" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" />
      <text x="-10" y="70" font-family="'Georgia', serif" font-size="8.5" fill="#6B4B32">Morning &#8226; Noon &#8226; Evening</text>
    </g>

    <!-- Peaceful Lion in Den with mouth shut -->
    <g transform="translate(290, 48)">
      <rect x="0" y="0" width="90" height="66" rx="6" fill="#F0E6D8" stroke="#D1C2B0" stroke-width="1" />
      <!-- Lion Silhouette Resting Peacefully -->
      <ellipse cx="45" cy="38" rx="28" ry="14" fill="#C29B38" />
      <circle cx="28" cy="28" r="10" fill="#A87F25" />
      <circle cx="45" cy="20" r="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" stroke-dasharray="2 2" />
      <text x="45" y="58" text-anchor="middle" font-family="'Georgia', serif" font-size="8" fill="#6B4B32">Angel shut the lions' mouths</text>
    </g>
  `
});

// 4. Jesus in Gethsemane
const gethsemaneSvg = createTextbookSvg({
  title: "Jesus in the Garden of Gethsemane",
  ref: "Luke 22:39-46",
  subheading: "The Ultimate Prayer of Surrender: 'Not My Will, But Thine'",
  handwritingText: {
    line1: "Father, if thou be willing, remove this cup from me: nevertheless not my will,",
    line2: "but thine, be done. And there appeared an angel unto him from heaven, strengthening him."
  },
  illustrationSvg: `
    <!-- Olive Trees Silhouette & Moonlight -->
    <g transform="translate(30, 20)">
      <!-- Gnarled Olive Tree -->
      <path d="M 40 100 Q 30 65, 45 45 Q 60 30, 50 15 Q 70 25, 75 45 Q 85 70, 70 100 Z" fill="#4B5E43" opacity="0.75" />
      <circle cx="55" cy="25" r="24" fill="#3D4F36" opacity="0.6" />
      <!-- Full Moon in Night Sky -->
      <circle cx="340" cy="25" r="18" fill="#FFFDF0" stroke="#E2D9BC" stroke-width="1.5" />
      <circle cx="340" cy="25" r="28" fill="rgba(255, 253, 240, 0.15)" />
    </g>

    <!-- The Savior Praying at the Rock -->
    <g transform="translate(180, 42)">
      <!-- Gethsemane Rock -->
      <ellipse cx="20" cy="62" rx="36" ry="15" fill="#786B59" stroke="#5A4F40" stroke-width="1" />
      
      <!-- Christ Kneeling with Hands Clasping the Rock -->
      <circle cx="20" cy="18" r="8" fill="#3E2723" />
      <circle cx="20" cy="18" r="14" fill="rgba(251, 191, 36, 0.2)" stroke="#FBBF24" stroke-width="0.8" />
      <path d="M 20 26 Q 8 42, 4 60 L 36 60 Q 32 42, 20 26 Z" fill="#5D4037" />
      <path d="M 12 38 Q 20 32, 28 38" stroke="#D7CCC8" stroke-width="1.5" stroke-linecap="round" />

      <!-- Angelic Light Ray from Heaven -->
      <line x1="20" y1="-20" x2="20" y2="8" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2" />
    </g>

    <text x="325" y="75" font-family="'Georgia', serif" font-size="9.5" font-weight="700" fill="#3D4F36">Garden Peace:</text>
    <text x="325" y="88" font-family="'Georgia', serif" font-size="8.5" fill="#5B6E54">Peace comes from</text>
    <text x="325" y="100" font-family="'Georgia', serif" font-size="8.5" fill="#5B6E54">complete surrender.</text>
  `
});

// 5. Nehemiah's Arrow Prayer
const nehemiahSvg = createTextbookSvg({
  title: "Nehemiah's Silent Arrow Prayer",
  ref: "Nehemiah 2:1-8",
  subheading: "Instant Silent Prayer in the King's Presence",
  handwritingText: {
    line1: "The king said unto me, 'For what dost thou make request?' So I prayed to the God of heaven,",
    line2: "and I said unto the king... And the king granted me, according to the good hand of my God upon me."
  },
  illustrationSvg: `
    <!-- Royal Persian Palace Throne Room & Cupbearer -->
    <g transform="translate(60, 20)">
      <!-- Royal Palace Column -->
      <rect x="20" y="10" width="16" height="90" fill="#D4AF37" stroke="#997D21" stroke-width="1" />
      <polygon points="12,10 44,10 28,0" fill="#997D21" />

      <!-- King Artaxerxes Seated on Throne -->
      <g transform="translate(60, 25)">
        <rect x="0" y="20" width="35" height="50" rx="3" fill="#6B21A8" stroke="#4C1D95" stroke-width="1" />
        <circle cx="16" cy="14" r="6" fill="#FCD34D" />
        <text x="16" y="82" text-anchor="middle" font-family="'Georgia', serif" font-size="8" fill="#6B21A8">King of Persia</text>
      </g>
    </g>

    <!-- Nehemiah Holding Golden Cup, Praying Silently in Heart -->
    <g transform="translate(220, 35)">
      <!-- Golden Cup in Hand -->
      <path d="M 0 35 L 6 35 L 8 46 L -2 46 Z" fill="#F59E0B" stroke="#B45309" stroke-width="0.8" />
      <path d="M 3 46 L 3 54 L -2 54 L 8 54" stroke="#B45309" stroke-width="1" />

      <!-- Nehemiah Figure -->
      <circle cx="25" cy="16" r="7" fill="#451A03" />
      <path d="M 25 23 L 15 65 L 35 65 Z" fill="#78350F" />
      
      <!-- Silent Arrow Prayer Rising Directly to God of Heaven -->
      <line x1="25" y1="8" x2="25" y2="-15" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
      <polygon points="21,-13 29,-13 25,-22" fill="#38BDF8" />
      <text x="36" y="-6" font-family="'Georgia', serif" font-size="8" font-weight="700" fill="#0284C7">Arrow Prayer</text>
    </g>

    <!-- Jerusalem Walls Being Rebuilt in Distance -->
    <g transform="translate(320, 50)" opacity="0.8">
      <rect x="0" y="25" width="60" height="25" fill="#D1C2B0" stroke="#8C6D53" stroke-width="1" />
      <polygon points="5,25 10,20 15,25 20,20 25,25 30,20 35,25 40,20 45,25 50,20 55,25" fill="#8C6D53" />
      <text x="30" y="60" text-anchor="middle" font-family="'Georgia', serif" font-size="8" fill="#785B43">Walls Rebuilt</text>
    </g>
  `
});

// 6. Paul and Silas Midnight Prison Praise
const paulSilasSvg = createTextbookSvg({
  title: "Paul & Silas: Midnight Prison Hymns",
  ref: "Acts 16:25-34",
  subheading: "Praise & Prayer That Shook the Foundations",
  handwritingText: {
    line1: "And at midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them.",
    line2: "And suddenly there was a great earthquake, so that the foundations of the prison were shaken."
  },
  illustrationSvg: `
    <!-- Stone Prison Cell with Iron Bars -->
    <g transform="translate(50, 15)">
      <rect x="0" y="0" width="300" height="100" rx="4" fill="#334155" opacity="0.15" />
      <!-- Iron Prison Bars -->
      <line x1="40" y1="0" x2="40" y2="100" stroke="#475569" stroke-width="2" />
      <line x1="80" y1="0" x2="80" y2="100" stroke="#475569" stroke-width="2" />
      <line x1="120" y1="0" x2="120" y2="100" stroke="#475569" stroke-width="2" />
      <line x1="160" y1="0" x2="160" y2="100" stroke="#475569" stroke-width="2" />
      <line x1="200" y1="0" x2="200" y2="100" stroke="#475569" stroke-width="2" />
      <line x1="240" y1="0" x2="240" y2="100" stroke="#475569" stroke-width="2" />
    </g>

    <!-- Paul and Silas in Wooden Stocks, Singing Praises -->
    <g transform="translate(140, 42)">
      <!-- Paul -->
      <circle cx="20" cy="14" r="6" fill="#1E293B" />
      <path d="M 20 20 L 12 55 L 28 55 Z" fill="#334155" />
      <!-- Silas -->
      <circle cx="48" cy="14" r="6" fill="#1E293B" />
      <path d="M 48 20 L 40 55 L 56 55 Z" fill="#334155" />

      <!-- Broken Chains -->
      <path d="M 8 50 Q -5 45, -2 40" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M 60 50 Q 72 45, 69 40" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" fill="none" />

      <!-- Musical Notes of Midnight Praise -->
      <g fill="#F59E0B">
        <circle cx="28" cy="-5" r="3" />
        <line x1="31" y1="-5" x2="31" y2="-18" stroke="#F59E0B" stroke-width="1.5" />
        <circle cx="42" cy="-10" r="3" />
        <line x1="45" y1="-10" x2="45" y2="-22" stroke="#F59E0B" stroke-width="1.5" />
      </g>
    </g>

    <text x="310" y="55" font-family="'Georgia', serif" font-size="9" font-weight="700" fill="#1E293B">Prison Opened:</text>
    <text x="310" y="68" font-family="'Georgia', serif" font-size="8.5" fill="#475569">Chains broke loose,</text>
    <text x="310" y="80" font-family="'Georgia', serif" font-size="8.5" fill="#475569">jailer found Christ.</text>
  `
});

// 7. Solomon's Prayer for Wisdom
const solomonSvg = createTextbookSvg({
  title: "Solomon's Prayer for Wisdom",
  ref: "1 Kings 3:5-14",
  subheading: "Asking for a Discerning Heart to Serve Others",
  handwritingText: {
    line1: "Give therefore thy servant an understanding heart to judge thy people, that I may discern",
    line2: "between good and bad... And the speech pleased the Lord, that Solomon had asked this thing."
  },
  illustrationSvg: `
    <!-- Royal Scales of Discernment & Scroll -->
    <g transform="translate(190, 25)">
      <!-- Golden Scales of Justice & Discernment -->
      <line x1="20" y1="10" x2="20" y2="70" stroke="#B45309" stroke-width="2.5" />
      <line x1="-25" y1="25" x2="65" y2="25" stroke="#B45309" stroke-width="2" />
      <circle cx="20" cy="10" r="4" fill="#F59E0B" />
      
      <!-- Left Pan -->
      <path d="M -25 25 L -35 50 L -15 50 Z" stroke="#D97706" stroke-width="1" fill="rgba(245, 158, 11, 0.2)" />
      <!-- Right Pan -->
      <path d="M 65 25 L 55 50 L 75 50 Z" stroke="#D97706" stroke-width="1" fill="rgba(245, 158, 11, 0.2)" />
      
      <!-- Base of Scales -->
      <line x1="5" y1="70" x2="35" y2="70" stroke="#B45309" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Young Solomon Kneeling Before the Open Sacred Torah Scroll -->
    <g transform="translate(80, 45)">
      <circle cx="20" cy="14" r="7" fill="#78350F" />
      <polygon points="15,6 25,6 27,2 20,0 13,2" fill="#F59E0B" /> <!-- Crown -->
      <path d="M 20 21 L 10 60 L 30 60 Z" fill="#92400E" />
      <!-- Scroll in Front -->
      <rect x="34" y="45" width="30" height="15" rx="2" fill="#FFFBEB" stroke="#D97706" stroke-width="1" />
      <text x="49" y="56" text-anchor="middle" font-family="'Georgia', serif" font-size="7" fill="#B45309">WISDOM</text>
    </g>

    <text x="315" y="55" font-family="'Georgia', serif" font-size="9" font-weight="700" fill="#92400E">God's Response:</text>
    <text x="315" y="68" font-family="'Georgia', serif" font-size="8.5" fill="#B45309">Given wisdom, plus</text>
    <text x="315" y="80" font-family="'Georgia', serif" font-size="8.5" fill="#B45309">honor and peace.</text>
  `
});

// 8. Hezekiah Spreading the Letter
const hezekiahSvg = createTextbookSvg({
  title: "Hezekiah Spreading the Letter Before the Lord",
  ref: "2 Kings 19:14-19",
  subheading: "Laying Anxious Threatening Letters Before God",
  handwritingText: {
    line1: "Hezekiah received the letter of the hand of the messengers, and read it:",
    line2: "and Hezekiah went up into the house of the Lord, and spread it before the Lord. And Hezekiah prayed."
  },
  illustrationSvg: `
    <!-- Temple Sanctuary Floor & Ark/Mercy Seat Silhouette -->
    <g transform="translate(40, 20)">
      <line x1="0" y1="85" x2="320" y2="85" stroke="#C2B29F" stroke-width="1.5" />
      <!-- Temple Veil & Golden Lampstand -->
      <path d="M 30 15 L 30 85 M 45 35 Q 30 45, 30 60" stroke="#D97706" stroke-width="1.2" fill="none" opacity="0.6" />
    </g>

    <!-- The Letter Laid Out Flat on Sanctuary Floor -->
    <g transform="translate(170, 50)">
      <!-- Unrolled Letter Scroll on Floor -->
      <rect x="0" y="24" width="65" height="30" rx="2" fill="#FFFFFF" stroke="#9A8470" stroke-width="1" />
      <line x1="8" y1="32" x2="57" y2="32" stroke="#CBD5E1" stroke-width="1.5" />
      <line x1="8" y1="38" x2="57" y2="38" stroke="#CBD5E1" stroke-width="1.5" />
      <line x1="8" y1="44" x2="45" y2="44" stroke="#CBD5E1" stroke-width="1.5" />

      <!-- Light Radiating Upward from the Spread Letter to Heaven -->
      <path d="M 0 24 L 18 -10 M 65 24 L 47 -10" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3 2" />
      <text x="32" y="10" text-anchor="middle" font-family="'Georgia', serif" font-size="8" font-weight="700" fill="#0284C7">Surrendered to God</text>
    </g>

    <!-- King Hezekiah Kneeling with Outstretched Hands -->
    <g transform="translate(100, 40)">
      <circle cx="20" cy="14" r="7" fill="#312E81" />
      <path d="M 20 21 L 10 65 L 30 65 Z" fill="#3730A3" />
      <!-- Hands pointing to the letter -->
      <path d="M 22 35 L 38 48" stroke="#C7D2FE" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <text x="300" y="55" font-family="'Georgia', serif" font-size="9" font-weight="700" fill="#312E81">Deliverance:</text>
    <text x="300" y="68" font-family="'Georgia', serif" font-size="8.5" fill="#4338CA">185,000 enemy army</text>
    <text x="300" y="80" font-family="'Georgia', serif" font-size="8.5" fill="#4338CA">defeated overnight.</text>
  `
});

fs.writeFileSync(path.join(STORIES_DIR, 'story-hannah.svg'), hannahSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-elijah.svg'), elijahSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-daniel.svg'), danielSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-gethsemane.svg'), gethsemaneSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-nehemiah.svg'), nehemiahSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-paul-silas.svg'), paulSilasSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-solomon.svg'), solomonSvg);
fs.writeFileSync(path.join(STORIES_DIR, 'story-hezekiah.svg'), hezekiahSvg);

console.log('Successfully generated all 8 textbook-style Bible prayer story vector assets in assets/stories/');
