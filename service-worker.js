const CACHE_NAME = "m8-painting-tools-shell-v3";
const SHELL_URLS = [
  "/",
  "/index.html",
  "/analysis/",
  "/analysis/index.html",
  "/value-checker/",
  "/value-checker/index.html",
  "/composition-checker/",
  "/composition-checker/index.html",
  "/color-studio/",
  "/color-studio/index.html",
  "/brush-runner/",
  "/brush-runner/index.html",
  "/manifest.webmanifest",
  "/assets/pwa/icon-192.png",
  "/assets/pwa/icon-512.png",
  "/assets/pwa/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        })
    );
    return;
  }

  if (requestUrl.pathname.startsWith("/assets/images/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const contentType = response.headers.get("Content-Type") || "";
          if (
            response &&
            response.status === 200 &&
            response.type === "basic" &&
            contentType.startsWith("image/")
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (!cachedResponse) {
            return Response.error();
          }

          const cachedContentType = cachedResponse.headers.get("Content-Type") || "";
          if (!cachedContentType.startsWith("image/")) {
            return Response.error();
          }

          return cachedResponse;
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        const contentType = response.headers.get("Content-Type") || "";
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic" ||
          (request.destination === "image" && !contentType.startsWith("image/"))
        ) {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});
