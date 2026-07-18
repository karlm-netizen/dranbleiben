/* Dranbleiben — Service Worker: App-Shell offline verfügbar machen */
var CACHE = "dranbleiben-v1";
var ASSETS = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "icon.svg",
  "sync.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  // Nur eigene Dateien aus dem Cache bedienen; fremde Hosts (später Supabase) durchlassen
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).catch(function () { return caches.match("index.html"); });
    })
  );
});
