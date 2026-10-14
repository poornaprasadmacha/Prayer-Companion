/**
 * ============================================================================
 * PRAYER COMPANION - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * Production-ready backend for Prayer Companion Web App.
 * Handles Email OTP authentication, Session Management, Local-First Sync,
 * Multi-Timezone Scheduled Morning/Evening Emails, Community Prayer Companions,
 * Admin Allowlist & Dashboard APIs, Moderation, and Sheets Database.
 * ============================================================================
 */

// Designated Administrator Email & Allowlist
const DEFAULT_ADMIN_EMAIL = 'poornaprasad12344@gmail.com';

// Global configuration & worksheet definitions (16 total worksheets)
const SHEET_NAMES = {
  USERS: 'Users',
  OTP_REQUESTS: 'OTP_Requests',
  SESSIONS: 'Sessions',
  PRAYER_POINTS: 'Prayer_Points',
  PRAYER_HISTORY: 'Prayer_History',
  ANSWERED_PRAYERS: 'Answered_Prayers',
  THANKSGIVING_JOURNAL: 'Thanksgiving_Journal',
  USER_SETTINGS: 'User_Settings',
  SYNC_LOG: 'Sync_Log',
  EMAIL_LOG: 'Email_Log',
  DAILY_CONTENT: 'Daily_Content',
  // Community Worksheets
  COMMUNITY_REQUESTS: 'Community_Prayer_Requests',
  PRAYER_COMMITMENTS: 'Prayer_Commitments',
  PRAYER_ENCOURAGEMENTS: 'Prayer_Encouragements',
  COMMUNITY_REPORTS: 'Community_Reports',
  // Admin Audit Log
  ADMIN_AUDIT_LOG: 'Admin_Audit_Log'
};

