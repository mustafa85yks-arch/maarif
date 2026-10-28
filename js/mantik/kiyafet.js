import { saatOf, hhmm, tarihOf, dakika, dakikadan } from '../zaman.js';
import { karliMi, yagacakMi } from './gok.js';
import { bulunma } from '../dil.js';

// Esas alınan hissedilen sıcaklığa göre ana kıyafet
const KATMAN = [
  [26, 'ince tişört, açık renk ve keten'],
  [21, 'tişört ya da ince gömlek'],
  [16, 'uzun kollu üst ve ince ceket'],
  [11, 'kazak ya da sweatshirt, üstüne mevsimlik ceket'],
  [6, 'kalın kazak ve mont'],
  [1, 'kalın mont, atkı ve bere'],
  [-99, 'kalın mont, atkı, bere, eldiven; altına içlik'],
];

// Durak, iskele, servis beklemesi payı: hissedilenden 2 derece soğukmuş gibi giyin
const BEKLEME_PAYI = -2;

const r = Math.round;
const buyukHarf = s => s[0].toLocaleUpperCase('tr-TR') + s.slice(1);
const liste = a => (a.length > 1 ? `${a.slice(0, -1).join(', ')} ve ${a.at(-1)}` : a[0]);

// Hangi gün için giyinilecek: akşam 20'den sonra yarın, yoksa bugünün kalan gündüzü (07–21)
export function gunduzPenceresi(simdiT) {
  const yarin = saatOf(simdiT) >= 20;
  const gun = yarin ? tarihOf(dakikadan(dakika(simdiT) + 1440)) : tarihOf(simdiT);
  const bas = yarin || saatOf(simdiT) < 7 ? `${gun}T07:00` : simdiT.slice(0, 13) + ':00';
  return { gun: yarin ? 'Yarın' : 'Bugün', bas, son: `${gun}T21:00` };
}

export function kiyafetOnerisi({ konumlar, idx }) {
  const p = gunduzPenceresi(konumlar[0].saatler[idx].t);
  const pencere = k => k.saatler.filter(s => s.t >= p.bas && s.t <= p.son).map(s => ({ ...s, yer: k.ad }));
  const semtSaatleri = konumlar.map(pencere);
  const hepsi = semtSaatleri.flat();
  if (!hepsi.length) return { gun: p.gun, satir: '', detay: [] };

  const enSoguk = hepsi.reduce((a, b) => (b.hissedilen < a.hissedilen ? b : a));
  const enSicak = hepsi.reduce((a, b) => (b.hissedilen > a.hissedilen ? b : a));
  const esas = enSoguk.hissedilen + BEKLEME_PAYI;
  const ana = KATMAN.find(([esik]) => esas >= esik)[1];
  const cok = konumlar.length > 1;
  const nerede = s => (cok ? `${bulunma(s.yer)} ` : '');

  const ekler = [];
  const yagan = hepsi.filter(yagacakMi);
  const sert = Math.max(...hepsi.map(s => s.ruzgar));
  if (hepsi.some(s => karliMi(s.kod) && s.yagis >= 0.2)) ekler.push('kaymayan bot');
  else if (yagan.length) ekler.push(sert >= 30 ? 'kapüşonlu yağmurluk (rüzgarda şemsiye dayanmaz)' : 'şemsiye');
  else if (Math.max(...hepsi.map(s => s.yagisOlasi)) >= 30) ekler.push('çantada küçük şemsiye');
  const toplamYagis = hepsi.reduce((t, s) => t + (s.yagis || 0), 0) / konumlar.length;
  if (toplamYagis >= 5 && !ekler.includes('kaymayan bot')) ekler.push('su geçirmez ayakkabı');
  if (sert >= 30 && esas <= 15 && !yagan.length) ekler.push('rüzgar kesen dış katman');
  if (Math.max(...hepsi.map(s => s.uv || 0)) >= 6) ekler.push('güneş gözlüğü ve şapka');

  const detay = [];
  if (enSicak.hissedilen - enSoguk.hissedilen >= 8) {
    detay.push(`Katmanlı giyin: ${hhmm(enSoguk.t)} ${nerede(enSoguk)}hissedilen ${r(enSoguk.hissedilen)}°, `
      + `${hhmm(enSicak.t)} ${nerede(enSicak)}${r(enSicak.hissedilen)}°.`);
  }

  if (cok) {
    // Semtlerin gündüz ortalaması: en soğuk ve en sıcak arasında belirgin fark var mı?
    const ort = semtSaatleri.map((a, i) => ({ ad: konumlar[i].ad, his: a.reduce((t, s) => t + s.hissedilen, 0) / (a.length || 1) }));
    const soguk = ort.reduce((a, b) => (b.his < a.his ? b : a)), sicak = ort.reduce((a, b) => (b.his > a.his ? b : a));
    if (sicak.his - soguk.his >= 2) detay.push(`${soguk.ad} en soğuk, ${sicak.ad} en sıcak semt (${r(sicak.his - soguk.his)}° fark).`);
    const yaganSemt = konumlar.filter((k, i) => semtSaatleri[i].some(yagacakMi)).map(k => bulunma(k.ad));
    const kuruSemt = konumlar.filter((k, i) => !semtSaatleri[i].some(yagacakMi)).map(k => k.ad);
    if (yaganSemt.length && kuruSemt.length === 1 && konumlar.length >= 3) detay.push(`${kuruSemt[0]} dışında her semtte yağış bekleniyor.`);
    else if (yaganSemt.length && kuruSemt.length) detay.push(`Yağış sadece ${liste(yaganSemt)} bekleniyor.`);
  }

  return {
    gun: p.gun,
    satir: buyukHarf(ana) + (ekler.length ? ` · ${ekler.join(', ')}` : ''),
    detay,
  };
}
