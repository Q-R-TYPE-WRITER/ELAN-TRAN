const CACHE = "essence-v1";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./pwa.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache =>
          cache.put(event.request, copy)
        );
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then(result =>
        result || caches.match("./index.html")
      )
    )
  );
});