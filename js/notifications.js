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
            <p style="color: #4A5568; margin: 0; line-height: 1.5;">${this.escape(message)}</p>
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
      .replace(/"/g, '&quot;');
  }
};

window.UI = UI;
