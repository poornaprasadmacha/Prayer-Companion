/**
 * Prayer Companion - Thanksgiving Journal Module
 * Handles recording daily gratitude, praise, blessings,
 * searching, filtering, and optional linking to answered prayers.
 */

const Thanksgiving = {
  /**
   * Create a new thanksgiving entry
   * @param {object} data
   */
  async create(data) {
    const userId = Auth.getUserId();
    const nowIso = new Date().toISOString();
    const entryId = 'tg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    const entry = {
      entry_id: entryId,
      user_id: userId,
      title: (data.title || '').trim(),
      description: (data.description || '').trim(),
      entry_date: (data.entry_date || (typeof Tracking !== 'undefined' ? Tracking.getLocalDateString() : new Date().toISOString().split('T')[0])).trim(),
      category: (data.category || 'General Praise').trim(),
      linked_prayer_id: (data.linked_prayer_id || '').trim(),
      created_at: nowIso,
      updated_at: nowIso,
      is_deleted: false,
      sync_status: 'pending'
    };

    if (!entry.title) {
      throw new Error('Please enter a title for what you are thankful for.');
    }

    await AppDB.put('thanksgiving', entry);
    await SyncEngine.enqueue('thanksgiving', 'create', entry);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'thanksgiving_created', entryId: entryId }
    }));

    return entry;
  },

  /**
   * Update an existing thanksgiving entry
   * @param {string} entryId
   * @param {object} updateData
   */
  async update(entryId, updateData) {
    const existing = await AppDB.get('thanksgiving', entryId);
    if (!existing) throw new Error('Thanksgiving entry not found.');

    const nowIso = new Date().toISOString();
    const updated = {
      ...existing,
      ...updateData,
      entry_id: entryId,
      user_id: existing.user_id,
      updated_at: nowIso,
      sync_status: 'pending'
    };

    if (!updated.title || !updated.title.trim()) {
      throw new Error('Title cannot be empty.');
    }

    await AppDB.put('thanksgiving', updated);
    await SyncEngine.enqueue('thanksgiving', 'update', updated);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'thanksgiving_updated', entryId: entryId }
    }));

    return updated;
  },

  /**
   * Soft-delete a thanksgiving entry
   * @param {string} entryId
   */
  async delete(entryId) {
    const existing = await AppDB.get('thanksgiving', entryId);
    if (!existing) return;

    const nowIso = new Date().toISOString();
    existing.is_deleted = true;
    existing.updated_at = nowIso;
    existing.sync_status = 'pending';

    await AppDB.put('thanksgiving', existing);
    await SyncEngine.enqueue('thanksgiving', 'delete', existing);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'thanksgiving_deleted', entryId: entryId }
    }));
  },

  /**
   * Get all active thanksgiving entries with optional filtering
   */
  async query({ searchQuery = '', category = 'all' } = {}) {
    const userId = Auth.getUserId();
    const all = await AppDB.getAll('thanksgiving');

    let filtered = all.filter(e => e.user_id === userId && !e.is_deleted);

    if (category && category !== 'all') {
      filtered = filtered.filter(e => (e.category || '').toLowerCase() === category.toLowerCase());
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    // Sort by entry_date descending
    filtered.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

    return filtered;
  }
};

window.Thanksgiving = Thanksgiving;
