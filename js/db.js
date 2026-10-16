/**
 * Prayer Companion - IndexedDB Local-First Database Module
 * Provides fast, offline-first, durable local storage for prayers, tracking,
 * answered prayers, thanksgiving entries, sync queue, and user preferences.
 */

const DB_NAME = 'PrayerCompanionDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Open and initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Prayers Store
      if (!db.objectStoreNames.contains('prayers')) {
        const prayersStore = db.createObjectStore('prayers', { keyPath: 'prayer_id' });
        prayersStore.createIndex('user_id', 'user_id', { unique: false });
        prayersStore.createIndex('status', 'status', { unique: false });
        prayersStore.createIndex('category', 'category', { unique: false });
        prayersStore.createIndex('updated_at', 'updated_at', { unique: false });
        prayersStore.createIndex('is_deleted', 'is_deleted', { unique: false });
      }

      // 2. Prayer History Store (Tracks daily prayer clicks)
      if (!db.objectStoreNames.contains('prayer_history')) {
        const historyStore = db.createObjectStore('prayer_history', { keyPath: 'history_id' });
        historyStore.createIndex('user_id', 'user_id', { unique: false });
        historyStore.createIndex('prayer_id', 'prayer_id', { unique: false });
        historyStore.createIndex('date', 'date', { unique: false });
        historyStore.createIndex('user_date', ['user_id', 'date'], { unique: false });
        historyStore.createIndex('is_deleted', 'is_deleted', { unique: false });
      }

      // 3. Answered Prayers Store
      if (!db.objectStoreNames.contains('answered_prayers')) {
        const answeredStore = db.createObjectStore('answered_prayers', { keyPath: 'answered_id' });
        answeredStore.createIndex('user_id', 'user_id', { unique: false });
        answeredStore.createIndex('prayer_id', 'prayer_id', { unique: false });
        answeredStore.createIndex('answered_date', 'answered_date', { unique: false });
        answeredStore.createIndex('is_deleted', 'is_deleted', { unique: false });
      }

      // 4. Thanksgiving Journal Store
      if (!db.objectStoreNames.contains('thanksgiving')) {
        const thanksgivingStore = db.createObjectStore('thanksgiving', { keyPath: 'entry_id' });
        thanksgivingStore.createIndex('user_id', 'user_id', { unique: false });
        thanksgivingStore.createIndex('entry_date', 'entry_date', { unique: false });
        thanksgivingStore.createIndex('updated_at', 'updated_at', { unique: false });
        thanksgivingStore.createIndex('is_deleted', 'is_deleted', { unique: false });
      }

      // 5. Background Sync Queue Store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('created_at', 'created_at', { unique: false });
        queueStore.createIndex('user_id', 'user_id', { unique: false });
      }

      // 6. Settings & Metadata Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Generic Promisified IndexedDB helpers
 */
