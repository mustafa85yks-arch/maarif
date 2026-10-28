// Doğum günleri: yalnızca bu cihazın localStorage'ında durur, hiçbir yere gönderilmez.
// Her kayıt { id, ad, gun, ay, yil? }; yıl isteğe bağlı, varsa yaş gösterilir.
const ANAHTAR = 'maarif_dogumgunleri_v1'; // "maarif_" öneki: tüm verileri sil bunu da siler

export const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const AYIN_GUNU = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function dogumGunleriOku() {
  try {
    const l = JSON.parse(localStorage.getItem(ANAHTAR) || '[]');
    return Array.isArray(l) ? l : [];
  } catch {
    return [];
  }
}

export function dogumGunleriYaz(liste) {
  try { localStorage.setItem(ANAHTAR, JSON.stringify(liste)); } catch { /* gizli sekme vb. */ }
}

const artikMi = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const iki = n => String(n).padStart(2, '0');
const gunFarki = (a, b) => Math.round((Date.parse(`${b}T12:00Z`) - Date.parse(`${a}T12:00Z`)) / 864e5);

// Bugünden itibaren bir sonraki doğum günü; 29 Şubat artık olmayan yılda 28 Şubat'ta kutlanır
function yilda(d, y) {
  const g = d.ay === 2 && d.gun === 29 && !artikMi(y) ? 28 : d.gun;
  return `${y}-${iki(d.ay)}-${iki(g)}`;
}

export function sonrakiDogumGunu(d, bugun) {
  const y = +bugun.slice(0, 4);
  let tarih = yilda(d, y), yil = y;
  if (tarih < bugun) { tarih = yilda(d, y + 1); yil = y + 1; }
  return { ...d, tarih, kalan: gunFarki(bugun, tarih), yas: d.yil ? yil - d.yil : null };
}

// En yakından en uzağa
export function siraliDogumGunleri(bugun) {
  return dogumGunleriOku().map(d => sonrakiDogumGunu(d, bugun)).sort((a, b) => a.kalan - b.kalan || a.ad.localeCompare(b.ad, 'tr'));
}
