// Möbius Bar Mini Player: offline shell. Songs and the song list always come from the network.
// The page and the app settings (manifest: name, icon) always come fresh from GitHub; the saved copy is only for offline.
const CACHE = "mobius-mini-solo-v10";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./about.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/audio/") || r.headers.has("range")) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (u.pathname.endsWith(".webmanifest") || u.pathname.endsWith("about.js")) {
    e.respondWith(fetch(r, { cache: "no-cache" }).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
