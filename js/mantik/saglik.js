// Seçilen hassasiyetlere göre kısa notlar. Genel bilgilendirmedir, tıbbi tavsiye değildir.
import { lodosMu } from './ruzgar.js';
import { POLEN_AD, polenSeviye } from './kalite.js';
import { dakika, tarihOf, sureYaz } from '../zaman.js';

const r = Math.round;
const enCok = (dizi, alan) => Math.max(...dizi.map(x => x[alan] ?? -Infinity));
const enAz = (dizi, alan) => Math.min(...dizi.map(x => x[alan] ?? Infinity));
const ort = (dizi, alan) => dizi.reduce((t, x) => t + x[alan], 0) / dizi.length;

export const SAGLIK_NOTU = 'Genel bilgilendirmedir, tıbbi tavsiye değildir.';

export function saglikNotlari({ saatler, idx, gunler, ayar }) {
  const h = new Set(ayar.hassas);
  const var_ = (...k) => k.some(x => h.has(x));
  const yasli = ayar.yas === '65+';
  const solunum = var_('astim', 'koah', 'rinit', 'sinuzit', 'farenjit');

  const ileri = saatler.slice(idx, idx + 12);
  const dun = idx >= 24 ? saatler.slice(idx - 24, idx - 12) : null;
  const notlar = [];
  const ekle = (oncelik, metin) => notlar.push({ oncelik, metin });

  const hisAz = enAz(ileri, 'hissedilen'), hisCok = enCok(ileri, 'hissedilen');
  const sogukEsik = yasli ? 7 : 4, sicakEsik = yasli ? 30 : 33;

  // Hava kirliliği
  const pm25 = enCok(ileri, 'pm25'), pm10 = enCok(ileri, 'pm10'), ozon = enCok(ileri, 'ozon');
  const toz = enCok(ileri, 'toz'), aqi = enCok(ileri, 'aqi');
  if (pm25 >= 25 || pm10 >= 50) {
    // Zirve saati: bölümde gösterilen "şu an" değeriyle karışmasın
    const zirve = ileri.reduce((a, b) => ((b.pm25 ?? 0) > (a.pm25 ?? 0) ? b : a));
    const deger = `${zirve.t.slice(11, 16)} civarı PM2.5 ${r(pm25)}, PM10 ${r(pm10)} µg/m³`;
    if (var_('astim', 'koah')) ekle(1, `Partikül kirliliği yüksek (${deger}): dışarıda uzun efordan kaçın, ilacını yanında taşı.`);
    else if (solunum || var_('kalp', 'cocuk', 'hamile') || yasli) ekle(2, `Partikül kirliliği yüksek (${deger}): uzun süre dışarıda kalma.`);
  }
  if (aqi > 80) ekle(1, 'Hava kalitesi çok kötü; herkes için dışarıda ağır efor önerilmez.');
  if (ozon >= 120 && var_('astim', 'koah')) ekle(2, `Ozon ${r(ozon)} µg/m³'e çıkıyor; dış efor sabah saatlerinde daha uygun.`);
  if (toz >= 100) ekle(1, `Çöl tozu yoğun (${r(toz)} µg/m³): pencereleri kapalı tut, dışarıda maske işe yarar.`);
  else if (toz >= 50 && (solunum || var_('goz', 'kalp'))) ekle(2, `Havada çöl tozu var (${r(toz)} µg/m³); dışarıda maske takabilirsin.`);

  // Polen
  const polenler = Object.entries(POLEN_AD)
    .map(([k, ad]) => ({ ad, seviye: polenSeviye(Math.max(...ileri.map(x => x.polen?.[k] ?? 0))) }))
    .filter(p => p.seviye === 'orta' || p.seviye === 'yüksek');
  if (polenler.length && var_('rinit', 'astim', 'goz')) {
    ekle(1, `${polenler.map(p => `${p.ad} poleni ${p.seviye}`).join(', ')}: dışarıdan gelince yüzünü yıka, pencereyi öğlen açma.`);
  }

  // Soğuk
  if (hisAz <= sogukEsik) {
    if (var_('astim', 'koah')) ekle(2, 'Soğuk hava bronşları daraltabilir; atkıyla ağzını ve burnunu ört.');
    if (h.has('kalp')) ekle(2, 'Soğukta damarlar büzülür, tansiyon yükselebilir; sabah erken ağır efordan kaçın.');
    if (yasli && !h.has('kalp')) ekle(3, 'Soğuk günde sıkı giyin; dışarıda uzun beklemekten kaçın.');
    if (h.has('cocuk')) ekle(3, 'Çocukları kat kat giydir; baş, el ve ayaklar sıcak kalsın.');
  }
  if (h.has('dolasim') && hisAz <= 10) ekle(2, 'Soğuk el ve ayakları etkiler; eldiven ve kalın çorap al.');

  // Sıcak
  if (hisCok >= sicakEsik && (var_('kalp', 'hamile', 'cocuk', 'migren') || yasli)) {
    ekle(1, `Hissedilen ${r(hisCok)}°'ye çıkıyor; öğle saatlerinde gölgede kal, sık sık su iç.`);
  }

  // Nem
  const nemAz = enAz(ileri, 'nem'), simdi = saatler[idx];
  if (nemAz < 35) {
    // Tek notta birleştir: geniz/boğaz, cilt, göz
    const yerler = [], oneriler = [];
    if (var_('sinuzit', 'farenjit', 'rinit')) { yerler.push('geniz ve boğaz'); oneriler.push('bol su iç'); }
    if (h.has('cilt')) { yerler.push('cilt'); oneriler.push('nemlendirici sür'); }
    if (h.has('goz')) { yerler.push('gözler'); }
    if (yerler.length) ekle(3, `Hava kuru (nem %${r(nemAz)}): ${yerler.join(', ')} kuruyabilir${oneriler.length ? `; ${oneriler.join(', ')}` : ''}.`);
  }
  if (simdi.sicaklik <= 12 && simdi.nem >= 85) {
    if (h.has('eklem')) ekle(2, 'Nemli soğuk eklemleri sızlatabilir; dizlerini ve belini sıcak tut.');
    if (h.has('sinuzit')) ekle(3, 'Nemli soğuk geniz akıntısını artırabilir.');
  }

  // Ani değişim (dünün aynı saatleriyle)
  if (dun) {
    const fark = r(ort(ileri, 'hissedilen') - ort(dun, 'hissedilen'));
    if (Math.abs(fark) >= 7 && var_('sinuzit', 'farenjit', 'astim', 'kalp', 'migren')) {
      ekle(2, `Dünden ${Math.abs(fark)}° daha ${fark < 0 ? 'soğuk' : 'sıcak'}; ani değişim vücudu zorlayabilir.`);
    }
  }
  const basincGecmis = idx >= 24 ? saatler[idx].basinc - saatler[idx - 24].basinc : 0;
  const basincIleri = (ileri.at(-1)?.basinc ?? simdi.basinc) - simdi.basinc;
  const basinc = Math.abs(basincIleri) > Math.abs(basincGecmis) ? basincIleri : basincGecmis;
  if (Math.abs(basinc) >= 6) {
    const yon = basinc < 0 ? 'düşüyor' : 'yükseliyor';
    if (h.has('migren')) ekle(1, `Hava basıncı hızla ${yon} (${Math.abs(r(basinc))} hPa); baş ağrısı tetiklenebilir.`);
    if (h.has('eklem') && basinc < 0) ekle(2, 'Basınç düşüşü eklem ağrısı yapabilir.');
  }

  // Rüzgar
  if (h.has('migren') && ileri.some(s => lodosMu(s) && s.ruzgar >= 20)) ekle(2, 'Lodos esiyor; baş ağrısına yatkınsan bol su iç, ekran molası ver.');
  if (h.has('goz') && enCok(ileri, 'ruzgar') >= 30) ekle(3, 'Sert rüzgar gözü kurutur; gözlük takabilirsin.');

  // UV
  const uv = enCok(ileri, 'uv');
  if (uv >= 8) ekle(1, `UV ${r(uv)} (çok yüksek): 11:00–15:00 arası güneş koruyucu, şapka ve gözlük.`);
  else if (uv >= 6 && var_('cilt', 'goz', 'cocuk', 'hamile')) ekle(2, `UV ${r(uv)} (yüksek): öğle saatlerinde güneş koruyucu ve şapka.`);

  // Kısa gün
  const bugun = gunler.find(g => g.gun === tarihOf(simdi.t));
  if (h.has('ruhhali') && bugun) {
    const uzunluk = dakika(bugun.batis) - dakika(bugun.dogus);
    if (uzunluk < 630) {
      const kapali = ort(ileri, 'bulut') > 80;
      ekle(3, `Gün ${sureYaz(uzunluk)}; öğlen en az 20 dakika gün ışığına çık.${kapali ? ' Hava kapalı, ışığa daha çok ihtiyacın var.' : ''}`);
    }
  }

  return notlar.sort((a, b) => a.oncelik - b.oncelik).map(n => n.metin);
}
