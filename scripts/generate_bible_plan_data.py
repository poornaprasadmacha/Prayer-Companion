#!/usr/bin/env python3
"""
Generate js/bible-plan-data.js containing:
1. Plan 1: OT followed by NT (Genesis to Revelation from PDF)
2. Plan 2: Morning NT + Night OT (Balanced daily reading)
3. 52 Real-Life Sunday Worship Readings
4. 365 Daily Reflections on the Essential Power & Necessity of Prayer
Clean, direct, zero marketing jargon, zero heavy words.
"""

import os, re, json, pypdf

PDF_PATH = r"C:\Users\poorn\.gemini\antigravity\brain\841de505-e50f-495c-8cda-2c87f00f9279\.user_uploaded\media_1792255037880_598904a4.pdf"

# 1. EXTRACT PLAN 1 FROM PDF
reader = pypdf.PdfReader(PDF_PATH)
plan1_raw = []
months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
current_month = None

for page in reader.pages:
    txt = page.extract_text()
    for raw_line in txt.split('\n'):
        line = raw_line.strip()
        if not line or '365 DAY' in line or 'READ THE BIBLE' in line or 'iphc.org' in line:
            continue
        if line in months:
            current_month = line
            continue
        m = re.match(r'^[pq\u25a1\u25a0\W]*\s*(\d+)\s+(.+)$', line)
        if m and current_month:
            reading = m.group(2).strip().rstrip(' ,;')
            reading = re.sub(r'\s+', ' ', reading)
            plan1_raw.append(reading)

assert len(plan1_raw) == 365, f"Expected 365 days, got {len(plan1_raw)}"

