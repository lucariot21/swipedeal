const CACHE_NAME = "volt-deals-v3";
const SHELL_URL = "/";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [SHELL_URL, OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);

          if (cachedPage) {
            return cachedPage;
          }

          return caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            return response;
          }

          const clone = response.clone();
          const shouldCache =
            requestUrl.pathname.startsWith("/_next/") ||
            /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|json)$/.test(requestUrl.pathname);

          if (shouldCache) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }

          return response;
        })
        .catch(() => caches.match(OFFLINE_URL));
    }),
  );
});