const HEADERS = {
  Users: ['user_id', 'email', 'created_at', 'last_login', 'status'],
  OTP_Requests: ['request_id', 'email', 'otp_hash', 'salt', 'created_at', 'expires_at', 'attempts', 'verified', 'ip_hint'],
  Sessions: ['session_id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'last_active', 'revoked'],
  Prayer_Points: ['prayer_id', 'user_id', 'title', 'description', 'category', 'person_name', 'created_at', 'target_date', 'priority', 'reminder_preference', 'status', 'updated_at', 'is_deleted'],
  Prayer_History: ['history_id', 'user_id', 'prayer_id', 'date', 'prayed_at', 'is_deleted'],
  Answered_Prayers: ['answered_id', 'user_id', 'prayer_id', 'testimony', 'answered_date', 'created_at', 'updated_at', 'is_deleted'],
  Thanksgiving_Journal: ['entry_id', 'user_id', 'title', 'description', 'entry_date', 'category', 'linked_prayer_id', 'created_at', 'updated_at', 'is_deleted'],
  User_Settings: ['user_id', 'timezone', 'morning_email_enabled', 'morning_time', 'evening_email_enabled', 'evening_time', 'updated_at'],
  Sync_Log: ['log_id', 'user_id', 'device_id', 'action', 'records_synced', 'timestamp', 'status', 'details'],
  Email_Log: ['log_id', 'user_id', 'email_type', 'date_sent_for', 'sent_at', 'status', 'error_message'],
  Daily_Content: ['content_id', 'day_of_year', 'verse_text', 'verse_reference', 'verse_translation', 'quote_text', 'quote_author'],
  // Community Worksheets
  Community_Prayer_Requests: ['Request_ID', 'Owner_User_ID', 'Prayer_Title', 'Shared_Description', 'Display_Name', 'Is_Anonymous', 'Category', 'Shared_Date', 'Last_Updated', 'Status', 'Allow_Encouragement', 'Created_At', 'Updated_At'],
  Prayer_Commitments: ['Commitment_ID', 'Request_ID', 'Companion_User_ID', 'Created_At', 'Updated_At', 'Status'],
  Prayer_Encouragements: ['Message_ID', 'Request_ID', 'Sender_User_ID', 'Message_Text', 'Created_At', 'Status', 'Moderation_Status'],
  Community_Reports: ['Report_ID', 'Reporter_User_ID', 'Request_ID', 'Message_ID', 'Reason', 'Created_At', 'Status', 'Reviewed_At', 'Reviewed_By'],
  // Admin Audit Log
  Admin_Audit_Log: ['Audit_ID', 'Admin_Email', 'Action', 'Details', 'Timestamp', 'IP_Hint']
};

/**
 * Get active spreadsheet instance
 */
function getDb() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SPREADSHEET_ID');
  if (sheetId) {
    return SpreadsheetApp.openById(sheetId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Server-Side Administrator Allowlist Checker
 */
function getAdminEmails() {
  const props = PropertiesService.getScriptProperties();
  const custom = props.getProperty('ADMIN_EMAILS');
  if (custom) {
    return custom.split(',').map(e => e.trim().toLowerCase());
  }
  return [DEFAULT_ADMIN_EMAIL.toLowerCase()];
}

function isAdmin(email) {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.trim().toLowerCase());
}

/**
 * Record Administrative Audit Event
 */
function logAdminAudit(adminEmail, action, details, ipHint = '') {
  try {
    const ss = getDb();
    const sheet = ss.getSheetByName(SHEET_NAMES.ADMIN_AUDIT_LOG);
    if (!sheet) return;
    const auditId = 'aud_' + generateRandomString(16);
    sheet.appendRow([
      auditId,
      adminEmail,
      action,
      details,
      new Date().toISOString(),
      ipHint || ''
    ]);
  } catch (err) {
    Logger.log('Failed to log admin audit: ' + err.toString());
  }
}

/**
 * Database Initialization - Creates all 16 required sheets with formatted headers.
 * Run this function once after creating your Google Apps Script project.
 */
function setupDatabase() {
  const ss = getDb();
  for (const [key, sheetName] of Object.entries(SHEET_NAMES)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = HEADERS[sheetName];
    if (headers && (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0)) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#023E8A')
        .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }
  seedDailyContent();
  Logger.log('Prayer Companion Database successfully initialized with 16 worksheets!');
}

/**
 * Seed Daily_Content sheet with authentic scriptures and quotes on prayer.
 */
function seedDailyContent() {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.DAILY_CONTENT);
  if (!sheet) return;
  if (sheet.getLastRow() > 1) {
    return;
  }

  const content = [
    [1, 1, "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.", "Philippians 4:6-7", "World English Bible (WEB)", "To be a Christian without prayer is no more possible than to be alive without breathing.", "Martin Luther"],
    [2, 2, "Rejoice always. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.", "1 Thessalonians 5:16-18", "World English Bible (WEB)", "Prayer does not fit us for the greater work; prayer is the greater work.", "Oswald Chambers"],
    [3, 3, "But you, when you pray, enter into your inner room, and having shut your door, pray to your Father who is in secret, and your Father who sees in secret will reward you openly.", "Matthew 6:6", "World English Bible (WEB)", "God does nothing but by prayer, and everything with it.", "John Wesley"],
    [4, 4, "You shall call on me, and you shall go and pray to me, and I will listen to you. You shall seek me, and find me, when you search for me with all your heart.", "Jeremiah 29:12-13", "World English Bible (WEB)", "I have been driven many times upon my knees by the overwhelming conviction that I had nowhere else to go.", "Abraham Lincoln"],
    [5, 5, "He also spoke a parable to them that they must always pray, and not give up.", "Luke 18:1", "World English Bible (WEB)", "Prayer is not overcoming God's reluctance; it is laying hold for His highest willingness.", "Richard Trench"],
    [6, 6, "Therefore I tell you, all things whatever you pray and ask for, believe that you have received them, and you shall have them.", "Mark 11:24", "World English Bible (WEB)", "True prayer is neither a mere mental exercise nor a vocal performance. It is spiritual communion with the Father.", "A.W. Tozer"],
    [7, 7, "Confess your offenses to one another, and pray for one another, that you may be healed. The insistent prayer of a righteous person is powerfully effective.", "James 5:16", "World English Bible (WEB)", "Prayer is the slender nerve that moves the muscle of omnipotence.", "Charles Spurgeon"],
    [8, 8, "Continue steadfastly in prayer, watching therein with thanksgiving.", "Colossians 4:2", "World English Bible (WEB)", "The man who mobilizes the Christian church to pray will make the greatest contribution to world evangelization in history.", "Andrew Murray"],
    [9, 9, "With all prayer and requests, praying at all times in the Spirit, and being watchful to this end in all perseverance and requests for all the saints.", "Ephesians 6:18", "World English Bible (WEB)", "Talking to men for God is a great thing, but talking to God for men is greater still.", "E.M. Bounds"],
    [10, 10, "Yahweh is near to all those who call on him, to all who call on him in truth. He will fulfill the desire of those who fear him. He also will hear their cry, and will save them.", "Psalm 145:18-19", "World English Bible (WEB)", "Prayer changes us in ways that we never thought possible. When we are unhappy, prayer can bring us peace.", "Mother Teresa"],
    [11, 11, "Let’s therefore draw near with boldness to the throne of grace, that we may receive mercy, and may find grace for help in time of need.", "Hebrews 4:16", "World English Bible (WEB)", "We have to pray with our eyes on God, not on the difficulties.", "Oswald Chambers"],
    [12, 12, "Truly God has listened. He has attended to the voice of my prayer. Blessed be God, who has not turned away my prayer, nor his loving kindness from me.", "Psalm 66:19-20", "World English Bible (WEB)", "The great tragedy of life is not unanswered prayer, but unoffered prayer.", "F.B. Meyer"],
    [13, 13, "This is the boldness which we have toward him, that if we ask anything according to his will, he listens to us.", "1 John 5:14-15", "World English Bible (WEB)", "Prayer is not asking for what you think you want, but asking to be changed in ways you can't imagine at the time.", "Kathleen Norris"],
    [14, 14, "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you. For everyone who asks receives.", "Matthew 7:7-8", "World English Bible (WEB)", "When we pray, God hears more than we say, answers more than we ask, gives more than we imagine.", "Anonymous Christian Reflection"],
    [15, 15, "Rejoicing in hope; enduring in troubles; continuing steadfastly in prayer.", "Romans 12:12", "World English Bible (WEB)", "Four things let us ever keep in mind: God hears prayer, God heeds prayer, God answers prayer, and God delivers by prayer.", "E.M. Bounds"],
    [16, 16, "Yahweh, in the morning you will hear my voice. In the morning I will lay my requests before you, and will watch expectantly.", "Psalm 5:3", "World English Bible (WEB)", "The primary purpose of prayer is not to get things from God, but to get into God's presence.", "Richard Foster"],
    [17, 17, "The righteous cry, and Yahweh hears, and delivers them out of all their troubles.", "Psalm 34:17", "World English Bible (WEB)", "Is prayer your steering wheel or your spare tire?", "Corrie ten Boom"],
    [18, 18, "He will call on me, and I will answer him. I will be with him in trouble. I will deliver him, and honor him.", "Psalm 91:15", "World English Bible (WEB)", "Prayer is the open door into the heart and presence of God.", "Andrew Murray"],
    [19, 19, "I love Yahweh, because he listens to my voice, and my cries for mercy. Because he has turned his ear to me, therefore I will call on him as long as I live.", "Psalm 116:1-2", "World English Bible (WEB)", "Groanings which cannot be uttered are often prayers which cannot be refused.", "Charles Spurgeon"],
    [20, 20, "If my people, who are called by my name, will humble themselves, and pray, and seek my face, and turn from their wicked ways; then I will hear from heaven, and will forgive their sin, and will heal their land.", "2 Chronicles 7:14", "World English Bible (WEB)", "A prayerless Christian is a powerless Christian.", "Billy Graham"],
    [21, 21, "Hear, Yahweh, my prayer. Listen to the voice of my petitions. In the day of my trouble I will call on you, for you will answer me.", "Psalm 86:6-7", "World English Bible (WEB)", "Prayer does not change God, but it changes him who prays.", "Søren Kierkegaard"],
    [22, 22, "Watch and pray, that you don’t enter into temptation. The spirit indeed is willing, but the flesh is weak.", "Matthew 26:41", "World English Bible (WEB)", "Work as if you were to live a hundred years, pray as if you were to die tomorrow.", "Benjamin Franklin"],
    [23, 23, "If you remain in me, and my words remain in you, you will ask whatever you desire, and it will be done for you.", "John 15:7", "World English Bible (WEB)", "The beginning of anxiety is the end of faith, and the beginning of true faith is the end of anxiety.", "George Müller"],
    [24, 24, "In the same way, the Spirit also helps our weaknesses, for we don’t know how to pray as we ought. But the Spirit himself makes intercession for us with groanings which can’t be uttered.", "Romans 8:26", "World English Bible (WEB)", "In prayer it is better to have a heart without words than words without a heart.", "John Bunyan"],
    [25, 25, "Give thanks to Yahweh, for he is good, for his loving kindness endures forever.", "Psalm 107:1", "World English Bible (WEB)", "Thanksgiving is the soil in which prayer thrives and faith grows deep roots.", "C.S. Lewis"],
    [26, 26, "God, you are my God. I will earnestly seek you. My soul thirsts for you. My flesh longs for you, in a dry and weary land, where there is no water.", "Psalm 63:1", "World English Bible (WEB)", "Faith and prayer are the two arms by which the needy soul embraces the generosity of God.", "E.M. Bounds"],
    [27, 27, "When you said, 'Seek my face,' my heart said to you, 'I will seek your face, Yahweh.'", "Psalm 27:8", "World English Bible (WEB)", "We must lay before Him what is in us, not what ought to be in us.", "C.S. Lewis"],
    [28, 28, "Seek Yahweh while he may be found. Call on him while he is near.", "Isaiah 55:6", "World English Bible (WEB)", "God shapes the world by prayer. The more praying there is in the world, the better the world will be.", "E.M. Bounds"],
    [29, 29, "He has responded to the prayer of the destitute, and has not despised their prayer.", "Psalm 102:17", "World English Bible (WEB)", "Prayer is turning our will over to the will of God, trusting that His ways are higher than ours.", "Dietrich Bonhoeffer"],
    [30, 30, "Casting all your worries on him, because he cares for you.", "1 Peter 5:7", "World English Bible (WEB)", "Never be afraid to trust an unknown future to a known God.", "Corrie ten Boom"],
    [31, 31, "It is because of Yahweh’s loving kindnesses that we are not consumed, because his compassion doesn’t fail. They are new every morning. Great is your faithfulness.", "Lamentations 3:22-23", "World English Bible (WEB)", "Let prayer be the key of the morning and the bolt of the evening.", "Matthew Henry"]
  ];

  sheet.getRange(2, 1, content.length, 7).setValues(content);
  Logger.log('Seeded 31 days of scripture and quotes.');
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  return createJsonResponse({
    success: true,
    message: 'Prayer Companion API is live and operational.',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle HTTP POST Requests - Central Dispatcher
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        return createJsonResponse({ success: false, error: 'Malformed JSON payload.' }, 400);
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    if (!action) {
      return createJsonResponse({ success: false, error: 'Action parameter is required.' }, 400);
    }

    // Public Auth endpoints
    if (action === 'request_otp') {
      return handleRequestOtp(payload);
    }
    if (action === 'verify_otp') {
      return handleVerifyOtp(payload);
    }

    // Authenticated endpoints - Require valid session token
    const token = payload.token || (e.parameter && e.parameter.token);
    const authUser = validateSession(token);
    if (!authUser) {
      return createJsonResponse({
        success: false,
        error: 'Invalid, revoked, or expired session. Please log in again.',
        code: 'AUTH_REQUIRED'
      }, 401);
    }

    // Check Admin Endpoints
    if (action.startsWith('admin_')) {
      if (!isAdmin(authUser.email)) {
        logAdminAudit(authUser.email, 'unauthorized_admin_attempt', `Action: ${action}`, payload.client_hint);
        return createJsonResponse({
          success: false,
          error: 'Access Denied: You do not have administrator permissions.',
          code: 'FORBIDDEN'
        }, 403);
      }
      return handleAdminAction(action, authUser, payload);
    }

    // Authenticated User Endpoints
    switch (action) {
      case 'verify_session':
        return createJsonResponse({
          success: true,
          user: {
            ...authUser,
            is_admin: isAdmin(authUser.email)
          }
        });

      case 'logout':
        return handleLogout(token);

      case 'get_initial_data':
        return handleGetInitialData(authUser.user_id);

      case 'sync_push':
        return handleSyncPush(authUser.user_id, payload);

      case 'sync_pull':
        return handleSyncPull(authUser.user_id, payload);

      case 'update_settings':
        return handleUpdateSettings(authUser.user_id, payload);

      case 'send_test_email':
        return handleSendTestEmail(authUser);

      case 'export_user_data':
        return handleExportUserData(authUser.user_id);

      case 'delete_account':
        return handleDeleteAccount(authUser.user_id, token);

      // Community Prayer Companions Endpoints
      case 'community_share_request':
        return handleCommunityShareRequest(authUser, payload);

      case 'community_update_request':
        return handleCommunityUpdateRequest(authUser, payload);

      case 'community_delete_request':
        return handleCommunityDeleteRequest(authUser, payload);

      case 'community_get_requests':
        return handleCommunityGetRequests(authUser, payload);

      case 'community_toggle_commitment':
        return handleCommunityToggleCommitment(authUser, payload);

      case 'community_send_encouragement':
        return handleCommunitySendEncouragement(authUser, payload);

      case 'community_get_encouragements':
        return handleCommunityGetEncouragements(authUser, payload);

      case 'community_report_content':
        return handleCommunityReportContent(authUser, payload);

      default:
        return createJsonResponse({ success: false, error: 'Unknown action: ' + action }, 400);
    }
  } catch (err) {
    Logger.log('Critical error in doPost: ' + err.toString());
    return createJsonResponse({ success: false, error: 'Internal server error: ' + err.message }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Output JSON response with CORS
 */
function createJsonResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function hashSha256(str) {
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return signature.map(function(byte) {
    var v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function generateRandomString(length = 32) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Math.random().toString() + new Date().getTime().toString());
  const hex = bytes.map(function(byte) {
    var v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
  return hex.substring(0, length);
}

// ============================================================================
// AUTHENTICATION LOGIC (Email OTP & Sessions)
// ============================================================================

function handleRequestOtp(payload) {
  const email = (payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return createJsonResponse({ success: false, error: 'Please provide a valid email address.' }, 400);
  }

  const ss = getDb();
  const otpSheet = ss.getSheetByName(SHEET_NAMES.OTP_REQUESTS);
  const now = new Date().getTime();

  // Rate Limiting: Check if request was made in the last 60 seconds
  const otpData = otpSheet.getDataRange().getValues();
  for (let i = otpData.length - 1; i >= 1; i--) {
    const rowEmail = String(otpData[i][1]).toLowerCase();
    const createdAt = new Date(otpData[i][4]).getTime();
    if (rowEmail === email && (now - createdAt) < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - createdAt)) / 1000);
      return createJsonResponse({
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new code.`
      }, 429);
    }
  }

  const otp = Utilities.formatString('%06d', Math.floor(Math.random() * 1000000));
  const salt = generateRandomString(16);
  const otpHash = hashSha256(salt + otp);
  const requestId = 'req_' + generateRandomString(16);
  const createdAtIso = new Date(now).toISOString();
  const expiresAtIso = new Date(now + 5 * 60 * 1000).toISOString();

  otpSheet.appendRow([
    requestId,
    email,
    otpHash,
    salt,
    createdAtIso,
    expiresAtIso,
    0,
    false,
    payload.client_hint || ''
  ]);

  try {
    const emailSubject = "Your Prayer Companion Verification Code";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #B5E0F2; border-radius: 12px; background: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #023E8A; margin: 0; font-size: 24px;">Prayer Companion</h2>
          <p style="color: #008080; font-size: 14px; margin-top: 4px;">Personal Prayer & Thanksgiving</p>
        </div>
        <p style="color: #2D3748; font-size: 16px;">Hello,</p>
        <p style="color: #2D3748; font-size: 15px; line-height: 1.5;">Here is your secure verification code to access your prayer journal:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; padding: 14px 32px; background: #F0F9FF; border: 2px dashed #023E8A; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #023E8A;">
            ${otp}
          </div>
        </div>
        <p style="color: #718096; font-size: 13px; text-align: center;">This code will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #A0AEC0; font-size: 12px; text-align: center; margin: 0;">"Rejoice always. Pray without ceasing. In everything give thanks." &mdash; 1 Thess 5:16-18</p>
      </div>
    `;

    GmailApp.sendEmail(email, emailSubject, `Your verification code is ${otp}. It expires in 5 minutes.`, {
      htmlBody: emailHtml,
      name: "Prayer Companion"
    });

    return createJsonResponse({
      success: true,
      message: 'Verification code sent to ' + email,
      email: email,
      cooldown_seconds: 60
    });
  } catch (emailErr) {
    Logger.log('GmailApp error: ' + emailErr.toString());
    return createJsonResponse({
      success: false,
      error: 'Failed to send verification email. Please verify Gmail sending permissions and quota.'
    }, 500);
  }
}

function handleVerifyOtp(payload) {
  const email = (payload.email || '').trim().toLowerCase();
  const enteredOtp = (payload.otp || '').trim();

  if (!email || !enteredOtp) {
    return createJsonResponse({ success: false, error: 'Email and verification code are required.' }, 400);
  }

  const ss = getDb();
  const otpSheet = ss.getSheetByName(SHEET_NAMES.OTP_REQUESTS);
  const otpData = otpSheet.getDataRange().getValues();
  const now = new Date().getTime();

  let targetRowIndex = -1;
  let targetSalt = '';
  let targetHash = '';
  let attempts = 0;
  let expiresAtMs = 0;

  for (let i = otpData.length - 1; i >= 1; i--) {
    if (String(otpData[i][1]).toLowerCase() === email && !otpData[i][7]) {
      targetRowIndex = i + 1;
      targetHash = otpData[i][2];
      targetSalt = otpData[i][3];
      expiresAtMs = new Date(otpData[i][5]).getTime();
      attempts = Number(otpData[i][6]) || 0;
      break;
    }
  }

  if (targetRowIndex === -1) {
    return createJsonResponse({ success: false, error: 'No active code found. Please request a new one.' }, 400);
  }

  if (now > expiresAtMs) {
    return createJsonResponse({ success: false, error: 'Verification code has expired. Please request a new one.' }, 400);
  }

  if (attempts >= 5) {
    return createJsonResponse({ success: false, error: 'Maximum verification attempts exceeded. Please request a new code.' }, 429);
  }

  const computedHash = hashSha256(targetSalt + enteredOtp);
  if (computedHash !== targetHash) {
    otpSheet.getRange(targetRowIndex, 7).setValue(attempts + 1);
    const remaining = 5 - (attempts + 1);
    return createJsonResponse({
      success: false,
      error: `Incorrect code. ${remaining} attempt(s) remaining.`
    }, 400);
  }

  otpSheet.getRange(targetRowIndex, 8).setValue(true);

  // Find or create user
  const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const usersData = usersSheet.getDataRange().getValues();
  let userId = '';
  let userRowIndex = -1;

  for (let i = 1; i < usersData.length; i++) {
    if (String(usersData[i][1]).toLowerCase() === email) {
      userId = usersData[i][0];
      userRowIndex = i + 1;
      break;
    }
  }

  const nowIso = new Date().toISOString();
  if (!userId) {
    userId = 'usr_' + generateRandomString(16);
    usersSheet.appendRow([userId, email, nowIso, nowIso, 'active']);

    const settingsSheet = ss.getSheetByName(SHEET_NAMES.USER_SETTINGS);
    settingsSheet.appendRow([
      userId,
      'Asia/Kolkata',
      true,
      '03:00',
      true,
      '18:00',
      nowIso
    ]);
  } else {
    usersSheet.getRange(userRowIndex, 4).setValue(nowIso);
  }

  const rawSessionToken = generateRandomString(48);
  const sessionTokenHash = hashSha256(rawSessionToken);
  const sessionId = 'ses_' + generateRandomString(16);
  const sessionExpiresIso = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();

  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  sessionsSheet.appendRow([
    sessionId,
    userId,
    sessionTokenHash,
    nowIso,
    sessionExpiresIso,
    nowIso,
    false
  ]);

  return createJsonResponse({
    success: true,
    message: 'Authentication successful.',
    token: rawSessionToken,
    user: {
      user_id: userId,
      email: email,
      created_at: nowIso,
      is_admin: isAdmin(email)
    }
  });
}

function validateSession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const ss = getDb();
  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const tokenHash = hashSha256(rawToken);
  const data = sessionsSheet.getDataRange().getValues();
  const now = new Date().getTime();

  for (let i = 1; i < data.length; i++) {
    const rowTokenHash = data[i][2];
    const expiresAt = new Date(data[i][4]).getTime();
    const revoked = Boolean(data[i][6]);

    if (rowTokenHash === tokenHash) {
      if (revoked || now > expiresAt) {
        return null;
      }
      const userId = data[i][1];
      const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
      const usersData = usersSheet.getDataRange().getValues();
      let email = '';
      for (let j = 1; j < usersData.length; j++) {
        if (usersData[j][0] === userId) {
          if (usersData[j][4] === 'deleted') return null;
          email = usersData[j][1];
          break;
        }
      }
      return { user_id: userId, email: email };
    }
  }
  return null;
}

function handleLogout(rawToken) {
  const ss = getDb();
  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const tokenHash = hashSha256(rawToken);
  const data = sessionsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === tokenHash) {
      sessionsSheet.getRange(i + 1, 7).setValue(true);
      break;
    }
  }
  return createJsonResponse({ success: true, message: 'Logged out successfully.' });
}

// ============================================================================
// DATA SYNC ENGINE (Incremental, Local-First, Conflict-Resolution)
// ============================================================================

function handleGetInitialData(userId) {
  const ss = getDb();
  const prayers = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId, HEADERS.Prayer_Points);
  const history = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY), userId, HEADERS.Prayer_History);
  const answered = getRowsByUser(ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS), userId, HEADERS.Answered_Prayers);
  const thanksgiving = getRowsByUser(ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL), userId, HEADERS.Thanksgiving_Journal);
  const settings = getUserSettings(userId);

  return createJsonResponse({
    success: true,
    data: {
      prayers: prayers.filter(p => !p.is_deleted),
      history: history.filter(h => !h.is_deleted),
      answered: answered.filter(a => !a.is_deleted),
      thanksgiving: thanksgiving.filter(t => !t.is_deleted),
      settings: settings
    },
    synced_at: new Date().toISOString()
  });
}

