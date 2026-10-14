/**
 * Prayer Companion - Prayer Point Management Module
 * Handles creating, updating, archiving, restoring, soft-deleting,
 * filtering, searching, and sorting prayer points.
 */

const Prayers = {
  CATEGORIES: [
    'Personal Life',
    'Family',
    'Health',
    'Education',
    'Career',
    'Church',
    'Ministries',
    'Missions',
    'Friends',
    'Nation',
    'Spiritual Growth',
    'Other'
  ],

  /**
   * Create a new prayer point
   * @param {object} prayerData
   * @returns {Promise<object>}
   */
  async create(prayerData) {
    const userId = Auth.getUserId();
    const nowIso = new Date().toISOString();
    const prayerId = 'pray_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    const prayer = {
      prayer_id: prayerId,
      user_id: userId,
      title: (prayerData.title || '').trim(),
      description: (prayerData.description || '').trim(),
      category: (prayerData.category || 'Personal Life').trim(),
      person_name: (prayerData.person_name || '').trim(),
      created_at: nowIso,
      target_date: (prayerData.target_date || '').trim(),
      priority: prayerData.priority || 'Medium', // High, Medium, Low
      reminder_preference: prayerData.reminder_preference || 'both', // both, morning, evening, none
      status: 'active', // active, archived, answered
      updated_at: nowIso,
      is_deleted: false,
      sync_status: 'pending'
    };

    if (!prayer.title) {
      throw new Error('Please enter a prayer title.');
    }

    // Save to IndexedDB immediately
    await AppDB.put('prayers', prayer);

    // Enqueue for background sync
    await SyncEngine.enqueue('prayers', 'create', prayer);

    // Notify listeners
    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'created', prayerId: prayer.prayer_id }
    }));

    return prayer;
  },

  /**
   * Update an existing prayer point
   * @param {string} prayerId
   * @param {object} updateData
   */
  async update(prayerId, updateData) {
    const existing = await AppDB.get('prayers', prayerId);
    if (!existing) {
      throw new Error('Prayer point not found.');
    }

    const nowIso = new Date().toISOString();
    const updated = {
      ...existing,
      ...updateData,
      prayer_id: prayerId, // immutable
      user_id: existing.user_id, // immutable
      updated_at: nowIso,
      sync_status: 'pending'
    };

    if (!updated.title || !updated.title.trim()) {
      throw new Error('Prayer title cannot be empty.');
    }

    await AppDB.put('prayers', updated);
    await SyncEngine.enqueue('prayers', 'update', updated);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'updated', prayerId: prayerId }
    }));

    return updated;
  },

  /**
   * Archive a prayer point
   * @param {string} prayerId
   */
  async archive(prayerId) {
    return this.update(prayerId, { status: 'archived' });
  },

  /**
   * Restore an archived prayer point back to active
   * @param {string} prayerId
   */
  async restore(prayerId) {
    return this.update(prayerId, { status: 'active' });
  },

  /**
   * Soft-delete a prayer point
   * @param {string} prayerId
   */
  async delete(prayerId) {
    const existing = await AppDB.get('prayers', prayerId);
    if (!existing) return;

    const nowIso = new Date().toISOString();
    existing.is_deleted = true;
    existing.updated_at = nowIso;
    existing.sync_status = 'pending';

    await AppDB.put('prayers', existing);
    await SyncEngine.enqueue('prayers', 'delete', existing);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'deleted', prayerId: prayerId }
    }));
  },

  /**
   * Get a single prayer point by ID
   * @param {string} prayerId
   */
  async get(prayerId) {
    return AppDB.get('prayers', prayerId);
  },

  /**
   * Query, filter, and sort prayer points
   */
  async query({
    status = 'active',
    category = 'all',
    priority = 'all',
    searchQuery = '',
    sortBy = 'newest'
  } = {}) {
    const userId = Auth.getUserId();
    const all = await AppDB.getAll('prayers');

    let filtered = all.filter(p => p.user_id === userId && !p.is_deleted);

    if (status === 'active') {
      const allAnswered = await AppDB.getAll('answered_prayers');
      const answeredSet = new Set(allAnswered.filter(a => !a.is_deleted).map(a => a.prayer_id));
      filtered = filtered.filter(p => p.status === 'active' && !answeredSet.has(p.prayer_id));
    } else if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter(p => p.priority === priority);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.person_name && p.person_name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'priority') {
        const priorityRank = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityRank[b.priority] || 2) - (priorityRank[a.priority] || 2);
      }
      return 0;
    });

    return filtered;
  }
};

window.Prayers = Prayers;
