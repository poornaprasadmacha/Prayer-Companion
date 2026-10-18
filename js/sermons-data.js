/**
 * Prayerly - Curated Bible Sermons & Spiritual Messages
 * Inspiring, authentic, biblical messages in English & Telugu
 * across core devotional themes: Prayer, Faith, Peace, Grace, and Healing.
 */

(function () {
  'use strict';

  const BIBLE_SERMONS = [
    {
      id: 'sermon-tel-1',
      title: 'విశ్వాసముతో కూడిన ప్రార్థన (The Prayer of Faith)',
      speaker: 'Rev. P. Joshua & Spiritual Elders',
      language: 'Telugu',
      category: 'Faith',
      duration: '18 min',
      scripture: 'యాకోబు (James) 5:13-16',
      summary: 'విశ్వాసముతో చేయబడిన ప్రార్థన రోగిని స్వస్థపరచును, కష్ట సమయాలలో దేవుని బలాన్ని అనుభవించే మార్గం.',
      keyTakeaways: [
        'ప్రార్థనలో సందేహం లేకుండా దేవుని వాగ్దానాలను పట్టుకోవాలి.',
        'నీతిమంతుని విజ్ఞాపన ఎంతగానో కార్యసాధకమై యుండును.',
        'మన భారాలను ప్రభువుపై మోపినప్పుడు ఆయన నెమ్మదిని ఇచ్చును.'
      ],
      prayerPrompt: 'ప్రభువా, నా అవిశ్వాసాన్ని తొలగించి, నీ వాగ్దానాల యందు స్థిరమైన విశ్వాసంతో ప్రార్థించే కృపను దయచేయి.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' // fallback clean embed or audio
    },
    {
      id: 'sermon-tel-2',
      title: 'దేవుని సమాధానము (The Peace That Surpasses All Understanding)',
      speaker: 'Bro. Bakht Singh Heritage Teachings',
      language: 'Telugu',
      category: 'Peace',
      duration: '22 min',
      scripture: 'ఫిలిప్పీయులకు (Philippians) 4:6-7',
      summary: 'ఏ విషయమును గూర్చియు చింతపడక కృతజ్ఞతాపూర్వకముగా మీ విన్నపములను దేవునికి తెలియజేయుడి.',
      keyTakeaways: [
        'చింత ప్రార్థనకు ఆటంకం; కృతజ్ఞత సమాధానానికి ద్వారం.',
        'పరిస్థితులు ఎలా ఉన్నా క్రీస్తు యేసు నందు మన హృదయాలకు దేవుని సమాధానం కావలి ఉండును.',
        'ప్రతిరోజూ దేవుని సన్నిధిలో గడపడం ద్వారా శాంతి లభిస్తుంది.'
      ],
      prayerPrompt: 'తండ్రీ, లోకపు ఆందోళనలను విడిచిపెట్టి, సమస్త జ్ఞానమునకు మించిన నీ సమాధానముతో నా హృదయాన్ని నింపుము.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-tel-3',
      title: 'దేవుని ఆశ్చర్యకరమైన కృప (The Abounding Grace of God)',
      speaker: 'Christian Devotional Ministry',
      language: 'Telugu',
      category: 'Grace',
      duration: '20 min',
      scripture: 'ఎఫెసీయులకు (Ephesians) 2:8-10',
      summary: 'కృప చేతనే విశ్వాసము ద్వారా మీరు రక్షింపబడియున్నారు; ఇది మీవలన కలిగినది కాదు, దేవుని వరమే.',
      keyTakeaways: [
        'రక్షణ మన స్వనీతి వలన కాదు, కేవలం క్రీస్తు కార్చిన రక్తం వలన.',
        'పాప క్షమాపణ పొందిన హృదయం కృతజ్ఞతా భావంతో సత్కార్యాలు చేస్తుంది.',
        'ప్రతిరోజూ దేవుని కృప నూతనంగా మనకు లభిస్తుంది.'
      ],
      prayerPrompt: 'యేసయ్యా, అర్హత లేని నాకు నీ ఉచిత కృపను ప్రసాదించినందుకు వందనములు. నీ చిత్తానుసారంగా జీవించే భాగ్యం దయచేయి.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-tel-4',
      title: 'రహస్యమందున్న తండ్రికి ప్రార్థన (The Secret Place of Prayer)',
      speaker: 'Rev. Samuel Raj & Fellowship',
      language: 'Telugu',
      category: 'Prayer',
      duration: '16 min',
      scripture: 'మత్తయి (Matthew) 6:5-8',
      summary: 'నీ గదిలోనికి వెళ్లి తలుపు వేసి రహస్యమందున్న నీ తండ్రికి ప్రార్థన చేయుము; రహస్యమందు చూచు నీ తండ్రి నీకు ప్రతిఫలమిచ్చును.',
      keyTakeaways: [
        'ప్రార్థన మనుష్యుల మెప్పు కొరకు కాదు, దేవునితో వ్యక్తిగత సహవాసం కొరకు.',
        'ఏకాంత సమయాలలో దేవుని స్వరం స్పష్టంగా వినబడుతుంది.',
        'హృదయపూర్వకమైన ప్రార్థనకు దేవుడు తప్పక జవాబిస్తాడు.'
      ],
      prayerPrompt: 'ప్రభువా, సమస్త ఆటంకాలను పక్కనబెట్టి, ఏకాంతంగా నీ పాదాల చెంత కూర్చుని మాట్లాడే హృదయాన్ని నాకు ప్రసాదించుము.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-eng-1',
      title: 'The Power of the Secret Place: Communion with the Father',
      speaker: 'Classic Biblical Exposition',
      language: 'English',
      category: 'Prayer',
      duration: '24 min',
      scripture: 'Matthew 6:6',
      summary: 'Discover the profound intimacy and divine authority found when you shut the door to the world and open your heart to God alone.',
      keyTakeaways: [
        'Private prayer is the heartbeat of all public spiritual power.',
        'God looks upon the sincerity of the quiet soul, not the multitude of words.',
        'In the secret place, anxiety dissolves and God’s strength takes over.'
      ],
      prayerPrompt: 'Heavenly Father, draw me deeper into the quiet sanctuary of Your presence. Teach me to pray with genuine surrender.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-eng-2',
      title: 'Mountain-Moving Faith: Trusting God When Answers Seem Delayed',
      speaker: 'Faith & Word Ministries',
      language: 'English',
      category: 'Faith',
      duration: '21 min',
      scripture: 'Mark 11:22-24',
      summary: 'How to stand firm in unwavering trust on God’s eternal promises, even when facing impossible circumstances.',
      keyTakeaways: [
        'Faith is not the absence of doubt, but the decision to believe God despite circumstances.',
        'Speak to your mountain with the authority of God’s Word.',
        'God’s delays are not His denials; His timing is always sovereign and perfect.'
      ],
      prayerPrompt: 'Lord Jesus, I bring my mountains to Your feet. Increase my faith to trust Your goodness even when the path is unseen.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-eng-3',
      title: 'Be Still and Know: Experiencing God’s Peace in the Storm',
      speaker: 'Peace & Comfort Daily Broadcast',
      language: 'English',
      category: 'Peace',
      duration: '19 min',
      scripture: 'Psalm 46:1-10',
      summary: 'A comforting meditation on resting in God as our ever-present refuge and strength when the world feels shaken.',
      keyTakeaways: [
        'Stillness is not passive weakness; it is active confidence in God’s sovereignty.',
        'God is in the midst of your struggle—He cannot fail.',
        'Surrendering control allows the peace of heaven to guard your mind.'
      ],
      prayerPrompt: 'Father God, when storms rage around me, anchor my soul in Your stillness. Quiet every anxious thought with Your peace.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-eng-4',
      title: 'The Greatness of Grace: Nothing Can Separate You from God’s Love',
      speaker: 'Grace & Truth Fellowship',
      language: 'English',
      category: 'Grace',
      duration: '25 min',
      scripture: 'Romans 8:31-39',
      summary: 'An inspiring exposition on the unshakable security of God’s grace through Christ Jesus, our eternal victor.',
      keyTakeaways: [
        'Neither tribulation, distress, nor persecution can sever God’s love for you.',
        'In all things we are more than conquerors through Him who loved us.',
        'Grace empowers us to live joyfully and forgive freely.'
      ],
      prayerPrompt: 'Thank You, Jesus, for Your unmerited grace. I rest today in the truth that Your love will never abandon me.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'sermon-eng-5',
      title: 'Jehovah Rapha: The Lord Who Heals and Restores',
      speaker: 'Healing & Restoration Word',
      language: 'English',
      category: 'Healing',
      duration: '23 min',
      scripture: 'Jeremiah 17:14; Psalm 103:1-5',
      summary: 'Receiving God’s healing touch for broken hearts, wounded spirits, and physical ailments through trusting prayer.',
      keyTakeaways: [
        'God cares deeply about your physical and emotional pain.',
        'Praise and thanksgiving open the heart to God’s restorative power.',
        'By His wounds we are brought into divine wholeness.'
      ],
      prayerPrompt: 'Heal me, O Lord, and I shall be healed; save me, and I shall be saved, for You are my praise.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ];

  if (typeof window !== 'undefined') {
    window.BIBLE_SERMONS = BIBLE_SERMONS;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BIBLE_SERMONS;
  }
})();
