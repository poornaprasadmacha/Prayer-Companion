/**
 * Prayer Companion - Authentication & Session Management Module
 * Handles Email OTP requests, OTP verification, session storage,
 * and offline/local-first mode switching.
 */

const Auth = {
  currentUser: null,
  token: null,
  apiUrl: '',

  /**
   * Initialize Authentication State on App Load
   */
  async init() {
    this.apiUrl = localStorage.getItem('PRAYER_API_URL') || '';
    const storedToken = localStorage.getItem('PRAYER_SESSION_TOKEN');
    const storedUser = localStorage.getItem('PRAYER_USER');

    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }
    this.token = storedToken || null;

    // Check 30-day cookie if local storage is missing user or token
    if (!this.token || !this.currentUser) {
      if (typeof document !== 'undefined' && document.cookie) {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)prayerly_session=([^;]*)/);
        if (cookieMatch && cookieMatch[1]) {
          try {
            const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]));
            if (parsed && parsed.token && parsed.user) {
              this.token = parsed.token;
              this.currentUser = parsed.user;
              localStorage.setItem('PRAYER_SESSION_TOKEN', this.token);
              localStorage.setItem('PRAYER_USER', JSON.stringify(this.currentUser));
            }
          } catch (e) {}
        }
      }
    }

    // Default to local mode if no user logged in
    if (!this.currentUser) {
      const isLocalMode = localStorage.getItem('PRAYER_LOCAL_MODE') === 'true';
      if (isLocalMode) {
        this.currentUser = {
          user_id: 'local_user',
          email: 'offline_user@local',
          is_local: true
        };
      }
    }

    return {
      isAuthenticated: Boolean(this.token && this.currentUser && !this.currentUser.is_local),
      isLocal: Boolean(this.currentUser && this.currentUser.is_local),
      user: this.currentUser
    };
  },

  getUserId() {
    return this.currentUser ? this.currentUser.user_id : 'local_user';
  },

  getUserEmail() {
    return this.currentUser ? this.currentUser.email : 'Local Journal';
  },

  isLoggedIn() {
    return Boolean(this.token && this.currentUser && !this.currentUser.is_local);
  },

  isLocalMode() {
    return Boolean(this.currentUser && this.currentUser.is_local);
  },

  setApiUrl(url) {
    this.apiUrl = (url || '').trim();
    localStorage.setItem('PRAYER_API_URL', this.apiUrl);
  },

  getApiUrl() {
    return this.apiUrl || localStorage.getItem('PRAYER_API_URL') || 'https://script.google.com/macros/s/AKfycbwUnQkzJ78bEl7MRcsUARi0WMSyF27JfHgSYcyHoVpDbWqv6QhXg2qIqLtToYBEOwECJA/exec';
  },

  /**
   * Request OTP code via email
   * @param {string} email
   */
  async requestOtp(email, name = '') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (cleanName) {
      localStorage.setItem('prayer_user_short_name', cleanName);
    }

    const apiUrl = this.getApiUrl();
    if (!apiUrl) {
      throw new Error('Backend URL is not configured yet.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'request_otp',
        email: cleanEmail,
        name: cleanName,
        client_hint: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to request verification code.');
    }
    return data;
  },

  /**
   * Verify OTP and receive session token
   * @param {string} email
   * @param {string} otp
   */
  async verifyOtp(email, otp) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
      throw new Error('Please enter both your email and the 6-digit verification code.');
    }

    const apiUrl = this.getApiUrl();
    if (!apiUrl) {
      throw new Error('Backend URL is not configured.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'verify_otp',
        email: cleanEmail,
        otp: cleanOtp
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Invalid verification code.');
    }

    // Save session
    this.token = data.token;
    this.currentUser = data.user;
    localStorage.setItem('PRAYER_SESSION_TOKEN', this.token);
    localStorage.setItem('PRAYER_USER', JSON.stringify(this.currentUser));
    localStorage.removeItem('PRAYER_LOCAL_MODE');

    // 30-Day Session Cookie Persistence
    try {
      if (typeof document !== 'undefined') {
        const sessionPayload = { token: this.token, user: this.currentUser };
        const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
        document.cookie = `prayerly_session=${encodeURIComponent(JSON.stringify(sessionPayload))}; max-age=${maxAge}; path=/; SameSite=Lax`;
      }
    } catch (_) {}

    return data;
  },

  /**
   * Continue in Local / Offline Mode
   */
  async continueInLocalMode() {
    this.token = null;
    this.currentUser = {
      user_id: 'local_user',
      email: 'offline_user@local',
      is_local: true
    };
    localStorage.removeItem('PRAYER_SESSION_TOKEN');
    localStorage.setItem('PRAYER_LOCAL_MODE', 'true');
    localStorage.setItem('PRAYER_USER', JSON.stringify(this.currentUser));
    await AppDB.seedWelcomeDataIfEmpty('local_user');
    return this.currentUser;
  },

  /**
   * Verify active session with backend
   */
  async checkSession() {
    if (!this.token || !this.apiUrl || this.isLocalMode()) return false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'verify_session',
          token: this.token
        })
      });
      const data = await response.json();
      if (!data.success) {
        // Session invalid or expired
        this.logout(false);
        return false;
      }
      return true;
    } catch (e) {
      // Network failure: stay logged in locally
      return true;
    }
  },

  /**
   * Logout user, optionally clearing local device cache
   * @param {boolean} clearLocalData
   */
  async logout(clearLocalData = false) {
    if (this.token && this.apiUrl) {
      try {
        fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'logout',
            token: this.token
          })
        }).catch(() => {});
      } catch (e) {}
    }

    const oldUserId = this.getUserId();
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('PRAYER_SESSION_TOKEN');
    localStorage.removeItem('PRAYER_USER');
    localStorage.removeItem('PRAYER_LOCAL_MODE');

    // Clear 30-day session cookie
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'prayerly_session=; max-age=0; path=/; SameSite=Lax';
      }
    } catch (_) {}

    if (clearLocalData && oldUserId) {
      await AppDB.clearAllUserData(oldUserId);
    }
  }
};

window.Auth = Auth;