# 2. 52 REAL-LIFE SUNDAY WORSHIP READINGS (FOR ACTUAL SUNDAYS)
SUNDAY_WORSHIP = [
    {"passage": "Psalm 8 & 19", "theme": "Majesty of God", "verse": "O Lord, our Lord, how majestic is your name in all the earth!"},
    {"passage": "Psalm 23 & 24", "theme": "The Good Shepherd", "verse": "The Lord is my shepherd; I shall not want."},
    {"passage": "Psalm 27", "theme": "Light and Salvation", "verse": "The Lord is my light and my salvation; whom shall I fear?"},
    {"passage": "Psalm 33", "theme": "Joy in the Lord", "verse": "Shout for joy in the Lord, O you righteous! Praise befits the upright."},
    {"passage": "Psalm 34", "theme": "Continual Praise", "verse": "I will bless the Lord at all times; his praise shall continually be in my mouth."},
    {"passage": "Psalm 42 & 43", "theme": "Thirsting for God", "verse": "As a deer pants for flowing streams, so pants my soul for you, O God."},
    {"passage": "Psalm 46 & 47", "theme": "Refuge & Strength", "verse": "God is our refuge and strength, a very present help in trouble."},
    {"passage": "Psalm 63", "theme": "Seeking God's Face", "verse": "O God, you are my God; earnestly I seek you; my soul thirsts for you."},
    {"passage": "Psalm 65 & 66", "theme": "Awesome Works", "verse": "Shout for joy to God, all the earth; sing the glory of his name!"},
    {"passage": "Psalm 67 & 68", "theme": "Grace to the Nations", "verse": "May God be gracious to us and bless us and make his face to shine upon us."},
    {"passage": "Psalm 84", "theme": "Courts of the Lord", "verse": "Better is one day in your courts than a thousand elsewhere."},
    {"passage": "Psalm 86 & 89:1-18", "theme": "Steadfast Love", "verse": "I will sing of the steadfast love of the Lord forever."},
    {"passage": "Psalm 90 & 91", "theme": "Secret Place of the Most High", "verse": "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty."},
    {"passage": "Psalm 95 & 96", "theme": "Sing to the Lord", "verse": "Oh come, let us sing to the Lord; let us make a joyful noise to the rock of our salvation!"},
    {"passage": "Psalm 98 & 99", "theme": "A New Song", "verse": "Oh sing to the Lord a new song, for he has done marvelous things!"},
    {"passage": "Psalm 100 & 101", "theme": "Thanksgiving & Praise", "verse": "Enter his gates with thanksgiving, and his courts with praise!"},
    {"passage": "Psalm 103", "theme": "Bless the Lord, O My Soul", "verse": "Bless the Lord, O my soul, and forget not all his benefits."},
    {"passage": "Psalm 104", "theme": "Greatness in Creation", "verse": "Bless the Lord, O my soul! O Lord my God, you are very great."},
    {"passage": "Psalm 111 & 112", "theme": "Praise for God's Works", "verse": "Great are the works of the Lord, studied by all who delight in them."},
    {"passage": "Psalm 113 & 114", "theme": "From Rising of the Sun", "verse": "From the rising of the sun to its setting, the name of the Lord is to be praised!"},
    {"passage": "Psalm 115 & 116", "theme": "To Your Name Give Glory", "verse": "Not to us, O Lord, not to us, but to your name give glory."},
    {"passage": "Psalm 118", "theme": "Enduring Mercy", "verse": "This is the day that the Lord has made; let us rejoice and be glad in it."},
    {"passage": "Psalm 121 & 122", "theme": "The Lord Your Keeper", "verse": "My help comes from the Lord, who made heaven and earth."},
    {"passage": "Psalm 125 & 126", "theme": "Unshakable Trust", "verse": "Those who trust in the Lord are like Mount Zion, which cannot be moved."},
    {"passage": "Psalm 130 & 131", "theme": "Quiet Hope", "verse": "I wait for the Lord, my soul waits, and in his word I hope."},
    {"passage": "Psalm 134 & 136", "theme": "Eternal Mercy", "verse": "Give thanks to the Lord, for he is good, for his steadfast love endures forever."},
    {"passage": "Psalm 138 & 139", "theme": "Known and Loved", "verse": "I praise you, for I am fearfully and wonderfully made."},
    {"passage": "Psalm 143 & 144", "theme": "Cry for Guidance", "verse": "Teach me to do your will, for you are my God! Let your good Spirit lead me."},
    {"passage": "Psalm 145", "theme": "Extolling the King", "verse": "The Lord is near to all who call on him, to all who call on him in truth."},
    {"passage": "Psalm 146 & 147", "theme": "He Heals Broken Hearts", "verse": "The Lord builds up Jerusalem; he heals the brokenhearted and binds up their wounds."},
    {"passage": "Psalm 148, 149 & 150", "theme": "Everything Praise the Lord", "verse": "Let everything that has breath praise the Lord! Praise the Lord!"},
    {"passage": "Exodus 15:1-18", "theme": "Song of Deliverance", "verse": "The Lord is my strength and my song, and he has become my salvation."},
    {"passage": "1 Samuel 2:1-10", "theme": "Hannah's Song", "verse": "There is none holy like the Lord: for there is none besides you."},
    {"passage": "2 Samuel 22:1-20", "theme": "The Rock of Refuge", "verse": "The Lord is my rock and my fortress and my deliverer."},
    {"passage": "1 Chronicles 16:8-36", "theme": "Thanksgiving at the Ark", "verse": "Oh give thanks to the Lord; call upon his name; make known his deeds among the peoples!"},
    {"passage": "1 Chronicles 29:10-18", "theme": "Yours is the Greatness", "verse": "Yours, O Lord, is the greatness and the power and the glory and the victory."},
    {"passage": "2 Chronicles 20:5-22", "theme": "Battlefield Praise", "verse": "Give thanks to the Lord, for his steadfast love endures forever."},
    {"passage": "Isaiah 6:1-8", "theme": "Holy, Holy, Holy", "verse": "Holy, holy, holy is the Lord of hosts; the whole earth is full of his glory!"},
    {"passage": "Isaiah 12 & 25", "theme": "Wells of Salvation", "verse": "Behold, God is my salvation; I will trust, and will not be afraid."},
    {"passage": "Isaiah 40:21-31", "theme": "Waiting on the Lord", "verse": "They who wait for the Lord shall renew their strength; they shall mount up with wings like eagles."},
    {"passage": "Habakkuk 3:1-19", "theme": "Joy in God My Savior", "verse": "Yet I will rejoice in the Lord; I will take joy in the God of my salvation."},
    {"passage": "Luke 1:46-55", "theme": "Mary's Magnificat", "verse": "My soul magnifies the Lord, and my spirit rejoices in God my Savior."},
    {"passage": "Luke 1:68-79", "theme": "Zechariah's Benedictus", "verse": "Blessed be the Lord God of Israel, for he has visited and redeemed his people."},
    {"passage": "Romans 11:33-36", "theme": "Unsearchable Wisdom", "verse": "Oh, the depth of the riches and wisdom and knowledge of God! To him be glory forever."},
    {"passage": "Ephesians 1:3-14", "theme": "Every Spiritual Blessing", "verse": "Blessed be the God and Father of our Lord Jesus Christ, who has blessed us in Christ."},
    {"passage": "Ephesians 3:14-21", "theme": "Far More Abundantly", "verse": "Now to him who is able to do far more abundantly than all that we ask or think."},
    {"passage": "Philippians 2:5-11", "theme": "The Name Above All Names", "verse": "At the name of Jesus every knee should bow, in heaven and on earth."},
    {"passage": "Colossians 1:15-20", "theme": "Preeminence of Christ", "verse": "He is the image of the invisible God, the firstborn of all creation."},
    {"passage": "1 Timothy 1:17 & 6:15", "theme": "King of the Ages", "verse": "To the King of the ages, immortal, invisible, the only God, be honor and glory forever."},
    {"passage": "Hebrews 1:1-4", "theme": "Radiance of God's Glory", "verse": "He is the radiance of the glory of God and the exact imprint of his nature."},
    {"passage": "Revelation 4:8-11 & 5:9-14", "theme": "Worthy is the Lamb", "verse": "Worthy are you, our Lord and God, to receive glory and honor and power!"},
    {"passage": "Revelation 19:1-8 & 22", "theme": "The Lord Reigns", "verse": "Hallelujah! For the Lord our God the Almighty reigns."}
]

