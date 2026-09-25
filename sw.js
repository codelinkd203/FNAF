// Minimal service worker — exists mainly so browsers treat this page as
// installable. It caches the shell so the picker still opens offline;
// it never intercepts requests to the game folders.
const CACHE = "fnaf-picker-v1";
const SHELL = ["./", "./index.html", "./style.css", "./script.js", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const scopeDir = new URL("./", self.registration.scope).pathname;
const SHELL_PATHS = new Set([scopeDir, ...SHELL.map((f) => scopeDir + f.replace("./", ""))]);

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isShell = url.origin === location.origin && SHELL_PATHS.has(url.pathname);

  if (!isShell) return; // let game folders (and everything else) pass straight through
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});