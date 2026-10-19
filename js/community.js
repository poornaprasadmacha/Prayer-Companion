/**
 * Prayer Companion - Community Prayer Companions Module
 * Handles voluntary prayer sharing, "I'll Pray" commitments,
 * encouragement messages, reports, and pagination.
 */

const Community = {
  /**
   * Share a personal prayer request with the community
   */
  async shareRequest({ prayer_title, shared_description, display_name, is_anonymous, category, allow_encouragement }) {
    if (!Auth.isLoggedIn()) {
      throw new Error('Please sign in with your email to share prayer requests with the community.');
    }
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl) {
      throw new Error('Cloud backend API is not configured.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_share_request',
        token: Auth.token,
        prayer_title: prayer_title,
        shared_description: shared_description,
        display_name: display_name,
        is_anonymous: Boolean(is_anonymous),
        category: category,
        allow_encouragement: allow_encouragement !== undefined ? Boolean(allow_encouragement) : true
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to share prayer request.');
    }
    return data;
  },

  /**
   * Update an existing shared request
   */
  async updateRequest(requestId, updateData) {
    if (!Auth.isLoggedIn()) throw new Error('Authentication required.');
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_update_request',
        token: Auth.token,
        request_id: requestId,
        ...updateData
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update request.');
    return data;
  },

  /**
   * Stop sharing / delete a shared request
   */
  async deleteRequest(requestId) {
    if (!Auth.isLoggedIn()) throw new Error('Authentication required.');
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_delete_request',
        token: Auth.token,
        request_id: requestId
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to remove request.');
    return data;
  },

  /**
   * Internal in-memory cache
   */
  _cache: null,

  /**
   * Retrieve cached community requests from IndexedDB or localStorage
   */
  async getCachedRequests() {
    if (this._cache && Array.isArray(this._cache.requests)) {
      return this._cache;
    }
    try {
      if (window.AppDB) {
        const record = await AppDB.get('settings', 'community_requests_cache');
        if (record && record.data && Array.isArray(record.data.requests)) {
          this._cache = record.data;
          return this._cache;
        }
      }
    } catch (_) {}
    try {
      const raw = localStorage.getItem('PRAYERLY_COMMUNITY_CACHE');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.requests)) {
          this._cache = parsed;
          return this._cache;
        }
      }
    } catch (_) {}
    return null;
  },

  /**
   * Persist community requests to IndexedDB and localStorage
   */
  async saveCachedRequests(data) {
    if (!data || !Array.isArray(data.requests)) return;
    this._cache = data;
    try {
      if (window.AppDB) {
        await AppDB.put('settings', {
          key: 'community_requests_cache',
          data: data,
          updated_at: Date.now()
        });
      }
    } catch (_) {}
    try {
      localStorage.setItem('PRAYERLY_COMMUNITY_CACHE', JSON.stringify(data));
    } catch (_) {}
  },

  /**
   * Fetch community requests with filtering and pagination
   */
  async getRequests({ filterType = 'recent', category = 'all', search = '', page = 1, limit = 15 } = {}) {
    const apiUrl = Auth.getApiUrl();
    if (!apiUrl || !Auth.isLoggedIn()) {
      return { requests: [], total: 0, page: 1, total_pages: 1 };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_get_requests',
        token: Auth.token,
        filter_type: filterType,
        category: category,
        search: search,
        page: page,
        limit: limit
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to load community requests.');
    }

    // Auto-update cache on default feed view
    if (filterType === 'recent' && category === 'all' && !search && page === 1) {
      await this.saveCachedRequests(data);
    }

    return data;
  },

  /**
   * Toggle commitment ("I'll Pray") for a community request
   */
  async toggleCommitment(requestId) {
    if (!Auth.isLoggedIn()) {
      throw new Error('Please sign in to commit to praying for this request.');
    }
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_toggle_commitment',
        token: Auth.token,
        request_id: requestId
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to record commitment.');

    // Update in-memory & IndexedDB cache optimistically
    try {
      const cached = await this.getCachedRequests();
      if (cached && Array.isArray(cached.requests)) {
        const target = cached.requests.find(r => r.request_id === requestId);
        if (target) {
          target.is_committed_by_me = Boolean(data.is_committed);
          if (data.supporters_count !== undefined) {
            target.supporters_count = data.supporters_count;
          } else {
            target.supporters_count = Math.max(0, (target.supporters_count || 0) + (data.is_committed ? 1 : -1));
          }
          await this.saveCachedRequests(cached);
        }
      }
    } catch (_) {}

    return data;
  },

  /**
   * Send encouragement message
   */
  async sendEncouragement(requestId, messageText) {
    if (!Auth.isLoggedIn()) throw new Error('Please sign in to send an encouragement.');
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_send_encouragement',
        token: Auth.token,
        request_id: requestId,
        message_text: messageText
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to send encouragement.');
    return data;
  },

  /**
   * Fetch approved encouragement messages for a request
   */
  async getEncouragements(requestId) {
    if (!Auth.isLoggedIn()) return { messages: [] };
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_get_encouragements',
        token: Auth.token,
        request_id: requestId
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to load encouragements.');
    return data;
  },

  /**
   * Report inappropriate community content
   */
  async reportContent(requestId, messageId, reason) {
    if (!Auth.isLoggedIn()) throw new Error('Authentication required to submit report.');
    const apiUrl = Auth.getApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'community_report_content',
        token: Auth.token,
        request_id: requestId,
        message_id: messageId,
        reason: reason
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to report content.');
    return data;
  }
};

window.Community = Community;
window.CommunityView = {
  openShareModal(prayer) {
    if (typeof App !== 'undefined' && typeof App.openShareCompanionModal === 'function') {
      App.openShareCompanionModal(prayer || {});
    }
  }
};
