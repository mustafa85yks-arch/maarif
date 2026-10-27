// Hava kalitesi: Avrupa Hava Kalitesi Endeksi (EAQI) + CAMS polen ve toz
export const POLEN_AD = {
  alder: 'Kızılağaç', birch: 'Huş', grass: 'Çimen', mugwort: 'Pelin', olive: 'Zeytin', ragweed: 'Ambrosia',
};

export function aqiEtiket(a) {
  if (a == null) return '–';
  if (a <= 20) return 'iyi';
  if (a <= 40) return 'makul';
  if (a <= 60) return 'orta';
  if (a <= 80) return 'kötü';
  if (a <= 100) return 'çok kötü';
  return 'son derece kötü';
}

// Avrupa endeksi bantları (µg/m³)
const BANTLAR = { pm25: [10, 20, 25, 50, 75], pm10: [20, 40, 50, 100, 150], ozon: [50, 100, 130, 240, 380] };
const BANT_AD = ['iyi', 'makul', 'orta', 'kötü', 'çok kötü', 'son derece kötü'];
export function bant(alan, v) {
  if (v == null) return '–';
  const i = BANTLAR[alan].findIndex(s => v <= s);
  return BANT_AD[i < 0 ? BANT_AD.length - 1 : i];
}

export function uvEtiket(uv) {
  if (uv == null) return '–';
  if (uv < 3) return 'düşük';
  if (uv < 6) return 'orta';
  if (uv < 8) return 'yüksek';
  if (uv < 11) return 'çok yüksek';
  return 'aşırı';
}

// tane/m³ — basit üç kademe
export function polenSeviye(v) {
  if (v == null || v < 1) return null;
  if (v < 10) return 'düşük';
  if (v < 50) return 'orta';
  return 'yüksek';
}

const enCok = (dizi, alan) => dizi.reduce((a, b) => ((b[alan] ?? -1) > (a[alan] ?? -1) ? b : a));

export function kaliteOzeti(saatler, idx) {
  const s = saatler[idx];
  if (s.aqi == null) return null;
  const ileri = saatler.slice(idx, idx + 12);
  const polenler = Object.entries(POLEN_AD)
    .map(([k, ad]) => {
      const deger = Math.max(...ileri.map(x => x.polen?.[k] ?? 0));
      return { ad, deger, seviye: polenSeviye(deger) };
    })
    .filter(p => p.seviye);
  return {
    simdi: s,
    etiket: aqiEtiket(s.aqi),
    enKotu: enCok(ileri, 'aqi'),
    toz: enCok(ileri, 'toz'),
    uv: enCok(ileri, 'uv'),
    polenler,
  };
}
