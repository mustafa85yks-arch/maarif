// Güneş: Open-Meteo'nun gün doğumu/batımı. Ay: SunCalc (lib/suncalc.js, window.SunCalc).
import { TZ, tarihOf, hhmm, dakika, sureYaz } from '../zaman.js';

export function gunesBilgisi(gunler, simdi) {
  const i = gunler.findIndex(g => g.gun === tarihOf(simdi));
  const bugun = gunler[i], yarin = gunler[i + 1];
  const n = dakika(simdi);
  let ana, kisa;
  if (n < dakika(bugun.dogus)) {
    ana = `Güneş ${hhmm(bugun.dogus)} doğacak; ${sureYaz(dakika(bugun.dogus) - n)} var.`;
    kisa = `doğuş ${hhmm(bugun.dogus)}`;
  } else if (n < dakika(bugun.batis)) {
    const k = dakika(bugun.batis) - n;
    ana = `Gün batımına ${sureYaz(k)} kaldı.`;
    kisa = `batışa ${sureYaz(k)}`;
  } else {
    ana = `Güneş battı. Yarın doğuş ${hhmm(yarin.dogus)}.`;
    kisa = `doğuş ${hhmm(yarin.dogus)}`;
  }
  const uzunluk = g => dakika(g.batis) - dakika(g.dogus);
  const fark = yarin ? uzunluk(yarin) - uzunluk(bugun) : 0;
  const gun = `Gün uzunluğu ${sureYaz(uzunluk(bugun))}`
    + (fark ? `; yarın ${Math.abs(fark)} dk daha ${fark < 0 ? 'kısa' : 'uzun'}.` : '.');
  return { ana, kisa, gun, dogus: hhmm(bugun.dogus), batis: hhmm(bugun.batis) };
}

const EVRELER = [
  [0.03, 'Yeni ay'], [0.22, 'Büyüyen hilal'], [0.28, 'İlk dördün'], [0.47, 'Büyüyen şişkin ay'],
  [0.53, 'Dolunay'], [0.72, 'Küçülen şişkin ay'], [0.78, 'Son dördün'], [0.97, 'Küçülen hilal'], [1.01, 'Yeni ay'],
];

export function ayBilgisi(lat, lon, simdi = new Date()) {
  const { fraction, phase } = SunCalc.getMoonIllumination(simdi);
  const ad = EVRELER.find(([sinir]) => phase < sinir)[1];
  const gece = new Date(simdi); gece.setHours(0, 0, 0, 0);
  const z = SunCalc.getMoonTimes(gece, lat, lon);
  const saat = d => (d ? new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d) : null);

  // Sonraki dolunaya kaç gün?
  let dolunay = null;
  for (let g = 1; g <= 30; g++) {
    const once = SunCalc.getMoonIllumination(new Date(simdi.getTime() + (g - 1) * 864e5)).phase;
    const sonra = SunCalc.getMoonIllumination(new Date(simdi.getTime() + g * 864e5)).phase;
    if (once < 0.5 && sonra >= 0.5) { dolunay = g; break; }
  }
  return { ad, yuzde: Math.round(fraction * 100), fraction, phase, dogus: saat(z.rise), batis: saat(z.set), dolunay };
}

// Aydınlık kısmı çizilmiş ay: sağ yarım daire + terminatör elipsi; küçülen ayda aynalanır
export function aySvg(fraction, phase, boy = 52) {
  const r = 20, rx = Math.abs(1 - 2 * fraction) * r, yon = fraction < 0.5 ? 0 : 1;
  const yol = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx.toFixed(2)},${r} 0 0 ${yon} 0,${-r}Z`;
  const ayna = phase > 0.5 ? ' transform="scale(-1,1)"' : '';
  return `<svg class="ay" viewBox="-22 -22 44 44" width="${boy}" height="${boy}" aria-hidden="true">`
    + `<circle r="${r}" class="ay-karanlik"/><path d="${yol}"${ayna} class="ay-aydinlik"/></svg>`;
}