# 3. CONCISE PRAYER WISDOM (NO FILLER, PURE TRUTH)
PRAYER_WISDOM_LIST = [
    "Prayer is not overcoming God's reluctance; it is laying hold of His willingness.",
    "To be a Christian without prayer is no more possible than to be alive without breathing.",
    "Begin your day speaking to God before you speak to the world.",
    "Worry looks around; fear looks back; but prayer looks up to God.",
    "When you enter your room and close the door, you shut out distraction and welcome peace.",
    "Prayer acknowledges human limitation and invites God's strength to work.",
    "Trouble drives the praying heart deeper into the peace of God.",
    "To pray without ceasing means maintaining a continual awareness of God throughout your day.",
    "True prayer asks with confidence, knowing God is faithful and good.",
    "Half of prayer is the stillness that waits to hear God's gentle guidance.",
    "The greatest prayer is not bending God's will to ours, but aligning our hearts with His.",
    "Do not be anxious about anything, but in everything by prayer, present your heart to God.",
    "Fervent prayer surrounds the fragile heart with the steadfast peace of God.",
    "When you open Scripture and pray, you walk closely in the presence of Christ.",
    "Never stop praying for those you love. God hears every sincere whisper.",
    "Gratitude in prayer turns what little we have into enough.",
    "God pours grace upon the humble heart that kneels in sincere dependence.",
    "Pouring out our struggles honestly before God unlocks His cleansing peace.",
    "When the storm rises, prayer is the spiritual anchor that keeps your soul steady.",
    "They that wait upon the Lord in prayer shall renew their strength.",
    "If earthly parents know how to give good gifts, how much more will your Father in heaven give good things to those who ask.",
    "Time spent in earnest prayer accomplishes what human striving cannot.",
    "Prayer keeps our spiritual sight clear so we can walk in truth and wisdom.",
    "Praying for another is one of the purest expressions of selfless love.",
    "Be still, and know that I am God. In silent prayer, God quietens our worries.",
    "In all your ways acknowledge God through prayer, and He shall direct your paths.",
    "God is our refuge and strength, a very present help in trouble; prayer is resting in Him.",
    "Prayer is the quiet trust that leaves the outcome entirely in God's hands.",
    "Create in me a clean heart, O God; renew a right spirit within me.",
    "As night falls, lay down your burdens. He who watches over you neither slumbers nor sleeps.",
    "Prayer changes us from the inside out, aligning our desires with eternity.",
    "God never tires of hearing the honest cries and thanksgiving of His children.",
    "The simplest prayer spoken in sincerity reaches heaven faster than elaborate speeches.",
    "Faith is the key, but prayer is the turning of that key in the door of grace.",
    "When you feel weakest, that is when prayer becomes your greatest strength.",
    "A day begun in prayer is a day anchored in wisdom and calm.",
    "Prayer does not demand answers on our schedule; it trusts God's perfect timing.",
    "Cast all your anxiety upon Him, because He cares for you.",
    "In the quiet place of prayer, God replaces restlessness with His deep peace.",
    "No prayer offered in faith is ever wasted or forgotten by God."
]

def get_wisdom(day_num):
    text = PRAYER_WISDOM_LIST[(day_num - 1) % len(PRAYER_WISDOM_LIST)]
    return {"text": text}

# 4. BUILD PLAN 1 (OT followed by NT)
plan1_days = []
for i, reading in enumerate(plan1_raw):
    day_num = i + 1
    plan1_days.append({
        "day": day_num,
        "reading": reading,
        "prayerWisdom": get_wisdom(day_num)
    })