const AppDB = {
  async get(storeName, key) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(storeName) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async getAllByIndex(storeName, indexName, queryValue) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(queryValue);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, item) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async putMany(storeName, items) {
    if (!items || items.length === 0) return Promise.resolve();
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(storeName, key) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Settings helpers
  async getSetting(key, defaultValue = null) {
    const item = await this.get('settings', key);
    return item ? item.value : defaultValue;
  },

  async setSetting(key, value) {
    return this.put('settings', { key, value });
  },

  /**
   * Seed welcoming starter prayer points for first-time or local-mode users
   */
  async seedWelcomeDataIfEmpty(userId = 'local_user') {
    const existing = await this.getAll('prayers');
    const userPrayers = existing.filter(p => p.user_id === userId && !p.is_deleted);
    if (userPrayers.length > 0) return;

    const now = new Date().toISOString();
    const starterPrayers = [
      {
        prayer_id: 'sample_1_' + Date.now(),
        user_id: userId,
        title: 'Spiritual Growth & Closeness with God',
        description: 'Praying for a deeper hunger for God’s Word, steadfast consistency in prayer, and sensitivity to the Holy Spirit each day.',
        category: 'Spiritual Growth',
        person_name: 'Me',
        created_at: now,
        target_date: '',
        priority: 'High',
        reminder_preference: 'both',
        status: 'active',
        updated_at: now,
        is_deleted: false,
        sync_status: 'synced'
      },
      {
        prayer_id: 'sample_2_' + Date.now(),
        user_id: userId,
        title: 'Peace, Health & Unity in the Family',
        description: 'Thanking God for family and asking for divine protection, peace, good health, and mutual grace in our home.',
        category: 'Family',
        person_name: 'Family',
        created_at: now,
        target_date: '',
        priority: 'High',
        reminder_preference: 'both',
        status: 'active',
        updated_at: now,
        is_deleted: false,
        sync_status: 'synced'
      },
      {
        prayer_id: 'sample_3_' + Date.now(),
        user_id: userId,
        title: 'Wisdom & Integrity in Daily Work & Decisions',
        description: 'Seeking the Lord’s wisdom for career projects, interactions with colleagues, and trusting Him to lead every step.',
        category: 'Career',
        person_name: '',
        created_at: now,
        target_date: '',
        priority: 'Medium',
        reminder_preference: 'both',
        status: 'active',
        updated_at: now,
        is_deleted: false,
        sync_status: 'synced'
      }
    ];

    await this.putMany('prayers', starterPrayers);

    // Also add a sample thanksgiving entry
    const starterThanksgiving = {
      entry_id: 'sample_tg_' + Date.now(),
      user_id: userId,
      title: 'God’s Unfailing Faithfulness',
      description: 'Praising God for new mercies this morning and for His peace that surpasses all understanding.',
      entry_date: (typeof Tracking !== 'undefined' ? Tracking.getLocalDateString() : new Date().toISOString().split('T')[0]),
      category: 'Spiritual Growth',
      linked_prayer_id: '',
      created_at: now,
      updated_at: now,
      is_deleted: false,
      sync_status: 'synced'
    };
    await this.put('thanksgiving', starterThanksgiving);
  },

  /**
   * Clear all local data belonging to a user (used during clean logout)
   */
  async clearAllUserData(userId) {
    const stores = ['prayers', 'prayer_history', 'answered_prayers', 'thanksgiving', 'sync_queue'];
    for (const storeName of stores) {
      const items = await this.getAll(storeName);
      for (const item of items) {
        if (!userId || item.user_id === userId) {
          const key = item.prayer_id || item.history_id || item.answered_id || item.entry_id || item.id;
          if (key !== undefined) {
            await this.delete(storeName, key);
          }
        }
      }
    }
    try {
      await this.deleteSetting('community_requests_cache');
    } catch (_) {}
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('PRAYERLY_COMMUNITY_CACHE');
      }
    } catch (_) {}
  },

  /**
   * Completely wipe all IndexedDB stores and delete the database from local device.
   */
  async clearEntireDatabase() {
    try {
      const stores = ['prayers', 'prayer_history', 'answered_prayers', 'thanksgiving', 'sync_queue', 'community_requests', 'encouragements', 'commitments', 'bible_stories', 'settings'];
      const db = await initDB().catch(() => null);
      if (db) {
        for (const storeName of stores) {
          if (db.objectStoreNames.contains(storeName)) {
            await new Promise((resolve) => {
              try {
                const tx = db.transaction(storeName, 'readwrite');
                tx.objectStore(storeName).clear();
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
              } catch (_) {
                resolve();
              }
            });
          }
        }
        try {
          db.close();
        } catch (_) {}
      }
    } catch (_) {}

    dbInstance = null;

    if (typeof indexedDB !== 'undefined' && indexedDB.deleteDatabase) {
      await new Promise((resolve) => {
        try {
          const req = indexedDB.deleteDatabase(DB_NAME);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        } catch (_) {
          resolve();
        }
      });
    }
  }
};

// Expose globally for browser
window.AppDB = AppDB;
