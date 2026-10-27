import { hhmm } from '../zaman.js';

// İstanbul'un geleneksel rüzgar gülü (rüzgarın estiği yön)
const RUZGARLAR = [
  { ad: 'Yıldız', kisa: 'K', yon: 'kuzey', yonelme: 'Yıldız\'a', not: 'Karadeniz\'den serinlik getirir.' },
  { ad: 'Poyraz', kisa: 'KD', yon: 'kuzeydoğu', yonelme: 'Poyraz\'a', not: 'Soğuk ve sert eser; havayı temizler, Boğaz\'ı köpürtür.' },
  { ad: 'Gündoğusu', kisa: 'D', yon: 'doğu', yonelme: 'Gündoğusu\'na', not: 'Genelde yumuşak ve kuru eser.' },
  { ad: 'Keşişleme', kisa: 'GD', yon: 'güneydoğu', yonelme: 'Keşişleme\'ye', not: 'Ilık ve kuru; kışın bile bahar havası getirir.' },
  { ad: 'Kıble', kisa: 'G', yon: 'güney', yonelme: 'Kıble\'ye', not: 'Ilık ve nemli; çoğu zaman yağmurun habercisi.' },
  { ad: 'Lodos', kisa: 'GB', yon: 'güneybatı', yonelme: 'Lodos\'a', not: 'Ilık ama hırçın; deniz kabarır, vapurlar aksayabilir, baş ağrıtır.' },
  { ad: 'Günbatısı', kisa: 'B', yon: 'batı', yonelme: 'Günbatısı\'na', not: 'Denizden nem getirir, bazen yağmur.' },
  { ad: 'Karayel', kisa: 'KB', yon: 'kuzeybatı', yonelme: 'Karayel\'e', not: 'Soğuk eser; kışın kar getirebilir.' },
];

export const ruzgarAdi = derece => RUZGARLAR[Math.round((((derece ?? 0) % 360) + 360) % 360 / 45) % 8];

// km/s — Beaufort'a göre sadeleştirilmiş
export function hizEtiketi(kmh) {
  if (kmh < 6) return 'durgun';
  if (kmh < 20) return 'hafif';
  if (kmh < 39) return 'orta';
  if (kmh < 62) return 'sert';
  return 'fırtına';
}
const ESME = { hafif: 'hafif hafif', orta: 'orta kuvvette', sert: 'sert', fırtına: 'fırtına şiddetinde' };

export const lodosMu = s => s.yon >= 190 && s.yon <= 250;

export function ruzgarYorumu(saatler, idx) {
  const s = saatler[idx];
  const r = ruzgarAdi(s.yon);
  const etiket = hizEtiketi(s.ruzgar);
  const cumle = etiket === 'durgun'
    ? 'Rüzgar yok denecek kadar az.'
    : `${r.ad} ${ESME[etiket]} esiyor: ${Math.round(s.ruzgar)} km/s, hamlelerde ${Math.round(s.hamle)} km/s.`;

  // Önümüzdeki 12 saatte rüzgar dönüyor mu? (yeni yön en az 2 saat sürmeli, esinti olmalı)
  let donus = null;
  const ileri = saatler.slice(idx + 1, idx + 13);
  for (let i = 0; i < ileri.length - 1; i++) {
    const a = ruzgarAdi(ileri[i].yon), b = ruzgarAdi(ileri[i + 1].yon);
    if (a.ad !== r.ad && a.ad === b.ad && ileri[i].ruzgar >= 12) {
      donus = `${hhmm(ileri[i].t)} gibi ${a.yonelme} dönüyor.`;
      break;
    }
  }
  return { ...r, etiket, cumle, donus };
}
