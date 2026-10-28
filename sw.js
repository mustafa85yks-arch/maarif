// Service worker: uygulama dosyalarını önbelleğe alır, internet yokken uygulama açılsın diye.
// Hava/hava kalitesi/Vikipedi verisine dokunmaz; onlar localStorage'da saklanır ve bağlantı yoksa son veri gösterilir.
// Yeni dosya eklenince DOSYALAR listesine yaz ve SURUM'u artır.
const SURUM = 'maarif-v2';
const DOSYALAR = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './css/style.css',
  './js/app.js',
  './js/ayarlar.js',
  './js/dil.js',
  './js/kurulum.js',
  './js/pwa.js',
  './js/zaman.js',
  './js/mantik/gok.js',
  './js/mantik/gokyuzu.js',
  './js/mantik/kalite.js',
  './js/mantik/kiyafet.js',
  './js/mantik/modeller.js',
  './js/mantik/namaz.js',
  './js/mantik/nem.js',
  './js/mantik/ozet.js',
  './js/mantik/ramazan.js',
  './js/mantik/ruzgar.js',
  './js/mantik/saglik.js',
  './js/mantik/uyarilar.js',
  './js/mantik/yaprak.js',
  './js/veri/fikralar.js',
  './js/veri/hava.js',
  './js/veri/ilceler.js',
  './js/veri/takvim.js',
  './js/veri/tarihte.js',
  './js/veri/yaprak_metin.js',
  './lib/adhan.umd.min.js',
  './lib/suncalc.js',
];
const YAZI_TIPI = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(adlar.filter(a => a !== SURUM).map(a => caches.delete(a))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin === self.location.origin) e.respondWith(agOnce(r));
  else if (YAZI_TIPI.test(r.url)) e.respondWith(onbellekOnce(r));
  // Diğer adresler (Open-Meteo, Vikipedi) doğrudan ağa gider
});

// Kendi dosyalarımız: önce ağ (güncel sürüm gelsin), 3 sn'de cevap yoksa ya da ağ yoksa önbellek
async function agOnce(r) {
  const c = await caches.open(SURUM);
  const ag = fetch(r).then(yanit => {
    if (yanit.ok) c.put(r, yanit.clone());
    return yanit;
  });
  const zamanAsimi = new Promise(coz => setTimeout(coz, 3000));
  try {
    const yanit = await Promise.race([ag, zamanAsimi]);
    if (yanit) return yanit;
  } catch { /* ağ yok */ }
  const eski = await c.match(r, { ignoreSearch: true });
  return eski ?? ag; // önbellekte de yoksa ağı beklemeye devam et
}

// Yazı tipleri değişmez: önce önbellek
async function onbellekOnce(r) {
  const c = await caches.open(SURUM);
  const eski = await c.match(r);
  if (eski) return eski;
  const yanit = await fetch(r);
  if (yanit.ok || yanit.type === 'opaque') c.put(r, yanit.clone());
  return yanit;
}