function handleSyncPush(userId, payload) {
  const ss = getDb();
  const nowIso = new Date().toISOString();
  let syncCount = 0;

  if (Array.isArray(payload.prayers)) {
    const sheet = ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS);
    for (const item of payload.prayers) {
      if (!item.prayer_id) continue;
      upsertRecord(sheet, HEADERS.Prayer_Points, 'prayer_id', item.prayer_id, {
        prayer_id: item.prayer_id,
        user_id: userId,
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'General',
        person_name: item.person_name || '',
        created_at: item.created_at || nowIso,
        target_date: item.target_date || '',
        priority: item.priority || 'Medium',
        reminder_preference: item.reminder_preference || 'both',
        status: item.status || 'active',
        updated_at: item.updated_at || nowIso,
        is_deleted: Boolean(item.is_deleted)
      });
      syncCount++;
    }
  }

  if (Array.isArray(payload.history)) {
    const sheet = ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY);
    for (const item of payload.history) {
      if (!item.history_id) continue;
      upsertRecord(sheet, HEADERS.Prayer_History, 'history_id', item.history_id, {
        history_id: item.history_id,
        user_id: userId,
        prayer_id: item.prayer_id,
        date: item.date,
        prayed_at: item.prayed_at || nowIso,
        is_deleted: Boolean(item.is_deleted)
      });
      syncCount++;
    }
  }

  if (Array.isArray(payload.answered)) {
    const sheet = ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS);
    for (const item of payload.answered) {
      if (!item.answered_id) continue;
      upsertRecord(sheet, HEADERS.Answered_Prayers, 'answered_id', item.answered_id, {
        answered_id: item.answered_id,
        user_id: userId,
        prayer_id: item.prayer_id,
        testimony: item.testimony || '',
        answered_date: item.answered_date || nowIso.split('T')[0],
        created_at: item.created_at || nowIso,
        updated_at: item.updated_at || nowIso,
        is_deleted: Boolean(item.is_deleted)
      });
      syncCount++;
    }
  }

  if (Array.isArray(payload.thanksgiving)) {
    const sheet = ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL);
    for (const item of payload.thanksgiving) {
      if (!item.entry_id) continue;
      upsertRecord(sheet, HEADERS.Thanksgiving_Journal, 'entry_id', item.entry_id, {
        entry_id: item.entry_id,
        user_id: userId,
        title: item.title || '',
        description: item.description || '',
        entry_date: item.entry_date || nowIso.split('T')[0],
        category: item.category || 'General',
        linked_prayer_id: item.linked_prayer_id || '',
        created_at: item.created_at || nowIso,
        updated_at: item.updated_at || nowIso,
        is_deleted: Boolean(item.is_deleted)
      });
      syncCount++;
    }
  }

  if (payload.settings && typeof payload.settings === 'object') {
    saveUserSettings(userId, payload.settings);
    syncCount++;
  }

  const syncLogSheet = ss.getSheetByName(SHEET_NAMES.SYNC_LOG);
  syncLogSheet.appendRow([
    'sync_' + generateRandomString(16),
    userId,
    payload.device_id || 'web',
    'push',
    syncCount,
    nowIso,
    'success',
    `Synced ${syncCount} records`
  ]);

  return createJsonResponse({
    success: true,
    synced_records: syncCount,
    synced_at: nowIso
  });
}

