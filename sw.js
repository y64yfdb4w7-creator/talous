// Finance OS — Service Worker v11
// Välimuistittaa kaikki JS-tiedostot → nopea lataus, offline-tuki

const CACHE_NAME = 'finance-os-v11';
const ASSETS = [
  '/talous/',
  '/talous/index.html',
  '/talous/js/db.js',
  '/talous/js/calculations.js',
  '/talous/js/signals.js',
  '/talous/js/import.js',
  '/talous/js/ui.js',
  '/talous/js/sync.js',
  '/talous/js/app.js',
  '/talous/manifest.json',
];

// Asennus — välimuistita kaikki tiedostot
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW v11: Välimuistitetaan tiedostot...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Aktivointi — poista vanhat välimuistit
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Cache First strategia app-tiedostoille
// Network First API-kutsuille (Supabase, Finnhub)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API-kutsut: aina verkosta, ei välimuistista
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('finnhub.io') ||
      url.hostname.includes('frankfurter.dev') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // App-tiedostot: välimuistista ensin, verkosta jos ei löydy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
