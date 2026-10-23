
const CACHE_NAME = "habit-tracker-v3";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/tracking.html",
  "/history.html",
  "/category.html",
  "/profile.html",
  "/admin.html",
  "/style.css",
  "/app.js",
  "/dashboard.js",
  "/tracking.js",
  "/history.js",
  "/category.js",
  "/profile.js",
  "/admin.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(FILES_TO_CACHE)
    )
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan cache API atau permintaan selain GET.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.method !== "GET"
  ) {
    return;
  }

  // HTML selalu mencoba mengambil versi terbaru dari server.
  if (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/"
  ) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || Response.error();
      })
    );

    return;
  }

  // File pendukung boleh menggunakan cache terlebih dahulu.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
