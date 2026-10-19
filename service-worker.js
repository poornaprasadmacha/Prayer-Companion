/**
 * Prayerly - Service Worker
 * Implements App Shell caching for full offline capability
 * and Cache-First strategy for static assets.
 */

const CACHE_NAME = 'prayerly-v45';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/icons.js',
  './js/content.js',
  './js/voice.js',
  './js/db.js',
  './js/auth.js',
  './js/sync.js',
  './js/tracking.js',
  './js/prayers.js',
  './js/community.js',
  './js/answered.js',
  './js/thanksgiving.js',
  './js/admin.js',
  './js/settings.js',
  './js/notifications.js',
  './js/bible-plan-data.js',
  './js/bible-plan.js',
  './js/bible-reader.js',
  './js/app.js',
  './assets/prayerly-logo.png',
  './assets/Prayerly-Logo-5.png',
  './assets/Prayerly-Logo-6.png',
  './assets/daily-devotional.jpg',
  './assets/keep-praying.png',
  './assets/no-active-prayers.png',
  './assets/no-active-prayers-dark.png',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-32.png',
  './assets/icons/icon-64.png',
  './assets/Prayerly.svg',
  './assets/Prayerly.png',
  './assets/answered-prayers.png',
  './assets/pray-for-others.png',
  './assets/thanksgiving.png',
  './assets/prayers-completed.svg',
  './assets/onboarding-step1.svg',
  './assets/onboarding-step2.svg',
  './assets/onboarding-step3.svg',
  './assets/onboarding-step4.svg',
  './assets/feature-cloud.svg',
  './assets/feature-companion.svg',
  './assets/feature-journal.svg',
  './assets/feature-thanksgiving.svg',
  './assets/landing-hero-preview.svg',
  './assets/qr-code.svg'
];

// Install Event - Pre-cache App Shell with redirect follow & resilience
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Pre-caching static app shell');
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { redirect: 'follow' });
            if (response && (response.ok || response.status === 200 || response.type === 'opaque')) {
              await cache.put(asset, response.clone());
              // Store aliases so matches succeed whether requested as './', '/', or 'index.html'
              if (asset === './' || asset === './index.html') {
                await cache.put('./', response.clone());
                await cache.put('./index.html', response.clone());
                await cache.put('/index.html', response.clone());
              }
            }
          } catch (err) {
            console.warn('[ServiceWorker] Pre-cache skip for:', asset, err);
          }
        })
      );
      console.log('[ServiceWorker] App shell pre-caching complete');
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up obsolete caches and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== 'prayerly-bible-cdn-v1') {
            console.log('[ServiceWorker] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - App Shell First for Navigations, Network-First for Apps Script, Cache-First for Assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Google Apps Script or external API pass-through
  if (requestUrl.hostname.includes('script.google.com') || requestUrl.hostname.includes('googleusercontent.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          success: false,
          error: 'Offline: Network unreachable. Changes are saved locally on your device.',
          offline: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Holy Bible CDN assets: Stale-While-Revalidate / Cache-First strategy for instant offline access
  if (requestUrl.hostname.includes('cdn.jsdelivr.net') || requestUrl.hostname.includes('raw.githubusercontent.com')) {
    event.respondWith(
      caches.open('prayerly-bible-cdn-v1').then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })
    );
    return;
  }

  // 3. Navigation Requests (PWA App Launch & Page Loads):
  // Return cached App Shell immediately (<10ms) so downloaded app opens instantly without network delay
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(async (cached) => {
        if (cached) {
          // Revalidate in background to keep shell fresh
          fetch(event.request).then((netRes) => {
            if (netRes && netRes.ok) {
              const clone = netRes.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
                cache.put('./', clone);
                cache.put('./index.html', clone);
              });
            }
          }).catch(() => {});
          return cached;
        }

        // Try standard App Shell fallbacks in cache
        const shell = (await caches.match('./', { ignoreSearch: true })) ||
                      (await caches.match('./index.html', { ignoreSearch: true })) ||
                      (await caches.match('/index.html', { ignoreSearch: true }));
        if (shell) {
          fetch(event.request).then((netRes) => {
            if (netRes && netRes.ok) {
              const clone = netRes.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
                cache.put('./', clone);
                cache.put('./index.html', clone);
              });
            }
          }).catch(() => {});
          return shell;
        }

        // If not in cache yet, fetch from network and cache
        return fetch(event.request).then((netRes) => {
          if (netRes && netRes.ok) {
            const clone = netRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
              cache.put('./', clone);
              cache.put('./index.html', clone);
            });
          }
          return netRes;
        }).catch(async () => {
          return (await caches.match('./', { ignoreSearch: true })) ||
                 (await caches.match('./index.html', { ignoreSearch: true }));
        });
      })
    );
    return;
  }

  // 4. Static Assets: Stale-While-Revalidate / Cache-First strategy for instant (<15ms) app launch
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {});

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetchPromise.then((networkResponse) => {
        if (networkResponse) {
          return networkResponse;
        }
        return caches.match('./', { ignoreSearch: true });
      });
    })
  );
});
