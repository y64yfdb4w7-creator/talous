// Finance OS — Service Worker v23
// Passiivinen: ei välimuistia, kaikki suoraan verkosta
// Tämä purkaa vanhan cachen ja poistuu tieltä

const CACHE_NAME = 'finance-os-v23';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Kaikki pyynnöt suoraan verkosta — ei välimuistia
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      new Response('Offline — avaa verkkoyhteydellä', { status: 503 })
    )
  );
});