function handleSyncPull(userId, payload) {
  const sinceTimestamp = payload.since ? new Date(payload.since).getTime() : 0;
  const ss = getDb();

  const prayers = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId, HEADERS.Prayer_Points, sinceTimestamp);
  const history = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY), userId, HEADERS.Prayer_History, sinceTimestamp);
  const answered = getRowsByUser(ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS), userId, HEADERS.Answered_Prayers, sinceTimestamp);
  const thanksgiving = getRowsByUser(ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL), userId, HEADERS.Thanksgiving_Journal, sinceTimestamp);
  const settings = getUserSettings(userId);

  return createJsonResponse({
    success: true,
    changes: {
      prayers: prayers,
      history: history,
      answered: answered,
      thanksgiving: thanksgiving,
      settings: settings
    },
    synced_at: new Date().toISOString()
  });
}

function upsertRecord(sheet, headers, idField, idValue, recordObj) {
  const data = sheet.getDataRange().getValues();
  const idColIdx = headers.indexOf(idField);
  const userColIdx = headers.indexOf('user_id');
  const updatedColIdx = headers.indexOf('updated_at');

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIdx] === idValue) {
      if (userColIdx !== -1 && data[i][userColIdx] !== recordObj.user_id) {
        return;
      }
      rowIndex = i + 1;
      break;
    }
  }

  const rowValues = headers.map(header => {
    return recordObj.hasOwnProperty(header) ? recordObj[header] : '';
  });

  if (rowIndex !== -1) {
    if (updatedColIdx !== -1 && recordObj.updated_at) {
      const existingUpdated = new Date(data[rowIndex - 1][updatedColIdx]).getTime();
      const incomingUpdated = new Date(recordObj.updated_at).getTime();
      if (incomingUpdated < existingUpdated) {
        return;
      }
    }
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function getRowsByUser(sheet, userId, headers, sinceTimestamp = 0) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const userColIdx = headers.indexOf('user_id');
  const updatedColIdx = headers.indexOf('updated_at');
  const createdColIdx = headers.indexOf('created_at');
  const result = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[userColIdx] === userId) {
      if (sinceTimestamp > 0) {
        const rowTime = updatedColIdx !== -1 && row[updatedColIdx]
          ? new Date(row[updatedColIdx]).getTime()
          : (createdColIdx !== -1 && row[createdColIdx] ? new Date(row[createdColIdx]).getTime() : 0);
        if (rowTime <= sinceTimestamp) {
          continue;
        }
      }
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx];
      });
      result.push(obj);
    }
  }
  return result;
}

// ============================================================================
// SETTINGS & USER PREFERENCES
// ============================================================================

function getUserSettings(userId) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_SETTINGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        user_id: data[i][0],
        timezone: data[i][1] || 'Asia/Kolkata',
        morning_email_enabled: Boolean(data[i][2]),
        morning_time: data[i][3] || '03:00',
        evening_email_enabled: Boolean(data[i][4]),
        evening_time: data[i][5] || '18:00',
        updated_at: data[i][6] || ''
      };
    }
  }

  return {
    user_id: userId,
    timezone: 'Asia/Kolkata',
    morning_email_enabled: true,
    morning_time: '03:00',
    evening_email_enabled: true,
    evening_time: '18:00',
    updated_at: new Date().toISOString()
  };
}

function saveUserSettings(userId, settingsObj) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_SETTINGS);
  const data = sheet.getDataRange().getValues();
  const nowIso = new Date().toISOString();

  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      foundRow = i + 1;
      break;
    }
  }

  const values = [
    userId,
    settingsObj.timezone || 'Asia/Kolkata',
    settingsObj.morning_email_enabled !== undefined ? settingsObj.morning_email_enabled : true,
    settingsObj.morning_time || '03:00',
    settingsObj.evening_email_enabled !== undefined ? settingsObj.evening_email_enabled : true,
    settingsObj.evening_time || '18:00',
    nowIso
  ];

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, HEADERS.User_Settings.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function handleUpdateSettings(userId, payload) {
  const settings = payload.settings || {};
  saveUserSettings(userId, settings);
  return createJsonResponse({
    success: true,
    message: 'Settings updated successfully.',
    settings: getUserSettings(userId)
  });
}

function handleExportUserData(userId) {
  const ss = getDb();
  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    prayers: getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId, HEADERS.Prayer_Points),
    history: getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY), userId, HEADERS.Prayer_History),
    answered: getRowsByUser(ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS), userId, HEADERS.Answered_Prayers),
    thanksgiving: getRowsByUser(ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL), userId, HEADERS.Thanksgiving_Journal),
    settings: getUserSettings(userId)
  };

  return createJsonResponse({
    success: true,
    export: exportData
  });
}

function handleDeleteAccount(userId, token) {
  const ss = getDb();
  softDeleteUserRows(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId);
  softDeleteUserRows(ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY), userId);
  softDeleteUserRows(ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS), userId);
  softDeleteUserRows(ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL), userId);

  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const sessionData = sessionsSheet.getDataRange().getValues();
  for (let i = 1; i < sessionData.length; i++) {
    if (sessionData[i][1] === userId) {
      sessionsSheet.getRange(i + 1, 7).setValue(true);
    }
  }

  const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const usersData = usersSheet.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      usersSheet.getRange(i + 1, 5).setValue('deleted');
      break;
    }
  }

  return createJsonResponse({
    success: true,
    message: 'Your account and personal prayer data have been deleted successfully.'
  });
}

function softDeleteUserRows(sheet, userId) {
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const isDeletedCol = data[0].indexOf('is_deleted');
  if (isDeletedCol === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      sheet.getRange(i + 1, isDeletedCol + 1).setValue(true);
    }
  }
}

// ============================================================================
// COMMUNITY PRAYER COMPANIONS (PRAY TOGETHER)
// ============================================================================

function handleCommunityShareRequest(authUser, payload) {
  const title = (payload.prayer_title || '').trim();
  const desc = (payload.shared_description || '').trim();
  const category = (payload.category || 'General').trim();
  const displayName = (payload.display_name || '').trim();
  const isAnonymous = Boolean(payload.is_anonymous);
  const allowEncouragement = payload.allow_encouragement !== undefined ? Boolean(payload.allow_encouragement) : true;

  if (!title) {
    return createJsonResponse({ success: false, error: 'Prayer title is required.' }, 400);
  }

  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS);
  const requestId = 'creq_' + Date.now() + '_' + generateRandomString(12);
  const nowIso = new Date().toISOString();
  const todayStr = nowIso.split('T')[0];

  sheet.appendRow([
    requestId,
    authUser.user_id,
    title,
    desc,
    isAnonymous ? 'Anonymous' : (displayName || 'Prayer Companion'),
    isAnonymous,
    category,
    todayStr,
    nowIso,
    'active',
    allowEncouragement,
    nowIso,
    nowIso
  ]);

  return createJsonResponse({
    success: true,
    message: 'Your prayer request has been shared with Prayer Companions.',
    request_id: requestId
  });
}

