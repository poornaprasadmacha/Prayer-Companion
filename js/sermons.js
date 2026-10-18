/**
 * Prayerly - Bible Sermons & Spiritual Teachings Controller
 * Provides fast, instant access to curated biblical messages
 * with search, category filtering, in-app media player, and direct prayer anchoring.
 */

(function () {
  'use strict';

  const Sermons = {
    activeCategory: 'All',
    searchQuery: '',
    activeSermonId: null,

    init() {
      this.render();
      this.renderHomeQuickBar();
    },

    getSermons() {
      if (typeof window !== 'undefined' && window.BIBLE_SERMONS) {
        return window.BIBLE_SERMONS;
      }
      if (typeof BIBLE_SERMONS !== 'undefined') {
        return BIBLE_SERMONS;
      }
      return [];
    },

    getFilteredSermons() {
      const all = this.getSermons();
      const q = this.searchQuery.toLowerCase().trim();
      const cat = this.activeCategory;

      return all.filter(s => {
        // Category / Language filter
        let matchesCat = true;
        if (cat !== 'All') {
          if (cat === 'Telugu') {
            matchesCat = (s.language === 'Telugu');
          } else if (cat === 'English') {
            matchesCat = (s.language === 'English');
          } else {
            matchesCat = (s.category === cat);
          }
        }

        // Query filter
        let matchesQuery = true;
        if (q) {
          matchesQuery = s.title.toLowerCase().includes(q) ||
                         s.speaker.toLowerCase().includes(q) ||
                         s.scripture.toLowerCase().includes(q) ||
                         s.summary.toLowerCase().includes(q);
        }

        return matchesCat && matchesQuery;
      });
    },

    setCategory(cat) {
      this.activeCategory = cat;
      this.render();
    },

    setSearchQuery(q) {
      this.searchQuery = q || '';
      this.render();
    },

    // -----------------------------------------------------------------------
    // Home Dashboard Fast-Access Quick Bar
    // -----------------------------------------------------------------------

    renderHomeQuickBar() {
      if (typeof document === 'undefined') return;
      const el = document.getElementById('home-sermons-quick-bar');
      if (!el) return;

      el.innerHTML = `
        <div class="home-sermons-card">
          <div class="home-sermons-header">
            <div class="home-sermons-title-group">
              <span class="home-sermons-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 17px; height: 17px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </span>
              <div>
                <strong class="home-sermons-title">Bible Sermons &amp; Messages</strong>
                <p class="home-sermons-sub">Spiritual teachings in English &amp; Telugu</p>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.switchTab('sermons')">
              All Sermons &rarr;
            </button>
          </div>
          <div class="home-sermons-chips">
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('All')">All</button>
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('Prayer')">Prayer</button>
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('Faith')">Faith</button>
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('Peace')">Peace</button>
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('Telugu')">Telugu</button>
            <button class="sermon-quick-chip" onclick="App.openSermonsFiltered('English')">English</button>
          </div>
        </div>
      `;
    },

    // -----------------------------------------------------------------------
    // Main View Renderer (#view-sermons)
    // -----------------------------------------------------------------------

    render() {
      if (typeof document === 'undefined') return;
      const container = document.getElementById('view-sermons');
      if (!container) return;

      const filtered = this.getFilteredSermons();
      const categories = ['All', 'Prayer', 'Faith', 'Peace', 'Grace', 'Healing', 'Telugu', 'English'];

      container.innerHTML = `
        <div class="section-header" style="margin-bottom: 14px;">
          <div>
            <h2 class="section-title">Bible Sermons</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin: 3px 0 0 0;">
              Inspiring biblical sermons and spiritual teachings in English &amp; Telugu.
            </p>
          </div>
        </div>

        <!-- Fast Search & Category Filters -->
        <div class="sermons-filter-bar">
          <div class="sermons-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sermons-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            <input 
              id="sermon-search-input"
              type="text" 
              class="sermons-search-input" 
              placeholder="Search sermons, speakers, scriptures..." 
              value="${this.escapeHtml(this.searchQuery)}"
              oninput="Sermons.setSearchQuery(this.value)"
            />
            ${this.searchQuery ? `
              <button class="sermons-clear-btn" onclick="Sermons.setSearchQuery('')" title="Clear search">&times;</button>
            ` : ''}
          </div>

          <div class="sermons-categories-scroll">
            ${categories.map(cat => `
              <button 
                class="sermon-category-pill ${cat === this.activeCategory ? 'active' : ''}" 
                onclick="Sermons.setCategory('${cat}')"
              >
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Results Counter -->
        <div class="sermons-results-counter">
          <span>Showing <strong>${filtered.length}</strong> ${filtered.length === 1 ? 'message' : 'messages'}</span>
        </div>

        <!-- Sermons Grid -->
        ${filtered.length > 0 ? `
          <div class="sermons-cards-grid">
            ${filtered.map(s => `
              <div class="sermon-card" id="card-${s.id}">
                <div class="sermon-card-header">
                  <div class="sermon-badge-group">
                    <span class="sermon-badge-category">${s.category}</span>
                    <span class="sermon-badge-lang">${s.language}</span>
                  </div>
                  <span class="sermon-duration">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${s.duration}
                  </span>
                </div>

                <h3 class="sermon-title" onclick="Sermons.openPlayer('${s.id}')">${this.escapeHtml(s.title)}</h3>
                
                <div class="sermon-meta-row">
                  <span class="sermon-speaker">${this.escapeHtml(s.speaker)}</span>
                  <span class="sermon-dot">&bull;</span>
                  <button class="sermon-scripture-btn" onclick="BibleReader.openPassage('${this.escapeJs(s.scripture)}')" title="Read this scripture in Bible">
                    ${this.escapeHtml(s.scripture)}
                  </button>
                </div>

                <p class="sermon-summary">${this.escapeHtml(s.summary)}</p>

                <div class="sermon-actions-row">
                  <button class="btn btn-primary btn-sm btn-sermon-listen" onclick="Sermons.openPlayer('${s.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Listen</span>
                  </button>
                  <button class="btn btn-secondary btn-sm btn-sermon-pray" onclick="Sermons.prayWithSermon('${s.id}')" title="Turn message into a prayer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 13px; height: 13px;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    <span>Pray Message</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="sermons-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 44px; height: 44px; color: var(--text-muted);"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <h3>No messages found</h3>
            <p>Try searching for a different topic, preacher, or category.</p>
            <button class="btn btn-secondary btn-sm" onclick="Sermons.setCategory('All'); Sermons.setSearchQuery('');">
              View All Sermons
            </button>
          </div>
        `}
      `;
    },

    // -----------------------------------------------------------------------
    // In-App Sermon Player Modal (#modal-sermon-player)
    // -----------------------------------------------------------------------

    openPlayer(sermonId) {
      const all = this.getSermons();
      const sermon = all.find(s => s.id === sermonId) || all[0];
      if (!sermon) return;

      this.activeSermonId = sermon.id;
      const modal = document.getElementById('modal-sermon-player');
      const body = document.getElementById('sermon-player-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="sermon-player-header-wrap">
          <div class="sermon-badge-group">
            <span class="sermon-badge-category">${sermon.category}</span>
            <span class="sermon-badge-lang">${sermon.language}</span>
            <span class="sermon-duration">${sermon.duration}</span>
          </div>
          <h2 class="sermon-player-title">${this.escapeHtml(sermon.title)}</h2>
          <div class="sermon-player-meta">
            <span>${this.escapeHtml(sermon.speaker)}</span>
            <span class="sermon-dot">&bull;</span>
            <span class="sermon-scripture-highlight">${this.escapeHtml(sermon.scripture)}</span>
          </div>
        </div>

        <!-- Media Player Frame -->
        <div class="sermon-player-frame-box">
          <div class="sermon-audio-visualizer">
            <div class="sermon-sound-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: var(--accent-interactive);"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            </div>
            <div class="sermon-player-controls-strip">
              <span class="sermon-stream-label">Spiritual Audio &bull; ${sermon.language}</span>
              <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0;">
                "Faith comes from hearing, and hearing through the word of Christ." &mdash; Romans 10:17
              </p>
            </div>
          </div>
        </div>

        <!-- Key Spiritual Takeaways -->
        <div class="sermon-takeaways-card">
          <h4 class="sermon-takeaways-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #D97706;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Key Biblical Insights
          </h4>
          <ul class="sermon-takeaways-list">
            ${(sermon.keyTakeaways || []).map(pt => `
              <li>${this.escapeHtml(pt)}</li>
            `).join('')}
          </ul>
        </div>

        <!-- Devotional Prayer Anchor Prompt -->
        <div class="sermon-prayer-prompt-card">
          <div class="sermon-prompt-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--accent-interactive);"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            <strong>Prayer Application</strong>
          </div>
          <p class="sermon-prompt-text">"${this.escapeHtml(sermon.prayerPrompt)}"</p>
        </div>
      `;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closePlayer() {
      const modal = document.getElementById('modal-sermon-player');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    prayWithSermon(sermonId) {
      const all = this.getSermons();
      const sermon = all.find(s => s.id === sermonId);
      if (!sermon) return;

      this.closePlayer();

      const title = `Prayer from Message: ${sermon.title}`;
      const description = `Scripture Anchor: ${sermon.scripture}\nSpeaker: ${sermon.speaker}\n\n"${sermon.prayerPrompt}"\n\nLord, anchor this teaching deep within my soul...`;

      if (typeof window.openPrayerModal === 'function') {
        window.openPrayerModal({
          title,
          description,
          category: sermon.category === 'Prayer' ? 'Personal' : sermon.category
        });
      } else if (typeof App !== 'undefined' && App.openPrayerModal) {
        App.openPrayerModal({
          title,
          description,
          category: sermon.category === 'Prayer' ? 'Personal' : sermon.category
        });
      }
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    escapeJs(str) {
      if (!str) return '';
      return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.Sermons = Sermons;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sermons;
  }
})();
