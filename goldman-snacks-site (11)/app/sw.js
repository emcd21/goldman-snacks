// Goldman Snacks app service worker. It precaches the app, the site's question and glossary scripts, the fonts
// and the garden pictures at install, so the installed app works offline (except the tutor).
// Pages and scripts are served from the cache at once and refreshed in the background, so a change to the
// site reaches the app on the next launch. Bump VERSION when the list of files changes.
const VERSION = 'gs-app-8';
const CACHE = 'gs-app-' + VERSION;
const FILES = [
  './', 'index.html', 'app.css', 'app.js', 'char3d.js', 'sculpt.js', 'sculptw.js', 'vendor/three.module.min.js', 'vendor/RoomEnvironment.js', 'notes.js', 'manifest.webmanifest', '../site.js', '../flashdata.js',
  'fonts/fonts.css', 'fonts/Hind-300.woff2', 'fonts/Hind-400.woff2', 'fonts/Hind-500.woff2', 'fonts/Hind-600.woff2', 'fonts/Hind-700.woff2', 'fonts/amiriquran-8aaeb960.woff2',
  'icons/icon-192.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'img/hills-aero.webp', 'img/bubbles.svg', 'img/bubble.svg', 'img/clouds.svg', 'img/grass.webp', 'img/lawn.webp',
  'img/garden/bg-1-f.webp',
  'img/garden/bg-1-t.webp',
  'img/garden/bg-2-f.webp',
  'img/garden/bg-3-t.webp',
  'img/garden/bg-4-f.webp',
  'img/garden/bg-5-t.webp',
  'img/garden/bg-6-t.webp',
  'img/garden/bg-7-f.webp',
  'img/garden/bg-8-t.webp',
  'img/garden/bg-9-f.webp',
  'img/garden/bg-9-t.webp',
  'img/garden/bunnies-p.webp',
  'img/garden/bunny_b-sh.webp',
  'img/garden/bunny_b.webp',
  'img/garden/bunny_w-sh.webp',
  'img/garden/bunny_w.webp',
  'img/garden/cat-p.webp',
  'img/garden/cat-sh.webp',
  'img/garden/cat.webp',
  'img/garden/cottage0-sh.webp',
  'img/garden/cottage0.webp',
  'img/garden/cottage1-sh.webp',
  'img/garden/cottage1.webp',
  'img/garden/cottage2-sh.webp',
  'img/garden/cottage2.webp',
  'img/garden/cottage3-sh.webp',
  'img/garden/cottage3.webp',
  'img/garden/cottage4-sh.webp',
  'img/garden/cottage4.webp',
  'img/garden/fence0-sh.webp',
  'img/garden/fence0.webp',
  'img/garden/fence1-sh.webp',
  'img/garden/fence1.webp',
  'img/garden/flowers-sh.webp',
  'img/garden/flowers.webp',
  'img/garden/kitten-p.webp',
  'img/garden/kitten-sh.webp',
  'img/garden/kitten.webp',
  'img/garden/lamb-p.webp',
  'img/garden/lamb-sh.webp',
  'img/garden/lamb.webp',
  'img/garden/path-sh.webp',
  'img/garden/path.webp',
  'img/garden/rubble-sh.webp',
  'img/garden/rubble.webp',
  'img/garden/tree0-sh.webp',
  'img/garden/tree0.webp',
  'img/garden/tree1-sh.webp',
  'img/garden/tree1.webp',
  'img/garden/well0-sh.webp',
  'img/garden/well0.webp',
  'img/garden/well1-sh.webp',
  'img/garden/well1.webp',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('gs-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(serve(req, e));
});
async function serve(req, e) {
  const cache = await caches.open(CACHE);
  const key = req.mode === 'navigate' ? './' : req;
  const hit = await cache.match(key, { ignoreSearch: true });
  const fresh = fetch(req).then(res => { if (res.status === 200 && res.type === 'basic') cache.put(key, res.clone()).catch(() => { }); return res; });
  if (hit) { e.waitUntil(fresh.catch(() => { })); return hit; }
  return fresh;
}
