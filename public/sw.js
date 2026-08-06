// X-PATH — app-shell service worker (installable-PWA pass).
// Structurally separate from the DL-055 offline dictation/scan upload
// queue (src/lib/offline-queue.ts, IndexedDB-backed, drives its own
// fetch() calls directly) — this worker's only job is making the app
// launch fast and installable by caching static build assets. It never
// intercepts navigation, Server Actions, or /api/* routes, so it can
// never serve stale or cross-tenant clinical data (Header G2).
const CACHE_NAME = "xpath-shell-v1";

const STATIC_PATTERNS = [
  /^\/_next\/static\//,
  /^\/icons\//,
  /^\/manifest\.webmanifest$/,
  /\.(?:png|jpe?g|svg|webp|gif|woff2?|ico)$/,
];

function isStaticAsset(pathname) {
  return STATIC_PATTERNS.some((re) => re.test(pathname));
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Never touch mutating requests (Server Actions are POST) or
  // cross-origin requests (R2 presigned uploads, etc).
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!isStaticAsset(url.pathname)) return; // navigation/API/auth pass straight to network

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }),
  );
});
