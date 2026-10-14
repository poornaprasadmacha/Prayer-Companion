/**
 * Prayer Companion - Answered Prayers Module
 * Manages "God Answered" celebrations, testimonies, answered history,
 * category filtering, and restoring answered prayers back to active.
 */

const Answered = {
  /**
   * Mark a prayer point as answered by God
   * @param {string} prayerId
   * @param {string} testimony
   * @param {string} answeredDate YYYY-MM-DD
   */
  async recordAnswer(prayerId, testimony = '', answeredDate = null) {
    const userId = Auth.getUserId();
    const nowIso = new Date().toISOString();
    const targetDate = answeredDate || new Date().toISOString().split('T')[0];

    const prayer = await AppDB.get('prayers', prayerId);
    if (!prayer) {
      throw new Error('Prayer point not found.');
    }

    // 1. Create Answered Record
    const answeredId = 'ans_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const answeredRecord = {
      answered_id: answeredId,
      user_id: userId,
      prayer_id: prayerId,
      testimony: (testimony || '').trim(),
      answered_date: targetDate,
      created_at: nowIso,
      updated_at: nowIso,
      is_deleted: false
    };

    await AppDB.put('answered_prayers', answeredRecord);
    await SyncEngine.enqueue('answered', 'create', answeredRecord);

    // 2. Update original prayer status to 'answered' (preserves record & history)
    prayer.status = 'answered';
    prayer.updated_at = nowIso;
    await AppDB.put('prayers', prayer);
    await SyncEngine.enqueue('prayers', 'update', prayer);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'answered', prayerId: prayerId, answeredId: answeredId }
    }));

    return answeredRecord;
  },

  /**
   * Update testimony of an answered prayer
   * @param {string} answeredId
   * @param {string} testimony
   */
  async updateTestimony(answeredId, testimony) {
    const record = await AppDB.get('answered_prayers', answeredId);
    if (!record) throw new Error('Answered prayer record not found.');

    record.testimony = (testimony || '').trim();
    record.updated_at = new Date().toISOString();

    await AppDB.put('answered_prayers', record);
    await SyncEngine.enqueue('answered', 'update', record);

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'testimony_updated', answeredId: answeredId }
    }));

    return record;
  },

  /**
   * Restore an answered prayer back to active prayer points
   * @param {string} answeredId
   */
  async restoreToActive(answeredId) {
    const record = await AppDB.get('answered_prayers', answeredId);
    if (!record) return;

    const nowIso = new Date().toISOString();

    // Soft delete the answered record
    record.is_deleted = true;
    record.updated_at = nowIso;
    await AppDB.put('answered_prayers', record);
    await SyncEngine.enqueue('answered', 'delete', record);

    // Set prayer back to active
    const prayer = await AppDB.get('prayers', record.prayer_id);
    if (prayer) {
      prayer.status = 'active';
      prayer.updated_at = nowIso;
      await AppDB.put('prayers', prayer);
      await SyncEngine.enqueue('prayers', 'update', prayer);
    }

    window.dispatchEvent(new CustomEvent('prayer-data-changed', {
      detail: { action: 'restored_active', prayerId: record.prayer_id }
    }));
  },

  /**
   * Fetch all answered prayers with their original prayer point data
   */
  async getAll({ category = 'all', searchQuery = '' } = {}) {
    const userId = Auth.getUserId();
    const allAnswered = await AppDB.getAll('answered_prayers');
    const allPrayers = await AppDB.getAll('prayers');

    const prayerMap = new Map();
    allPrayers.forEach(p => prayerMap.set(p.prayer_id, p));

    let list = [];
    allAnswered.forEach(a => {
      if (a.user_id === userId && !a.is_deleted) {
        const originalPrayer = prayerMap.get(a.prayer_id) || {
          title: 'Answered Request',
          category: 'Personal Life',
          description: ''
        };

        list.push({
          ...a,
          prayer_title: originalPrayer.title,
          prayer_description: originalPrayer.description,
          prayer_category: originalPrayer.category,
          person_name: originalPrayer.person_name
        });
      }
    });

    if (category && category !== 'all') {
      list = list.filter(item => item.prayer_category.toLowerCase() === category.toLowerCase());
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        (item.prayer_title && item.prayer_title.toLowerCase().includes(q)) ||
        (item.testimony && item.testimony.toLowerCase().includes(q)) ||
        (item.prayer_category && item.prayer_category.toLowerCase().includes(q)) ||
        (item.person_name && item.person_name.toLowerCase().includes(q))
      );
    }

    // Sort by answered date descending
    list.sort((a, b) => new Date(b.answered_date) - new Date(a.answered_date));

    return list;
  }
};

window.Answered = Answered;
