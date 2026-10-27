// Namaz vakitleri: adhan.js (lib/adhan.umd.min.js, window.adhan) Türkiye yöntemi + Diyanet'e göre düzeltme.
//
// Ölçüm (27 Eki 2026): Diyanet'in 2025–2026 İstanbul vakitleriyle (730 gün) karşılaştırıldı.
// Düzeltmesiz ikindi/akşam/yatsı mevsime göre ±1,3 dk sapıyor. Aşağıdaki eğri 2025 verisiyle kurulup
// 2026'da denendi: altı vakitte de en çok 1 dk fark, günlerin %85–96'sında birebir.
// Esenyurt, Silivri, Şile (1 aylık veri) için de en çok 1 dk.
import { TZ, dakika, dakikadan, sureYaz, hhmm } from '../zaman.js';

export const VAKIT_ADI = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

// Diyanet'in İstanbul'da ayrı vakit yayımladığı ilçeler; diğerleri "İstanbul" vaktini kullanır
const DIYANET_ILCE = new Set(['Arnavutköy', 'Avcılar', 'Başakşehir', 'Beylikdüzü', 'Büyükçekmece', 'Çatalca',
  'Çekmeköy', 'Esenyurt', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Şile', 'Silivri',
  'Sultanbeyli', 'Sultangazi', 'Tuzla']);
const ISTANBUL = { lat: 41.019, lon: 28.949 };

// Dakika düzeltmesi = c0 + c1·cos w + s1·sin w + c2·cos 2w + s2·sin 2w  (w = yılın günü açısı)
const KATSAYI = [
  [-0.041, -0.024, 0.177, -0.01, 0.031],
  [-0.06, -0.045, 0.22, -0.036, 0.118],
  [-0.076, -0.077, -0.025, -0.14, 0.032],
  [-0.046, -0.246, -1.183, -0.271, -0.184],
  [-0.078, -0.196, -0.994, -0.194, 0.105],
  [-0.07, -0.33, -1.275, -0.099, 0.374],
];

const yerelDakika = d => {
  const [s, dk, sn] = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    .format(d).split(':').map(Number);
  return (s % 24) * 60 + dk + sn / 60;
};

export const diyanetBolgesi = konum => (DIYANET_ILCE.has(konum.ad) ? konum.ad : 'İstanbul');

// gun: 'YYYY-AA-GG' → [{ ad, t: 'YYYY-AA-GGTSS:DD' }] × 6
export function vakitler(konum, gun) {
  const k = DIYANET_ILCE.has(konum.ad) ? konum : ISTANBUL;
  const [y, a, g] = gun.split('-').map(Number);
  const prm = adhan.CalculationMethod.Turkey();
  prm.rounding = adhan.Rounding.None;
  const p = new adhan.PrayerTimes(new adhan.Coordinates(k.lat, k.lon), new Date(y, a - 1, g, 12), prm);
  const w = 2 * Math.PI * ((Date.UTC(y, a - 1, g) - Date.UTC(y, 0, 1)) / 864e5) / 365.25;
  const oz = [1, Math.cos(w), Math.sin(w), Math.cos(2 * w), Math.sin(2 * w)];
  return [p.fajr, p.sunrise, p.dhuhr, p.asr, p.maghrib, p.isha].map((d, i) => {
    const dk = Math.round(yerelDakika(d) + oz.reduce((t, x, j) => t + x * KATSAYI[i][j], 0));
    return { ad: VAKIT_ADI[i], t: `${gun}T${String(Math.floor(dk / 60)).padStart(2, '0')}:${String(dk % 60).padStart(2, '0')}` };
  });
}

const yarinOf = gun => dakikadan(dakika(`${gun}T12:00`) + 1440).slice(0, 10);

// Sıradaki vakit (bugün bittiyse yarının imsakı)
export function siradakiVakit(konum, simdi) {
  const gun = simdi.slice(0, 10);
  const v = vakitler(konum, gun).find(x => x.t > simdi) ?? vakitler(konum, yarinOf(gun))[0];
  return { ...v, kalan: sureYaz(dakika(v.t) - dakika(simdi)), saat: hhmm(v.t) };
}

export { yarinOf };
