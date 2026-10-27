// Ramazan'da en üstte duran imsak/iftar geri sayımı
import { RAMAZAN } from '../veri/takvim.js';
import { vakitler, yarinOf } from './namaz.js';
import { dakika, sureYaz, hhmm } from '../zaman.js';
import { yagacakMi, karliMi, kodBilgi } from './gok.js';

const r = Math.round;
export const ramazandaMi = gun => gun >= RAMAZAN.bas && gun <= RAMAZAN.son;

function iftarHavasi(saatler, t) {
  const s = saatler.find(x => x.t.slice(0, 13) === t.slice(0, 13));
  if (!s) return '';
  if (karliMi(s.kod) && s.yagis >= 0.2) return `İftarda kar var, ${r(s.sicaklik)}°.`;
  if (yagacakMi(s)) return `İftarda yağmur var (%${r(s.yagisOlasi)}); iftara giderken şemsiye al.`;
  if (s.ruzgar >= 39) return `İftarda rüzgar sert, ${r(s.sicaklik)}°.`;
  return `İftarda hava ${r(s.sicaklik)}°, ${kodBilgi(s.kod, true).ad.toLocaleLowerCase('tr-TR')}.`;
}

export function ramazanDurumu(konum, simdi, saatler) {
  const gun = simdi.slice(0, 10), yarin = yarinOf(gun);
  const v = vakitler(konum, gun);
  const imsak = v[0].t, aksam = v[4].t;
  const kalan = t => sureYaz(dakika(t) - dakika(simdi));

  if (ramazandaMi(gun)) {
    if (simdi < imsak) return { baslik: 'İmsaka', saat: hhmm(imsak), kalan: kalan(imsak), not: 'Sahur vakti.' };
    if (simdi < aksam) return { baslik: 'İftara', saat: hhmm(aksam), kalan: kalan(aksam), not: iftarHavasi(saatler, aksam) };
    if (ramazandaMi(yarin)) {
      const ertesi = vakitler(konum, yarin)[0].t;
      return { baslik: 'İmsaka', saat: hhmm(ertesi), kalan: kalan(ertesi), not: 'Sahura kalkmayı unutma.' };
    }
    return { baslik: 'Ramazan bitti', not: 'Yarın Ramazan Bayramı. Bayramın mübarek olsun.' };
  }
  if (ramazandaMi(yarin)) {
    const ilk = vakitler(konum, yarin)[0].t;
    return { baslik: 'Yarın Ramazan', saat: hhmm(ilk), kalan: kalan(ilk), not: `İlk sahur bu gece; imsak ${hhmm(ilk)}.` };
  }
  return null;
}
