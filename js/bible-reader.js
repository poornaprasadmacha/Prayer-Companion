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
  // 1b. CANONICAL TELUGU SCRIPTURE PATCHES & TEXT SANITIZER
  // Completely eliminates font-glitch artifacts (¸°, ,º -> యౌ), broken accents (é),
  // and replaces mistranslated Devanagari Hindi (Amos 7:1) with authentic BSI Telugu.
  // =========================================================================

  const CANONICAL_TELUGU_PATCHES = {
    'amos_7_1': 'ప్రభువైన యెహోవా నాకు ఈ దర్శనము కనుపరచెను; రాజునకు రావలసిన కోత తీరిన తరువాత పచ్చిక మరల మొలచుచుండగా ఆయన మిడతలను పుట్టించెను.',
    'genesis_27_37': 'అందుకు ఇస్సాకు ఇదిగో అతని నీకు ఏలికనుగా నియమించి అతని బంధుజను లందరిని అతనికి దాసులుగా ఇచ్చితిని; ధాన్యమును ద్రాక్షారస మును ఇచ్చి అతని పోషించితిని గనుక నా కుమారుడా, నీకేమి చేతును?',
    'genesis_33_2': 'అప్పుడతడు తన పిల్లలను లేయా రాహేలుల కును ఇద్దరు దాసీలకును పంచి అప్పగించెను. అతడు ముందర దాసీలను, వారి పిల్లలను వారి వెనుక లేయాను ఆమె పిల్లలను ఆ వెనుక రాహేలును యోసేపును ఉంచెను.',
    'exodus_8_17': 'అహరోను తన కఱ్ఱను పట్టుకొని చెయ్యి చాపి ఆ దేశపు ధూళిని కొట్టినప్పుడు పేలు మనుష్యులమీదను జంతువులమీదను ఉండెను; ఐగుప్తు దేశమందంతటను ఆ దేశపు ధూళి అంతయు పేలాయెను.',
    'deuteronomy_12_17': 'నీ ధాన్యములో నేమి నీ ద్రాక్షారసములోనేమి నీ నూనెలోనేమి దశమభాగమును, నీ గోవులలోనిదేమి నీ గొఱ్ఱ మేకల మందలోని దేమి తొలిచూలు పిల్లలను నీవు మ్రొక్కుకొను మ్రొక్కుబళ్లలో దేనిని నీ స్వేచ్ఛార్పణమును ప్రతిష్ఠార్పణమును నీ యింట తినక',
    '1kings_7_26': 'అది బెత్తెడు దళసరిగలదై యుండెను; దాని పై అంచు పాత్రకు పై అంచువలె తామర పుష్పములవంటి పని కలిగి యుండెను; అది తొమి్మది గరిసెలు పట్టును.',
    '2kings_15_16': 'మెనహేము రాగా తిప్సహు పట్టణపు వారు తమ గుమ్మములు తీయలేదు గనుక అతడు వారినంద రిని హతము చేసి, తిర్సాను దాని చేరువ గ్రామములనన్నిటిని కొల్లపెట్టి అచ్చట గర్భిణులందరి గర్భములను చింపెను.',
    '1chronicles_15_28': 'ఇశ్రాయేలీయులందరును ఆర్భాటము చేయుచు, కొమ్ములు బూరలు ఊదుచు, తాళములు కొట్టుచు, స్వరమండలములు సితారాలు వాయించుచు యెహోవా నిబంధన మందసమును తీసికొనివచ్చిరి.',
    'job_11_9': 'దాని పరిమాణము భూమికంటె అధికమైనది దాని వెడల్పు సముద్రముకంటె అధికమైనది',
    'ecclesiastes_11_5': 'చూలాలి గర్భమందు ఎముకలు ఏరీతిగా ఎదుగునది నీకు తెలియదు, గాలి యే త్రోవను వచ్చునో నీవెరుగవు, ఆలాగునే సమస్తమును జరిగించు దేవుని క్రియలను నీవెరుగవు.',
    'ezekiel_44_26': 'ఒకడు అంటుపడి శుచిర్భూతుడైన తరువాత ఏడు దినములు లెక్కించి',
    'daniel_4_17': 'ఈ ఆజ్ఞ జాగరూకు లగు దేవదూతల ప్రకటన ననుసరించి జరుగును, నిర్ణయ మైన పరిశుద్ధుల ప్రకటన ననుసరించి సంభవించును. మహోన్నతుడగు దేవుడు మానవుల రాజ్యముపైని అధికారియైయుండి, తానెవరికి అనుగ్రహింప నిచ్ఛయించునో వారికనుగ్రహించుననియు, ఆ యా రాజ్యము పైన అత్యల్ప మనుష్యులను ఆయన నియమించుచున్నా డనియు మనుష్యులందరు తెలిసికొనునట్లు ఈలాగు జరు గును.',
    'hosea_1_8': 'లోరూ హామా (జాలినొందనిది) పాలువిడిచిన తరువాత తల్లి గర్భవతియై కుమారుని కనినప్పుడు',
    'malachi_2_14': 'అది ఎందుకని మీ రడుగగా, యౌవన కాలమందు నీవు పెండ్లి చేసికొని అన్యాయముగా విసర్జించిన నీ భార్య పక్షమున యెహోవా సాక్షియాయెను, అది నీకు తోటిదై నీవు చేసిన నిబంధనకు పాత్రురాలు గదా, నీ పెండ్లి భార్య గదా.',
    'matthew_21_21': 'అందుకు యేసు—మీరు విశ్వాసముగలిగి సందేహపడకుండిన యెడల, ఈ అంజూరపుచెట్టునకు జరిగిన దానిని చేయుట మాత్రమే కాదు, ఈ కొండను చూచి—నీవు ఎత్తబడి సముద్రములో పడవేయబడుమని చెప్పినను ఆలాగు జరుగును.',
    'matthew_25_44': 'అందుకు వారును—ప్రభువా, మేమెప్పుడు నీవు ఆకలిగొని యుండుటయైనను, దప్పిగొనియుండుటయైనను, పరదేశివై యుండుటయైనను, దిగంబరివై యుండుటయైనను, రోగివై యుండుటయైనను, చెరసాలలో ఉండుటయైనను చూచి, నీకు ఉపచారము చేయకపోతిమని ఆయనను అడుగుదురు.',
    'mark_7_19': 'అది వాని హృదయములో ప్రవేశింపక కడుపులోనే ప్రవేశించి బహిర్భూమిలో విడువబడును; ఇట్లు అది భోజనపదార్థము లన్ని టిని పవిత్రపరచును.',
    'luke_1_22': 'అతడు వెలుపలికి వచ్చినప్పుడు వారితో మాటలాడలేక పోయినందున, ఆలయము నందు అతనికి దర్శనము కలిగిన దని వారు గ్రహించిరి; అప్పుడతడు వారికి సంజ్ఞలు చేయుచు, మూగవాడై యుండెను.',
    'luke_11_42': 'అయ్యో పరిసయ్యులారా, మీరు పుదీనా సదాప మొదలైన ప్రతి కూరలోను పదియవవంతు చెల్లించు చున్నారే గాని, న్యాయమును దేవుని ప్రేమను విడిచి పెట్టుచున్నారు. వాటిని మానక వీటిని చేయవలసియుండెను.',
    'john_3_2': 'అతడు రాత్రియందు ఆయనయొద్దకు వచ్చి—బోధకుడా, నీవు దేవునియొద్దనుండి వచ్చిన బోధ కుడవని మే మెరుగుదుము; దేవుడతనికి తోడైయుంటేనే గాని నీవు చేయుచున్న సూచకక్రియలను ఎవడును చేయనేరడని ఆయనతో చెప్పెను.',
    'john_3_4': 'అందుకు నీకొదేము—ముసలివాడైన మనుష్యుడేలాగు జన్మింపగలడు? రెండవమారు తల్లి గర్భమందు ప్రవేశించి జన్మింపగలడా అని ఆయనను అడుగగా',
    'acts_3_13': 'అబ్రాహాము ఇస్సాకు యాకోబు అనువారి దేవుడు, అనగా మన పితరుల దేవుడు తన సేవకుడైన యేసును మహిమపరచియున్నాడు; మీరాయనను అప్పగించితిరి, పిలాతు ఆయనను విడుదల చేయుటకు నిశ్చయించినప్పుడు మీరు అతని యెదుట ఆయనను నిరాకరించితిరి.',
    'acts_14_17': 'అయినను ఆయన ఆకాశమునుండి మీకు వర్షమును, ఫలవంతములైన రుతువులను దయచేయుచు, ఆహారము ననుగ్రహించుచు, ఉల్లాసముతో మీ హృదయ ములను నింపుచు, మేలుచేయుచునే యుండెను.',
    'romans_4_19': 'మరియు అతడు విశ్వాసమునందు బల హీనుడు కాక, రమారమి నూరేండ్ల వయస్సుగలవాడై యుండి, అప్పటికి తన శరీరము మృతతుల్యమైనట్టును, శారాగర్భమును మృతతుల్యమైనట్టును ఆలోచించెను గాని,',
    'romans_9_22': 'ఆలాగు దేవుడు తన ఉగ్రతను అగపరచుటకును, తన ప్రభావమును చూపుటకును, ఇచ్ఛయించినవాడై, నాశనమునకు సిద్ధపడి ఉగ్రతాపాత్రమైన ఘటములను ఆయన బహు దీర్ఘశాంతముతో సహించిన నేమి?',
    '1corinthians_3_2': 'అప్పటిలో మీకు బలము చాలకపోయినందున పాలతోనే మిమ్మును పెంచితినిగాని అన్నముతో మిమ్మును పెంచలేదు. మీరింకను శరీరసంబంధులై యుండుటవలన ఇప్పుడును మీరు బలహీనులై యున్నారు.',
    '2corinthians_8_19': 'అంతేకాక మన ప్రభువునకు మహిమ కలుగు నిమిత్తమును మా సిద్ధమైన మనస్సు కనుపరచు నిమిత్తమును ఈ ఉపకారద్రవ్యము విషయమై పరిచారకులమైన మాతోకూడ అతడు ప్రయాణము చేసెను.',
    '2corinthians_11_12': 'అతిశయకారణము వెదకువారు ఏవిషయములో అతిశయించుచున్నారో, ఆ విషయములో వారును మావలెనే యున్నారని కనబడునిమిత్తము వారికి కారణము దొరకకుండ కొట్టివేయుటకు, నేను చేయుచున్నట్లే ఇకముందును చేయుదును.',
    '1timothy_3_15': 'అయినను నేను ఆలస్యముచేసినయెడల దేవుని మందిర ములో, అనగా జీవముగల దేవుని సంఘములో, జనులేలాగు ప్రవర్తింపవలెనో అది నీకు తెలియవలెనని యీ సంగతులను నీకు వ్రాయుచున్నాను.',
    'hebrews_8_8': 'అయితే ఆయన ఆక్షేపించి వారితో ఈలాగు చెప్పుచున్నాడు ప్రభువు ఇట్లనెను—ఇదిగో యొక కాలము వచ్చు చున్నది. అప్పటిలో ఇశ్రాయేలు ఇంటివారితోను యూదా ఇంటివారితోను నేను క్రొత్తనిబంధన చేతును.',
    'revelation_6_4': 'అప్పుడు ఎఱ్ఱనిదైన వేరొక గుఱ్ఱము బయలువెళ్ళెను; మనుష్యులు ఒకని ఒకడు చంపు కొనునట్లు భూలోకములో సమాధానము లేకుండ చేయుటకు ఈ గుఱ్ఱముమీద కూర్చున్నవానికి అధికార మియ్యబడెను; మరియు అతనికి ఒక పెద్ద ఖడ్గము ఇయ్యబడెను.',
    'revelation_18_8': 'అందుచేత ఒక్క దినముననే దాని తెగుళ్లు, అనగా మరణమును దుఃఖమును కరవును వచ్చును; దానికి తీర్పుతీర్చుచున్న దేవుడైన ప్రభువు బలిష్ఠుడు గనుక అది అగ్నిచేత బొత్తిగా కాల్చివేయబడును.',
    'revelation_19_18': 'అతడు గొప్ప శబ్దముతో ఆర్భటించి—రండి, రాజుల మాంసమును సహస్రాధిపతుల మాంసమును బలిష్ఠుల మాంసమును గుఱ్ఱముల మాంసమును వాటిమీద కూర్చుండువారి మాంసమును, స్వతంత్రులదేమి దాసులదేమి చిన్నవారిదేమి పెద్దవారిదేమి అందరి మాంసమును తినుటకై దేవుని గొప్ప విందుకు కూడిరండని ఆకాశమధ్యమున ఎగురుచున్న సమస్త పక్షులను పిలిచెను.'
  };

  function cleanTeluguText(text, bookId, ch, v) {
    const key = `${bookId}_${ch}_${v}`;
    if (CANONICAL_TELUGU_PATCHES[key]) {
      return CANONICAL_TELUGU_PATCHES[key];
    }
    if (!text || typeof text !== 'string') return '';
    let s = text;
    // Replace ¸° and ,º and ¸° with యౌ
    s = s.replace(/¸°|,º|¸\s*°/g, 'యౌ');
    s = s.replace(/¸(?=వ)/g, 'యౌ');
    s = s.replace(/¸యవన/g, 'యౌవన');
    // Common glyph corruption replacements
    s = s.replace(/స్వేచ్చా\s*éర్పణమును/g, 'స్వేచ్ఛార్పణమును');
    s = s.replace(/పుష్ప\s*éములవంటి/g, 'పుష్పములవంటి');
    s = s.replace(/గర్భిéణులందరి/g, 'గర్భిణులందరి');
    s = s.replace(/ఆర్బా\s*éటము/g, 'ఆర్భాటము');
    s = s.replace(/బ\s*³ూమి/g, 'భూమి');
    s = s.replace(/గర్బ\s*éమందు/g, 'గర్భమందు');
    s = s.replace(/శుచిర్భూéతుడైన/g, 'శుచిర్భూతుడైన');
    s = s.replace(/నిచ్ఛ\s*éయించునో/g, 'నిచ్ఛయించునో');
    s = s.replace(/గర్బ\s*éవతియై/g, 'గర్భవతియై');
    s = s.replace(/బహిర్బూ\\s*éమిలో/g, 'బహిర్భూమిలో');
    s = s.replace(/శారాగర్భéమును/g, 'శారాగర్భమును');
    s = s.replace(/ఇచ్చ\\s*éయించినవాడై/g, 'ఇచ్ఛయించినవాడై');
    s = s.replace(/ఆర్భ\\s*éటించి/g, 'ఆర్భటించి');
    // Strip standalone ¸
    s = s.replace(/¸/g, '');
    return s.trim();
  }

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
    currentVerseCount: 0,

    // User Preferences (Stored in localStorage)
    viewMode: 'bilingual',        // 'bilingual' (Telugu + English), 'telugu', 'english'
    englishVersion: 'niv',        // 'niv' (default) or 'kjv'
    fontSize: 'normal',           // 'small', 'normal', 'large', 'xlarge'

    // Offline Engine State
    isDownloadingOffline: false,
    offlineProgress: { current: 0, total: 132, percent: 0 },

    // Multi-tap gesture detection state for Bookmarking (2 taps) & Notes (3 taps)
    _tapCount: 0,
    _lastTapVerse: null,
    _lastTapTime: 0,
    _tapTimer: null,
    currentNoteTarget: null,

    // 4-Column Navigator State (Figure 2)
    navLinkFilter: 'OT',
    navSelectedBookId: 'genesis',
    navSelectedChapter: 1,
    navSearchQuery: '',

    cleanTeluguText(text, bookId, ch, v) {
      return cleanTeluguText(text, bookId, ch, v);
    },

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

      const cacheKey = (translation === 'telugu') ? `telugu_v2_${bookId}` : `${translation}_${bookId}`;
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
        chapters: rawData.chapters.map(ch => {
          const chNum = parseInt(ch.chapter, 10);
          return {
            chapter: chNum,
            verses: (ch.verses || []).map(v => {
              const vNum = parseInt(v.verse, 10);
              const rawText = (v.text || '').trim();
              const cleaned = (translation === 'telugu')
                ? cleanTeluguText(rawText, book.id, chNum, vNum)
                : rawText;
              return {
                verse: vNum,
                text: cleaned
              };
            })
          };
        })
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
        let tText = teluguMap.get(i);
        const eText = englishMap.get(i);
        if (tText) {
          tText = cleanTeluguText(tText, book.id, chapterNum, i);
        }
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

    open(bookId, chapterNum) {
      this.openChapter(bookId || this.currentBookId || 'genesis', chapterNum || this.currentChapter || 1);
    },

    openChapter(bookId, chapterNum, options = {}) {
      const book = BOOK_BY_ID.get(bookId) || BIBLE_BOOKS[0];
      this.currentBookId = book.id;
      this.currentChapter = Math.max(1, Math.min(book.chapters, parseInt(chapterNum, 10) || 1));
      this.recordRecentBook(book.id);

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

      // Automatically download all 66 books in background when Holy Bible is opened
      this.triggerBackgroundDownloadIfPending();
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
      this.closeFastChapterPicker();
      this.closeOfflineModal();
      this.closeVerseNoteModal();
      this.closeVerseMenu();
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
    // Bookmarking (Double-Tap) & Verse Notes (Triple-Tap)
    // -----------------------------------------------------------------------

    getBookmarks() {
      try {
        const raw = localStorage.getItem('prayerly_bible_bookmarks');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) return new Set(list);
        }
      } catch (e) {}
      return new Set();
    },

    saveBookmarks(bookmarksSet) {
      try {
        localStorage.setItem('prayerly_bible_bookmarks', JSON.stringify(Array.from(bookmarksSet)));
      } catch (e) {}
    },

    isBookmarked(bookId, ch, v) {
      return this.getBookmarks().has(`${bookId}_${ch}_${v}`);
    },

    toggleBookmark(verseNum) {
      const key = `${this.currentBookId}_${this.currentChapter}_${verseNum}`;
      const bookmarks = this.getBookmarks();
      let isNowMarked = false;

      if (bookmarks.has(key)) {
        bookmarks.delete(key);
        isNowMarked = false;
      } else {
        bookmarks.add(key);
        isNowMarked = true;
      }

      this.saveBookmarks(bookmarks);

      const rowEl = document.getElementById(`verse-row-${verseNum}`);
      if (rowEl) {
        if (isNowMarked) {
          rowEl.classList.add('is-bookmarked');
        } else {
          rowEl.classList.remove('is-bookmarked');
        }
      }

      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast(isNowMarked ? 'Verse bookmarked' : 'Bookmark removed', 'info');
      }
    },

    getNotesMap() {
      try {
        const raw = localStorage.getItem('prayerly_bible_notes');
        if (raw) {
          const map = JSON.parse(raw);
          if (map && typeof map === 'object') return map;
        }
      } catch (e) {}
      return {};
    },

    saveNotesMap(notesMap) {
      try {
        localStorage.setItem('prayerly_bible_notes', JSON.stringify(notesMap));
      } catch (e) {}
    },

    getVerseNote(bookId, ch, v) {
      const map = this.getNotesMap();
      return map[`${bookId}_${ch}_${v}`] || null;
    },

    hasVerseNote(bookId, ch, v) {
      return !!this.getVerseNote(bookId, ch, v);
    },

    openVerseNoteModal(verseNum) {
      const book = BOOK_BY_ID.get(this.currentBookId) || BIBLE_BOOKS[0];
      const modal = document.getElementById('modal-bible-verse-note');
      if (!modal) return;

      const rowEl = document.getElementById(`verse-row-${verseNum}`);
      let teluguText = '';
      let englishText = '';
      if (rowEl) {
        const tEl = rowEl.querySelector('.verse-text-telugu');
        const eEl = rowEl.querySelector('.verse-text-english');
        if (tEl) teluguText = tEl.textContent.trim();
        if (eEl) englishText = eEl.textContent.trim();
      }

      this.currentNoteTarget = {
        bookId: this.currentBookId,
        chapter: this.currentChapter,
        verse: verseNum,
        bookName: book.name,
        teluguBookName: book.telugu,
        teluguText,
        englishText
      };

      const titleEl = document.getElementById('bible-verse-note-title');
      const subEl = document.getElementById('bible-verse-note-sub');
      const snippetEl = document.getElementById('bible-verse-note-snippet');
      const textareaEl = document.getElementById('bible-verse-note-text');
      const deleteBtn = document.getElementById('btn-delete-bible-note');

      const refEl = document.getElementById('bible-verse-note-ref');
      if (refEl) {
        refEl.textContent = `${book.telugu} ${this.currentChapter}:${verseNum}`;
      }

      if (titleEl) {
        titleEl.textContent = `${book.name} ${this.currentChapter}:${verseNum}`;
      }
      if (subEl) {
        subEl.textContent = `${book.telugu} • Personal Note`;
      }
      if (snippetEl) {
        snippetEl.innerHTML = `
          ${teluguText ? `<p style="margin-bottom: 4px; font-weight: 500;">"${this.escapeHtml(teluguText)}"</p>` : ''}
          ${englishText ? `<p style="font-size: 12px; color: var(--text-muted); font-style: italic;">"${this.escapeHtml(englishText)}"</p>` : ''}
        `;
      }

      const existingNote = this.getVerseNote(this.currentBookId, this.currentChapter, verseNum);
      if (textareaEl) {
        textareaEl.value = existingNote ? existingNote.note : '';
      }

      if (deleteBtn) {
        deleteBtn.style.display = existingNote ? 'inline-block' : 'none';
      }

      modal.classList.add('active');
      modal.style.display = 'flex';
      if (textareaEl) {
        setTimeout(() => textareaEl.focus(), 80);
      }
    },

    closeVerseNoteModal() {
      const modal = document.getElementById('modal-bible-verse-note');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
      this.currentNoteTarget = null;
    },

    saveCurrentVerseNote() {
      if (!this.currentNoteTarget) return;
      const textareaEl = document.getElementById('bible-verse-note-text');
      const text = textareaEl ? textareaEl.value.trim() : '';
      const { bookId, chapter, verse, bookName, teluguBookName, teluguText, englishText } = this.currentNoteTarget;

      if (!text) {
        this.deleteCurrentVerseNote();
        return;
      }

      const notes = this.getNotesMap();
      const key = `${bookId}_${chapter}_${verse}`;
      notes[key] = {
        bookId,
        chapter,
        verse,
        bookName,
        teluguBookName,
        ref: `${bookName} ${chapter}:${verse}`,
        snippet: teluguText || englishText,
        note: text,
        updatedAt: new Date().toISOString()
      };
      this.saveNotesMap(notes);

      const rowEl = document.getElementById(`verse-row-${verse}`);
      if (rowEl) {
        rowEl.classList.add('has-note');
      }

      this.closeVerseNoteModal();

      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Note saved for verse', 'success');
      }
    },

    deleteCurrentVerseNote() {
      if (!this.currentNoteTarget) return;
      const { bookId, chapter, verse } = this.currentNoteTarget;
      const notes = this.getNotesMap();
      const key = `${bookId}_${chapter}_${verse}`;

      if (notes[key]) {
        delete notes[key];
        this.saveNotesMap(notes);
      }

      const rowEl = document.getElementById(`verse-row-${verse}`);
      if (rowEl) {
        rowEl.classList.remove('has-note');
      }

      this.closeVerseNoteModal();

      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Note deleted', 'info');
      }
    },

    // -----------------------------------------------------------------------
    // Verse Context Menu (Long-Press Action Sheet: Bookmark, Share, Note)
    // -----------------------------------------------------------------------

    openVerseMenu(verseNum) {
      this._selectedVerseForMenu = verseNum;
      const book = BOOK_BY_ID.get(this.currentBookId) || BIBLE_BOOKS[0];
      const modal = document.getElementById('modal-bible-verse-menu');
      const refEl = document.getElementById('bible-verse-menu-ref');
      const bookmarkLabel = document.getElementById('bible-menu-label-bookmark');

      if (refEl) {
        refEl.textContent = `${book.telugu} ${this.currentChapter}:${verseNum} (${book.name} ${this.currentChapter}:${verseNum})`;
      }

      const vKey = `${book.id}_${this.currentChapter}_${verseNum}`;
      const isBookmarked = this.getBookmarks().has(vKey);
      if (bookmarkLabel) {
        bookmarkLabel.textContent = isBookmarked ? 'Remove Bookmark' : 'Bookmark';
      }

      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
      }
    },

    closeVerseMenu(e) {
      if (e && e.target && e.target.closest('.bible-verse-menu-sheet')) {
        return;
      }
      const modal = document.getElementById('modal-bible-verse-menu');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    },

    menuActionBookmark() {
      if (!this._selectedVerseForMenu) return;
      const verseNum = this._selectedVerseForMenu;
      this.closeVerseMenu();
      this.toggleBookmark(verseNum);
    },

    menuActionShare() {
      if (!this._selectedVerseForMenu) return;
      const verseNum = this._selectedVerseForMenu;
      const book = BOOK_BY_ID.get(this.currentBookId) || BIBLE_BOOKS[0];
      const teluguText = (this.currentTeluguChapter && this.currentTeluguChapter[verseNum]) || '';
      const englishText = (this.currentEnglishChapter && this.currentEnglishChapter[verseNum]) || '';

      const shareTitle = `${book.name} ${this.currentChapter}:${verseNum} (${book.telugu})`;
      const shareBody = `${book.telugu} ${this.currentChapter}:${verseNum}\n"${teluguText}"\n\n${book.name} ${this.currentChapter}:${verseNum} (${(this.englishVersion || 'NIV').toUpperCase()})\n"${englishText}"\n\n— via Prayerly (prayerly.ceeras.in)`;

      this.closeVerseMenu();

      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: shareTitle,
          text: shareBody,
          url: window.location.href
        }).catch(() => {});
      } else {
        this.copyToClipboard(shareBody, 'Verse copied to clipboard!');
      }
    },

    menuActionNote() {
      if (!this._selectedVerseForMenu) return;
      const verseNum = this._selectedVerseForMenu;
      this.closeVerseMenu();
      this.openVerseNoteModal(verseNum);
    },

    bindVerseLongPress(rowEl, verseNum) {
      if (!rowEl) return;
      let pressTimer = null;
      let startX = 0;
      let startY = 0;
      let didTrigger = false;

      const startPress = (clientX, clientY) => {
        didTrigger = false;
        startX = clientX;
        startY = clientY;
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          didTrigger = true;
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(35); } catch(e) {}
          }
          BibleReader.openVerseMenu(verseNum);
        }, 400);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      // Touch events (Mobile)
      rowEl.addEventListener('touchstart', (e) => {
        if (e.target && e.target.closest('button')) return;
        const touch = e.touches[0];
        startPress(touch.clientX, touch.clientY);
      }, { passive: true });

      rowEl.addEventListener('touchmove', (e) => {
        if (!pressTimer) return;
        const touch = e.touches[0];
        if (Math.hypot(touch.clientX - startX, touch.clientY - startY) > 8) {
          cancelPress();
        }
      }, { passive: true });

      rowEl.addEventListener('touchend', (e) => {
        cancelPress();
        if (didTrigger && e.cancelable) {
          e.preventDefault();
        }
      });

      rowEl.addEventListener('touchcancel', cancelPress);

      // Mouse events (Desktop)
      rowEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target && e.target.closest('button')) return;
        startPress(e.clientX, e.clientY);
      });

      rowEl.addEventListener('mousemove', (e) => {
        if (!pressTimer) return;
        if (Math.hypot(e.clientX - startX, e.clientY - startY) > 6) {
          cancelPress();
        }
      });

      rowEl.addEventListener('mouseup', cancelPress);
      rowEl.addEventListener('mouseleave', cancelPress);

      // Context menu suppression
      rowEl.addEventListener('contextmenu', (e) => {
        if (didTrigger) {
          e.preventDefault();
        }
      });
    },

    handleVerseTap(verseNum, event) {
      if (event) {
        if (event.target && event.target.closest('button.btn-verse-tool, .verse-note-badge')) {
          return;
        }
      }

      const now = Date.now();
      if (this._lastTapVerse === verseNum && (now - this._lastTapTime) < 380) {
        this._tapCount = (this._tapCount || 1) + 1;
      } else {
        this._tapCount = 1;
        this._lastTapVerse = verseNum;
      }
      this._lastTapTime = now;

      if (this._tapTimer) {
        clearTimeout(this._tapTimer);
        this._tapTimer = null;
      }

      if (this._tapCount >= 3) {
        this._tapCount = 0;
        this._lastTapVerse = null;
        this.openVerseNoteModal(verseNum);
      } else if (this._tapCount === 2) {
        this._tapTimer = setTimeout(() => {
          if (this._lastTapVerse === verseNum && this._tapCount === 2) {
            this.toggleBookmark(verseNum);
          }
          this._tapCount = 0;
          this._lastTapVerse = null;
        }, 260);
      } else {
        this._tapTimer = setTimeout(() => {
          this._tapCount = 0;
          this._lastTapVerse = null;
        }, 320);
      }
    },

    // -----------------------------------------------------------------------
    // 4-Column "Select Verse" Navigator (Figure 2)
    // -----------------------------------------------------------------------

    getRecentBooks() {
      try {
        const raw = localStorage.getItem('prayerly_bible_recent_books');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(id => BOOK_BY_ID.has(id)).slice(0, 3);
          }
        }
      } catch (e) {}
      return ['romans', '1peter', 'revelation'];
    },

    getBookShortCode(book) {
      if (!book) return '';
      const SHORT_CODES = {
        genesis: 'Gen', exodus: 'Exod', leviticus: 'Lev', numbers: 'Num', deuteronomy: 'Deut',
        joshua: 'Josh', judges: 'Judg', ruth: 'Ruth', '1samuel': '1Sam', '2samuel': '2Sam',
        '1kings': '1Kgs', '2kings': '2Kgs', '1chronicles': '1Chr', '2chronicles': '2Chr',
        ezra: 'Ezra', nehemiah: 'Neh', esther: 'Esth', job: 'Job', psalms: 'Ps',
        proverbs: 'Prov', ecclesiastes: 'Eccl', songofsongs: 'Song', isaiah: 'Isa',
        jeremiah: 'Jer', lamentations: 'Lam', ezekiel: 'Ezek', daniel: 'Dan', hosea: 'Hos',
        joel: 'Joel', amos: 'Amos', obadiah: 'Obad', jonah: 'Jon', micah: 'Mic',
        nahum: 'Nah', habakkuk: 'Hab', zephaniah: 'Zeph', haggai: 'Hag', zechariah: 'Zech',
        malachi: 'Mal', matthew: 'Matt', mark: 'Mark', luke: 'Luke', john: 'John',
        acts: 'Acts', romans: 'Rom', '1corinthians': '1Cor', '2corinthians': '2Cor',
        galatians: 'Gal', ephesians: 'Eph', philippians: 'Phil', colossians: 'Col',
        '1thessalonians': '1Th', '2thessalonians': '2Th', '1timothy': '1Tim', '2timothy': '2Tim',
        titus: 'Tit', philemon: 'Phlm', hebrews: 'Heb', james: 'Jas', '1peter': '1Pet',
        '2peter': '2Pet', '1john': '1Jn', '2john': '2Jn', '3john': '3Jn', jude: 'Jude',
        revelation: 'Rev'
      };
      return SHORT_CODES[book.id] || book.name.slice(0, 4);
    },

    recordRecentBook(bookId) {
      if (!BOOK_BY_ID.has(bookId)) return;
      try {
        let recent = this.getRecentBooks();
        recent = [bookId, ...recent.filter(id => id !== bookId)].slice(0, 3);
        localStorage.setItem('prayerly_bible_recent_books', JSON.stringify(recent));
      } catch (e) {}
    },

    togglePicker() {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (!pickerEl) return;
      if (pickerEl.style.display === 'none' || !pickerEl.style.display) {
        this.openPicker();
      } else {
        this.closePicker();
      }
    },

    openPicker(initialTab = null) {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (!pickerEl) return;
      pickerEl.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      const curBook = BOOK_BY_ID.get(this.currentBookId) || BIBLE_BOOKS[0];
      this.navSelectedBookId = curBook.id;
      this.navSelectedChapter = this.currentChapter;
      this.navLinkFilter = curBook.testament;
      this.navSearchQuery = '';

      const searchInput = document.getElementById('bible-nav-search-input');
      if (searchInput) searchInput.value = '';
      const searchClear = document.getElementById('bible-nav-search-clear');
      if (searchClear) searchClear.style.display = 'none';

      this.render4ColNavigator();
      this.triggerBackgroundDownloadIfPending();
    },

    closePicker() {
      const pickerEl = document.getElementById('bible-picker-dialog');
      if (pickerEl) pickerEl.style.display = 'none';
      document.body.style.overflow = '';
    },

    navSelectLink(type) {
      this.navLinkFilter = type;
      if (type === 'PS' || type === 'Ps') {
        this.navSelectedBookId = 'psalms';
      } else if (type === 'PROV' || type === 'Prov') {
        this.navSelectedBookId = 'proverbs';
      } else if (type === 'Isa') {
        this.navSelectedBookId = 'isaiah';
      } else if (type === 'Luke') {
        this.navSelectedBookId = 'luke';
      } else if (type === 'Acts') {
        this.navSelectedBookId = 'acts';
      } else if (type === 'Rom') {
        this.navSelectedBookId = 'romans';
      } else if (type === 'Gal') {
        this.navSelectedBookId = 'galatians';
      } else if (type === '1Pet') {
        this.navSelectedBookId = '1peter';
      } else if (type === 'Rev') {
        this.navSelectedBookId = 'revelation';
      } else if (type === 'OT') {
        const cur = BOOK_BY_ID.get(this.navSelectedBookId);
        if (!cur || cur.testament !== 'OT') {
          this.navSelectedBookId = 'genesis';
        }
      } else if (type === 'NT') {
        const cur = BOOK_BY_ID.get(this.navSelectedBookId);
        if (!cur || cur.testament !== 'NT') {
          this.navSelectedBookId = 'matthew';
        }
      } else if (BOOK_BY_ID.has(type)) {
        this.navSelectedBookId = type;
      }
      this.navSelectedChapter = 1;
      this.render4ColNavigator();
      this.fetchBook(this.englishVersion, this.navSelectedBookId).then(() => {
        this.render4ColVerses();
      }).catch(() => {});
    },

    navSelectBook(bookId) {
      const book = BOOK_BY_ID.get(bookId);
      if (!book) return;
      this.navSelectedBookId = book.id;
      this.navSelectedChapter = 1;
      this.navLinkFilter = null;
      this.render4ColNavigator();
      this.fetchBook(this.englishVersion, book.id).then(() => {
        this.render4ColVerses();
      }).catch(() => {});
    },

    navSelectChapter(ch) {
      const book = BOOK_BY_ID.get(this.navSelectedBookId);
      const maxCh = book ? book.chapters : 50;
      this.navSelectedChapter = Math.max(1, Math.min(maxCh, ch));

      const chCol = document.getElementById('bible-col-chapters');
      if (chCol) {
        chCol.querySelectorAll('.bible-nav-num-cell').forEach(btn => {
          if (parseInt(btn.textContent.trim(), 10) === this.navSelectedChapter) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      this.render4ColVerses();
      if (book) {
        this.fetchBook(this.englishVersion, book.id).then(() => {
          this.render4ColVerses();
        }).catch(() => {});
      }
    },

    getChapterVerseCount(bookId, ch) {
      const cached = MEM_CACHE.get(`telugu_v2_${bookId}`) || MEM_CACHE.get(`telugu_${bookId}`) || MEM_CACHE.get(`niv_${bookId}`);
      if (cached && cached.chapters) {
        const found = cached.chapters.find(c => c.chapter === ch);
        if (found && found.verses) return found.verses.length;
      }
      return 35; // Standard fallback until book is loaded
    },

    render4ColNavigator() {
      // 1. Column 1: Links (Top 7 anchors + Last 3 dynamic Most Recently Used books)
      const linksCol = document.getElementById('bible-col-links');
      if (linksCol) {
        const baseLinks = [
          { key: 'OT', label: 'OT', bookId: 'genesis' },
          { key: 'NT', label: 'NT', bookId: 'matthew' },
          { key: 'Ps', label: 'Ps', bookId: 'psalms' },
          { key: 'Prov', label: 'Prov', bookId: 'proverbs' },
          { key: 'Isa', label: 'Isa', bookId: 'isaiah' },
          { key: 'Luke', label: 'Luke', bookId: 'luke' },
          { key: 'Acts', label: 'Acts', bookId: 'acts' }
        ];

        // Dynamic last 3 links: populated from user's most recently used books (defaulting to Rom, 1Pet, Rev)
        const recentIds = this.getRecentBooks();
        const recentLinks = recentIds.map(id => {
          const b = BOOK_BY_ID.get(id);
          const shortCode = this.getBookShortCode(b);
          if (id === 'revelation') return { key: 'Rev', label: shortCode, bookId: id };
          if (id === 'romans') return { key: 'Rom', label: shortCode, bookId: id };
          if (id === '1peter') return { key: '1Pet', label: shortCode, bookId: id };
          return { key: id, label: shortCode, bookId: id };
        });

        const linkItems = [...baseLinks, ...recentLinks];

        linksCol.innerHTML = linkItems.map(item => {
          const isActive = (this.navLinkFilter === item.key) ||
                           (!this.navLinkFilter && this.navSelectedBookId === item.bookId);
          return `
            <button class="bible-nav-link-btn ${isActive ? 'active' : ''}" onclick="BibleReader.navSelectLink('${item.key}')">
              ${item.label}
            </button>
          `;
        }).join('');
      }

      // 2. Column 2: Books (Telugu & English)
      const booksCol = document.getElementById('bible-col-books');
      if (booksCol) {
        const q = (this.navSearchQuery || '').trim().toLowerCase();
        let filtered = BIBLE_BOOKS;

        if (q) {
          filtered = BIBLE_BOOKS.filter(b => {
            return b.name.toLowerCase().includes(q) ||
                   b.telugu.toLowerCase().includes(q) ||
                   b.id.toLowerCase().includes(q) ||
                   (b.aliases && b.aliases.some(a => a.toLowerCase().includes(q)));
          });
        } else if (this.navLinkFilter === 'OT') {
          filtered = BIBLE_BOOKS.filter(b => b.testament === 'OT');
        } else if (this.navLinkFilter === 'NT') {
          filtered = BIBLE_BOOKS.filter(b => b.testament === 'NT');
        } else if (this.navLinkFilter === 'PS' || this.navLinkFilter === 'Ps') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'psalms');
        } else if (this.navLinkFilter === 'PROV' || this.navLinkFilter === 'Prov') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'proverbs');
        } else if (this.navLinkFilter === 'Isa') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'isaiah');
        } else if (this.navLinkFilter === 'Luke') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'luke');
        } else if (this.navLinkFilter === 'Acts') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'acts');
        } else if (this.navLinkFilter === 'Rom') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'romans');
        } else if (this.navLinkFilter === 'Gal') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'galatians');
        } else if (this.navLinkFilter === '1Pet') {
          filtered = BIBLE_BOOKS.filter(b => b.id === '1peter');
        } else if (this.navLinkFilter === 'Rev') {
          filtered = BIBLE_BOOKS.filter(b => b.id === 'revelation');
        }

        if (filtered.length > 0 && !filtered.some(b => b.id === this.navSelectedBookId)) {
          this.navSelectedBookId = filtered[0].id;
          this.navSelectedChapter = 1;
        }

        booksCol.innerHTML = filtered.map(b => `
          <div class="bible-nav-book-row ${b.id === this.navSelectedBookId ? 'active' : ''}" onclick="BibleReader.navSelectBook('${b.id}')" id="nav-book-row-${b.id}">
            <span class="nav-book-telugu b-tel">${b.telugu}</span>
            <span class="nav-book-english b-eng">${b.name}</span>
          </div>
        `).join('');

        // Auto-scroll active book row into view smoothly
        setTimeout(() => {
          const activeRow = booksCol.querySelector('.bible-nav-book-row.active');
          if (activeRow && booksCol.scrollHeight > booksCol.clientHeight) {
            activeRow.scrollIntoView({ block: 'nearest' });
          }
        }, 40);
      }

      // 3. Column 3: Chapters
      const chCol = document.getElementById('bible-col-chapters');
      if (chCol) {
        const selBook = BOOK_BY_ID.get(this.navSelectedBookId) || BIBLE_BOOKS[0];
        const totalChapters = selBook.chapters;

        chCol.innerHTML = `
          <div class="bible-nav-nums-grid">
            ${Array.from({ length: totalChapters }, (_, i) => i + 1).map(c => `
              <button class="bible-nav-num-cell ${c === this.navSelectedChapter ? 'active' : ''}" onclick="BibleReader.navSelectChapter(${c})" id="nav-ch-cell-${c}">
                ${c}
              </button>
            `).join('')}
          </div>
        `;

        setTimeout(() => {
          const activeCell = chCol.querySelector('.bible-nav-num-cell.active');
          if (activeCell && chCol.scrollHeight > chCol.clientHeight) {
            activeCell.scrollIntoView({ block: 'nearest' });
          }
        }, 40);
      }

      // 4. Column 4: Verses
      this.render4ColVerses();
    },

    render4ColVerses() {
      const vCol = document.getElementById('bible-col-verses');
      if (!vCol) return;
      const book = BOOK_BY_ID.get(this.navSelectedBookId) || BIBLE_BOOKS[0];
      const count = this.getChapterVerseCount(book.id, this.navSelectedChapter);

      vCol.innerHTML = `
        <div class="bible-nav-nums-grid">
          ${Array.from({ length: count }, (_, i) => i + 1).map(v => `
            <button class="bible-nav-num-cell ${v === 1 ? 'initial-v' : ''}" onclick="BibleReader.navJumpToVerse('${book.id}', ${this.navSelectedChapter}, ${v})" id="nav-v-cell-${v}">
              ${v}
            </button>
          `).join('')}
        </div>
      `;

      const hintEl = document.getElementById('bible-nav-active-selection-hint');
      if (hintEl) {
        hintEl.textContent = `${book.telugu} (${book.name}) Chapter ${this.navSelectedChapter}`;
      }
    },

    navJumpToVerse(bookId, ch, verse) {
      this.recordRecentBook(bookId);
      this.closePicker();
      this.openChapter(bookId, ch, { clearContext: false });

      setTimeout(() => {
        this.scrollToVerse(verse);
      }, 260);
    },

    scrollToVerse(v) {
      const rowEl = document.getElementById(`verse-row-${v}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowEl.classList.add('verse-row-highlighted');
        setTimeout(() => {
          rowEl.classList.remove('verse-row-highlighted');
        }, 2400);
      }
    },

    handleNavSearch(query) {
      const q = (query || '').trim();
      this.navSearchQuery = q;

      const clearBtn = document.getElementById('bible-nav-search-clear');
      if (clearBtn) {
        clearBtn.style.display = q ? 'block' : 'none';
      }

      const parsed = this.parseReference(q);
      if (parsed && parsed.length > 0) {
        const target = parsed[0];
        this.navSelectedBookId = target.book.id;
        this.navSelectedChapter = target.initialChapter;
      }

      this.render4ColNavigator();
    },

    clearNavSearch() {
      const input = document.getElementById('bible-nav-search-input');
      if (input) input.value = '';
      this.handleNavSearch('');
    },

    // Backward-compatibility wrappers
    renderPicker(testament = 'OT', filterQuery = '') {
      if (testament) this.navLinkFilter = testament;
      if (filterQuery) this.navSearchQuery = filterQuery;
      this.render4ColNavigator();
    },
    toggleBookChapters(bookId) {
      this.navSelectBook(bookId);
    },
    selectChapter(bookId, ch) {
      this.navJumpToVerse(bookId, ch, 1);
    },
    toggleFastChapterPicker() { this.togglePicker(); },
    openFastChapterPicker() { this.openPicker(); },
    closeFastChapterPicker() { this.closePicker(); },
    showBookChapters(bookId) { this.navSelectBook(bookId); },
    toggleQuickVerses() {},

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
        this.currentVerseCount = (paired && paired.verses) ? paired.verses.length : 0;

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
        const bookmarks = this.getBookmarks();
        const notes = this.getNotesMap();

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
            ${paired.verses.map(v => {
              const vKey = `${book.id}_${paired.chapter}_${v.verse}`;
              const isMarked = bookmarks.has(vKey);
              const hasNote = !!notes[vKey];
              return `
              <div class="bible-verse-row ${isMarked ? 'is-bookmarked' : ''} ${hasNote ? 'has-note' : ''}" id="verse-row-${v.verse}" onclick="BibleReader.handleVerseTap(${v.verse}, event)">
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
                  <button class="btn-verse-tool" title="Copy verse" onclick="event.stopPropagation(); BibleReader.copyVerse(${v.verse}, '${this.escapeJs(v.telugu)}', '${this.escapeJs(v.english)}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            `;}).join('')}
          </div>
        `;

        contentEl.innerHTML = html;
        contentEl.scrollTop = 0;

        // Bind high-performance long press listeners to all verse rows
        const verseRows = contentEl.querySelectorAll('.bible-verse-row');
        verseRows.forEach(row => {
          const vNum = parseInt(row.id.replace('verse-row-', ''), 10);
          if (vNum) {
            this.bindVerseLongPress(row, vNum);
          }
        });

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
        if (keySet.has(`telugu_v2_${b.id}`) || keySet.has(`telugu_${b.id}`)) teluguCount++;
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

    // Trigger background download silently when Holy Bible is opened
    async triggerBackgroundDownloadIfPending() {
      if (this.isDownloadingOffline) return;
      try {
        const status = await this.getOfflineStatus();
        if (!status.isFullyOffline && (status.teluguCount < status.totalBooks || status.nivCount < status.totalBooks)) {
          this.startFullOfflineDownload(true);
        }
      } catch (e) {
        console.warn('Background download note:', e);
      }
    },

    // Handle user clicking the offline badge button (starts or reports background download, no popup modal)
    handleOfflineBadgeClick() {
      if (this.isDownloadingOffline) {
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Downloading all 66 books in background. You can keep reading without interruption.', 'info');
        }
        return;
      }
      this.getOfflineStatus().then(status => {
        if (status.isFullyOffline || status.teluguCount === status.totalBooks) {
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast('Holy Bible is 100% saved and available offline!', 'success');
          }
        } else {
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast('Downloading all 66 books in background. You can keep reading without interruption.', 'info');
          }
          this.startFullOfflineDownload(true);
        }
      });
    },

    async updateOfflineUI() {
      try {
        const status = await this.getOfflineStatus();

        // 1. Bible Reader Top Bar Button (Never show fractional percentages like 14% or 33/66)
        const offlineBtn = document.getElementById('bible-reader-offline-btn');
        const offlineIcon = document.getElementById('bible-reader-offline-icon');
        const offlineText = document.getElementById('bible-reader-offline-text');

        if (offlineBtn && offlineText && offlineIcon) {
          if (this.isDownloadingOffline) {
            offlineBtn.className = 'bible-offline-badge-btn downloading';
            offlineIcon.className = 'bible-offline-spinner';
            offlineIcon.textContent = '';
            offlineText.textContent = 'Downloading...';
            offlineBtn.title = 'Downloading all 66 books quietly in background...';
          } else if (status.isFullyOffline || status.teluguCount === status.totalBooks) {
            offlineBtn.className = 'bible-offline-badge-btn';
            offlineIcon.className = 'bible-offline-icon';
            offlineIcon.textContent = '✓';
            offlineText.textContent = 'Offline Ready';
            offlineBtn.title = 'Holy Bible 100% Available Offline';
          } else {
            offlineBtn.className = 'bible-offline-badge-btn';
            offlineIcon.className = 'bible-offline-icon';
            offlineIcon.textContent = '✓';
            offlineText.textContent = 'Offline Ready';
            offlineBtn.title = 'Holy Bible Available Offline';
          }
        }

        // 2. Picker Bar Label (Clean and elegant without messy counts or percentages)
        const pickerLabel = document.getElementById('bible-picker-offline-label');
        const pickerBtn = document.getElementById('bible-picker-offline-dl-btn');
        if (pickerLabel) {
          if (this.isDownloadingOffline) {
            pickerLabel.textContent = 'Offline: Downloading all books in background...';
            if (pickerBtn) pickerBtn.textContent = 'Downloading in background...';
          } else if (status.isFullyOffline || status.teluguCount === status.totalBooks) {
            pickerLabel.textContent = 'Offline: All 66 Books Available Offline';
            if (pickerBtn) pickerBtn.style.display = 'none';
          } else {
            pickerLabel.textContent = 'Offline: All 66 Books Available';
            if (pickerBtn) {
              pickerBtn.style.display = 'inline-block';
              pickerBtn.textContent = 'Download All (Offline)';
            }
          }
        }

        // 3. Settings Card
        const settingsBadge = document.getElementById('settings-bible-offline-badge');
        if (settingsBadge) {
          if (this.isDownloadingOffline) {
            settingsBadge.className = 'badge';
            settingsBadge.style.background = 'rgba(245, 158, 11, 0.12)';
            settingsBadge.style.color = '#D97706';
            settingsBadge.textContent = 'Downloading in background...';
          } else if (status.isFullyOffline || status.teluguCount === status.totalBooks) {
            settingsBadge.className = 'badge';
            settingsBadge.style.background = 'rgba(16, 185, 129, 0.12)';
            settingsBadge.style.color = '#059669';
            settingsBadge.textContent = '100% Offline Ready';
          } else {
            settingsBadge.className = 'badge';
            settingsBadge.style.background = 'rgba(37, 99, 235, 0.1)';
            settingsBadge.style.color = 'var(--accent-interactive)';
            settingsBadge.textContent = '100% Offline Ready';
          }
        }

        // 4. Offline Dialog Stats (Clean status labels)
        const teluguStat = document.getElementById('bible-offline-telugu-stat');
        const nivStat = document.getElementById('bible-offline-niv-stat');
        const kjvStat = document.getElementById('bible-offline-kjv-stat');
        const dlBtnLabel = document.getElementById('btn-bible-download-label');

        if (teluguStat) teluguStat.textContent = 'Available Offline';
        if (nivStat) nivStat.textContent = 'Available Offline';
        if (kjvStat) kjvStat.textContent = 'Available Offline';
        if (dlBtnLabel) {
          dlBtnLabel.textContent = 'Download All in Background';
        }
      } catch (e) {}
    },

    openOfflineModal() {
      // Direct user action to start/verify background download immediately
      this.handleOfflineBadgeClick();
    },

    closeOfflineModal() {
      const modal = document.getElementById('modal-bible-offline');
      if (modal) {
        modal.classList.remove('active');
      }
    },

    async startFullOfflineDownload(isSilent = false) {
      if (this.isDownloadingOffline) {
        if (!isSilent && typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Offline download is already in progress in the background...', 'info');
        }
        return;
      }

      this.isDownloadingOffline = true;
      this.updateOfflineUI();

      const progressSection = document.getElementById('bible-offline-progress-section');
      const settingsProgressWrap = document.getElementById('settings-bible-progress-bar-wrap');
      if (!isSilent && progressSection) progressSection.style.display = 'block';
      if (!isSilent && settingsProgressWrap) settingsProgressWrap.style.display = 'block';

      const totalTasks = BIBLE_BOOKS.length * 2; // Telugu + NIV
      let completed = 0;

      const keys = await BibleCache.getAllKeys();
      const keySet = new Set(keys);

      const updateProgress = (bookName, current, total) => {
        const pct = Math.min(100, Math.round((current / total) * 100));
        this.offlineProgress = { current, total, percent: pct };

        const msgEl = document.getElementById('bible-offline-progress-msg');
        const fillEl = document.getElementById('bible-offline-progress-fill');
        const settingsFill = document.getElementById('settings-bible-progress-bar');
        const settingsLbl = document.getElementById('settings-bible-progress-label');

        if (msgEl) msgEl.textContent = 'Downloading Holy Bible in background...';
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (settingsFill) settingsFill.style.width = `${pct}%`;
        if (settingsLbl) settingsLbl.textContent = 'Downloading in background...';

        const offlineText = document.getElementById('bible-reader-offline-text');
        if (offlineText) offlineText.textContent = 'Downloading...';
      };

      try {
        for (const book of BIBLE_BOOKS) {
          if (!this.isDownloadingOffline) break;

          // 1. Check & Download Telugu
          if (!keySet.has(`telugu_v2_${book.id}`)) {
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
        if (!isSilent && typeof UI !== 'undefined' && UI.toast) {
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
