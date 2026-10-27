// Open-Meteo: üç model (ECMWF, ICON, GFS), iki ilçe — tek istek.
// Ekranda gösterilen değer her saat için üç modelin ortancasıdır; tek modelin aşırı tahmini öne çıkmaz.
export const MODELLER = ['ecmwf_ifs025', 'icon_seamless', 'gfs_seamless'];
export const MODEL_ADI = { ecmwf_ifs025: 'ECMWF', icon_seamless: 'ICON', gfs_seamless: 'GFS' };

const SAATLIK = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'dew_point_2m',
  'precipitation_probability', 'precipitation', 'wind_speed_10m', 'wind_direction_10m',
  'wind_gusts_10m', 'pressure_msl', 'uv_index', 'weather_code', 'cloud_cover',
];
const ONBELLEK = 'maarif_hava_v2';
export const TAZELIK = 30 * 60 * 1000;

export async function havaGetir(konumlar, { zorla = false } = {}) {
  const anahtar = konumlar.map(k => k.ad).join('|');
  const kayit = onbellekOku();
  const ayniKonum = kayit && kayit.anahtar === anahtar;
  if (!zorla && ayniKonum && Date.now() - kayit.zaman < TAZELIK) return kayit;
  try {
    // Hava kalitesi alınamazsa tahmin yine gösterilir, sadece o bölüm boş kalır
    const [ham, kalite] = await Promise.all([tahminCek(konumlar), kaliteCek(konumlar).catch(() => null)]);
    const veri = {
      anahtar,
      zaman: Date.now(),
      konumlar: konumlar.map((k, i) => ({ ...k, ...birlestir(ham[i], kalite?.[i]) })),
    };
    onbellekYaz(veri);
    return veri;
  } catch (e) {
    // Bağlantı yoksa son alınan veriyi göster
    if (ayniKonum) return { ...kayit, eski: true };
    throw e;
  }
}

async function tahminCek(konumlar) {
  const p = new URLSearchParams({
    latitude: konumlar.map(k => k.lat).join(','),
    longitude: konumlar.map(k => k.lon).join(','),
    hourly: SAATLIK.join(','),
    daily: 'sunrise,sunset',
    models: MODELLER.join(','),
    timezone: 'Europe/Istanbul',
    past_days: '1', // dünle karşılaştırma: ani sıcaklık ve basınç değişimi
    forecast_days: '3',
  });
  return jsonCek(`https://api.open-meteo.com/v1/forecast?${p}`);
}

const KALITE = ['pm2_5', 'pm10', 'ozone', 'dust', 'uv_index', 'european_aqi', ...POLENLER()];
function POLENLER() { return ['alder', 'birch', 'grass', 'mugwort', 'olive', 'ragweed'].map(p => `${p}_pollen`); }

async function kaliteCek(konumlar) {
  const p = new URLSearchParams({
    latitude: konumlar.map(k => k.lat).join(','),
    longitude: konumlar.map(k => k.lon).join(','),
    hourly: KALITE.join(','),
    timezone: 'Europe/Istanbul',
    past_days: '1',
    forecast_days: '3',
  });
  return jsonCek(`https://air-quality-api.open-meteo.com/v1/air-quality?${p}`);
}

async function jsonCek(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Open-Meteo yanıtı: ${r.status}`);
  const j = await r.json();
  return Array.isArray(j) ? j : [j];
}

function birlestir(j, kj) {
  // Hava kalitesi saatleri zaman dizesiyle eşlenir
  const kh = kj?.hourly;
  const kIdx = new Map((kh?.time ?? []).map((t, i) => [t, i]));
  const h = j.hourly;
  const degerler = (v, i) => MODELLER.map(m => h[`${v}_${m}`]?.[i] ?? null);
  const saatler = h.time.map((t, i) => {
    const o = v => orta(degerler(v, i));
    const modeller = {};
    for (const m of MODELLER) {
      modeller[m] = {
        sicaklik: h[`temperature_2m_${m}`]?.[i] ?? null,
        yagis: h[`precipitation_${m}`]?.[i] ?? null,
        ruzgar: h[`wind_speed_10m_${m}`]?.[i] ?? null,
      };
    }
    return {
      t,
      sicaklik: o('temperature_2m'),
      hissedilen: o('apparent_temperature'),
      nem: o('relative_humidity_2m'),
      ciy: o('dew_point_2m'),
      yagisOlasi: o('precipitation_probability'),
      yagis: o('precipitation'),
      ruzgar: o('wind_speed_10m'),
      hamle: o('wind_gusts_10m'),
      basinc: o('pressure_msl'),
      bulut: o('cloud_cover'),
      yon: yonOrtasi(degerler('wind_direction_10m', i)),
      kod: kodSec(degerler('weather_code', i)),
      modeller,
      ...kaliteSaati(kh, kIdx.get(t), o('uv_index')),
    };
  });
  const d = j.daily;
  const gunAl = (v, i) => MODELLER.map(m => d[`${v}_${m}`]?.[i]).find(Boolean);
  const gunler = d.time.map((gun, i) => ({ gun, dogus: gunAl('sunrise', i), batis: gunAl('sunset', i) }));
  return { saatler, gunler };
}

function kaliteSaati(kh, i, uvGfs) {
  const al = v => (kh && i != null ? kh[v]?.[i] ?? null : null);
  const uvCams = al('uv_index');
  const polen = {};
  for (const p of POLENLER()) polen[p.replace('_pollen', '')] = al(p);
  return {
    // UV: hava modellerinden yalnızca GFS veriyor; CAMS da varsa yüksek olanı al
    uv: uvGfs == null ? uvCams : uvCams == null ? uvGfs : Math.max(uvGfs, uvCams),
    pm25: al('pm2_5'), pm10: al('pm10'), ozon: al('ozone'), toz: al('dust'), aqi: al('european_aqi'),
    polen,
  };
}

function orta(dizi) {
  const a = dizi.filter(x => x != null).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// Yönlerin ortalaması: 350° ile 10°'nin ortası 0° olmalı, 180° değil
function yonOrtasi(dizi) {
  const a = dizi.filter(x => x != null);
  if (!a.length) return null;
  const r = Math.PI / 180;
  const x = a.reduce((t, d) => t + Math.sin(d * r), 0);
  const y = a.reduce((t, d) => t + Math.cos(d * r), 0);
  return (Math.atan2(x, y) / r + 360) % 360;
}

// Hava kodu sayı değil kategori: iki model aynı kodu veriyorsa o, yoksa ortanca (eşitlikte ağır olan)
function kodSec(dizi) {
  const a = dizi.filter(x => x != null).sort((x, y) => x - y);
  if (!a.length) return null;
  for (const k of a) if (a.filter(x => x === k).length >= 2) return k;
  return a[a.length >> 1];
}

function onbellekOku() {
  try { return JSON.parse(localStorage.getItem(ONBELLEK)); } catch { return null; }
}
function onbellekYaz(v) {
  try { localStorage.setItem(ONBELLEK, JSON.stringify(v)); } catch { /* yer yoksa önbelleksiz devam */ }
}
