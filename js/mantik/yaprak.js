// Takvim yaprağının arka yüzü: günün havası, burç, söz, yemek. Seçimler günün tarihine göre sabittir;
// sayfa yenilense de gün içinde aynı cümle kalır.
import { GUNUN_HAVASI, BURC_METIN, ELEMENT_AD, GUN_TARIFI, SOZLER, YEMEKLER, MEVSIM_BALIGI } from '../veri/yaprak_metin.js';
import { BURCLAR } from '../ayarlar.js';
import { yagacakMi, karliMi } from './gok.js';
import { lodosMu, ruzgarAdi } from './ruzgar.js';
import { ramazandaMi } from './ramazan.js';

// Tarih + tuz → tekrarlanabilir sayı
function tohum(gun, tuz) {
  let h = 2166136261;
  for (const c of gun + tuz) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
const sec = (dizi, gun, tuz) => dizi[tohum(gun, tuz) % dizi.length];

// Bugünün gündüzü (07–21), geçmiş saatler dahil: yaprak bütün günü anlatır
export function gunOzeti(saatler, gun) {
  const g = saatler.filter(s => s.t >= `${gun}T07:00` && s.t <= `${gun}T21:00`);
  const his = g.map(s => s.hissedilen);
  return {
    hisMax: Math.max(...his),
    hisMin: Math.min(...his),
    karli: g.some(s => karliMi(s.kod) && s.yagis >= 0.2),
    yagisli: g.some(yagacakMi),
    toplamYagis: g.reduce((t, s) => t + (s.yagis || 0), 0),
    ruzgarMax: Math.max(...g.map(s => s.ruzgar)),
    lodos: g.some(s => lodosMu(s) && s.ruzgar >= 20),
    poyraz: g.some(s => ruzgarAdi(s.yon).ad === 'Poyraz' && s.ruzgar >= 25),
    gunesli: g.filter(s => s.kod <= 1).length >= g.length / 2,
    sisli: g.some(s => s.kod === 45 || s.kod === 48),
    ay: +gun.slice(5, 7),
    haftaGunu: new Date(`${gun}T12:00Z`).getUTCDay(), // 0 pazar
  };
}

export function gununHavasi(o, gun, ozel) {
  const H = GUNUN_HAVASI;
  let grup;
  if (ozel.some(x => x.ad === 'Cumhuriyet Bayramı')) grup = H.cumhuriyet;
  else if (ozel.some(x => x.tur === 'bayram')) grup = H.bayram;
  else if (ozel.some(x => x.tur === 'kandil')) grup = H.kandil;
  else if (o.karli) grup = H.kar;
  else if (o.lodos) grup = H.lodos;
  else if (o.toplamYagis >= 10) grup = H.saganak;
  else if (o.yagisli) grup = H.yagmur;
  else if (o.sisli) grup = H.sis;
  else if (o.poyraz) grup = H.poyraz;
  else if (o.hisMax >= 30) grup = H.sicak;
  else if (o.hisMin <= 3) grup = H.soguk;
  else if (o.gunesli && o.hisMax >= 16 && o.hisMax <= 27) {
    if (o.ay >= 3 && o.ay <= 5) grup = H.bahar;
    else grup = o.haftaGunu === 0 || o.haftaGunu === 6 ? H.haftasonuGuzel : H.haftaiciGuzel;
  } else if (o.haftaGunu === 1) grup = H.pazartesi;
  else if (o.haftaGunu === 5) grup = H.cuma;
  else grup = H.varsayilan;
  return sec(grup, gun, 'hava');
}

export function gunElementi(o) {
  if (o.yagisli || o.karli) return 'su';
  if (o.ruzgarMax >= 25) return 'hava';
  if (o.gunesli) return 'ates';
  return 'toprak';
}

export function burcSatiri(o, gun, burcId) {
  const b = BURCLAR.find(([id]) => id === burcId);
  if (!b) return null;
  const [, ad, element] = b;
  const gunEl = gunElementi(o);
  return {
    baslik: `${ad} · ${ELEMENT_AD[element]} burcu · bugün hava ${GUN_TARIFI[gunEl]}`,
    metin: sec(BURC_METIN[element][gunEl], gun, 'burc' + burcId),
  };
}

export function gununSozu(o, gun) {
  let grup;
  if (o.lodos || o.poyraz || o.ruzgarMax >= 30) grup = SOZLER.ruzgar;
  else if (o.karli) grup = SOZLER.kis;
  else if (o.yagisli) grup = SOZLER.yagmur;
  else if (o.hisMax >= 28) grup = SOZLER.sicak;
  else if (o.hisMin <= 5) grup = SOZLER.soguk;
  else if (o.ay >= 3 && o.ay <= 5) grup = SOZLER.bahar;
  else if (o.ay >= 9 && o.ay <= 11) grup = SOZLER.guz;
  else grup = SOZLER.genel;
  return sec(grup, gun, 'soz');
}

export function yemekOnerisi(o, gun) {
  const Y = YEMEKLER;
  const balik = MEVSIM_BALIGI[o.ay];
  let grup;
  if (ramazandaMi(gun)) grup = Y.ramazan;
  else if (o.karli || o.hisMin <= 5) grup = Y.soguk;
  else if (o.lodos) grup = Y.lodos;
  else if (o.yagisli) grup = (o.ay >= 10 || o.ay <= 2) ? [...Y.yagmur, ...Y.kestane] : Y.yagmur;
  else if (o.hisMax >= 28) grup = Y.sicak;
  else if (o.gunesli && o.ay >= 3 && o.ay <= 5) grup = [...Y.bahar, ...Y.guzel];
  else if (o.gunesli) grup = Y.guzel;
  else grup = Y.varsayilan;
  return sec(grup, gun, 'yemek').replace('{balik}', balik);
}