function handleCommunityUpdateRequest(authUser, payload) {
  const requestId = payload.request_id;
  if (!requestId) return createJsonResponse({ success: false, error: 'Request ID is required.' }, 400);

  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS);
  const data = sheet.getDataRange().getValues();
  const headers = HEADERS.Community_Prayer_Requests;

  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      if (data[i][1] !== authUser.user_id && !isAdmin(authUser.email)) {
        return createJsonResponse({ success: false, error: 'Unauthorized to edit this request.' }, 403);
      }
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow === -1) {
    return createJsonResponse({ success: false, error: 'Request not found.' }, 404);
  }

  const nowIso = new Date().toISOString();
  if (payload.prayer_title !== undefined) sheet.getRange(foundRow, 3).setValue(payload.prayer_title);
  if (payload.shared_description !== undefined) sheet.getRange(foundRow, 4).setValue(payload.shared_description);
  if (payload.display_name !== undefined) sheet.getRange(foundRow, 5).setValue(payload.display_name);
  if (payload.is_anonymous !== undefined) sheet.getRange(foundRow, 6).setValue(Boolean(payload.is_anonymous));
  if (payload.status !== undefined) sheet.getRange(foundRow, 10).setValue(payload.status);
  if (payload.allow_encouragement !== undefined) sheet.getRange(foundRow, 11).setValue(Boolean(payload.allow_encouragement));
  sheet.getRange(foundRow, 9).setValue(nowIso); // Last_Updated
  sheet.getRange(foundRow, 13).setValue(nowIso); // Updated_At

  return createJsonResponse({ success: true, message: 'Community request updated successfully.' });
}

function handleCommunityDeleteRequest(authUser, payload) {
  return handleCommunityUpdateRequest(authUser, { request_id: payload.request_id, status: 'deleted' });
}

function handleCommunityGetRequests(authUser, payload) {
  const ss = getDb();
  const reqSheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS);
  const comSheet = ss.getSheetByName(SHEET_NAMES.PRAYER_COMMITMENTS);

  const reqData = reqSheet.getDataRange().getValues();
  const comData = comSheet.getDataRange().getValues();

  // Supporter counts by Request_ID & Set of commitments for current user
  const commitmentCounts = {};
  const myCommitments = new Set();

  for (let i = 1; i < comData.length; i++) {
    const rId = comData[i][1];
    const uId = comData[i][2];
    const status = comData[i][5];

    if (status === 'active') {
      commitmentCounts[rId] = (commitmentCounts[rId] || 0) + 1;
      if (uId === authUser.user_id) {
        myCommitments.add(rId);
      }
    }
  }

  const filterType = payload.filter_type || 'recent'; // recent, most_supported, needs_prayer, my_requests
  const category = (payload.category || 'all').toLowerCase();
  const search = (payload.search || '').toLowerCase().trim();

  let list = [];
  for (let i = 1; i < reqData.length; i++) {
    const row = reqData[i];
    const status = row[9];
    const ownerId = row[1];

    if (status !== 'active') continue; // only active requests in public list

    if (filterType === 'my_requests' && ownerId !== authUser.user_id) continue;
    if (category !== 'all' && String(row[6]).toLowerCase() !== category) continue;

    if (search) {
      const match = String(row[2]).toLowerCase().includes(search) ||
                    String(row[3]).toLowerCase().includes(search) ||
                    String(row[4]).toLowerCase().includes(search);
      if (!match) continue;
    }

    const rId = row[0];
    const count = commitmentCounts[rId] || 0;

    list.push({
      request_id: rId,
      prayer_title: row[2],
      shared_description: row[3],
      display_name: Boolean(row[5]) ? 'Anonymous' : (row[4] || 'Prayer Companion'),
      is_anonymous: Boolean(row[5]),
      category: row[6],
      shared_date: row[7],
      allow_encouragement: Boolean(row[10]),
      created_at: row[11],
      supporters_count: count,
      is_committed_by_me: myCommitments.has(rId),
      is_owner: ownerId === authUser.user_id
    });
  }

  // Sort
  if (filterType === 'most_supported') {
    list.sort((a, b) => b.supporters_count - a.supporters_count);
  } else if (filterType === 'needs_prayer') {
    list.sort((a, b) => a.supporters_count - b.supporters_count);
  } else {
    // recent
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 20;
  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return createJsonResponse({
    success: true,
    requests: paginated,
    total: total,
    page: page,
    total_pages: Math.ceil(total / limit)
  });
}

function handleCommunityToggleCommitment(authUser, payload) {
  const requestId = payload.request_id;
  if (!requestId) return createJsonResponse({ success: false, error: 'Request ID is required.' }, 400);

  const ss = getDb();
  const comSheet = ss.getSheetByName(SHEET_NAMES.PRAYER_COMMITMENTS);
  const data = comSheet.getDataRange().getValues();
  const nowIso = new Date().toISOString();

  let targetRow = -1;
  let currentStatus = '';

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === requestId && data[i][2] === authUser.user_id) {
      targetRow = i + 1;
      currentStatus = data[i][5];
      break;
    }
  }

  let newStatus = 'active';
  if (targetRow !== -1) {
    if (currentStatus === 'active') {
      newStatus = 'inactive'; // toggle undo
    } else {
      newStatus = 'active';
    }
    comSheet.getRange(targetRow, 5).setValue(nowIso);
    comSheet.getRange(targetRow, 6).setValue(newStatus);
  } else {
    const commitmentId = 'com_' + Date.now() + '_' + generateRandomString(12);
    comSheet.appendRow([
      commitmentId,
      requestId,
      authUser.user_id,
      nowIso,
      nowIso,
      'active'
    ]);
  }

  // Recalculate supporter count
  const updatedData = comSheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < updatedData.length; i++) {
    if (updatedData[i][1] === requestId && updatedData[i][5] === 'active') {
      count++;
    }
  }

  return createJsonResponse({
    success: true,
    is_committed: newStatus === 'active',
    supporters_count: count,
    message: newStatus === 'active' ? 'You committed to pray for this request. God bless you!' : 'Prayer commitment removed.'
  });
}

function handleCommunitySendEncouragement(authUser, payload) {
  const requestId = payload.request_id;
  const messageText = (payload.message_text || '').trim();

  if (!requestId || !messageText) {
    return createJsonResponse({ success: false, error: 'Message and Request ID are required.' }, 400);
  }

  if (messageText.length > 300) {
    return createJsonResponse({ success: false, error: 'Message is too long (maximum 300 characters).' }, 400);
  }

  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.PRAYER_ENCOURAGEMENTS);
  const msgId = 'msg_' + Date.now() + '_' + generateRandomString(12);
  const nowIso = new Date().toISOString();

  sheet.appendRow([
    msgId,
    requestId,
    authUser.user_id,
    messageText,
    nowIso,
    'active',
    'approved'
  ]);

  return createJsonResponse({
    success: true,
    message: 'Encouragement message sent.',
    message_id: msgId
  });
}

function handleCommunityGetEncouragements(authUser, payload) {
  const requestId = payload.request_id;
  if (!requestId) return createJsonResponse({ success: false, error: 'Request ID is required.' }, 400);

  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.PRAYER_ENCOURAGEMENTS);
  const data = sheet.getDataRange().getValues();

  const messages = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === requestId && data[i][5] === 'active' && data[i][6] === 'approved') {
      messages.push({
        message_id: data[i][0],
        message_text: data[i][3],
        created_at: data[i][4],
        is_mine: data[i][2] === authUser.user_id
      });
    }
  }

  messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return createJsonResponse({ success: true, messages: messages });
}

function handleCommunityReportContent(authUser, payload) {
  const requestId = payload.request_id || '';
  const messageId = payload.message_id || '';
  const reason = (payload.reason || 'Inappropriate content').trim();

  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REPORTS);
  const reportId = 'rep_' + Date.now() + '_' + generateRandomString(12);
  const nowIso = new Date().toISOString();

  sheet.appendRow([
    reportId,
    authUser.user_id,
    requestId,
    messageId,
    reason,
    nowIso,
    'pending',
    '',
    ''
  ]);

  return createJsonResponse({
    success: true,
    message: 'Thank you for reporting. Our moderation team will review this promptly.'
  });
}

// ============================================================================
// ADMIN DASHBOARD & AUDIT APIS (STRICT ALLOWLIST ACCESS)
// ============================================================================

