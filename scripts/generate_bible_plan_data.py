#!/usr/bin/env python3
"""
Generate js/bible-plan-data.js containing:
1. Plan 1: Canonical / Chronological / Thematic 365-day plan extracted from the user's uploaded PDF (iphc.org/discipleship)
2. Plan 2: Morning NT + Night OT balanced 365-day plan
3. 52 Dedicated Sunday Worship & Praise Readings
4. 365 Daily Reflections on the Supreme Importance & Power of Prayer
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

# 2. 52 SUNDAY WORSHIP & PRAISE READINGS
SUNDAY_WORSHIP = [
    {"passage": "Psalm 8 & Psalm 19", "theme": "Majesty of God in Creation", "verse": "O Lord, our Lord, how majestic is your name in all the earth!"},
    {"passage": "Psalm 23 & Psalm 24", "theme": "The Good Shepherd & King of Glory", "verse": "The Lord is my shepherd; I shall not want... Lift up your heads, O gates!"},
    {"passage": "Psalm 27", "theme": "Light, Salvation & Sanctuary", "verse": "The Lord is my light and my salvation; whom shall I fear?"},
    {"passage": "Psalm 33", "theme": "Joyful Exultation in God's Word", "verse": "Shout for joy in the Lord, O you righteous! Praise befits the upright."},
    {"passage": "Psalm 34", "theme": "Continual Praise & Refuge", "verse": "I will bless the Lord at all times; his praise shall continually be in my mouth."},
    {"passage": "Psalm 42 & Psalm 43", "theme": "Thirsting for the Living God", "verse": "As a deer pants for flowing streams, so pants my soul for you, O God."},
    {"passage": "Psalm 46 & Psalm 47", "theme": "Our Fortress & Supreme Sovereign", "verse": "God is our refuge and strength, a very present help in trouble."},
    {"passage": "Psalm 63", "theme": "Seeking God's Face at Dawn", "verse": "O God, you are my God; earnestly I seek you; my soul thirsts for you."},
    {"passage": "Psalm 65 & Psalm 66", "theme": "Praise in Zion & Awesome Works", "verse": "Shout for joy to God, all the earth; sing the glory of his name!"},
    {"passage": "Psalm 67 & Psalm 68", "theme": "Blessing to the Nations", "verse": "May God be gracious to us and bless us and make his face to shine upon us."},
    {"passage": "Psalm 84", "theme": "Longing for God's Courts", "verse": "Better is one day in your courts than a thousand elsewhere."},
    {"passage": "Psalm 86 & Psalm 89:1-18", "theme": "Steadfast Love Across Generations", "verse": "I will sing of the steadfast love of the Lord forever; with my mouth I will make known your faithfulness."},
    {"passage": "Psalm 90 & Psalm 91", "theme": "Dwelling in the Secret Place", "verse": "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty."},
    {"passage": "Psalm 95 & Psalm 96", "theme": "Singing a New Song to the Lord", "verse": "Oh come, let us sing to the Lord; let us make a joyful noise to the rock of our salvation!"},
    {"passage": "Psalm 98 & Psalm 99", "theme": "The Lord Has Made Known His Victory", "verse": "Oh sing to the Lord a new song, for he has done marvelous things!"},
    {"passage": "Psalm 100 & Psalm 101", "theme": "Enter His Gates with Thanksgiving", "verse": "Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!"},
    {"passage": "Psalm 103", "theme": "Bless the Lord, O My Soul", "verse": "Bless the Lord, O my soul, and forget not all his benefits, who forgives all your iniquity."},
    {"passage": "Psalm 104", "theme": "Splendor & Majesty in Creation", "verse": "Bless the Lord, O my soul! O Lord my God, you are very great; you are clothed with splendor and majesty."},
    {"passage": "Psalm 111 & Psalm 112", "theme": "Praise for God's Righteous Works", "verse": "Great are the works of the Lord, studied by all who delight in them."},
    {"passage": "Psalm 113 & Psalm 114", "theme": "From the Rising of the Sun to Its Setting", "verse": "From the rising of the sun to its setting, the name of the Lord is to be praised!"},
    {"passage": "Psalm 115 & Psalm 116", "theme": "Not to Us, but to Your Name", "verse": "Not to us, O Lord, not to us, but to your name give glory, for the sake of your steadfast love."},
    {"passage": "Psalm 118", "theme": "His Steadfast Love Endures Forever", "verse": "This is the day that the Lord has made; let us rejoice and be glad in it."},
    {"passage": "Psalm 121 & Psalm 122", "theme": "The Lord Your Keeper & City of Peace", "verse": "I lift up my eyes to the hills. From where does my help come? My help comes from the Lord."},
    {"passage": "Psalm 125 & Psalm 126", "theme": "Unshakable Trust & Harvest of Joy", "verse": "Those who trust in the Lord are like Mount Zion, which cannot be moved, but abides forever."},
    {"passage": "Psalm 130 & Psalm 131", "theme": "Hope in the Lord with a Quiet Soul", "verse": "I wait for the Lord, my soul waits, and in his word I hope; my soul waits for the Lord."},
    {"passage": "Psalm 134 & Psalm 136", "theme": "Night Blessing & Eternal Mercy", "verse": "Give thanks to the Lord, for he is good, for his steadfast love endures forever."},
    {"passage": "Psalm 138 & Psalm 139", "theme": "Known and Loved by the Almighty", "verse": "I praise you, for I am fearfully and wonderfully made. Wonderful are your works!"},
    {"passage": "Psalm 143 & Psalm 144", "theme": "Cry for Guidance & Blessed Security", "verse": "Teach me to do your will, for you are my God! Let your good Spirit lead me on level ground!"},
    {"passage": "Psalm 145", "theme": "Extolling the Great King", "verse": "The Lord is near to all who call on him, to all who call on him in truth."},
    {"passage": "Psalm 146 & Psalm 147", "theme": "Praise the Lord, O My Soul", "verse": "The Lord builds up Jerusalem; he heals the brokenhearted and binds up their wounds."},
    {"passage": "Psalm 148, 149 & 150", "theme": "Universal Symphonic Praise", "verse": "Let everything that has breath praise the Lord! Praise the Lord!"},
    {"passage": "Exodus 15:1-18", "theme": "The Song of Moses and Deliverance", "verse": "The Lord is my strength and my song, and he has become my salvation."},
    {"passage": "1 Samuel 2:1-10", "theme": "Hannah's Exultant Song of Triumph", "verse": "There is none holy like the Lord: for there is none besides you; there is no rock like our God."},
    {"passage": "2 Samuel 22:1-20", "theme": "David's Song of the Rock of Refuge", "verse": "The Lord is my rock and my fortress and my deliverer, my God, my rock, in whom I take refuge."},
    {"passage": "1 Chronicles 16:8-36", "theme": "Covenant Praise at the Ark", "verse": "Sing to the Lord, all the earth! Tell of his salvation from day to day."},
    {"passage": "1 Chronicles 29:10-18", "theme": "Yours is the Greatness and Power", "verse": "Yours, O Lord, is the greatness and the power and the glory and the victory and the majesty."},
    {"passage": "2 Chronicles 20:5-22", "theme": "Triumphant Praise on the Battlefield", "verse": "Give thanks to the Lord, for his steadfast love endures forever."},
    {"passage": "Isaiah 6:1-8", "theme": "Holy, Holy, Holy is the Lord of Hosts", "verse": "Holy, holy, holy is the Lord of hosts; the whole earth is full of his glory!"},
    {"passage": "Isaiah 12:1-6 & 25:1-9", "theme": "Wells of Salvation & God Exalted", "verse": "Behold, God is my salvation; I will trust, and will not be afraid; for the Lord God is my strength."},
    {"passage": "Isaiah 40:21-31", "theme": "Renewed Strength for Those Who Wait", "verse": "They who wait for the Lord shall renew their strength; they shall mount up with wings like eagles."},
    {"passage": "Habakkuk 3:1-19", "theme": "Joy in the God of Salvation", "verse": "Yet I will rejoice in the Lord; I will take joy in the God of my salvation."},
    {"passage": "Luke 1:46-55", "theme": "The Magnificat: My Soul Magnifies the Lord", "verse": "My soul magnifies the Lord, and my spirit rejoices in God my Savior."},
    {"passage": "Luke 1:68-79", "theme": "The Benedictus: The Dayspring from on High", "verse": "Blessed be the Lord God of Israel, for he has visited and redeemed his people."},
    {"passage": "Romans 11:33-36 & 16:25-27", "theme": "The Unsearchable Depth of God's Wisdom", "verse": "Oh, the depth of the riches and wisdom and knowledge of God! To him be glory forever. Amen."},
    {"passage": "Ephesians 1:3-14", "theme": "Blessed with Every Spiritual Blessing", "verse": "Blessed be the God and Father of our Lord Jesus Christ, who has blessed us in Christ."},
    {"passage": "Ephesians 3:14-21", "theme": "To Him Who Is Able to Do Exceedingly Abundantly", "verse": "Now to him who is able to do far more abundantly than all that we ask or think, to him be glory."},
    {"passage": "Philippians 2:5-11", "theme": "The Name Above Every Name", "verse": "At the name of Jesus every knee should bow, in heaven and on earth and under the earth."},
    {"passage": "Colossians 1:15-20", "theme": "The Preeminence of Christ", "verse": "He is the image of the invisible God, the firstborn of all creation. For by him all things were created."},
    {"passage": "1 Timothy 1:17 & 6:15-16", "theme": "The King of the Ages, Immortal & Invisible", "verse": "To the King of the ages, immortal, invisible, the only God, be honor and glory forever and ever."},
    {"passage": "Hebrews 1:1-4 & 13:20-21", "theme": "The Radiance of God's Glory", "verse": "He is the radiance of the glory of God and the exact imprint of his nature."},
    {"passage": "Revelation 4:8-11 & 5:9-14", "theme": "The Song of the Lamb Around the Throne", "verse": "Worthy are you, our Lord and God, to receive glory and honor and power! Worthy is the Lamb!"},
    {"passage": "Revelation 19:1-8 & 22:12-21", "theme": "Hallelujah! The Lord God Omnipotent Reigns", "verse": "Hallelujah! For the Lord our God the Almighty reigns. Amen. Come, Lord Jesus!"}
]

# 3. 365 PRAYER WISDOM REFLECTIONS (CONNECTING SCRIPTURE TO PRAYER)
PRAYER_WISDOM_SEEDS = [
    ("Communion with the Creator", "Prayer is not overcoming God's reluctance; it is laying hold of His loving willingness to fellowship with you."),
    ("Spiritual Breath", "To be a follower of God without prayer is no more possible than to be alive without breathing."),
    ("Morning Anchor", "Begin your morning speaking to God before you speak to the world; let His voice set your soul's compass for the day."),
    ("Cast Your Cares", "Worry looks around; fear looks back; anxiety looks within; but prayer looks up to the Almighty."),
    ("The Quiet Altar", "When you enter your secret room and close the door, you shut out distraction and welcome divine clarity."),
    ("Strength in Weakness", "Prayer acknowledges human limitation and invites divine omnipotence to work in and through you."),
    ("Secret Springs of Joy", "Trouble drives the praying soul deeper into the heart of God where living waters never run dry."),
    ("Unceasing Reliance", "To pray without ceasing means maintaining a continual, silent awareness of God throughout every ordinary moment."),
    ("Asking in Faith", "True prayer asks with confidence, not because we are worthy, but because our Father in heaven is faithful and good."),
    ("Listening in Reverence", "Prayer is a holy conversation. Half of the power of prayer is the stillness that waits to hear God's gentle whisper."),
    ("Thy Will Be Done", "The greatest prayer is not bending God's will to our desires, but aligning our desires with His eternal love."),
    ("Peace That Surpasses", "Do not be anxious about anything, but in everything by prayer and petition, present your heart to God and rest in His peace."),
    ("The Shield of the Heart", "Fervent prayer surrounds the fragile heart with the steadfast protection of the Most High."),
    ("Fellowship with Jesus", "When you open Scripture and pray, you walk with Christ just as the disciples did along the Emmaus road."),
    ("Persistent Hope", "Never stop praying for those you love. What seems impossible to human eyes is already within the reach of God's hand."),
    ("The Power of Thanksgiving", "Gratitude in prayer turns what little we have into enough, and transforms common days into holy ground."),
    ("Humility Before the Throne", "God resists the proud but pours lavish grace upon the humble heart that kneels in sincere dependence."),
    ("Healing Through Confession", "Pouring out our failures honestly before God unlocks the cleansing flood of His boundless mercy."),
    ("Anchor in the Storm", "When the winds blow and waves rise, prayer is the spiritual anchor that keeps your soul steady and secure."),
    ("Waiting with Expectation", "They that wait upon the Lord in prayer shall renew their strength; they shall mount up with wings as eagles."),
    ("A Father's Care", "If earthly parents know how to give good gifts, how much more will your Heavenly Father give the Holy Spirit to those who ask!"),
    ("Spiritual Renewal", "One hour spent in earnest prayer will accomplish more for your inner peace than days of worldly striving."),
    ("Walking in the Light", "Prayer keeps our spiritual sight clean so we can discern truth from deception and righteousness from vanity."),
    ("Interceding for Others", "Standing in the gap for another in prayer is one of the highest acts of selfless Christian love."),
    ("The Power of Stillness", "Be still, and know that I am God. In the silence of prayer, God's sovereignty quietens our frantic fears."),
    ("Divine Guidance", "In all your ways acknowledge Him through prayer, and He shall make straight your paths."),
    ("Refuge in Times of Trouble", "God is our refuge and our strength, a very present help in trouble; prayer is running into His open arms."),
    ("Faith that Moves Mountains", "Prayer is not the power that moves mountains; God is the power. Prayer is the faith that trusts Him to do it."),
    ("Clean Hands and Pure Heart", "Create in me a clean heart, O God; renew a right spirit within me as I seek Your presence today."),
    ("Evening Surrender", "As night falls, lay down your burdens at the cross. He who watches over you neither slumbers nor sleeps.")
]

def get_prayer_wisdom(day_num):
    seed = PRAYER_WISDOM_SEEDS[(day_num - 1) % len(PRAYER_WISDOM_SEEDS)]
    # Add day-specific depth
    variations = [
        f"{seed[1]} As you read today's Scripture, ask the Lord to illuminate your mind and write His truth upon your heart.",
        f"{seed[1]} Bring your honest thoughts, uncertainties, and petitions to the Lord today; He hears every whispered word.",
        f"{seed[1]} Take a sacred minute right now to pause, breathe, and thank God for His steadfast love and guidance.",
        f"{seed[1]} Let today's passage become a personal prayer: turn God's promises back to Him in joyful trust.",
        f"{seed[1]} Remember that the same God who led patriarchs and apostles is with you in this very moment as you pray."
    ]
    text = variations[day_num % len(variations)]
    return {"theme": seed[0], "text": text}

# 4. BUILD PLAN 1 (PDF CANONICAL)
plan1_days = []
for i, reading in enumerate(plan1_raw):
    day_num = i + 1
    is_sunday = (day_num % 7 == 0)
    sunday_info = SUNDAY_WORSHIP[(day_num // 7 - 1) % len(SUNDAY_WORSHIP)] if is_sunday else None
    wisdom = get_prayer_wisdom(day_num)
    
    # Infer category
    cat = "Scripture"
    if any(b in reading for b in ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]):
        cat = "Pentateuch (Law)"
    elif any(b in reading for b in ["Joshua", "Judges", "Ruth", "Samuel", "Kings", "Chronicles", "Ezra", "Nehemiah", "Esther"]):
        cat = "Historical Books"
    elif any(b in reading for b in ["Job", "Psalms", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon"]):
        cat = "Poetry & Wisdom"
    elif any(b in reading for b in ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]):
        cat = "The Prophets"
    elif any(b in reading for b in ["Matthew", "Mark", "Luke", "John"]):
        cat = "The Gospels"
    elif any(b in reading for b in ["Acts"]):
        cat = "Acts of the Apostles"
    elif any(b in reading for b in ["Romans", "Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Thessalonians", "Timothy", "Titus", "Philemon", "Hebrews", "James", "Peter", "John", "Jude"]):
        cat = "The Epistles"
    elif "Revelation" in reading:
        cat = "Revelation"
        
    plan1_days.append({
        "day": day_num,
        "reading": reading,
        "category": cat,
        "isSunday": is_sunday,
        "worshipReading": sunday_info["passage"] if is_sunday else None,
        "worshipTheme": sunday_info["theme"] if is_sunday else None,
        "worshipVerse": sunday_info["verse"] if is_sunday else None,
        "prayerWisdom": wisdom
    })

# 5. BUILD PLAN 2 (MORNING NT + NIGHT OT)
# NT 260 chapters apportioned across 365 days
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

# For the remaining 105 days (365 - 260), cycle through Gospel & Epistles devotional summits
devotional_summits = [
    "Matthew 5 (Beatitudes)", "Matthew 6 (The Lord's Prayer)", "Matthew 7 (Golden Rule)",
    "Matthew 11:28-30 (Rest for Souls)", "Matthew 28 (Great Commission)", "Mark 12:28-34 (Greatest Commandment)",
    "Luke 10:25-37 (Good Samaritan)", "Luke 15 (The Prodigal Son)", "John 1:1-18 (The Word Made Flesh)",
    "John 3:1-21 (Born of the Spirit)", "John 10:1-18 (The Good Shepherd)", "John 14 (Way, Truth, Life)",
    "John 15 (The True Vine)", "John 17 (Christ's High Priestly Prayer)", "Acts 2:1-47 (Coming of the Holy Spirit)",
    "Romans 5 (Peace with God)", "Romans 8:1-17 (Life in the Spirit)", "Romans 8:18-39 (More Than Conquerors)",
    "Romans 12 (Living Sacrifice)", "1 Corinthians 13 (The Love Chapter)", "1 Corinthians 15:1-26 (The Resurrection)",
    "1 Corinthians 15:50-58 (Victory Over Death)", "2 Corinthians 4 (Treasure in Jars of Clay)",
    "2 Corinthians 5:11-21 (Ministry of Reconciliation)", "Galatians 5:16-26 (Fruit of the Spirit)",
    "Ephesians 1:15-23 (Prayer for Spiritual Wisdom)", "Ephesians 2:1-10 (Saved by Grace Through Faith)",
    "Ephesians 3:14-21 (Prayer for Spiritual Strength)", "Ephesians 6:10-20 (The Whole Armor of God)",
    "Philippians 2:1-11 (The Humility of Christ)", "Philippians 4:4-13 (Rejoice in the Lord Always)",
    "Colossians 1:15-20 (The Supremacy of Christ)", "Colossians 3:1-17 (Put on the New Self)",
    "1 Thessalonians 4:13-18 (Hope of the Resurrection)", "1 Thessalonians 5:12-24 (Pray Without Ceasing)",
    "Hebrews 4:14-16 (The Throne of Grace)", "Hebrews 11:1-16 (Heroes of Faith)",
    "Hebrews 11:17-40 (Triumph of Faith)", "Hebrews 12:1-13 (Looking to Jesus)",
    "James 1:1-18 (Faith and Endurance)", "James 3:1-18 (Taming the Tongue)", "James 5:13-20 (The Prayer of Faith)",
    "1 Peter 1:3-12 (A Living Hope)", "1 Peter 2:1-10 (A Chosen Race & Royal Priesthood)",
    "1 Peter 5:6-11 (Cast All Anxiety on Him)", "1 John 1 (Walking in the Light)",
    "1 John 3:1-10 (Children of God)", "1 John 4:7-21 (God Is Love)",
    "Revelation 1:9-20 (Vision of the Glorified Son)", "Revelation 21:1-7 (The New Heaven & New Earth)",
    "Revelation 22:1-7 (The River of Life)"
]

# Repeat summits to cover exactly 105 days
morning_list = list(nt_chapters)
idx = 0
while len(morning_list) < 365:
    morning_list.append(devotional_summits[idx % len(devotional_summits)])
    idx += 1

# Night OT: 929 chapters distributed across 365 days
# Generate ~2.5 chapters per day
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

total_ot = len(all_ot_chapters) # 929
ot_chunks = []
start = 0
for day in range(1, 366):
    end = int(round(day * (total_ot / 365.0)))
    chunk = all_ot_chapters[start:end]
    start = end
    if not chunk:
        chunk = [all_ot_chapters[-1]]
    
    # Format chunk
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

assert len(ot_chunks) == 365

plan2_days = []
for i in range(365):
    day_num = i + 1
    is_sunday = (day_num % 7 == 0)
    sunday_info = SUNDAY_WORSHIP[(day_num // 7 - 1) % len(SUNDAY_WORSHIP)] if is_sunday else None
    wisdom = get_prayer_wisdom(day_num)
    m_read = morning_list[i]
    n_read = ot_chunks[i]
    combined = f"Morning: {m_read} | Night: {n_read}"
    
    plan2_days.append({
        "day": day_num,
        "morning": m_read,
        "night": n_read,
        "reading": combined,
        "category": "Dual Walk (NT + OT)",
        "isSunday": is_sunday,
        "worshipReading": sunday_info["passage"] if is_sunday else None,
        "worshipTheme": sunday_info["theme"] if is_sunday else None,
        "worshipVerse": sunday_info["verse"] if is_sunday else None,
        "prayerWisdom": wisdom
    })

# 6. OUTPUT AS CLEAN JS FILE
output_data = {
    "plans": [
        {
            "id": "plan_canonical",
            "name": "Through the Bible in 365 Days",
            "shortName": "Canonical & Chronological",
            "badge": "OT Then NT",
            "description": "The complete journey through Scripture: Old Testament foundations with interspersed Psalms and Proverbs, culminating in the New Testament.",
            "totalDays": 365,
            "days": plan1_days
        },
        {
            "id": "plan_morning_night",
            "name": "Morning NT + Night OT",
            "shortName": "Morning & Night Walk",
            "badge": "Daily Dual Walk",
            "description": "Start every morning with a New Testament chapter to anchor your thoughts in Christ, and conclude your evening with Old Testament wisdom, history, and peaceful prayer.",
            "totalDays": 365,
            "days": plan2_days
        }
    ],
    "sundayWorship": SUNDAY_WORSHIP
}

js_content = f"""/**
 * Prayer Companion - 365-Day Bible Reading Plans Data
 * Generated from authentic canonical and dual-testament reading plans.
 * 100% Offline Capable & Synchronized.
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
print("Plan 1 total days:", len(plan1_days))
print("Plan 2 total days:", len(plan2_days))
print("Sunday worship readings:", len(SUNDAY_WORSHIP))
