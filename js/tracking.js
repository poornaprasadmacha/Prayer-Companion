/**
 * Prayer Companion - Daily Prayer Tracking & History Module
 * Implements "I Prayed Today" action, instant optimistic updates,
 * undo support, daily streak calculation, and prayer history view.
 */

const Tracking = {
  /**
   * Format a Date object to local YYYY-MM-DD string
   */
  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get all prayer IDs marked as prayed for a specific date
   * @param {string} dateStr YYYY-MM-DD
   * @returns {Promise<Set<string>>}
   */
  async getPrayedPrayerIdsForDate(dateStr = this.getLocalDateString()) {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');
    const set = new Set();

    allHistory.forEach(h => {
      if (h.user_id === userId && h.date === dateStr && !h.is_deleted) {
        set.add(h.prayer_id);
      }
    });

    return set;
  },

  /**
   * Toggle "I Prayed Today" for a prayer point.
   * If not prayed today -> Marks as prayed.
   * If already prayed today -> Undoes the mark.
   * @param {string} prayerId
   * @returns {Promise<{prayed: boolean, historyItem: object}>}
   */
  async togglePrayedToday(prayerId) {
    const userId = Auth.getUserId();
    const dateStr = this.getLocalDateString();
    const nowIso = new Date().toISOString();

    const allHistory = await AppDB.getAll('prayer_history');
    const matching = allHistory.filter(h =>
      h.user_id === userId &&
      h.prayer_id === prayerId &&
      h.date === dateStr &&
      !h.is_deleted
    );

    if (matching.length > 0) {
      // Undo mark for all matching records
      for (const item of matching) {
        item.is_deleted = true;
        item.updated_at = nowIso;
        await AppDB.put('prayer_history', item);
        await SyncEngine.enqueue('history', 'delete', item);
      }

      window.dispatchEvent(new CustomEvent('prayer-data-changed', {
        detail: { action: 'unprayed', prayerId: prayerId }
      }));

      return { prayed: false, historyItem: matching[0] };
    } else {
      // Mark as prayed today
      const newHistoryItem = {
        history_id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        user_id: userId,
        prayer_id: prayerId,
        date: dateStr,
        prayed_at: nowIso,
        is_deleted: false
      };

      await AppDB.put('prayer_history', newHistoryItem);
      await SyncEngine.enqueue('history', 'create', newHistoryItem);

      window.dispatchEvent(new CustomEvent('prayer-data-changed', {
        detail: { action: 'prayed', prayerId: prayerId }
      }));

      return { prayed: true, historyItem: newHistoryItem };
    }
  },

  /**
   * Get Today's Prayer Statistics
   */
  async getTodayStats() {
    const userId = Auth.getUserId();
    const today = this.getLocalDateString();

    const allPrayers = await AppDB.getAll('prayers');
    const activePrayers = allPrayers.filter(p => p.user_id === userId && p.status === 'active' && !p.is_deleted);

    const prayedSet = await this.getPrayedPrayerIdsForDate(today);

    let prayedCount = 0;
    activePrayers.forEach(p => {
      if (prayedSet.has(p.prayer_id)) {
        prayedCount++;
      }
    });

    const unprayedCount = Math.max(0, activePrayers.length - prayedCount);

    const allAnswered = await AppDB.getAll('answered_prayers');
    const answeredCount = allAnswered.filter(a => a.user_id === userId && !a.is_deleted).length;

    return {
      totalActive: activePrayers.length,
      prayedToday: prayedCount,
      unprayedToday: unprayedCount,
      totalAnswered: answeredCount
    };
  },

  /**
   * Calculate consecutive days prayer streak
   */
  async getPrayerStreak() {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');

    const validDates = new Set();
    allHistory.forEach(h => {
      if (h.user_id === userId && !h.is_deleted && h.date) {
        validDates.add(h.date);
      }
    });

    if (validDates.size === 0) return 0;

    let streak = 0;
    const checkDate = new Date();

    // If not prayed today yet, check if prayed yesterday to keep streak active
    const todayStr = this.getLocalDateString(checkDate);
    if (!validDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (streak < 1000) {
      const dStr = this.getLocalDateString(checkDate);
      if (validDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  /**
   * Get Prayer History breakdown for a specific date
   */
  async getHistoryForDate(dateStr) {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');
    const allPrayers = await AppDB.getAll('prayers');
    const prayerMap = new Map();
    allPrayers.forEach(p => prayerMap.set(p.prayer_id, p));

    const records = [];
    allHistory.forEach(h => {
      if (h.user_id === userId && h.date === dateStr && !h.is_deleted) {
        const prayer = prayerMap.get(h.prayer_id) || { title: 'Prayer Point', category: 'General' };
        records.push({
          history_id: h.history_id,
          prayer_id: h.prayer_id,
          title: prayer.title,
          category: prayer.category,
          person_name: prayer.person_name,
          prayed_at: h.prayed_at
        });
      }
    });

    return records.sort((a, b) => new Date(b.prayed_at) - new Date(a.prayed_at));
  },

  /**
   * Get recent daily prayer counts for the past N days (for calendar view)
   */
  async getRecentDaysActivity(days = 14) {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');

    const countsByDate = new Map();
    allHistory.forEach(h => {
      if (h.user_id === userId && !h.is_deleted && h.date) {
        countsByDate.set(h.date, (countsByDate.get(h.date) || 0) + 1);
      }
    });

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = this.getLocalDateString(d);
      result.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        count: countsByDate.get(dateStr) || 0
      });
    }

    return result;
  },

  /**
   * Calculate detailed streak statistics
   */
  async getDetailedStreakStats() {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');

    const validDates = new Set();
    let totalPrayers = 0;
    allHistory.forEach(h => {
      if (h.user_id === userId && !h.is_deleted && h.date) {
        validDates.add(h.date);
        totalPrayers++;
      }
    });

    const currentStreak = await this.getPrayerStreak();

    // Calculate longest streak in history
    let longestStreak = 0;
    const sortedDates = Array.from(validDates).sort();
    let tempStreak = 0;
    let prevTime = null;

    for (const dStr of sortedDates) {
      const currTime = new Date(dStr + 'T00:00:00').getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevTime = currTime;
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    return {
      currentStreak,
      longestStreak,
      totalActiveDays: validDates.size,
      totalPrayers
    };
  },

  /**
   * Generate GitHub-style activity heat-map data (weeks x 7 days)
   * @param {number} totalWeeks Default: 12 weeks
   */
  async getHeatmapData(totalWeeks = 12) {
    const userId = Auth.getUserId();
    const allHistory = await AppDB.getAll('prayer_history');

    const countsByDate = new Map();
    allHistory.forEach(h => {
      if (h.user_id === userId && !h.is_deleted && h.date) {
        countsByDate.set(h.date, (countsByDate.get(h.date) || 0) + 1);
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.getLocalDateString(today);

    // End date is the end of the current week (Sunday)
    const currentDayOfWeek = today.getDay(); // 0-6 (0=Sun)
    const daysToSunday = (7 - currentDayOfWeek) % 7;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToSunday);

    const totalDays = totalWeeks * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const weeks = [];
    let currentWeek = [];

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dStr = this.getLocalDateString(cursor);
      const count = countsByDate.get(dStr) || 0;
      const isFuture = cursor > today;
      const isToday = dStr === todayStr;

      let level = 0;
      if (!isFuture && count > 0) {
        if (count === 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 5) level = 3;
        else level = 4;
      }

      currentWeek.push({
        date: dStr,
        dayName: cursor.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNum: cursor.getDate(),
        monthName: cursor.toLocaleDateString(undefined, { month: 'short' }),
        count: isFuture ? 0 : count,
        level,
        isFuture,
        isToday
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      weeks,
      startDate: this.getLocalDateString(startDate),
      endDate: this.getLocalDateString(endDate)
    };
  }
};

window.Tracking = Tracking;
