// Ana ekrana ekleme: service worker kaydı ve kurulum ipucu
let kurulumIstegi = null; // Android/Chrome'un "yükle" penceresi

export function pwaBaslat(yeniden) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* çevrimdışı açılış olmaz, uygulama yine çalışır */ });
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    kurulumIstegi = e;
    yeniden();
  });
  window.addEventListener('appinstalled', () => { kurulumIstegi = null; yeniden(); });
}

const yuklu = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const iphone = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

// Alt bilgideki ipucu: yüklüyse hiçbir şey, Android'de düğme, iPhone'da tarif
export function kurulumIpucu() {
  if (yuklu()) return '';
  if (kurulumIstegi) return '<button class="dugme" id="yukle">Ana ekrana ekle</button>';
  if (iphone()) return '<p class="ipucu">Ana ekrana eklemek için: Safari\'de Paylaş <span aria-hidden="true">⎙</span> → <b>Ana Ekrana Ekle</b></p>';
  return '';
}

export function kurulumDugmesiBagla(kok) {
  kok.querySelector('#yukle')?.addEventListener('click', async () => {
    if (!kurulumIstegi) return;
    kurulumIstegi.prompt();
    await kurulumIstegi.userChoice;
    kurulumIstegi = null;
  });
}
