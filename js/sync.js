/**
 * Prayer Companion - Local-First Background Sync Engine
 * Handles pending queue, batch push to Google Apps Script,
 * incremental pull, Last-Write-Wins conflict resolution,
 * and online/offline network detection.
 */

const SyncEngine = {
  status: 'synced', // 'synced' | 'syncing' | 'local' | 'offline' | 'failed'
  isSyncing: false,
  retryTimeout: null,
  retryDelay: 3000, // starting backoff delay 3s

  init() {
    // Listen for network connectivity changes
    window.addEventListener('online', () => {
      console.log('Network connected. Resuming background sync...');
      this.updateStatus('syncing', 'Network back online. Syncing...');
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      console.log('Network disconnected.');
      this.updateStatus('offline', 'Offline — changes saved locally.');
    });

    // Check initial status
    if (!navigator.onLine) {
      this.updateStatus('offline', 'Offline — changes saved locally.');
    } else if (Auth.isLocalMode() || !Auth.isLoggedIn()) {
      this.updateStatus('local', 'Saved on this device.');
    } else {
      this.updateStatus('synced', 'Synced with cloud.');
    }
  },

  /**
   * Update sync status and notify UI listeners
   */
  updateStatus(newStatus, message = '') {
    this.status = newStatus;
    const event = new CustomEvent('prayer-sync-status', {
      detail: { status: newStatus, message: message, timestamp: new Date() }
    });
    window.dispatchEvent(event);
  },

  /**
   * Enqueue a local change to be synced to the cloud
   */
  async enqueue(entityType, action, recordData) {
    const queueItem = {
      user_id: Auth.getUserId(),
      entity_type: entityType, // 'prayers' | 'history' | 'answered' | 'thanksgiving' | 'settings'
      action: action, // 'create' | 'update' | 'delete'
      data: recordData,
      created_at: new Date().toISOString()
    };

    await AppDB.put('sync_queue', queueItem);

    if (!Auth.isLoggedIn() || Auth.isLocalMode()) {
      this.updateStatus('local', 'Saved on this device.');
      return;
    }

    if (!navigator.onLine) {
      this.updateStatus('offline', 'Offline — changes will sync later.');
      return;
    }

    // Trigger sync in background
    this.syncNow();
  },

  /**
   * Run background sync: pushes pending queue and pulls incremental cloud updates
   */
  async syncNow() {
    if (this.isSyncing) return;
    if (!Auth.isLoggedIn() || Auth.isLocalMode()) {
      this.updateStatus('local', 'Saved on this device.');
      return;
    }
    if (!navigator.onLine) {
      this.updateStatus('offline', 'Offline — changes will sync later.');
      return;
    }

    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) {
      this.updateStatus('local', 'Saved on this device (No cloud API configured).');
      return;
    }

    this.isSyncing = true;
    this.updateStatus('syncing', 'Syncing...');

    try {
      // 1. Read all queued items
      const queueItems = await AppDB.getAll('sync_queue');
      const userId = Auth.getUserId();
      const userQueue = queueItems.filter(item => item.user_id === userId);

      if (userQueue.length > 0) {
        // Group queue by entity type
        const payload = {
          action: 'sync_push',
          token: Auth.token,
          device_id: 'web_' + (navigator.platform || 'app'),
          prayers: [],
          history: [],
          answered: [],
          thanksgiving: [],
          settings: null
        };

        userQueue.forEach(item => {
          if (item.entity_type === 'prayers') payload.prayers.push(item.data);
          else if (item.entity_type === 'history') payload.history.push(item.data);
          else if (item.entity_type === 'answered') payload.answered.push(item.data);
          else if (item.entity_type === 'thanksgiving') payload.thanksgiving.push(item.data);
          else if (item.entity_type === 'settings') payload.settings = item.data;
        });

        // Push to server
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Sync push failed on server.');
        }

        // Successfully pushed! Remove processed items from queue
        for (const item of userQueue) {
          await AppDB.delete('sync_queue', item.id);
        }
      }

      // 2. Incremental Pull: Fetch cloud changes since last sync
      const lastSync = await AppDB.getSetting('last_sync_timestamp', '');
      const pullResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sync_pull',
          token: Auth.token,
          since: lastSync
        })
      });

      const pullResult = await pullResponse.json();
      if (pullResult.success && pullResult.changes) {
        await this.applyPullChanges(pullResult.changes);
        await AppDB.setSetting('last_sync_timestamp', pullResult.synced_at || new Date().toISOString());
      }

      // Reset backoff on success
      this.retryDelay = 3000;
      this.updateStatus('synced', 'Synced.');
      try {
        localStorage.setItem('prayerly_last_sync_time', new Date().toISOString());
      } catch (_) {}

      // Dispatch event to refresh views without full-page reloads
      window.dispatchEvent(new CustomEvent('prayer-data-changed', { detail: { source: 'sync' } }));
    } catch (err) {
      console.warn('Sync failed:', err);
      this.updateStatus('failed', 'Sync failed — retrying in a moment.');

      // Exponential backoff retry (up to 60s)
      if (this.retryTimeout) clearTimeout(this.retryTimeout);
      this.retryTimeout = setTimeout(() => {
        this.retryDelay = Math.min(this.retryDelay * 2, 60000);
        this.syncNow();
      }, this.retryDelay);
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Apply incoming server changes using Last-Write-Wins conflict resolution
   */
  async applyPullChanges(changes) {
    if (!changes) return;

    // Apply Prayers
    if (Array.isArray(changes.prayers)) {
      for (const cloudItem of changes.prayers) {
        const localItem = await AppDB.get('prayers', cloudItem.prayer_id);
        if (!localItem) {
          await AppDB.put('prayers', cloudItem);
        } else {
          const localTime = new Date(localItem.updated_at || localItem.created_at || 0).getTime();
          const cloudTime = new Date(cloudItem.updated_at || cloudItem.created_at || 0).getTime();
          if (cloudTime >= localTime) {
            await AppDB.put('prayers', cloudItem);
          }
        }
      }
    }

    // Apply History
    if (Array.isArray(changes.history)) {
      for (const cloudItem of changes.history) {
        await AppDB.put('prayer_history', cloudItem);
      }
    }

    // Apply Answered
    if (Array.isArray(changes.answered)) {
      for (const cloudItem of changes.answered) {
        const localItem = await AppDB.get('answered_prayers', cloudItem.answered_id);
        if (!localItem) {
          await AppDB.put('answered_prayers', cloudItem);
        } else {
          const localTime = new Date(localItem.updated_at || 0).getTime();
          const cloudTime = new Date(cloudItem.updated_at || 0).getTime();
          if (cloudTime >= localTime) {
            await AppDB.put('answered_prayers', cloudItem);
          }
        }
      }
    }

    // Apply Thanksgiving
    if (Array.isArray(changes.thanksgiving)) {
      for (const cloudItem of changes.thanksgiving) {
        const localItem = await AppDB.get('thanksgiving', cloudItem.entry_id);
        if (!localItem) {
          await AppDB.put('thanksgiving', cloudItem);
        } else {
          const localTime = new Date(localItem.updated_at || 0).getTime();
          const cloudTime = new Date(cloudItem.updated_at || 0).getTime();
          if (cloudTime >= localTime) {
            await AppDB.put('thanksgiving', cloudItem);
          }
        }
      }
    }

    // Apply Settings
    if (changes.settings) {
      await AppDB.setSetting('user_preferences', changes.settings);
    }
  },

  /**
   * Initial sync on login: Pulls all cloud data directly
   */
  async initialCloudPull() {
    if (!Auth.isLoggedIn() || !navigator.onLine) return;
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) return;

    this.updateStatus('syncing', 'Loading cloud data...');
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'get_initial_data',
          token: Auth.token
        })
      });

      const res = await response.json();
      if (res.success && res.data) {
        if (Array.isArray(res.data.prayers)) await AppDB.putMany('prayers', res.data.prayers);
        if (Array.isArray(res.data.history)) await AppDB.putMany('prayer_history', res.data.history);
        if (Array.isArray(res.data.answered)) await AppDB.putMany('answered_prayers', res.data.answered);
        if (Array.isArray(res.data.thanksgiving)) await AppDB.putMany('thanksgiving', res.data.thanksgiving);
        if (res.data.settings) await AppDB.setSetting('user_preferences', res.data.settings);
        await AppDB.setSetting('last_sync_timestamp', res.synced_at || new Date().toISOString());

        this.updateStatus('synced', 'Synced with cloud.');
        window.dispatchEvent(new CustomEvent('prayer-data-changed', { detail: { source: 'initial_pull' } }));
      }
    } catch (e) {
      console.warn('Initial cloud pull failed:', e);
      this.updateStatus('failed', 'Could not reach server.');
    }
  }
};

window.SyncEngine = SyncEngine;
