/*
 * Service worker: makes the app work offline and installable, so a coach can open trainings and exercises
 * on the pitch without a connection. Generated into dist/sw.js by scripts/build-sw.mjs, which fills in
 * the build's files and a version; don't edit dist/sw.js by hand.
 *
 * - The app and all its chunks (exercise texts, animations) are cached when the service worker installs.
 * - Pages (navigations) come from the network, falling back to the cached app when offline or slow.
 * - Other files come from the cache first. Hashed files never change, so that's always safe.
 * - Google Fonts are cached as they're used, and refreshed in the background.
 */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `ikdien-${VERSION}`;
const RUNTIME = 'ikdien-runtime';
/** Older versions stay a while, so a page that's still open can load its (old) chunks after a deploy. */
const KEEP_VERSIONS = 3;
/** On a weak connection, don't wait longer than this for a fresh page before using the cached one. */
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const versions = (await caches.keys()).filter((key) => key.startsWith('ikdien-') && key !== RUNTIME);
      // caches.keys() lists caches in creation order: drop all but the newest few.
      const old = versions.filter((key) => key !== CACHE).slice(0, -(KEEP_VERSIONS - 1) || undefined);
      await Promise.all(old.map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

/** The app shell of this version: every route is the same single-page app. */
const appShell = async () => (await caches.open(CACHE)).match('/index.html');

async function page(request) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS)),
    ]);
    // Deep links come back from GitHub Pages' 404 fallback, which is the same app; use it as is.
    if (response.ok || response.status === 404) return response;
    return (await appShell()) ?? response;
  } catch {
    return (await appShell()) ?? Response.error();
  }
}

async function cacheFirst(request) {
  // This version first (for files without a hash in their name, like the icons), then older versions.
  // Static files don't vary, but servers may still send `Vary: Origin`, which would make module script
  // requests (sent with an Origin header) miss the cache; so the Vary header is ignored.
  const cached =
    (await (await caches.open(CACHE)).match(request, { ignoreVary: true })) ?? (await caches.match(request, { ignoreVary: true }));
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(page(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
  }
});
