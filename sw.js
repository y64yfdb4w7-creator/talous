// Finance OS — Service Worker v24
// Passiivinen: ei välimuistia, kaikki suoraan verkosta

const CACHE_NAME = 'finance-os-v24';

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

// Kaikki pyynnöt suoraan verkosta — ei välimuistia, pakota tuore versio
self.addEventListener('fetch', event => {
  // JS-tiedostot: aina verkosta, ei HTTP-välimuistia
  const url = event.request.url;
  const isScript = url.includes('/js/') && url.endsWith('.js');
  const isHtml   = url.endsWith('/talous/') || url.endsWith('/talous/index.html');

  if (isScript || isHtml) {
    const req = new Request(event.request.url, {
      method: event.request.method,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      mode: 'cors',
      credentials: event.request.credentials,
    });
    event.respondWith(
      fetch(req).catch(() =>
        new Response('Offline — avaa verkkoyhteydellä', { status: 503 })
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      new Response('Offline — avaa verkkoyhteydellä', { status: 503 })
    )
  );
});