# 5. BUILD PLAN 2 (Morning NT + Night OT)
nt_chapters = []
for b, c in [
    ("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21),
    ("Acts", 28), ("Romans", 16), ("1 Corinthians", 16), ("2 Corinthians", 13),
    ("Galatians", 6), ("Ephesians", 6), ("Philippians", 4), ("Colossians", 4),
    ("1 Thessalonians", 5), ("2 Thessalonians", 3), ("1 Timothy", 6), ("2 Timothy", 4),
    ("Titus", 3), ("Philemon", 1), ("Hebrews", 13), ("James", 5),
    ("1 Peter", 5), ("2 Peter", 3), ("1 John", 5), ("2 John", 1),
    ("3 John", 1), ("Jude", 1), ("Revelation", 22)
]:
    for ch in range(1, c + 1):
        nt_chapters.append(f"{b} {ch}")

devotional_summits = [
    "Matthew 5", "Matthew 6", "Matthew 7", "Matthew 28", "Mark 12",
    "Luke 10", "Luke 15", "John 1", "John 3", "John 10", "John 14", "John 15", "John 17",
    "Acts 2", "Romans 5", "Romans 8", "Romans 12", "1 Corinthians 13", "1 Corinthians 15",
    "2 Corinthians 4", "2 Corinthians 5", "Galatians 5", "Ephesians 1", "Ephesians 2",
    "Ephesians 3", "Ephesians 6", "Philippians 2", "Philippians 4", "Colossians 1", "Colossians 3",
    "1 Thessalonians 5", "Hebrews 4", "Hebrews 11", "Hebrews 12", "James 1", "James 5",
    "1 Peter 1", "1 Peter 5", "1 John 1", "1 John 3", "1 John 4", "Revelation 1", "Revelation 21", "Revelation 22"
]

morning_list = list(nt_chapters)
idx = 0
while len(morning_list) < 365:
    morning_list.append(devotional_summits[idx % len(devotional_summits)])
    idx += 1

ot_books = [
    ("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36), ("Deuteronomy", 34),
    ("Joshua", 24), ("Judges", 21), ("Ruth", 4), ("1 Samuel", 31), ("2 Samuel", 24),
    ("1 Kings", 22), ("2 Kings", 25), ("1 Chronicles", 29), ("2 Chronicles", 36),
    ("Ezra", 10), ("Nehemiah", 13), ("Esther", 10), ("Job", 42), ("Psalms", 150),
    ("Proverbs", 31), ("Ecclesiastes", 12), ("Song of Solomon", 8), ("Isaiah", 66),
    ("Jeremiah", 52), ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12),
    ("Hosea", 14), ("Joel", 3), ("Amos", 9), ("Obadiah", 1), ("Jonah", 4),
    ("Micah", 7), ("Nahum", 3), ("Habakkuk", 3), ("Zephaniah", 3), ("Haggai", 2),
    ("Zechariah", 14), ("Malachi", 4)
]

all_ot_chapters = []
for b, c in ot_books:
    for ch in range(1, c + 1):
        all_ot_chapters.append((b, ch))

total_ot = len(all_ot_chapters)
ot_chunks = []
start = 0
for day in range(1, 366):
    end = int(round(day * (total_ot / 365.0)))
    chunk = all_ot_chapters[start:end]
    start = end
    if not chunk:
        chunk = [all_ot_chapters[-1]]
    
    b_first = chunk[0][0]
    b_last = chunk[-1][0]
    if b_first == b_last:
        if chunk[0][1] == chunk[-1][1]:
            ref = f"{b_first} {chunk[0][1]}"
        else:
            ref = f"{b_first} {chunk[0][1]}-{chunk[-1][1]}"
    else:
        ref = f"{b_first} {chunk[0][1]} - {b_last} {chunk[-1][1]}"
    ot_chunks.append(ref)

plan2_days = []
for i in range(365):
    day_num = i + 1
    m_read = morning_list[i]
    n_read = ot_chunks[i]
    plan2_days.append({
        "day": day_num,
        "morning": m_read,
        "night": n_read,
        "reading": f"{m_read} / {n_read}",
        "prayerWisdom": get_wisdom(day_num)
    })

# 6. MINIMAL CLEAN OUTPUT
output_data = {
    "plans": [
        {
            "id": "plan_canonical",
            "name": "OT followed by NT",
            "shortName": "OT then NT",
            "description": "Genesis to Revelation with Psalms and Proverbs.",
            "totalDays": 365,
            "days": plan1_days
        },
        {
            "id": "plan_morning_night",
            "name": "Morning NT + Night OT",
            "shortName": "Morning NT + Night OT",
            "description": "Morning New Testament, Evening Old Testament.",
            "totalDays": 365,
            "days": plan2_days
        }
    ],
    "sundayWorship": SUNDAY_WORSHIP
}

js_content = f"""/**
 * Prayer Companion - 365-Day Bible Reading Plans Data
 * Clean, Direct, Offline-First.
 */

const BiblePlanData = {json.dumps(output_data, indent=2, ensure_ascii=False)};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = BiblePlanData;
}}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "bible-plan-data.js")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Successfully generated {out_path} ({len(js_content)} bytes)")
