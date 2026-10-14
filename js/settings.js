/**
 * Prayer Companion - Settings, Preferences & Privacy Module
 * Manages user preferences, reminders, timezone, data export,
 * cache clearing, account deletion, and backend connection test.
 */

const Settings = {
  /**
   * Get user short name (e.g. "Poorna")
   */
  getUserShortName() {
    let name = localStorage.getItem('prayer_user_short_name');
    if (name && name.trim()) return name.trim();

    const email = Auth.getUserEmail();
    if (email && email.includes('@')) {
      if (email.toLowerCase().includes('poorna')) {
        name = 'Poorna';
      } else {
        const prefix = email.split('@')[0];
        const clean = prefix.replace(/[0-9._+-]/g, '');
        name = clean ? (clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()) : (prefix.charAt(0).toUpperCase() + prefix.slice(1));
      }
      localStorage.setItem('prayer_user_short_name', name);
      return name;
    }
    return '';
  },

  /**
   * Save user short name
   */
  async setUserShortName(name) {
    const trimmed = (name || '').trim();
    if (trimmed) {
      localStorage.setItem('prayer_user_short_name', trimmed);
    } else {
      localStorage.removeItem('prayer_user_short_name');
    }

    const currentSettings = await this.getSettings();
    currentSettings.short_name = trimmed;
    await this.saveSettings(currentSettings);

    window.dispatchEvent(new CustomEvent('prayer-user-name-changed', { detail: { shortName: trimmed } }));
    return trimmed;
  },

  /**
   * Load user settings (from IndexedDB or defaults)
   */
  async getSettings() {
    const cached = await AppDB.getSetting('user_preferences');
    if (cached) return cached;

    return {
      timezone: 'Asia/Kolkata',
      morning_email_enabled: true,
      morning_time: '03:00',
      evening_email_enabled: true,
      evening_time: '18:00',
      short_name: this.getUserShortName()
    };
  },

  /**
   * Save user settings locally and push to cloud
   */
  async saveSettings(settingsObj) {
    await AppDB.setSetting('user_preferences', settingsObj);
    await SyncEngine.enqueue('settings', 'update', settingsObj);
    return settingsObj;
  },

  /**
   * Send test reminder email to user's registered address
   */
  async sendTestEmail() {
    if (!Auth.isLoggedIn()) {
      throw new Error('Please log in with your email to test reminder emails.');
    }
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) {
      throw new Error('Google Apps Script Web App URL is not configured.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'send_test_email',
        token: Auth.token
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send test email.');
    }
    return data;
  },

  /**
   * Test backend API connection
   */
  async testConnection(url) {
    const testUrl = (url || Auth.getApiUrl() || '').trim();
    if (!testUrl) throw new Error('Please enter a Google Apps Script Web App URL.');

    const response = await fetch(testUrl + (testUrl.includes('?') ? '&' : '?') + 'ping=1', {
      method: 'GET'
    });

    const data = await response.json();
    if (data && data.success) {
      return { success: true, message: 'Successfully connected to Prayerly Google Apps Script backend!' };
    }
    throw new Error('Unexpected response from backend.');
  },

  /**
   * Export all user data as a downloadable JSON file
   */
  async exportUserData() {
    const userId = Auth.getUserId();
    const prayers = await AppDB.getAll('prayers');
    const history = await AppDB.getAll('prayer_history');
    const answered = await AppDB.getAll('answered_prayers');
    const thanksgiving = await AppDB.getAll('thanksgiving');
    const settings = await this.getSettings();

    const exportPackage = {
      app: 'Prayerly',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      user: {
        user_id: userId,
        email: Auth.getUserEmail()
      },
      settings: settings,
      data: {
        prayers: prayers.filter(p => p.user_id === userId && !p.is_deleted),
        prayer_history: history.filter(h => h.user_id === userId && !h.is_deleted),
        answered_prayers: answered.filter(a => a.user_id === userId && !a.is_deleted),
        thanksgiving: thanksgiving.filter(t => t.user_id === userId && !t.is_deleted)
      }
    };

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-companion-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportPackage;
  },

  /**
   * Delete account completely
   */
  async deleteAccount() {
    if (Auth.isLoggedIn() && Auth.getApiUrl()) {
      try {
        const response = await fetch(Auth.getApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete_account',
            token: Auth.token
          })
        });
        await response.json();
      } catch (e) {
        console.warn('Server delete error:', e);
      }
    }

    await Auth.logout(true);
  }
};

window.Settings = Settings;
