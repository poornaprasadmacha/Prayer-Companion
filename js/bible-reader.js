/**
 * Prayerly - Holy Bible Reader (పరిశుద్ధ గ్రంథము)
 * Supports Telugu Bible, English (NIV by default, switchable to KJV),
 * Bilingual Verse-by-Verse view, 100% Offline IndexedDB caching,
 * and direct integration with the 365-Day Bible Reading Plan.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. ALL 66 BOOKS METADATA (OLD & NEW TESTAMENTS)
  // Verified mappings for Telugu, NIV, and KJV CDN data sources
  // =========================================================================

  const BIBLE_BOOKS = [
    // Old Testament (39 books)
    { index: 1, id: 'genesis', name: 'Genesis', telugu: 'ఆదికాండము', teluguShort: 'ఆది', chapters: 50, testament: 'OT', files: { telugu: 'Genesis.json', niv: 'Genesis.json', kjv: 'Genesis.json' } },
    { index: 2, id: 'exodus', name: 'Exodus', telugu: 'నిర్గమకాండము', teluguShort: 'నిర్గ', chapters: 40, testament: 'OT', files: { telugu: 'Exodus.json', niv: 'Exodus.json', kjv: 'Exodus.json' } },
    { index: 3, id: 'leviticus', name: 'Leviticus', telugu: 'లేవీయకాండము', teluguShort: 'లేవీ', chapters: 27, testament: 'OT', files: { telugu: 'Leviticus.json', niv: 'Leviticus.json', kjv: 'Leviticus.json' } },
    { index: 4, id: 'numbers', name: 'Numbers', telugu: 'సంఖ్యాకాండము', teluguShort: 'సంఖ్యా', chapters: 36, testament: 'OT', files: { telugu: 'Numbers.json', niv: 'Numbers.json', kjv: 'Numbers.json' } },
    { index: 5, id: 'deuteronomy', name: 'Deuteronomy', telugu: 'ద్వితీయోపదేశకాండము', teluguShort: 'ద్వితీ', chapters: 34, testament: 'OT', files: { telugu: 'Deuteronomy.json', niv: 'Deuteronomy.json', kjv: 'Deuteronomy.json' } },
    { index: 6, id: 'joshua', name: 'Joshua', telugu: 'యెహొషువ', teluguShort: 'యెహో', chapters: 24, testament: 'OT', files: { telugu: 'Joshua.json', niv: 'Joshua.json', kjv: 'Joshua.json' } },
    { index: 7, id: 'judges', name: 'Judges', telugu: 'న్యాయాధిపతులు', teluguShort: 'న్యాయా', chapters: 21, testament: 'OT', files: { telugu: 'Judges.json', niv: 'Judges.json', kjv: 'Judges.json' } },
    { index: 8, id: 'ruth', name: 'Ruth', telugu: 'రూతు', teluguShort: 'రూతు', chapters: 4, testament: 'OT', files: { telugu: 'Ruth.json', niv: 'Ruth.json', kjv: 'Ruth.json' } },
    { index: 9, id: '1samuel', name: '1 Samuel', telugu: '1 సమూయేలు', teluguShort: '1 సమూ', chapters: 31, testament: 'OT', files: { telugu: '1 Samuel.json', niv: '1 Samuel.json', kjv: '1Samuel.json' } },
    { index: 10, id: '2samuel', name: '2 Samuel', telugu: '2 సమూయేలు', teluguShort: '2 సమూ', chapters: 24, testament: 'OT', files: { telugu: '2 Samuel.json', niv: '2 Samuel.json', kjv: '2Samuel.json' } },
    { index: 11, id: '1kings', name: '1 Kings', telugu: '1 రాజులు', teluguShort: '1 రాజు', chapters: 22, testament: 'OT', files: { telugu: '1 Kings.json', niv: '1 Kings.json', kjv: '1Kings.json' } },
    { index: 12, id: '2kings', name: '2 Kings', telugu: '2 రాజులు', teluguShort: '2 రాజు', chapters: 25, testament: 'OT', files: { telugu: '2 Kings.json', niv: '2 Kings.json', kjv: '2Kings.json' } },
    { index: 13, id: '1chronicles', name: '1 Chronicles', telugu: '1 దినవృత్తాంతములు', teluguShort: '1 దిన', chapters: 29, testament: 'OT', files: { telugu: '1 Chronicles.json', niv: '1 Chronicles.json', kjv: '1Chronicles.json' } },
    { index: 14, id: '2chronicles', name: '2 Chronicles', telugu: '2 దినవృత్తాంతములు', teluguShort: '2 దిన', chapters: 36, testament: 'OT', files: { telugu: '2 Chronicles.json', niv: '2 Chronicles.json', kjv: '2Chronicles.json' } },
    { index: 15, id: 'ezra', name: 'Ezra', telugu: 'ఎజ్రా', teluguShort: 'ఎజ్రా', chapters: 10, testament: 'OT', files: { telugu: 'Ezra.json', niv: 'Ezra.json', kjv: 'Ezra.json' } },
    { index: 16, id: 'nehemiah', name: 'Nehemiah', telugu: 'నెహెమ్యా', teluguShort: 'నెహె', chapters: 13, testament: 'OT', files: { telugu: 'Nehemiah.json', niv: 'Nehemiah.json', kjv: 'Nehemiah.json' } },
    { index: 17, id: 'esther', name: 'Esther', telugu: 'ఎస్తేరు', teluguShort: 'ఎస్తే', chapters: 10, testament: 'OT', files: { telugu: 'Esther.json', niv: 'Esther.json', kjv: 'Esther.json' } },
    { index: 18, id: 'job', name: 'Job', telugu: 'యోబు', teluguShort: 'యోబు', chapters: 42, testament: 'OT', files: { telugu: 'Job.json', niv: 'Job.json', kjv: 'Job.json' } },
    { index: 19, id: 'psalms', name: 'Psalms', telugu: 'కీర్తనల గ్రంథము', teluguShort: 'కీర్తన', chapters: 150, testament: 'OT', files: { telugu: 'Psalms.json', niv: 'Psalms.json', kjv: 'Psalms.json' } },
    { index: 20, id: 'proverbs', name: 'Proverbs', telugu: 'సామెతలు', teluguShort: 'సామె', chapters: 31, testament: 'OT', files: { telugu: 'Proverbs.json', niv: 'Proverbs.json', kjv: 'Proverbs.json' } },
    { index: 21, id: 'ecclesiastes', name: 'Ecclesiastes', telugu: 'ప్రసంగి', teluguShort: 'ప్రసం', chapters: 12, testament: 'OT', files: { telugu: 'Ecclesiastes.json', niv: 'Ecclesiastes.json', kjv: 'Ecclesiastes.json' } },
    { index: 22, id: 'songofsongs', name: 'Song of Songs', aliases: ['Song of Solomon', 'Canticles'], telugu: 'పరమగీతము', teluguShort: 'పరమ', chapters: 8, testament: 'OT', files: { telugu: 'Song of Songs.json', niv: 'Song Of Solomon.json', kjv: 'SongofSolomon.json' } },
    { index: 23, id: 'isaiah', name: 'Isaiah', telugu: 'యెషయా', teluguShort: 'యెష', chapters: 66, testament: 'OT', files: { telugu: 'Isaiah.json', niv: 'Isaiah.json', kjv: 'Isaiah.json' } },
    { index: 24, id: 'jeremiah', name: 'Jeremiah', telugu: 'యిర్మియా', teluguShort: 'యిర్మి', chapters: 52, testament: 'OT', files: { telugu: 'Jeremiah.json', niv: 'Jeremiah.json', kjv: 'Jeremiah.json' } },
    { index: 25, id: 'lamentations', name: 'Lamentations', telugu: 'విలాపవాక్యములు', teluguShort: 'విలాప', chapters: 5, testament: 'OT', files: { telugu: 'Lamentations.json', niv: 'Lamentations.json', kjv: 'Lamentations.json' } },
    { index: 26, id: 'ezekiel', name: 'Ezekiel', telugu: 'యెహెజ్కేలు', teluguShort: 'యెహె', chapters: 48, testament: 'OT', files: { telugu: 'Ezekiel.json', niv: 'Ezekiel.json', kjv: 'Ezekiel.json' } },
    { index: 27, id: 'daniel', name: 'Daniel', telugu: 'దానియేలు', teluguShort: 'దాని', chapters: 12, testament: 'OT', files: { telugu: 'Daniel.json', niv: 'Daniel.json', kjv: 'Daniel.json' } },
    { index: 28, id: 'hosea', name: 'Hosea', telugu: 'హోషేయ', teluguShort: 'హోషే', chapters: 14, testament: 'OT', files: { telugu: 'Hosea.json', niv: 'Hosea.json', kjv: 'Hosea.json' } },
    { index: 29, id: 'joel', name: 'Joel', telugu: 'యోవేలు', teluguShort: 'యోవే', chapters: 3, testament: 'OT', files: { telugu: 'Joel.json', niv: 'Joel.json', kjv: 'Joel.json' } },
    { index: 30, id: 'amos', name: 'Amos', telugu: 'ఆమోసు', teluguShort: 'ఆమో', chapters: 9, testament: 'OT', files: { telugu: 'Amos.json', niv: 'Amos.json', kjv: 'Amos.json' } },
    { index: 31, id: 'obadiah', name: 'Obadiah', telugu: 'ఓబద్యా', teluguShort: 'ఓబ', chapters: 1, testament: 'OT', files: { telugu: 'Obadiah.json', niv: 'Obadiah.json', kjv: 'Obadiah.json' } },
    { index: 32, id: 'jonah', name: 'Jonah', telugu: 'యోనా', teluguShort: 'యోనా', chapters: 4, testament: 'OT', files: { telugu: 'Jonah.json', niv: 'Jonah.json', kjv: 'Jonah.json' } },
    { index: 33, id: 'micah', name: 'Micah', telugu: 'మీకా', teluguShort: 'మీకా', chapters: 7, testament: 'OT', files: { telugu: 'Micah.json', niv: 'Micah.json', kjv: 'Micah.json' } },
    { index: 34, id: 'nahum', name: 'Nahum', telugu: 'నహూము', teluguShort: 'నహూ', chapters: 3, testament: 'OT', files: { telugu: 'Nahum.json', niv: 'Nahum.json', kjv: 'Nahum.json' } },
    { index: 35, id: 'habakkuk', name: 'Habakkuk', telugu: 'హబక్కూకు', teluguShort: 'హబ', chapters: 3, testament: 'OT', files: { telugu: 'Habakkuk.json', niv: 'Habakkuk.json', kjv: 'Habakkuk.json' } },
    { index: 36, id: 'zephaniah', name: 'Zephaniah', telugu: 'జెఫన్యా', teluguShort: 'జెఫ', chapters: 3, testament: 'OT', files: { telugu: 'Zephaniah.json', niv: 'Zephaniah.json', kjv: 'Zephaniah.json' } },
    { index: 37, id: 'haggai', name: 'Haggai', telugu: 'హగ్గయి', teluguShort: 'హగ్గ', chapters: 2, testament: 'OT', files: { telugu: 'Haggai.json', niv: 'Haggai.json', kjv: 'Haggai.json' } },
    { index: 38, id: 'zechariah', name: 'Zechariah', telugu: 'జెకర్యా', teluguShort: 'జెక', chapters: 14, testament: 'OT', files: { telugu: 'Zechariah.json', niv: 'Zechariah.json', kjv: 'Zechariah.json' } },
    { index: 39, id: 'malachi', name: 'Malachi', telugu: 'మలాకీ', teluguShort: 'మలా', chapters: 4, testament: 'OT', files: { telugu: 'Malachi.json', niv: 'Malachi.json', kjv: 'Malachi.json' } },

    // New Testament (27 books)
    { index: 40, id: 'matthew', name: 'Matthew', telugu: 'మత్తయి సువార్త', teluguShort: 'మత్త', chapters: 28, testament: 'NT', files: { telugu: 'Matthew.json', niv: 'Matthew.json', kjv: 'Matthew.json' } },
    { index: 41, id: 'mark', name: 'Mark', telugu: 'మార్కు సువార్త', teluguShort: 'మార్కు', chapters: 16, testament: 'NT', files: { telugu: 'Mark.json', niv: 'Mark.json', kjv: 'Mark.json' } },
    { index: 42, id: 'luke', name: 'Luke', telugu: 'లూకా సువార్త', teluguShort: 'లూకా', chapters: 24, testament: 'NT', files: { telugu: 'Luke.json', niv: 'Luke.json', kjv: 'Luke.json' } },
    { index: 43, id: 'john', name: 'John', telugu: 'యోహాను సువార్త', teluguShort: 'యోహా', chapters: 21, testament: 'NT', files: { telugu: 'John.json', niv: 'John.json', kjv: 'John.json' } },
    { index: 44, id: 'acts', name: 'Acts', telugu: 'అపొస్తలుల కార్యములు', teluguShort: 'అపొ', chapters: 28, testament: 'NT', files: { telugu: 'Acts.json', niv: 'Acts.json', kjv: 'Acts.json' } },
    { index: 45, id: 'romans', name: 'Romans', telugu: 'రోమీయులకు', teluguShort: 'రోమా', chapters: 16, testament: 'NT', files: { telugu: 'Romans.json', niv: 'Romans.json', kjv: 'Romans.json' } },
    { index: 46, id: '1corinthians', name: '1 Corinthians', telugu: '1 కొరింథీయులకు', teluguShort: '1 కొరిం', chapters: 16, testament: 'NT', files: { telugu: '1 Corinthians.json', niv: '1 Corinthians.json', kjv: '1Corinthians.json' } },
    { index: 47, id: '2corinthians', name: '2 Corinthians', telugu: '2 కొరింథీయులకు', teluguShort: '2 కొరిం', chapters: 13, testament: 'NT', files: { telugu: '2 Corinthians.json', niv: '2 Corinthians.json', kjv: '2Corinthians.json' } },
    { index: 48, id: 'galatians', name: 'Galatians', telugu: 'గలతీయులకు', teluguShort: 'గలతీ', chapters: 6, testament: 'NT', files: { telugu: 'Galatians.json', niv: 'Galatians.json', kjv: 'Galatians.json' } },
    { index: 49, id: 'ephesians', name: 'Ephesians', telugu: 'ఎఫెసీయులకు', teluguShort: 'ఎఫెసీ', chapters: 6, testament: 'NT', files: { telugu: 'Ephesians.json', niv: 'Ephesians.json', kjv: 'Ephesians.json' } },
    { index: 50, id: 'philippians', name: 'Philippians', telugu: 'ఫిలిప్పీయులకు', teluguShort: 'ఫిలిప్పీ', chapters: 4, testament: 'NT', files: { telugu: 'Philippians.json', niv: 'Philippians.json', kjv: 'Philippians.json' } },
    { index: 51, id: 'colossians', name: 'Colossians', telugu: 'కొలొస్సయులకు', teluguShort: 'కొలొస్స', chapters: 4, testament: 'NT', files: { telugu: 'Colossians.json', niv: 'Colossians.json', kjv: 'Colossians.json' } },
    { index: 52, id: '1thessalonians', name: '1 Thessalonians', telugu: '1 థెస్సలొనీకయులకు', teluguShort: '1 థెస్స', chapters: 5, testament: 'NT', files: { telugu: '1 Thessalonians.json', niv: '1 Thessalonians.json', kjv: '1Thessalonians.json' } },
    { index: 53, id: '2thessalonians', name: '2 Thessalonians', telugu: '2 థెస్సలొనీకయులకు', teluguShort: '2 థెస్స', chapters: 3, testament: 'NT', files: { telugu: '2 Thessalonians.json', niv: '2 Thessalonians.json', kjv: '2Thessalonians.json' } },
    { index: 54, id: '1timothy', name: '1 Timothy', telugu: '1 తిమోతికి', teluguShort: '1 తిమో', chapters: 6, testament: 'NT', files: { telugu: '1 Timothy.json', niv: '1 Timothy.json', kjv: '1Timothy.json' } },
    { index: 55, id: '2timothy', name: '2 Timothy', telugu: '2 తిమోతికి', teluguShort: '2 తిమో', chapters: 4, testament: 'NT', files: { telugu: '2 Timothy.json', niv: '2 Timothy.json', kjv: '2Timothy.json' } },
    { index: 56, id: 'titus', name: 'Titus', telugu: 'తీతుకు', teluguShort: 'తీతు', chapters: 3, testament: 'NT', files: { telugu: 'Titus.json', niv: 'Titus.json', kjv: 'Titus.json' } },
    { index: 57, id: 'philemon', name: 'Philemon', telugu: 'ఫిలేమోనుకు', teluguShort: 'ఫిలే', chapters: 1, testament: 'NT', files: { telugu: 'Philemon.json', niv: 'Philemon.json', kjv: 'Philemon.json' } },
    { index: 58, id: 'hebrews', name: 'Hebrews', telugu: 'హెబ్రీయులకు', teluguShort: 'హెబ్రీ', chapters: 13, testament: 'NT', files: { telugu: 'Hebrews.json', niv: 'Hebrews.json', kjv: 'Hebrews.json' } },
    { index: 59, id: 'james', name: 'James', telugu: 'యాకోబు', teluguShort: 'యాకో', chapters: 5, testament: 'NT', files: { telugu: 'James.json', niv: 'James.json', kjv: 'James.json' } },
    { index: 60, id: '1peter', name: '1 Peter', telugu: '1 పేతురు', teluguShort: '1 పేతు', chapters: 5, testament: 'NT', files: { telugu: '1 Peter.json', niv: '1 Peter.json', kjv: '1Peter.json' } },
    { index: 61, id: '2peter', name: '2 Peter', telugu: '2 పేతురు', teluguShort: '2 పేతు', chapters: 3, testament: 'NT', files: { telugu: '2 Peter.json', niv: '2 Peter.json', kjv: '2Peter.json' } },
    { index: 62, id: '1john', name: '1 John', telugu: '1 యోహాను', teluguShort: '1 యోహా', chapters: 5, testament: 'NT', files: { telugu: '1 John.json', niv: '1 John.json', kjv: '1John.json' } },
    { index: 63, id: '2john', name: '2 John', telugu: '2 యోహాను', teluguShort: '2 యోహా', chapters: 1, testament: 'NT', files: { telugu: '2 John.json', niv: '2 John.json', kjv: '2John.json' } },
    { index: 64, id: '3john', name: '3 John', telugu: '3 యోహాను', teluguShort: '3 యోహా', chapters: 1, testament: 'NT', files: { telugu: '3 John.json', niv: '3 John.json', kjv: '3John.json' } },
    { index: 65, id: 'jude', name: 'Jude', telugu: 'యూదా', teluguShort: 'యూదా', chapters: 1, testament: 'NT', files: { telugu: 'Jude.json', niv: 'Jude.json', kjv: 'Jude.json' } },
    { index: 66, id: 'revelation', name: 'Revelation', telugu: 'ప్రకటన గ్రంథము', teluguShort: 'ప్రకటన', chapters: 22, testament: 'NT', files: { telugu: 'Revelation.json', niv: 'Revelation.json', kjv: 'Revelation.json' } }
  ];

  // Quick lookup maps
  const BOOK_BY_ID = new Map();
  const BOOK_BY_NAME = new Map();

  BIBLE_BOOKS.forEach(b => {
    BOOK_BY_ID.set(b.id, b);
    BOOK_BY_NAME.set(b.name.toLowerCase(), b);
    BOOK_BY_NAME.set(b.telugu.toLowerCase(), b);
    BOOK_BY_NAME.set(b.teluguShort.toLowerCase(), b);
    if (b.aliases) {
      b.aliases.forEach(a => BOOK_BY_NAME.set(a.toLowerCase(), b));
    }
  });

  // =========================================================================
  // 2. OFFLINE INDEXEDDB CACHE (prayerly_bible_v1)
  // Ensures once a book is loaded, it is available offline forever.
  // =========================================================================

  const BibleCache = {
    dbPromise: null,

    getDb() {
      if (this.dbPromise) return this.dbPromise;
      if (typeof indexedDB === 'undefined') {
        this.dbPromise = Promise.resolve(null);
        return this.dbPromise;
      }
      this.dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open('prayerly_bible_v1', 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('books')) {
              db.createObjectStore('books');
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
      return this.dbPromise;
    },

    async get(key) {
      try {
        const db = await this.getDb();
        if (!db) return null;
        return new Promise((resolve) => {
          const tx = db.transaction('books', 'readonly');
          const store = tx.objectStore('books');
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      } catch (e) {
        return null;
      }
    },

    async set(key, val) {
      try {
        const db = await this.getDb();
        if (!db) return;
        return new Promise((resolve) => {
          const tx = db.transaction('books', 'readwrite');
          const store = tx.objectStore('books');
          store.put(val, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } catch (e) {
        // silent fallback
      }
    },

    async getAllKeys() {
      try {
        const db = await this.getDb();
        if (!db) return [];
        return new Promise((resolve) => {
          const tx = db.transaction('books', 'readonly');
          const store = tx.objectStore('books');
          if (typeof store.getAllKeys === 'function') {
            const req = store.getAllKeys();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
          } else {
            const keys = [];
            const req = store.openCursor();
            req.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                keys.push(cursor.key);
                cursor.continue();
              } else {
                resolve(keys);
              }
            };
            req.onerror = () => resolve([]);
          }
        });
      } catch (e) {
        return [];
      }
    },

    async count() {
      try {
        const db = await this.getDb();
        if (!db) return 0;
        return new Promise((resolve) => {
          const tx = db.transaction('books', 'readonly');
          const store = tx.objectStore('books');
          const req = store.count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => resolve(0);
        });
      } catch (e) {
        return 0;
      }
    },

    async clear() {
      try {
        const db = await this.getDb();
        if (!db) return;
        return new Promise((resolve) => {
          const tx = db.transaction('books', 'readwrite');
          const store = tx.objectStore('books');
          store.clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } catch (e) {}
    }
  };

  // In-memory memory cache for fast repeat access
  const MEM_CACHE = new Map();

  // =========================================================================
  // 3. BIBLE READER CONTROLLER
  // =========================================================================

  const BibleReader = {
    books: BIBLE_BOOKS,

    // State
    currentBookId: 'genesis',
    currentChapter: 1,
    assignedChapters: [1], // If opened from day's plan (e.g. [1, 2, 3])
    highlightVerse: null,
    readingContext: null, // e.g. { dayNum: 1, passage: 'Genesis 1-3' }

    // User Preferences (Stored in localStorage)
    viewMode: 'bilingual',        // 'bilingual' (Telugu + English), 'telugu', 'english'
    englishVersion: 'niv',        // 'niv' (default) or 'kjv'
    fontSize: 'normal',           // 'small', 'normal', 'large', 'xlarge'

    // Offline Engine State
    isDownloadingOffline: false,
    offlineProgress: { current: 0, total: 132, percent: 0 },

    init() {
      // Load user preferences
      try {
        const savedView = localStorage.getItem('prayerly_bible_view_mode');
        if (savedView && ['bilingual', 'telugu', 'english'].includes(savedView)) {
          this.viewMode = savedView;
        }
        const savedVer = localStorage.getItem('prayerly_bible_english_version');
        if (savedVer && ['niv', 'kjv'].includes(savedVer)) {
          this.englishVersion = savedVer;
        }
        const savedSize = localStorage.getItem('prayerly_bible_font_size');
        if (savedSize && ['small', 'normal', 'large', 'xlarge'].includes(savedSize)) {
          this.fontSize = savedSize;
        }
      } catch (e) {}

      // Initialize offline status UI
      this.updateOfflineUI();

      // Intelligent background pre-caching for 100% offline access
      this.autoCachePlanBooks();

      // Hardware/browser back button listener to exit dedicated Bible reading page cleanly
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('popstate', () => {
          if (typeof document !== 'undefined' && document.body && document.body.classList.contains('bible-full-page-active')) {
            const modal = document.getElementById('modal-bible-reader');
            if (modal && modal.classList.contains('active')) {
              this.closeModal(true); // pass true to prevent recursive history.back()
            }
          }
        });

        // Keyboard shortcuts: Escape closes picker or reader, Left/Right arrows navigate chapters
        window.addEventListener('keydown', (e) => {
          if (!document.body || !document.body.classList.contains('bible-full-page-active')) return;
          if (e.target && ['input', 'textarea', 'select'].includes((e.target.tagName || '').toLowerCase())) return;

          if (e.key === 'Escape') {
            const picker = document.getElementById('bible-picker-dialog');
            if (picker && picker.style.display !== 'none') {
              this.closePicker();
            } else {
              this.closeModal();
            }
          } else if (e.key === 'ArrowLeft') {
            this.prevChapter();
          } else if (e.key === 'ArrowRight') {
            this.nextChapter();
          }
        });
      }
    },

    // -----------------------------------------------------------------------
    // Book Data Loading & Normalization
    // -----------------------------------------------------------------------

    async preloadBook(translation, bookId) {
      try {
        await this.fetchBook(translation, bookId);
      } catch (e) {}
    },

    async fetchBook(translation, bookId) {
      const book = BOOK_BY_ID.get(bookId);
      if (!book) throw new Error(`Unknown book id: ${bookId}`);

      const cacheKey = `${translation}_${bookId}`;
      if (MEM_CACHE.has(cacheKey)) {
        return MEM_CACHE.get(cacheKey);
      }

      // Check IndexedDB
      const cached = await BibleCache.get(cacheKey);
      if (cached && cached.chapters) {
        MEM_CACHE.set(cacheKey, cached);
        return cached;
      }

      // Fetch from CDN / GitHub
      const filename = book.files[translation] || (book.name + '.json');
      let repo = 'Bible-telugu';
      if (translation === 'niv') repo = 'Bible-niv';
      if (translation === 'kjv') repo = 'Bible-kjv';

      const cdnUrl = `https://cdn.jsdelivr.net/gh/aruljohn/${repo}@master/${encodeURIComponent(filename)}`;
      const rawUrl = `https://raw.githubusercontent.com/aruljohn/${repo}/master/${encodeURIComponent(filename)}`;

      let rawData = null;
      try {
        const res = await fetch(cdnUrl);
        if (res.ok) rawData = await res.json();
      } catch (e) {}

      if (!rawData) {
        const res2 = await fetch(rawUrl);
        if (res2.ok) rawData = await res2.json();
      }

      if (!rawData || !rawData.chapters) {
        throw new Error(`Failed to load ${translation} for ${book.name}`);
      }

      // Normalize chapters data structure: { chapters: [ { chapter: 1, verses: [ { verse: 1, text: '...' } ] } ] }
      const normalized = {
        bookId: book.id,
        bookName: book.name,
        teluguName: book.telugu,
        translation,
        chapters: rawData.chapters.map(ch => ({
          chapter: parseInt(ch.chapter, 10),
          verses: (ch.verses || []).map(v => ({
            verse: parseInt(v.verse, 10),
            text: (v.text || '').trim()
          }))
        }))
      };

      MEM_CACHE.set(cacheKey, normalized);
      BibleCache.set(cacheKey, normalized); // Persist offline
      return normalized;
    },

    // -----------------------------------------------------------------------
    // Chapter Pairing: Merge Telugu + English verse-by-verse
    // -----------------------------------------------------------------------

    async loadPairedChapter(bookId, chapterNum) {
      const book = BOOK_BY_ID.get(bookId);
      if (!book) throw new Error('Book not found');

      // Fetch Telugu & English books concurrently
      const [teluguBook, englishBook] = await Promise.all([
        this.fetchBook('telugu', bookId).catch(err => {
          console.warn('Telugu fetch note:', err);
          return null;
        }),
        this.fetchBook(this.englishVersion, bookId).catch(err => {
          console.warn('English fetch note:', err);
          return null;
        })
      ]);

      const teluguCh = teluguBook ? teluguBook.chapters.find(c => c.chapter === chapterNum) : null;
      const englishCh = englishBook ? englishBook.chapters.find(c => c.chapter === chapterNum) : null;

      const teluguVerses = teluguCh ? teluguCh.verses : [];
      const englishVerses = englishCh ? englishCh.verses : [];

      // Determine max verses
      const maxVerseNum = Math.max(
        teluguVerses.length > 0 ? teluguVerses[teluguVerses.length - 1].verse : 0,
        englishVerses.length > 0 ? englishVerses[englishVerses.length - 1].verse : 0
      );

      const teluguMap = new Map(teluguVerses.map(v => [v.verse, v.text]));
      const englishMap = new Map(englishVerses.map(v => [v.verse, v.text]));

      const pairedVerses = [];
      for (let i = 1; i <= maxVerseNum; i++) {
        const tText = teluguMap.get(i);
        const eText = englishMap.get(i);
        if (tText || eText) {
          pairedVerses.push({
            verse: i,
            telugu: tText || '',
            english: eText || ''
          });
        }
      }

      return {
        book,
        chapter: chapterNum,
        verses: pairedVerses,
        hasTelugu: !!teluguBook,
        hasEnglish: !!englishBook,
        englishVersion: this.englishVersion.toUpperCase()
      };
    },

    // -----------------------------------------------------------------------
    // Passage Reference Parser
    // E.g. "Genesis 1-3", "Matthew 3 / Genesis 6-8", "Luke 1:46-55", "Psalm 103"
    // -----------------------------------------------------------------------

    parseReference(refStr) {
      if (!refStr || typeof refStr !== 'string') return null;

      // Clean string
      const cleanRef = refStr.replace(/•/g, '/').trim();
      const parts = cleanRef.split('/');

      const results = [];

      parts.forEach(part => {
        const trimmed = part.trim();
        // Regex matches "1 Samuel 1-3" or "Genesis 1:1-17" or "Psalm 23"
        const match = trimmed.match(/^([1-3]?\s*[A-Za-z]+)\s*(\d+)(?:[:-](\d+))?(?:-(\d+))?/);
        if (match) {
          const rawBook = match[1].trim();
          const startNum = parseInt(match[2], 10);
          const endNum = match[3] ? parseInt(match[3], 10) : startNum;

          // Resolve book
          const bookMeta = this.resolveBook(rawBook);
          if (bookMeta) {
            // Check if match was chapter range (e.g. Genesis 1-3) vs verse range (Luke 1:46-55)
            const isVerseRange = trimmed.includes(':');
            let chapters = [startNum];

            if (!isVerseRange && endNum > startNum && (endNum - startNum) <= 10) {
              chapters = [];
              for (let c = startNum; c <= endNum; c++) {
                chapters.push(c);
              }
            }

            results.push({
              book: bookMeta,
              chapters,
              initialChapter: startNum,
              label: trimmed
            });
          }
        }
      });

      return results.length > 0 ? results : null;
    },

    resolveBook(nameOrId) {
      if (!nameOrId) return null;
      const lower = nameOrId.toLowerCase().trim();
      const clean = lower.replace(/[^a-z0-9]/g, '');

      if (BOOK_BY_ID.has(clean)) return BOOK_BY_ID.get(clean);
      if (BOOK_BY_NAME.has(lower)) return BOOK_BY_NAME.get(lower);

      // Search prefix or fuzzy
      for (const b of BIBLE_BOOKS) {
        if (b.name.toLowerCase().startsWith(lower) || b.telugu.includes(lower)) {
          return b;
        }
      }
      return null;
    },

    // -----------------------------------------------------------------------
    // UI Actions & Reader Opening
    // -----------------------------------------------------------------------

    openChapter(bookId, chapterNum, options = {}) {
      const book = BOOK_BY_ID.get(bookId) || BIBLE_BOOKS[0];
      this.currentBookId = book.id;
      this.currentChapter = Math.max(1, Math.min(book.chapters, parseInt(chapterNum, 10) || 1));

      if (options.assignedChapters && Array.isArray(options.assignedChapters)) {
        this.assignedChapters = options.assignedChapters;
      } else {
        this.assignedChapters = [this.currentChapter];
      }

      if (options.dayNum) {
        this.readingContext = {
          dayNum: options.dayNum,
          planId: options.planId || null,
          passage: options.passage || `${book.name} ${this.currentChapter}`
        };
      } else if (options.clearContext !== false) {
        this.readingContext = null;
      }

      this.showModal();
      this.render();
    },

    openPassage(refStr, dayNum = null) {
      const parsed = this.parseReference(refStr);
      if (!parsed || parsed.length === 0) {
        // Fallback: open Genesis 1
        this.openChapter('genesis', 1, { dayNum });
        return;
      }

      const firstTarget = parsed[0];
      this.openChapter(firstTarget.book.id, firstTarget.initialChapter, {
        assignedChapters: firstTarget.chapters,
        dayNum,
        passage: refStr
      });
    },

    openDayReading(dayNum) {
      if (typeof BiblePlan === 'undefined' || !BiblePlan.getActivePlan) return;
      const activePlan = BiblePlan.getActivePlan();
      if (!activePlan) return;
      const dayData = activePlan.days.find(d => d.day === dayNum) || activePlan.days[0];
      if (dayData) {
        const passage = dayData.morning ? `${dayData.morning} / ${dayData.night}` : dayData.reading;
        this.openPassage(passage, dayNum);
      }
    },

    showModal() {
      const modal = document.getElementById('modal-bible-reader');
      if (modal) {
        modal.classList.add('active');
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.add('bible-full-page-active');
          document.body.style.overflow = 'hidden';
        }
      }
      this.updateOfflineUI();
      try {
        if (typeof window !== 'undefined' && window.location && window.location.hash !== '#bible') {
          window.history.pushState({ page: 'bible' }, '', '#bible');
        }
      } catch (e) {}
    },

    closeModal(isPopState = false) {
      const modal = document.getElementById('modal-bible-reader');
      if (modal) {
        modal.classList.remove('active');
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.remove('bible-full-page-active');
          document.body.style.overflow = '';
        }
      }
      this.closePicker();
      this.closeOfflineModal();
      try {
        if (!isPopState && typeof window !== 'undefined' && window.location && window.location.hash === '#bible') {
          if (window.history.state && window.history.state.page === 'bible') {
            window.history.back();
          } else {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      } catch (e) {}
    },

    // -----------------------------------------------------------------------
    // Preference Setters
    // -----------------------------------------------------------------------

    setViewMode(mode) {
      if (!['bilingual', 'telugu', 'english'].includes(mode)) return;
      this.viewMode = mode;
      try {
        localStorage.setItem('prayerly_bible_view_mode', mode);
      } catch (e) {}
      this.render();
    },

    setEnglishVersion(version) {
      if (!['niv', 'kjv'].includes(version)) return;
      this.englishVersion = version;
      try {
        localStorage.setItem('prayerly_bible_english_version', version);
      } catch (e) {}
      this.render();
    },

    adjustFontSize(delta) {
      const sizes = ['small', 'normal', 'large', 'xlarge'];
      let idx = sizes.indexOf(this.fontSize);
      if (idx === -1) idx = 1;
      idx = Math.max(0, Math.min(sizes.length - 1, idx + delta));
      this.fontSize = sizes[idx];
      try {
        localStorage.setItem('prayerly_bible_font_size', this.fontSize);
      } catch (e) {}
      const contentEl = document.getElementById('bible-reader-content');
      if (contentEl) {
        sizes.forEach(s => contentEl.classList.remove(`font-${s}`));
        contentEl.classList.add(`font-${this.fontSize}`);
      }
    },

    // -----------------------------------------------------------------------
    // Navigation (Next / Prev Chapter across entire Bible)
    // -----------------------------------------------------------------------

    nextChapter() {
      const book = BOOK_BY_ID.get(this.currentBookId);
      if (!book) return;

      if (this.currentChapter < book.chapters) {
        this.openChapter(book.id, this.currentChapter + 1, {
          assignedChapters: this.assignedChapters,
          clearContext: false
        });
      } else {
        // Go to next book
        const nextIdx = book.index; // 1-based index
        if (nextIdx < BIBLE_BOOKS.length) {
          const nextBook = BIBLE_BOOKS[nextIdx]; // next book
          this.openChapter(nextBook.id, 1, { clearContext: false });
        } else {
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast('You have reached the end of Revelation.', 'info');
          }
        }
      }
    },

    prevChapter() {
      const book = BOOK_BY_ID.get(this.currentBookId);
      if (!book) return;

      if (this.currentChapter > 1) {
        this.openChapter(book.id, this.currentChapter - 1, {
          assignedChapters: this.assignedChapters,
          clearContext: false
        });
      } else {
        // Go to previous book
        const prevIdx = book.index - 2; // 0-based
        if (prevIdx >= 0) {
          const prevBook = BIBLE_BOOKS[prevIdx];
          this.openChapter(prevBook.id, prevBook.chapters, { clearContext: false });
        }
      }
    },

    // -----------------------------------------------------------------------
    // Verse Interaction: Copy & Pray
    // -----------------------------------------------------------------------

    async copyVerse(verseNum, teluguText, englishText) {
      const book = BOOK_BY_ID.get(this.currentBookId);
      const bookTitle = `${book.telugu} (${book.name}) ${this.currentChapter}:${verseNum}`;

      let copyString = '';
      if (this.viewMode === 'bilingual') {
        copyString = `"${teluguText}"\n"${englishText}"\n— ${bookTitle} [${this.englishVersion.toUpperCase()}]`;
      } else if (this.viewMode === 'telugu') {
        copyString = `"${teluguText}"\n— ${book.telugu} ${this.currentChapter}:${verseNum}`;
      } else {
        copyString = `"${englishText}"\n— ${book.name} ${this.currentChapter}:${verseNum} [${this.englishVersion.toUpperCase()}]`;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(copyString);
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast('Verse copied to clipboard!', 'success');
          }
          return;
        } catch (e) {}
      }

      // Fallback prompt
      window.prompt('Copy scripture:', copyString);
    },

    prayVerse(verseNum, teluguText, englishText) {
      const book = BOOK_BY_ID.get(this.currentBookId);
      const ref = `${book.name} ${this.currentChapter}:${verseNum}`;
      const teluguRef = `${book.telugu} ${this.currentChapter}:${verseNum}`;

      const title = `Prayer Anchor: ${ref}`;
      const desc = `Scripture Meditation:\n"${teluguText}"\n"${englishText}"\n— ${teluguRef} (${ref})\n\nLord, I anchor this prayer in Your promise...`;

      this.closeModal();

      if (typeof window.openPrayerModal === 'function') {
        window.openPrayerModal({
          title,
          description: desc,
          category: 'Personal'
        });
      } else if (typeof App !== 'undefined' && App.openPrayerModal) {
        App.openPrayerModal({
          title,
          description: desc,
          category: 'Personal'
        });
      }
    },

    markDayRead() {
      if (!this.readingContext || !this.readingContext.dayNum) return;
      if (typeof BiblePlan !== 'undefined' && BiblePlan.toggleDay) {
        BiblePlan.toggleDay(this.readingContext.dayNum);
        const completeBtn = document.getElementById('bible-reader-complete-btn');
        if (completeBtn) {
          completeBtn.classList.add('btn-day-done');
          completeBtn.innerHTML = `<span>✓ Completed Day ${this.readingContext.dayNum}</span>`;
        }
      }
    },

    // -----------------------------------------------------------------------
    // Book & Chapter Picker Dialog
    // -----------------------------------------------------------------------

    togglePicker() {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (!pickerEl) return;
      if (pickerEl.style.display === 'none' || !pickerEl.style.display) {
        this.openPicker();
      } else {
        this.closePicker();
      }
    },

    openPicker() {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (!pickerEl) return;
      pickerEl.style.display = 'block';
      this.renderPicker('OT');
      this.updateOfflineUI();
    },

    closePicker() {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (pickerEl) pickerEl.style.display = 'none';
    },

    renderPicker(activeTestament = 'OT', filterQuery = '') {
      const container = document.getElementById('bible-picker-content');
      if (!container) return;

      const q = filterQuery.toLowerCase().trim();
      const filtered = BIBLE_BOOKS.filter(b => {
        if (q) {
          return b.name.toLowerCase().includes(q) || b.telugu.toLowerCase().includes(q);
        }
        return b.testament === activeTestament;
      });

      container.innerHTML = `
        <div class="bible-picker-tabs">
          <button class="bible-picker-tab ${!q && activeTestament === 'OT' ? 'active' : ''}" onclick="BibleReader.renderPicker('OT')">
            Old Testament (39)
          </button>
          <button class="bible-picker-tab ${!q && activeTestament === 'NT' ? 'active' : ''}" onclick="BibleReader.renderPicker('NT')">
            New Testament (27)
          </button>
        </div>
        <div class="bible-picker-search-wrap">
          <input type="text" class="bible-picker-search-input" placeholder="Search book (e.g. Genesis, Matthew)..." value="${filterQuery}" oninput="BibleReader.renderPicker('${activeTestament}', this.value)" />
        </div>
        <div class="bible-picker-grid">
          ${filtered.map(b => `
            <div class="bible-picker-book-card ${b.id === this.currentBookId ? 'current-book' : ''}">
              <div class="bible-picker-book-header" onclick="BibleReader.toggleBookChapters('${b.id}')">
                <div class="bible-picker-book-names">
                  <span class="bible-picker-telugu">${b.telugu}</span>
                  <span class="bible-picker-english">${b.name} (${b.chapters})</span>
                </div>
                <span class="bible-picker-arrow">&darr;</span>
              </div>
              <div id="chapters-grid-${b.id}" class="bible-picker-chapters-grid" style="${b.id === this.currentBookId ? 'display: flex;' : 'display: none;'}">
                ${Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => `
                  <button class="bible-picker-ch-btn ${b.id === this.currentBookId && ch === this.currentChapter ? 'active-ch' : ''}" onclick="BibleReader.selectChapter('${b.id}', ${ch})">
                    ${ch}
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    toggleBookChapters(bookId) {
      const el = document.getElementById(`chapters-grid-${bookId}`);
      if (el) {
        el.style.display = (el.style.display === 'none') ? 'flex' : 'none';
      }
    },

    selectChapter(bookId, ch) {
      this.closePicker();
      this.openChapter(bookId, ch, { clearContext: false });
    },

    // -----------------------------------------------------------------------
    // Main Reader Renderer
    // -----------------------------------------------------------------------

    async render() {
      const book = BOOK_BY_ID.get(this.currentBookId) || BIBLE_BOOKS[0];
      const titleEl = document.getElementById('bible-reader-title-text');
      const contentEl = document.getElementById('bible-reader-content');
      const assignedBarEl = document.getElementById('bible-reader-assigned-bar');
      const completeBtnWrap = document.getElementById('bible-reader-complete-wrap');

      // Update header title
      if (titleEl) {
        titleEl.innerHTML = `
          <span class="reader-title-english">${book.name} ${this.currentChapter}</span>
          ${(this.viewMode === 'telugu' || this.viewMode === 'bilingual') ? `
            <span class="reader-title-separator">&bull;</span>
            <span class="reader-title-telugu">${book.telugu}</span>
          ` : ''}
        `;
      }

      // Update active control pill classes
      const viewButtons = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
        ? document.querySelectorAll('.bible-reader-view-btn')
        : [];
      viewButtons.forEach(btn => {
        if (btn.getAttribute && btn.getAttribute('data-mode') === this.viewMode) {
          btn.classList.add('active');
        } else if (btn.classList) {
          btn.classList.remove('active');
        }
      });

      const transButtons = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
        ? document.querySelectorAll('.bible-reader-trans-btn')
        : [];
      transButtons.forEach(btn => {
        if (btn.getAttribute && btn.getAttribute('data-version') === this.englishVersion) {
          btn.classList.add('active');
        } else if (btn.classList) {
          btn.classList.remove('active');
        }
      });

      // Show/hide translation switcher depending on view mode
      const transToggleEl = document.getElementById('bible-reader-trans-toggle');
      if (transToggleEl) {
        transToggleEl.style.display = (this.viewMode === 'telugu') ? 'none' : 'inline-flex';
      }

      // Assigned chapter chips (if day reading has multiple chapters)
      if (assignedBarEl) {
        if (this.assignedChapters && this.assignedChapters.length > 1) {
          assignedBarEl.style.display = 'flex';
          assignedBarEl.innerHTML = `
            <span class="assigned-bar-label">Day Reading:</span>
            ${this.assignedChapters.map(ch => `
              <button class="assigned-chip ${ch === this.currentChapter ? 'active' : ''}" onclick="BibleReader.openChapter('${book.id}', ${ch}, { assignedChapters: BibleReader.assignedChapters, clearContext: false })">
                ${book.name} ${ch}
              </button>
            `).join('')}
          `;
        } else {
          assignedBarEl.style.display = 'none';
          assignedBarEl.innerHTML = '';
        }
      }

      // Mark Day Completed button
      if (completeBtnWrap) {
        if (this.readingContext && this.readingContext.dayNum) {
          const isDone = (typeof BiblePlan !== 'undefined' && BiblePlan.getState && BiblePlan.getState().completedDays.includes(this.readingContext.dayNum));
          completeBtnWrap.innerHTML = `
            <button id="bible-reader-complete-btn" class="bible-reader-footer-btn ${isDone ? 'btn-day-done' : 'btn-day-complete'}" onclick="BibleReader.markDayRead()">
              <span>${isDone ? `✓ Completed Day ${this.readingContext.dayNum}` : `Mark Day ${this.readingContext.dayNum} as Read`}</span>
            </button>
          `;
          completeBtnWrap.style.display = 'block';
        } else {
          completeBtnWrap.style.display = 'none';
          completeBtnWrap.innerHTML = '';
        }
      }

      // Loading skeleton
      if (contentEl) {
        contentEl.className = `bible-reader-content-body font-${this.fontSize} mode-${this.viewMode}`;
        contentEl.innerHTML = `
          <div class="bible-reader-loading">
            <div class="bible-reader-spinner"></div>
            <p class="bible-reader-loading-text">
              <span>Loading Scripture...</span>
            </p>
          </div>
        `;
      }

      try {
        const paired = await this.loadPairedChapter(book.id, this.currentChapter);

        if (!contentEl) return;

        if (paired.verses.length === 0) {
          contentEl.innerHTML = `
            <div class="bible-reader-empty">
              <p>Unable to load verses for this chapter right now. Please check your internet connection.</p>
              <button class="btn btn-secondary btn-sm" onclick="BibleReader.render()">Retry</button>
            </div>
          `;
          return;
        }

        // Render Verses
        const html = `
          <div class="bible-chapter-header">
            <h2 class="bible-chapter-h2">${paired.book.name} Chapter ${paired.chapter}</h2>
            ${(this.viewMode === 'telugu' || this.viewMode === 'bilingual') ? `
              <div class="bible-chapter-sub">${paired.book.telugu} &bull; ${paired.englishVersion}</div>
            ` : `
              <div class="bible-chapter-sub">${paired.englishVersion}</div>
            `}
          </div>
          <div class="bible-verses-stream">
            ${paired.verses.map(v => `
              <div class="bible-verse-row" id="verse-row-${v.verse}">
                <div class="verse-num-cell">
                  <span class="verse-num-badge">${v.verse}</span>
                </div>
                <div class="verse-text-cell">
                  ${(this.viewMode === 'bilingual' || this.viewMode === 'telugu') ? `
                    <p class="verse-text-telugu" lang="te">${this.escapeHtml(v.telugu || '')}</p>
                  ` : ''}
                  ${(this.viewMode === 'bilingual' || this.viewMode === 'english') ? `
                    <p class="verse-text-english" lang="en">${this.escapeHtml(v.english || '')}</p>
                  ` : ''}
                </div>
                <div class="verse-actions-cell">
                  <button class="btn-verse-tool" title="Copy verse" onclick="BibleReader.copyVerse(${v.verse}, '${this.escapeJs(v.telugu)}', '${this.escapeJs(v.english)}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                  <button class="btn-verse-tool btn-verse-pray" title="Pray this verse" onclick="BibleReader.prayVerse(${v.verse}, '${this.escapeJs(v.telugu)}', '${this.escapeJs(v.english)}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 13px; height: 13px;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    <span>Pray</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        contentEl.innerHTML = html;
        contentEl.scrollTop = 0;
        this.updateOfflineUI();
      } catch (err) {
        console.error('Error rendering chapter:', err);
        if (contentEl) {
          const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
          contentEl.innerHTML = `
            <div class="bible-reader-empty">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                ${isOffline ? 'Book Not Saved Offline Yet' : 'Failed to Load Scripture'}
              </h3>
              <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 14px auto; font-size: 13px; line-height: 1.5;">
                ${isOffline
                  ? `"${book.name}" has not been downloaded for offline reading yet. Connect to the internet once and tap "Download All" to have all 66 books available offline forever.`
                  : this.escapeHtml(err.message)}
              </p>
              <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="BibleReader.startFullOfflineDownload()">Download All for Offline</button>
                <button class="btn btn-secondary btn-sm" onclick="BibleReader.render()">Try Again</button>
              </div>
            </div>
          `;
        }
      }
    },

    // -----------------------------------------------------------------------
    // Offline Engine & Storage Manager
    // -----------------------------------------------------------------------

    async getOfflineStatus() {
      const keys = await BibleCache.getAllKeys();
      const keySet = new Set(keys);

      let teluguCount = 0;
      let nivCount = 0;
      let kjvCount = 0;

      BIBLE_BOOKS.forEach(b => {
        if (keySet.has(`telugu_${b.id}`)) teluguCount++;
        if (keySet.has(`niv_${b.id}`)) nivCount++;
        if (keySet.has(`kjv_${b.id}`)) kjvCount++;
      });

      const totalTarget = BIBLE_BOOKS.length; // 66
      const isFullyOffline = (teluguCount === totalTarget && nivCount === totalTarget);
      const percent = Math.min(100, Math.round(((teluguCount + nivCount) / (totalTarget * 2)) * 100));

      return {
        totalBooks: totalTarget,
        teluguCount,
        nivCount,
        kjvCount,
        isFullyOffline,
        percent
      };
    },

    async updateOfflineUI() {
      try {
        const status = await this.getOfflineStatus();

        // 1. Bible Reader Top Bar Button
        const offlineBtn = document.getElementById('bible-reader-offline-btn');
        const offlineIcon = document.getElementById('bible-reader-offline-icon');
        const offlineText = document.getElementById('bible-reader-offline-text');

        if (offlineBtn && offlineText && offlineIcon) {
          if (this.isDownloadingOffline) {
            offlineBtn.className = 'bible-offline-badge-btn downloading';
            offlineIcon.className = 'bible-offline-spinner';
            offlineIcon.textContent = '';
            offlineText.textContent = `Offline: ${this.offlineProgress.percent}%`;
            offlineBtn.title = `Downloading books (${this.offlineProgress.current} / ${this.offlineProgress.total})...`;
          } else if (status.isFullyOffline || status.teluguCount === status.totalBooks) {
            offlineBtn.className = 'bible-offline-badge-btn';
            offlineIcon.className = 'bible-offline-icon';
            offlineIcon.textContent = '✓';
            offlineText.textContent = 'Offline Ready';
            offlineBtn.title = '100% Offline Ready (All 66 Books Saved)';
          } else {
            offlineBtn.className = 'bible-offline-badge-btn needs-download';
            offlineIcon.className = 'bible-offline-icon';
            offlineIcon.textContent = '📥';
            offlineText.textContent = status.percent > 0 ? `${status.percent}% Offline` : 'Make Offline';
            offlineBtn.title = `Tap to download all 66 books (${status.teluguCount}/${status.totalBooks} saved)`;
          }
        }

        // 2. Picker Bar Label
        const pickerLabel = document.getElementById('bible-picker-offline-label');
        const pickerBtn = document.getElementById('bible-picker-offline-dl-btn');
        if (pickerLabel) {
          if (status.isFullyOffline) {
            pickerLabel.textContent = 'Offline: All 66 Books Available Offline (100%)';
            if (pickerBtn) pickerBtn.style.display = 'none';
          } else {
            pickerLabel.textContent = `Offline: ${status.teluguCount}/66 Books Saved (${status.percent}%)`;
            if (pickerBtn) {
              pickerBtn.style.display = 'inline-block';
              pickerBtn.textContent = this.isDownloadingOffline ? `Downloading (${status.percent}%)...` : 'Download All (Offline)';
            }
          }
        }

        // 3. Settings Card
        const settingsBadge = document.getElementById('settings-bible-offline-badge');
        if (settingsBadge) {
          if (status.isFullyOffline) {
            settingsBadge.className = 'badge';
            settingsBadge.style.background = 'rgba(16, 185, 129, 0.12)';
            settingsBadge.style.color = '#059669';
            settingsBadge.textContent = '100% Offline Ready';
          } else {
            settingsBadge.className = 'badge';
            settingsBadge.style.background = 'rgba(37, 99, 235, 0.1)';
            settingsBadge.style.color = 'var(--accent-interactive)';
            settingsBadge.textContent = `${status.percent}% Offline (${status.teluguCount}/${status.totalBooks} Books)`;
          }
        }

        // 4. Offline Dialog Stats
        const teluguStat = document.getElementById('bible-offline-telugu-stat');
        const nivStat = document.getElementById('bible-offline-niv-stat');
        const kjvStat = document.getElementById('bible-offline-kjv-stat');
        const dlBtnLabel = document.getElementById('btn-bible-download-label');

        if (teluguStat) teluguStat.textContent = `${status.teluguCount} / ${status.totalBooks} Books (${Math.round((status.teluguCount / status.totalBooks) * 100)}%)`;
        if (nivStat) nivStat.textContent = `${status.nivCount} / ${status.totalBooks} Books (${Math.round((status.nivCount / status.totalBooks) * 100)}%)`;
        if (kjvStat) kjvStat.textContent = `${status.kjvCount} / ${status.totalBooks} Books (${Math.round((status.kjvCount / status.totalBooks) * 100)}%)`;
        if (dlBtnLabel) {
          dlBtnLabel.textContent = status.isFullyOffline ? 'Re-verify All 66 Books' : 'Download All 66 Books';
        }
      } catch (e) {}
    },

    openOfflineModal() {
      const modal = document.getElementById('modal-bible-offline');
      if (modal) {
        modal.classList.add('active');
        this.updateOfflineUI();
      }
    },

    closeOfflineModal() {
      const modal = document.getElementById('modal-bible-offline');
      if (modal) {
        modal.classList.remove('active');
      }
    },

    async startFullOfflineDownload() {
      if (this.isDownloadingOffline) {
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Offline download is already in progress...', 'info');
        }
        return;
      }

      this.isDownloadingOffline = true;
      const progressSection = document.getElementById('bible-offline-progress-section');
      const settingsProgressWrap = document.getElementById('settings-bible-progress-bar-wrap');
      if (progressSection) progressSection.style.display = 'block';
      if (settingsProgressWrap) settingsProgressWrap.style.display = 'block';

      const totalTasks = BIBLE_BOOKS.length * 2; // Telugu + NIV
      let completed = 0;

      const keys = await BibleCache.getAllKeys();
      const keySet = new Set(keys);

      const updateProgress = (bookName, current, total) => {
        const pct = Math.min(100, Math.round((current / total) * 100));
        this.offlineProgress = { current, total, percent: pct };

        const msgEl = document.getElementById('bible-offline-progress-msg');
        const pctEl = document.getElementById('bible-offline-progress-pct');
        const fillEl = document.getElementById('bible-offline-progress-fill');
        const settingsFill = document.getElementById('settings-bible-progress-bar');
        const settingsPct = document.getElementById('settings-bible-progress-percent');
        const settingsLbl = document.getElementById('settings-bible-progress-label');

        if (msgEl) msgEl.textContent = `Saving ${bookName}... (${current}/${total})`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (settingsFill) settingsFill.style.width = `${pct}%`;
        if (settingsPct) settingsPct.textContent = `${pct}%`;
        if (settingsLbl) settingsLbl.textContent = `Saving ${bookName}...`;

        const offlineText = document.getElementById('bible-reader-offline-text');
        if (offlineText) offlineText.textContent = `Offline: ${pct}%`;
      };

      try {
        for (const book of BIBLE_BOOKS) {
          if (!this.isDownloadingOffline) break;

          // 1. Check & Download Telugu
          if (!keySet.has(`telugu_${book.id}`)) {
            try {
              await this.fetchBook('telugu', book.id);
            } catch (e) {}
          }
          completed++;
          updateProgress(book.telugu, completed, totalTasks);

          // Small yielding interval
          await new Promise(r => setTimeout(r, 20));

          // 2. Check & Download NIV
          if (!keySet.has(`niv_${book.id}`)) {
            try {
              await this.fetchBook('niv', book.id);
            } catch (e) {}
          }
          completed++;
          updateProgress(book.name, completed, totalTasks);

          await new Promise(r => setTimeout(r, 20));
        }

        this.isDownloadingOffline = false;
        await this.updateOfflineUI();

        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('All 66 books downloaded! Holy Bible is now 100% available offline.', 'success');
        }

        setTimeout(() => {
          if (progressSection) progressSection.style.display = 'none';
          if (settingsProgressWrap) settingsProgressWrap.style.display = 'none';
        }, 1500);
      } catch (err) {
        this.isDownloadingOffline = false;
        await this.updateOfflineUI();
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Offline download paused. Any downloaded books remain saved.', 'warning');
        }
      }
    },

    async clearOfflineCache() {
      if (typeof window !== 'undefined' && window.confirm) {
        const ok = window.confirm('Are you sure you want to clear the offline Bible cache? This will delete saved offline scripture files.');
        if (!ok) return;
      }
      this.isDownloadingOffline = false;
      await BibleCache.clear();
      MEM_CACHE.clear();
      await this.updateOfflineUI();
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Holy Bible offline cache cleared.', 'info');
      }
    },

    // -----------------------------------------------------------------------
    // Intelligent Background Auto-Preloading
    // Pre-caches current reading plan days, New Testament, and Psalms ahead of time
    // -----------------------------------------------------------------------

    autoCachePlanBooks() {
      if (typeof window === 'undefined') return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

      const runPreload = async () => {
        try {
          // 1. Preload Genesis and Matthew immediately
          await this.preloadBook('telugu', 'genesis');
          await this.preloadBook('niv', 'genesis');
          await this.preloadBook('telugu', 'matthew');
          await this.preloadBook('niv', 'matthew');

          // 2. Preload active plan's upcoming readings
          if (typeof BiblePlan !== 'undefined' && BiblePlan.getActivePlan) {
            const plan = BiblePlan.getActivePlan();
            if (plan && plan.days) {
              const currentDay = BiblePlan.getCurrentDayNumber ? BiblePlan.getCurrentDayNumber() : 1;
              const upcoming = plan.days.slice(Math.max(0, currentDay - 1), currentDay + 7);
              for (const day of upcoming) {
                const passage = day.morning ? `${day.morning} / ${day.night}` : day.reading;
                const parsed = this.parseReference(passage);
                for (const p of parsed) {
                  await this.preloadBook('telugu', p.book.id);
                  await this.preloadBook('niv', p.book.id);
                }
              }
            }
          }

          // 3. Progressively preload New Testament books during idle
          const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');
          for (const b of ntBooks) {
            await new Promise(r => setTimeout(r, 200));
            await this.preloadBook('telugu', b.id);
            await this.preloadBook('niv', b.id);
          }

          await this.updateOfflineUI();
        } catch (e) {}
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => runPreload(), { timeout: 3000 });
      } else {
        setTimeout(runPreload, 2500);
      }
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    escapeJs(str) {
      if (!str) return '';
      return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ');
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.BibleReader = BibleReader;
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', () => BibleReader.init());
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BibleReader;
  }
})();
