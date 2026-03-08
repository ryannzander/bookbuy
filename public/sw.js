const CACHE_NAME = "buybook-v1";
const STATIC_ASSETS = ["/", "/icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/trpc/")) return;
  event.respondWith(
    fetch(event.request).then((r) => {
      if (r.ok && url.origin === self.location.origin) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
      }
      return r;
    }).catch(() => caches.match(event.request))
  );
});
