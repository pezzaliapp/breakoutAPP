const CACHE = 'breakout-v4';
const ASSETS = [
  './',
  './index.html?v=4',
  './style.v4.css',
  './app.v4.js',
  './manifest.webmanifest?v=4',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.pathname.endsWith('/index.html')) {
    // normalize to versioned page
    return e.respondWith(caches.match('./index.html?v=4').then(r=>r||fetch(e.request)));
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