function handleAdminAction(action, authAdmin, payload) {
  const adminEmail = authAdmin.email;

  switch (action) {
    case 'admin_get_overview': {
      logAdminAudit(adminEmail, 'view_overview', 'Dashboard overview requested');
      const stats = calculateServerSideStats();
      return createJsonResponse({ success: true, stats: stats });
    }

    case 'admin_get_users': {
      logAdminAudit(adminEmail, 'view_users', `Search: ${payload.search || 'none'}`);
      const usersList = getAdminUsersList(payload);
      return createJsonResponse({ success: true, ...usersList });
    }

    case 'admin_get_prayer_stats': {
      logAdminAudit(adminEmail, 'view_prayer_stats', 'Prayer statistics charts requested');
      const stats = getAdminPrayerTrends(payload);
      return createJsonResponse({ success: true, trends: stats });
    }

    case 'admin_get_prayer_points': {
      logAdminAudit(adminEmail, 'inspect_prayer_points', `Filters: user=${payload.email || 'all'}, cat=${payload.category || 'all'}`);
      const result = getAdminPrayerPoints(payload);
      return createJsonResponse({ success: true, ...result });
    }

    case 'admin_get_email_logs': {
      logAdminAudit(adminEmail, 'view_email_logs', `Status: ${payload.status || 'all'}`);
      const logs = getAdminEmailLogs(payload);
      return createJsonResponse({ success: true, ...logs });
    }

    case 'admin_get_audit_logs': {
      const audits = getAdminAuditLogs(payload);
      return createJsonResponse({ success: true, ...audits });
    }

    case 'admin_get_moderation_reports': {
      logAdminAudit(adminEmail, 'view_moderation_reports', 'Reviewing community reports');
      const reports = getAdminModerationReports(payload);
      return createJsonResponse({ success: true, ...reports });
    }

    case 'admin_moderate_content': {
      const modResult = handleAdminModerateContent(adminEmail, payload);
      return createJsonResponse(modResult);
    }

    case 'admin_send_test_email': {
      logAdminAudit(adminEmail, 'send_admin_test_email', `Sent test to ${adminEmail}`);
      const userDateStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
      sendMorningEmail(authAdmin.user_id, adminEmail, 'Asia/Kolkata', userDateStr);
      return createJsonResponse({ success: true, message: 'Test email successfully sent to ' + adminEmail });
    }

    default:
      return createJsonResponse({ success: false, error: 'Unknown admin action: ' + action }, 400);
  }
}

/**
 * Server-Side Calculation of Aggregate Statistics for Admin Overview
 */
function calculateServerSideStats() {
  const ss = getDb();
  const users = ss.getSheetByName(SHEET_NAMES.USERS).getDataRange().getValues();
  const prayers = ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS).getDataRange().getValues();
  const history = ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY).getDataRange().getValues();
  const answered = ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS).getDataRange().getValues();
  const thanksgiving = ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL).getDataRange().getValues();
  const settings = ss.getSheetByName(SHEET_NAMES.USER_SETTINGS).getDataRange().getValues();
  const emailLog = ss.getSheetByName(SHEET_NAMES.EMAIL_LOG).getDataRange().getValues();
  const commRequests = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS).getDataRange().getValues();
  const commitments = ss.getSheetByName(SHEET_NAMES.PRAYER_COMMITMENTS).getDataRange().getValues();
  const encouragements = ss.getSheetByName(SHEET_NAMES.PRAYER_ENCOURAGEMENTS).getDataRange().getValues();
  const reports = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REPORTS).getDataRange().getValues();

  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

  // Users stats
  let totalUsers = 0;
  let newUsersToday = 0;
  let usersLast7Days = 0;

  for (let i = 1; i < users.length; i++) {
    if (users[i][4] !== 'deleted') {
      totalUsers++;
      const createdAt = new Date(users[i][2]);
      const createdStr = Utilities.formatDate(createdAt, 'Asia/Kolkata', 'yyyy-MM-dd');
      if (createdStr === todayStr) newUsersToday++;
      if (createdAt.getTime() >= sevenDaysAgo) usersLast7Days++;
    }
  }

  // Prayer points stats
  let totalActivePrayers = 0;
  let prayersCreatedToday = 0;
  for (let i = 1; i < prayers.length; i++) {
    if (!prayers[i][12] && prayers[i][10] === 'active') { // not deleted, active
      totalActivePrayers++;
      const createdStr = Utilities.formatDate(new Date(prayers[i][6]), 'Asia/Kolkata', 'yyyy-MM-dd');
      if (createdStr === todayStr) prayersCreatedToday++;
    }
  }

  // Prayers marked as prayed today
  const prayedTodayUnique = new Set();
  for (let i = 1; i < history.length; i++) {
    if (!history[i][5] && history[i][3] === todayStr) {
      prayedTodayUnique.add(history[i][1] + '_' + history[i][2]);
    }
  }

  // Answered & Thanksgiving totals
  let totalAnswered = 0;
  for (let i = 1; i < answered.length; i++) {
    if (!answered[i][7]) totalAnswered++;
  }

  let totalThanksgiving = 0;
  for (let i = 1; i < thanksgiving.length; i++) {
    if (!thanksgiving[i][9]) totalThanksgiving++;
  }

  // Reminders enabled
  let morningEnabled = 0;
  let eveningEnabled = 0;
  for (let i = 1; i < settings.length; i++) {
    if (Boolean(settings[i][2])) morningEnabled++;
    if (Boolean(settings[i][4])) eveningEnabled++;
  }

  // Email delivery today
  let emailsSentToday = 0;
  let emailsFailedToday = 0;
  for (let i = 1; i < emailLog.length; i++) {
    if (emailLog[i][3] === todayStr) {
      if (emailLog[i][5] === 'sent') emailsSentToday++;
      else if (emailLog[i][5] === 'failed') emailsFailedToday++;
    }
  }

  // Community statistics
  let totalCommRequests = 0;
  let activeCommRequests = 0;
  let newCommRequestsToday = 0;
  for (let i = 1; i < commRequests.length; i++) {
    const status = commRequests[i][9];
    if (status !== 'deleted') {
      totalCommRequests++;
      if (status === 'active') activeCommRequests++;
      if (commRequests[i][7] === todayStr) newCommRequestsToday++;
    }
  }

  let totalCommitments = 0;
  for (let i = 1; i < commitments.length; i++) {
    if (commitments[i][5] === 'active') totalCommitments++;
  }

  let totalEncouragements = 0;
  for (let i = 1; i < encouragements.length; i++) {
    if (encouragements[i][5] === 'active') totalEncouragements++;
  }

  let pendingReports = 0;
  for (let i = 1; i < reports.length; i++) {
    if (reports[i][6] === 'pending') pendingReports++;
  }

  return {
    today: todayStr,
    users: {
      total: totalUsers,
      new_today: newUsersToday,
      last_7_days: usersLast7Days
    },
    prayers: {
      total_active: totalActivePrayers,
      created_today: prayersCreatedToday,
      prayed_today: prayedTodayUnique.size,
      total_answered: totalAnswered
    },
    thanksgiving: {
      total: totalThanksgiving
    },
    reminders: {
      morning_enabled: morningEnabled,
      evening_enabled: eveningEnabled,
      emails_sent_today: emailsSentToday,
      emails_failed_today: emailsFailedToday
    },
    community: {
      total_requests: totalCommRequests,
      active_requests: activeCommRequests,
      new_today: newCommRequestsToday,
      total_commitments: totalCommitments,
      total_encouragements: totalEncouragements,
      pending_reports: pendingReports
    }
  };
}

/**
 * Admin User Management: Searchable, Paginated List with Aggregates
 */
function getAdminUsersList(payload) {
  const ss = getDb();
  const users = ss.getSheetByName(SHEET_NAMES.USERS).getDataRange().getValues();
  const prayers = ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS).getDataRange().getValues();
  const answered = ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS).getDataRange().getValues();
  const thanksgiving = ss.getSheetByName(SHEET_NAMES.THANKSGIVING_JOURNAL).getDataRange().getValues();
  const settings = ss.getSheetByName(SHEET_NAMES.USER_SETTINGS).getDataRange().getValues();

  // Aggregate maps
  const activePrayersMap = {};
  for (let i = 1; i < prayers.length; i++) {
    if (!prayers[i][12] && prayers[i][10] === 'active') {
      const uId = prayers[i][1];
      activePrayersMap[uId] = (activePrayersMap[uId] || 0) + 1;
    }
  }

  const answeredMap = {};
  for (let i = 1; i < answered.length; i++) {
    if (!answered[i][7]) {
      const uId = answered[i][1];
      answeredMap[uId] = (answeredMap[uId] || 0) + 1;
    }
  }

  const tgMap = {};
  for (let i = 1; i < thanksgiving.length; i++) {
    if (!thanksgiving[i][9]) {
      const uId = thanksgiving[i][1];
      tgMap[uId] = (tgMap[uId] || 0) + 1;
    }
  }

  const settingsMap = {};
  for (let i = 1; i < settings.length; i++) {
    settingsMap[settings[i][0]] = {
      timezone: settings[i][1],
      morning: Boolean(settings[i][2]),
      evening: Boolean(settings[i][4])
    };
  }

  const search = (payload.search || '').toLowerCase().trim();
  const statusFilter = payload.status || 'all';

  let list = [];
  for (let i = 1; i < users.length; i++) {
    const uId = users[i][0];
    const email = users[i][1];
    const status = users[i][4];

    if (statusFilter !== 'all' && status !== statusFilter) continue;
    if (search && !email.toLowerCase().includes(search)) continue;

    const userSet = settingsMap[uId] || { timezone: 'Asia/Kolkata', morning: true, evening: true };

    list.push({
      user_id: uId,
      email: email,
      created_at: users[i][2],
      last_login: users[i][3],
      status: status,
      active_prayers: activePrayersMap[uId] || 0,
      answered_prayers: answeredMap[uId] || 0,
      thanksgiving_entries: tgMap[uId] || 0,
      timezone: userSet.timezone,
      morning_reminder: userSet.morning,
      evening_reminder: userSet.evening
    });
  }

  // Sort by registration date descending
  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 20;
  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    users: paginated,
    total: total,
    page: page,
    total_pages: Math.ceil(total / limit)
  };
}

/**
 * Admin Prayer Trends: Time series and category breakdown
 */
