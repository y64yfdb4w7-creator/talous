// Finance OS — Service Worker v22
// index.html haetaan AINA verkosta → JS-tiedostot päivittyvät heti

const CACHE_NAME = 'finance-os-v22';
const JS_ASSETS = [
  '/talous/js/db.js',
  '/talous/js/calculations.js',
  '/talous/js/signals.js',
  '/talous/js/import.js',
  '/talous/js/ui.js',
  '/talous/js/sync.js',
  '/talous/js/app.js',
  '/talous/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(JS_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API-kutsut: aina verkosta
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('finnhub.io') ||
      url.hostname.includes('frankfurter.dev') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // index.html: AINA verkosta — näin JS-päivitykset tulevat heti
  if (url.pathname === '/talous/' || url.pathname === '/talous/index.html') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/talous/index.html'))
    );
    return;
  }

  // JS-tiedostot: välimuistista ensin, verkosta jos ei löydy
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
