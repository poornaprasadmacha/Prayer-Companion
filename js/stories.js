/**
 * Prayer Companion - Bible Prayer Stories Repository
 * Illustrated textbook-style prayer stories from Sacred Scripture.
 */

const BibleStories = {
  data: [
    {
      id: 'hannah',
      title: "Hannah's Whispered Prayer of Faith",
      reference: "1 Samuel 1:1-20",
      category: "Faith & Petition",
      theme: "Heartfelt Humility",
      image: "assets/stories/story-hannah.svg",
      summary: "Barren and deeply distressed, Hannah poured out her soul before God in silent, tearful prayer. God remembered her whispered plea and granted her Samuel.",
      scriptureQuote: "She spoke in her heart; only her lips moved, but her voice was not heard... The Lord remembered her.",
      keyTakeaway: "God does not require loud or ornate words; He hears the silent whispers of a broken and contrite heart.",
      application: "When overwhelmed by grief or unfulfilled longings, take your deep pain directly to the altar. Whisper your tears to God in complete vulnerability."
    },
    {
      id: 'elijah',
      title: "Elijah's Fire on Mount Carmel",
      reference: "1 Kings 18:30-39",
      category: "Boldness & Miracles",
      theme: "Honoring God's Name",
      image: "assets/stories/story-elijah.svg",
      summary: "Standing against 450 prophets of Baal, Elijah rebuilt the Lord's altar and prayed a concise 63-word prayer. Fire fell from heaven, turning an entire nation back to God.",
      scriptureQuote: "Hear me, O Lord, hear me, that this people may know that thou art the Lord God... Then the fire of the Lord fell.",
      keyTakeaway: "Bold prayers are not fueled by human pride, but by a holy zeal for God's glory and truth to be revealed.",
      application: "Pray with courage in difficult circumstances. Focus your petitions on bringing glory to God rather than seeking personal credit."
    },
    {
      id: 'daniel',
      title: "Daniel's Three-Times-Daily Prayer",
      reference: "Daniel 6:10-23",
      category: "Consistency & Loyalty",
      theme: "Steadfast Devotion",
      image: "assets/stories/story-daniel.svg",
      summary: "Even under threat of death in a den of lions, Daniel continued his lifelong habit of praying three times daily with open windows facing Jerusalem. God sent an angel to shut the lions' mouths.",
      scriptureQuote: "His windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed.",
      keyTakeaway: "Unshakable consistency in prayer creates spiritual resilience that no earthly decree or trial can compromise.",
      application: "Build set prayer times into your daily rhythm (morning, noon, evening). Consistency in quiet times shields your heart when trials arise."
    },
    {
      id: 'gethsemane',
      title: "Jesus in the Garden of Gethsemane",
      reference: "Luke 22:39-46",
      category: "Surrender & Peace",
      theme: "Total Obedience",
      image: "assets/stories/story-gethsemane.svg",
      summary: "Facing the agony of the cross, Jesus knelt in Gethsemane in earnest agony, praying: 'Not my will, but Yours be done.' An angel appeared from heaven strengthening Him.",
      scriptureQuote: "Father, if thou be willing, remove this cup from me: nevertheless not my will, but thine, be done.",
      keyTakeaway: "True peace in prayer is found not when God aligns with our demands, but when our hearts surrender completely to His sovereign will.",
      application: "In moments of agonizing uncertainty, conclude your deepest petitions with: 'Yet not my will, but Yours be done, Lord.' Surrender invites supernatural strength."
    },
    {
      id: 'nehemiah',
      title: "Nehemiah's Silent Arrow Prayer",
      reference: "Nehemiah 2:1-8",
      category: "Everyday & Instant Prayer",
      theme: "In-the-Moment Guidance",
      image: "assets/stories/story-nehemiah.svg",
      summary: "When King Artaxerxes unexpectedly asked Nehemiah why he looked sad and what he desired, Nehemiah shot a swift, silent prayer to the God of Heaven before speaking. God opened the king's heart to rebuild Jerusalem.",
      scriptureQuote: "The king said unto me, 'For what dost thou make request?' So I prayed to the God of heaven, and I said unto the king...",
      keyTakeaway: "God is as close as our breath. Silent 'arrow prayers' in the midst of conversations or meetings can direct the course of history.",
      application: "Practice shooting short, silent prayers throughout your workday: 'Lord, give me wisdom,' 'Lord, guard my tongue,' 'Lord, grant favor here.'"
    },
    {
      id: 'paul-silas',
      title: "Paul & Silas: Midnight Prison Hymns",
      reference: "Acts 16:25-34",
      category: "Praise & Deliverance",
      theme: "Joy in Suffering",
      image: "assets/stories/story-paul-silas.svg",
      summary: "Beaten and bound in the inner dungeon with stocks on their feet, Paul and Silas spent midnight praying and singing hymns of praise. A violent earthquake broke their bonds, and the jailer was saved.",
      scriptureQuote: "At midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them. And suddenly there was a great earthquake.",
      keyTakeaway: "Praise in the midnight hour of despair is spiritual warfare that shatters chains and opens prison doors for others.",
      application: "When you find yourself in a metaphorical midnight or painful lockup, choose thanksgiving and praise before you see the breakthrough."
    },
    {
      id: 'solomon',
      title: "Solomon's Prayer for Wisdom",
      reference: "1 Kings 3:5-14",
      category: "Wisdom & Purpose",
      theme: "A Discerning Heart",
      image: "assets/stories/story-solomon.svg",
      summary: "When God invited young Solomon in a dream to 'Ask what I shall give you,' Solomon requested neither riches nor long life, but an understanding heart to discern good and evil and serve his people.",
      scriptureQuote: "Give therefore thy servant an understanding heart to judge thy people... And the speech pleased the Lord.",
      keyTakeaway: "When we prioritize spiritual wisdom and selfless love in prayer, God delights in granting both wisdom and everything else we need.",
      application: "Ask God daily: 'Grant me a discerning heart today for my family, my work, and my spiritual walk.'"
    },
    {
      id: 'hezekiah',
      title: "Hezekiah Spreading the Threatening Letter",
      reference: "2 Kings 19:14-19",
      category: "Anxiety & Protection",
      theme: "Laying Burdens Down",
      image: "assets/stories/story-hezekiah.svg",
      summary: "Surrounded by the invincible Assyrian army and receiving a threatening blasphemous letter, King Hezekiah took the letter directly into the temple and spread it out on the floor before God. God delivered Jerusalem that very night.",
      scriptureQuote: "Hezekiah went up into the house of the Lord, and spread it before the Lord. And Hezekiah prayed before the Lord.",
      keyTakeaway: "Physical, written burdens—bills, medical diagnostics, cruel letters—can be literally spread out before God in quiet surrender.",
      application: "When an anxious email, bill, or health report arrives, physically hold it up or lay it before the Lord in your prayer room."
    }
  ],

  getAll() {
    return this.data;
  },

  getById(id) {
    return this.data.find(s => s.id === id);
  },

  search(query, category = 'all') {
    const q = (query || '').toLowerCase().trim();
    return this.data.filter(s => {
      const matchCat = category === 'all' || s.category.toLowerCase().includes(category.toLowerCase());
      const matchText = !q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q) || s.reference.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }
};

window.BibleStories = BibleStories;