function getAdminPrayerTrends(payload) {
  const ss = getDb();
  const prayers = ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS).getDataRange().getValues();
  const history = ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY).getDataRange().getValues();
  const answered = ss.getSheetByName(SHEET_NAMES.ANSWERED_PRAYERS).getDataRange().getValues();

  // Category counts
  const categoryCounts = {};
  let totalActive = 0;
  let totalArchived = 0;
  let totalAnsweredStatus = 0;

  for (let i = 1; i < prayers.length; i++) {
    if (!prayers[i][12]) {
      const cat = prayers[i][4] || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const st = prayers[i][10];
      if (st === 'active') totalActive++;
      else if (st === 'archived') totalArchived++;
      else if (st === 'answered') totalAnsweredStatus++;
    }
  }

  // Recent 14 days time series
  const days = 14;
  const recentDays = [];
  const createdByDate = {};
  const prayedByDate = {};
  const answeredByDate = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = Utilities.formatDate(d, 'Asia/Kolkata', 'yyyy-MM-dd');
    recentDays.push(dateStr);
    createdByDate[dateStr] = 0;
    prayedByDate[dateStr] = 0;
    answeredByDate[dateStr] = 0;
  }

  for (let i = 1; i < prayers.length; i++) {
    if (!prayers[i][12]) {
      const dStr = Utilities.formatDate(new Date(prayers[i][6]), 'Asia/Kolkata', 'yyyy-MM-dd');
      if (createdByDate.hasOwnProperty(dStr)) createdByDate[dStr]++;
    }
  }

  for (let i = 1; i < history.length; i++) {
    if (!history[i][5]) {
      const dStr = history[i][3];
      if (prayedByDate.hasOwnProperty(dStr)) prayedByDate[dStr]++;
    }
  }

  for (let i = 1; i < answered.length; i++) {
    if (!answered[i][7]) {
      const dStr = answered[i][4];
      if (answeredByDate.hasOwnProperty(dStr)) answeredByDate[dStr]++;
    }
  }

  const timeSeries = recentDays.map(date => ({
    date: date,
    created: createdByDate[date] || 0,
    prayed: prayedByDate[date] || 0,
    answered: answeredByDate[date] || 0
  }));

  return {
    time_series: timeSeries,
    categories: categoryCounts,
    status_distribution: {
      active: totalActive,
      archived: totalArchived,
      answered: totalAnsweredStatus
    }
  };
}

/**
 * Admin Prayer Points Viewer: Privacy-conscious inspection
 */
function getAdminPrayerPoints(payload) {
  const ss = getDb();
  const prayers = ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS).getDataRange().getValues();
  const users = ss.getSheetByName(SHEET_NAMES.USERS).getDataRange().getValues();

  const userEmailMap = {};
  for (let i = 1; i < users.length; i++) {
    userEmailMap[users[i][0]] = users[i][1];
  }

  const categoryFilter = payload.category || 'all';
  const statusFilter = payload.status || 'all';
  const emailFilter = (payload.email || '').toLowerCase().trim();

  let list = [];
  for (let i = 1; i < prayers.length; i++) {
    if (prayers[i][12]) continue; // skip deleted

    const uId = prayers[i][1];
    const uEmail = userEmailMap[uId] || 'Unknown';

    if (emailFilter && !uEmail.toLowerCase().includes(emailFilter)) continue;
    if (categoryFilter !== 'all' && prayers[i][4] !== categoryFilter) continue;
    if (statusFilter !== 'all' && prayers[i][10] !== statusFilter) continue;

    list.push({
      prayer_id: prayers[i][0],
      user_email: uEmail,
      title: prayers[i][2],
      description: prayers[i][3] ? prayers[i][3].substring(0, 100) + '...' : '', // truncate for privacy
      category: prayers[i][4],
      person_name: prayers[i][5],
      priority: prayers[i][8],
      status: prayers[i][10],
      created_at: prayers[i][6]
    });
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 20;
  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    prayer_points: paginated,
    total: total,
    page: page,
    total_pages: Math.ceil(total / limit)
  };
}

/**
 * Admin Email Delivery Logs
 */
function getAdminEmailLogs(payload) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.EMAIL_LOG);
  const data = sheet.getDataRange().getValues();
  const users = ss.getSheetByName(SHEET_NAMES.USERS).getDataRange().getValues();

  const userEmailMap = {};
  for (let i = 1; i < users.length; i++) {
    userEmailMap[users[i][0]] = users[i][1];
  }

  const statusFilter = payload.status || 'all';

  const logs = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const st = data[i][5];
    if (statusFilter !== 'all' && st !== statusFilter) continue;

    logs.push({
      log_id: data[i][0],
      user_email: userEmailMap[data[i][1]] || data[i][1],
      email_type: data[i][2],
      date_sent_for: data[i][3],
      sent_at: data[i][4],
      status: st,
      error_message: data[i][6] || ''
    });
  }

  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 25;
  const total = logs.length;
  const paginated = logs.slice((page - 1) * limit, page * limit);

  return {
    logs: paginated,
    total: total,
    page: page,
    total_pages: Math.ceil(total / limit)
  };
}

/**
 * Admin Audit Logs
 */
function getAdminAuditLogs(payload) {
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.ADMIN_AUDIT_LOG);
  const data = sheet.getDataRange().getValues();

  const audits = [];
  for (let i = data.length - 1; i >= 1; i--) {
    audits.push({
      audit_id: data[i][0],
      admin_email: data[i][1],
      action: data[i][2],
      details: data[i][3],
      timestamp: data[i][4]
    });
  }

  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 25;
  const total = audits.length;
  const paginated = audits.slice((page - 1) * limit, page * limit);

  return {
    audits: paginated,
    total: total,
    page: page,
    total_pages: Math.ceil(total / limit)
  };
}

/**
 * Admin Moderation Reports Viewer
 */
function getAdminModerationReports(payload) {
  const ss = getDb();
  const repSheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REPORTS);
  const repData = repSheet.getDataRange().getValues();
  const reqSheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS);
  const reqData = reqSheet.getDataRange().getValues();

  const reqMap = {};
  for (let i = 1; i < reqData.length; i++) {
    reqMap[reqData[i][0]] = {
      title: reqData[i][2],
      status: reqData[i][9]
    };
  }

  const reports = [];
  for (let i = repData.length - 1; i >= 1; i--) {
    const rId = repData[i][2];
    reports.push({
      report_id: repData[i][0],
      request_id: rId,
      message_id: repData[i][3],
      reason: repData[i][4],
      created_at: repData[i][5],
      status: repData[i][6],
      reviewed_at: repData[i][7],
      reviewed_by: repData[i][8],
      target_title: reqMap[rId] ? reqMap[rId].title : 'Community Item'
    });
  }

  return { reports: reports };
}

function handleAdminModerateContent(adminEmail, payload) {
  const ss = getDb();
  const actionType = payload.moderation_action; // 'hide_request', 'restore_request', 'resolve_report'
  const nowIso = new Date().toISOString();

  if (actionType === 'hide_request' || actionType === 'restore_request') {
    const sheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REQUESTS);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.request_id) {
        const newStatus = actionType === 'hide_request' ? 'hidden' : 'active';
        sheet.getRange(i + 1, 10).setValue(newStatus);
        logAdminAudit(adminEmail, actionType, `Request: ${payload.request_id} -> ${newStatus}`);
        break;
      }
    }
  }

  if (payload.report_id) {
    const repSheet = ss.getSheetByName(SHEET_NAMES.COMMUNITY_REPORTS);
    const data = repSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.report_id) {
        repSheet.getRange(i + 1, 7).setValue('reviewed');
        repSheet.getRange(i + 1, 8).setValue(nowIso);
        repSheet.getRange(i + 1, 9).setValue(adminEmail);
        logAdminAudit(adminEmail, 'resolve_report', `Report ${payload.report_id} marked reviewed`);
        break;
      }
    }
  }

  return { success: true, message: 'Content moderation action executed successfully.' };
}

// ============================================================================
// SCHEDULED EMAIL REMINDERS
// ============================================================================

function getDailyVerseAndQuote(dateObj) {
  const dayOfMonth = dateObj.getDate();
  const ss = getDb();
  const sheet = ss.getSheetByName(SHEET_NAMES.DAILY_CONTENT);
  if (sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][1]) === dayOfMonth) {
        return {
          verse_text: data[i][2],
          verse_ref: data[i][3],
          quote_text: data[i][5],
          quote_author: data[i][6]
        };
      }
    }
  }
  return {
    verse_text: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.",
    verse_ref: "Philippians 4:6",
    quote_text: "To be a Christian without prayer is no more possible than to be alive without breathing.",
    quote_author: "Martin Luther"
  };
}

function wasEmailSentToday(userId, emailType, dateStr) {
  const ss = getDb();
  const emailLogSheet = ss.getSheetByName(SHEET_NAMES.EMAIL_LOG);
  const data = emailLogSheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === userId && data[i][2] === emailType && data[i][3] === dateStr && data[i][5] === 'sent') {
      return true;
    }
  }
  return false;
}

function logEmailDelivery(userId, emailType, dateStr, status, errMsg = '') {
  const ss = getDb();
  const emailLogSheet = ss.getSheetByName(SHEET_NAMES.EMAIL_LOG);
  emailLogSheet.appendRow([
    'eml_' + generateRandomString(16),
    userId,
    emailType,
    dateStr,
    new Date().toISOString(),
    status,
    errMsg
  ]);
}

