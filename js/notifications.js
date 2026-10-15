/**
 * Prayer Companion - UI Toast & Notification Utilities
 * Unobtrusive feedback toasts and accessible confirmation dialogs.
 */

const UI = {
  /**
   * Show a temporary toast message
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} type
   * @param {number} durationMs
   */
  toast(message, type = 'info', durationMs = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === 'success') {
      icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width: 16px; height: 16px;"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${this.escape(message)}</span>
    `;

    container.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, durationMs);
  },

  /**
   * Show modal confirmation dialog
   */
  confirm({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-backdrop active';

      overlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${this.escape(title)}</h3>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin: 0; line-height: 1.5;">${this.escape(message)}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary cancel-btn">${this.escape(cancelText)}</button>
            <button class="btn ${isDestructive ? 'btn-danger' : 'btn-primary'} confirm-btn">${this.escape(confirmText)}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const cleanup = (result) => {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
        resolve(result);
      };

      overlay.querySelector('.cancel-btn').addEventListener('click', () => cleanup(false));
      overlay.querySelector('.confirm-btn').addEventListener('click', () => cleanup(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  },

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

window.UI = UI;

/**
 * Scripture Verse of the Day Web / Local Notifications
 */
const VerseNotifications = {
  timerId: null,

  isSupported() {
    return 'Notification' in window;
  },

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission() {
    if (!this.isSupported()) {
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Notifications are not supported in this browser.', 'warning');
      }
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('prayerly_verse_notifications_permission', permission);
      if (permission === 'granted') {
        localStorage.setItem('prayerly_verse_notifications_enabled', 'true');
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Daily Scripture notifications enabled!', 'success');
        }
        return true;
      } else {
        localStorage.setItem('prayerly_verse_notifications_enabled', 'false');
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast('Notification permission was denied.', 'warning');
        }
        return false;
      }
    } catch (err) {
      console.warn('requestPermission error:', err);
      return false;
    }
  },

  async sendDailyVerseNotification(isTest = false) {
    if (!this.isSupported()) {
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Web notifications are not supported by this browser.', 'warning');
      }
      return;
    }
    if (Notification.permission !== 'granted') {
      const ok = await this.requestPermission();
      if (!ok) return;
    }

    const todayContent = (typeof DailyContent !== 'undefined' && DailyContent.getToday)
      ? DailyContent.getToday()
      : {
          verse: {
            text: "In nothing be anxious; but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
            ref: "Philippians 4:6"
          }
        };

    const title = isTest
      ? 'Prayerly • Test Scripture Notification'
      : 'Prayerly • Daily Scripture Inspiration';

    const body = `"${todayContent.verse.text}"\n— ${todayContent.verse.ref}`;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon: 'assets/icons/icon-192.png',
            badge: 'assets/icons/icon.svg',
            tag: 'prayerly-scripture-verse',
            renotify: true,
            data: { url: window.location.origin }
          });
          if (isTest && typeof UI !== 'undefined' && UI.toast) {
            UI.toast('Test notification delivered to your device!', 'success');
          }
          return;
        }
      }

      const notification = new Notification(title, {
        body,
        icon: 'assets/icons/icon-192.png',
        tag: 'prayerly-scripture-verse'
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      if (isTest && typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Test notification delivered to your device!', 'success');
      }
    } catch (err) {
      console.warn('sendDailyVerseNotification note:', err);
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Could not display system notification. Check device settings.', 'info');
      }
    }
  },

  startScheduler() {
    if (this.timerId) clearInterval(this.timerId);

    // Check every 30 seconds
    this.timerId = setInterval(() => {
      const isEnabled = localStorage.getItem('prayerly_verse_notifications_enabled') === 'true';
      if (!isEnabled || Notification.permission !== 'granted') return;

      const morningTime = localStorage.getItem('prayerly_morning_time') || '03:00';
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const todayStr = (typeof Tracking !== 'undefined' && Tracking.getLocalDateString)
        ? Tracking.getLocalDateString()
        : now.toISOString().split('T')[0];

      const lastSentDate = localStorage.getItem('prayerly_last_verse_notification_date');

      if (currentTimeStr === morningTime && lastSentDate !== todayStr) {
        localStorage.setItem('prayerly_last_verse_notification_date', todayStr);
        this.sendDailyVerseNotification(false);
      }
    }, 30000);
  }
};

window.VerseNotifications = VerseNotifications;

