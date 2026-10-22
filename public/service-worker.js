const CACHE_NAME = "habit-tracker-v2";

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

self.addEventListener(
  "install",
  event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  event => {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames
              .filter(name => name !== CACHE_NAME)
              .map(name => caches.delete(name))
          );
        })
    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  event => {
    // Jangan cache API/database
    if (event.request.url.includes("/api/")) {
      return;
    }

    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request);
        })
    );
  }
);