function checkAndSendScheduledEmails() {
  const ss = getDb();
  const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const users = usersSheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    const userId = users[i][0];
    const email = users[i][1];
    const status = users[i][4];
    if (status !== 'active') continue;

    const settings = getUserSettings(userId);
    const userTz = settings.timezone || 'Asia/Kolkata';

    let userDateStr, userTimeStr;
    try {
      userDateStr = Utilities.formatDate(new Date(), userTz, 'yyyy-MM-dd');
      userTimeStr = Utilities.formatDate(new Date(), userTz, 'HH:mm');
    } catch (tzErr) {
      userDateStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
      userTimeStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'HH:mm');
    }

    const currentHour = userTimeStr.split(':')[0];

    // 1. Morning Email (3:00 AM)
    if (settings.morning_email_enabled) {
      const targetMorningHour = (settings.morning_time || '03:00').split(':')[0];
      if (currentHour === targetMorningHour && !wasEmailSentToday(userId, 'morning', userDateStr)) {
        sendMorningEmail(userId, email, userTz, userDateStr);
      }
    }

    // 2. Evening Email (6:00 PM)
    if (settings.evening_email_enabled) {
      const targetEveningHour = (settings.evening_time || '18:00').split(':')[0];
      if (currentHour === targetEveningHour && !wasEmailSentToday(userId, 'evening', userDateStr)) {
        sendEveningEmail(userId, email, userTz, userDateStr);
      }
    }
  }
}

function sendMorningEmail(userId, email, userTz, dateStr) {
  try {
    const ss = getDb();
    const prayers = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId, HEADERS.Prayer_Points);
    const activePrayers = prayers.filter(p => !p.is_deleted && p.status === 'active' && p.reminder_preference !== 'none' && p.reminder_preference !== 'evening');

    const content = getDailyVerseAndQuote(new Date());
    const webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '#';

    let prayerCardsHtml = '';
    if (activePrayers.length === 0) {
      prayerCardsHtml = `<p style="color: #718096; font-style: italic;">You currently have no active prayer points. Open the app to add what's on your heart today.</p>`;
    } else {
      prayerCardsHtml = activePrayers.map(p => `
        <div style="background: #F0F9FF; border-left: 4px solid #008080; border-radius: 6px; padding: 12px 16px; margin-bottom: 12px;">
          <div style="font-weight: bold; color: #023E8A; font-size: 15px;">${escapeHtml(p.title)}</div>
          ${p.category ? `<span style="display: inline-block; font-size: 11px; color: #008080; background: #E6FFFA; padding: 2px 8px; border-radius: 4px; margin: 4px 0;">${escapeHtml(p.category)}</span>` : ''}
          ${p.description ? `<p style="color: #4A5568; font-size: 13px; margin: 6px 0 0 0; line-height: 1.4;">${escapeHtml(p.description)}</p>` : ''}
          ${p.person_name ? `<p style="color: #718096; font-size: 12px; margin: 4px 0 0 0;">Praying for: <strong>${escapeHtml(p.person_name)}</strong></p>` : ''}
        </div>
      `).join('');
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #B5E0F2; border-radius: 12px; background: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #023E8A; margin: 0;">Prayer Companion</h2>
          <p style="color: #008080; font-size: 14px; margin-top: 4px;">Morning Prayer Points &bull; ${dateStr}</p>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #2D3748; font-style: italic; font-size: 14px; margin: 0 0 6px 0; line-height: 1.5;">"${content.verse_text}"</p>
          <p style="color: #023E8A; font-weight: bold; font-size: 12px; margin: 0; text-align: right;">&mdash; ${content.verse_ref}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #023E8A; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;">Your Active Prayer Points</h3>
          ${prayerCardsHtml}
        </div>

        <div style="background: #FEFCBF; border-left: 4px solid #D69E2E; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #744210; font-size: 13px; margin: 0;"><em>"${content.quote_text}"</em> &mdash; <strong>${content.quote_author}</strong></p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${webAppUrl}" style="background: #023E8A; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">Open Prayer Companion</a>
        </div>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="color: #A0AEC0; font-size: 11px; text-align: center; margin: 0;">You are receiving this daily morning reminder because you enabled it in Prayer Companion. Manage reminder settings anytime in the app.</p>
      </div>
    `;

    GmailApp.sendEmail(email, "Your Daily Prayer Points — Morning Prayer", `Good morning. Here are your active prayer points for ${dateStr}.`, {
      htmlBody: emailHtml,
      name: "Prayer Companion"
    });

    logEmailDelivery(userId, 'morning', dateStr, 'sent');
  } catch (err) {
    Logger.log(`Failed to send morning email to ${email}: ` + err.toString());
    logEmailDelivery(userId, 'morning', dateStr, 'failed', err.toString());
  }
}

function sendEveningEmail(userId, email, userTz, dateStr) {
  try {
    const ss = getDb();
    const prayers = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_POINTS), userId, HEADERS.Prayer_Points);
    const activePrayers = prayers.filter(p => !p.is_deleted && p.status === 'active' && p.reminder_preference !== 'none' && p.reminder_preference !== 'morning');

    const history = getRowsByUser(ss.getSheetByName(SHEET_NAMES.PRAYER_HISTORY), userId, HEADERS.Prayer_History);
    const prayedTodaySet = new Set();
    history.forEach(h => {
      if (!h.is_deleted && h.date === dateStr) {
        prayedTodaySet.add(h.prayer_id);
      }
    });

    const prayedList = [];
    const unprayedList = [];

    activePrayers.forEach(p => {
      if (prayedTodaySet.has(p.prayer_id)) {
        prayedList.push(p);
      } else {
        unprayedList.push(p);
      }
    });

    const content = getDailyVerseAndQuote(new Date());
    const webAppUrl = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL') || '#';

    let listHtml = '';
    if (activePrayers.length === 0) {
      listHtml = `<p style="color: #718096; font-style: italic;">No active prayer points registered today.</p>`;
    } else {
      if (prayedList.length > 0) {
        listHtml += `<div style="margin-bottom: 16px;"><h4 style="color: #008080; margin: 0 0 8px 0; font-size: 14px;">Marked as Prayed Today (${prayedList.length})</h4>`;
        listHtml += prayedList.map(p => `
          <div style="background: #E6FFFA; border-left: 4px solid #008080; border-radius: 4px; padding: 8px 12px; margin-bottom: 6px; font-size: 13px;">
            <span style="color: #008080; font-weight: bold;">&#10003; ${escapeHtml(p.title)}</span>
          </div>
        `).join('');
        listHtml += `</div>`;
      }

      if (unprayedList.length > 0) {
        listHtml += `<div style="margin-bottom: 16px;"><h4 style="color: #4A5568; margin: 0 0 8px 0; font-size: 14px;">Unmarked Prayer Points (${unprayedList.length})</h4>`;
        listHtml += unprayedList.map(p => `
          <div style="background: #F7FAFC; border-left: 4px solid #CBD5E0; border-radius: 4px; padding: 8px 12px; margin-bottom: 6px; font-size: 13px;">
            <span style="color: #2D3748;">&bull; ${escapeHtml(p.title)}</span>
            ${p.person_name ? `<span style="color: #718096; font-size: 11px;"> (${escapeHtml(p.person_name)})</span>` : ''}
          </div>
        `).join('');
        listHtml += `<p style="color: #718096; font-size: 11px; margin-top: 6px;"><em>Note: The app only tracks what you mark. An unmarked point does not mean it was not prayed!</em></p></div>`;
      }
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #B5E0F2; border-radius: 12px; background: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #023E8A; margin: 0;">Prayer Companion</h2>
          <p style="color: #008080; font-size: 14px; margin-top: 4px;">Evening Prayer Reminder &bull; ${dateStr}</p>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #2D3748; font-style: italic; font-size: 14px; margin: 0 0 6px 0; line-height: 1.5;">"${content.verse_text}"</p>
          <p style="color: #023E8A; font-weight: bold; font-size: 12px; margin: 0; text-align: right;">&mdash; ${content.verse_ref}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #023E8A; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;">Today's Prayer Review</h3>
          ${listHtml}
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${webAppUrl}" style="background: #023E8A; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">Review & Update Prayer Journal</a>
        </div>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="color: #A0AEC0; font-size: 11px; text-align: center; margin: 0;">You received this evening prayer review based on your Prayer Companion reminder preferences.</p>
      </div>
    `;

    GmailApp.sendEmail(email, "Evening Prayer Reminder — Review Today's Prayer Points", `Good evening. Review your daily prayer points for ${dateStr}.`, {
      htmlBody: emailHtml,
      name: "Prayer Companion"
    });

    logEmailDelivery(userId, 'evening', dateStr, 'sent');
  } catch (err) {
    Logger.log(`Failed to send evening email to ${email}: ` + err.toString());
    logEmailDelivery(userId, 'evening', dateStr, 'failed', err.toString());
  }
}

function handleSendTestEmail(authUser) {
  const userDateStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  sendMorningEmail(authUser.user_id, authUser.email, 'Asia/Kolkata', userDateStr);
  return createJsonResponse({
    success: true,
    message: 'Test morning reminder email sent successfully to ' + authUser.email
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
