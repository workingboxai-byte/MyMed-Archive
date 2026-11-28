/* MyMed Archive Service Worker — Offline-First PWA with GitHub Pages relative scope support */

const SHELL_CACHE = 'mymed-shell-v1';
const STATIC_CACHE = 'mymed-static-v1';
const ATLAS_3D_CACHE = 'mymed-atlas3d-v1';
const ACTIVE_CACHES = [SHELL_CACHE, STATIC_CACHE, ATLAS_3D_CACHE];

// Core lightweight shell files precached on install (3D anatomy-data is intentionally excluded)
const PRECACHE_RELATIVE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

function resolveScopedUrl(relativePath) {
  return new URL(relativePath, self.registration.scope).toString();
}

function isAtlas3DRequest(url) {
  const path = url.pathname.toLowerCase();
  return (
    path.includes('/anatomy-data/') ||
    path.includes('/models/') ||
    path.endsWith('.glb') ||
    path.endsWith('.gltf') ||
    path.endsWith('.bin') ||
    path.endsWith('.ktx2') ||
    path.endsWith('.wasm')
  );
}

function isDevInternalRequest(url) {
  const path = url.pathname;
  return (
    path.includes('/@vite/') ||
    path.includes('/@react-refresh') ||
    path.includes('/@fs/') ||
    path.includes('/@id/') ||
    path.includes('/node_modules/.vite/')
  );
}

function isStaticAssetRequest(request, url) {
  const dest = request.destination;
  if (
    dest === 'script' ||
    dest === 'style' ||
    dest === 'font' ||
    dest === 'image' ||
    dest === 'manifest'
  ) {
    return true;
  }
  const path = url.pathname.toLowerCase();
  if (
    /\.(js|mjs|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|webmanifest)$/.test(path)
  ) {
    return true;
  }
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    return true;
  }
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_RELATIVE_URLS.map((rel) => {
            const url = resolveScopedUrl(rel);
            return fetch(url, { cache: 'no-cache' })
              .then((res) => {
                if (res && res.ok) {
                  return cache.put(url, res);
                }
              })
              .catch(() => undefined);
          })
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ACTIVE_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.hostname.endsWith('.supabase.co')) return;
  if (isDevInternalRequest(url)) return;

  // 1. 3D Atlas assets (anatomy-data/): Runtime Cache-First (never precached at install)
  if (isAtlas3DRequest(url)) {
    event.respondWith(
      caches.open(ATLAS_3D_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const networkResponse = await fetch(request);
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(request, networkResponse.clone()).catch(() => undefined);
        }
        return networkResponse;
      })
    );
    return;
  }

  // 2. HTML Navigation: Network-First with cache fallback for instant offline launch
  const acceptHeader = request.headers.get('accept') || '';
  if (request.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => undefined);
            cache.put(resolveScopedUrl('./index.html'), networkResponse.clone()).catch(() => undefined);
          }
          return networkResponse;
        } catch {
          const exactCached = await cache.match(request);
          if (exactCached) return exactCached;
          const indexCached = await cache.match(resolveScopedUrl('./index.html'));
          if (indexCached) return indexCached;
          const rootCached = await cache.match(resolveScopedUrl('./'));
          if (rootCached) return rootCached;
          return new Response('Offline', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      })
    );
    return;
  }

  // 3. JS / CSS / Fonts / Icons: Stale-While-Revalidate
  if (isStaticAssetRequest(request, url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone()).catch(() => undefined);
            }
            return networkResponse;
          })
          .catch(() => undefined);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) return networkResponse;
        return new Response('', { status: 504, statusText: 'Offline asset unavailable' });
      })
    );
  }
});
