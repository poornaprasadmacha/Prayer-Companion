/**
 * Prayerly - Service Worker
 * Implements App Shell caching for full offline capability
 * and Cache-First strategy for static assets.
 */

const CACHE_NAME = 'prayerly-v16';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/icons.js',
  './js/content.js',
  './js/stories.js',
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
  './js/app.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/Prayerly.svg',
  './assets/Prayerly.png',
  './assets/answered-prayers.png',
  './assets/pray-for-others.png',
  './assets/thanksgiving.png',
  './assets/prayers-completed.svg'
];

// Install Event - Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for static assets, Pass-through for Apps Script, Cache Fallback when Offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // If request is directed to Google Apps Script or external API, pass through without caching
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

  // Static Assets: Network-First strategy (with Cache Fallback for offline)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
