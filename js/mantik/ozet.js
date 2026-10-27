import { yagiyor, karliMi } from './gok.js';
import { ruzgarAdi } from './ruzgar.js';
import { saatOf, hhmm } from '../zaman.js';

function sicaklikSifati(h) {
  if (h <= 0) return 'Dondurucu';
  if (h <= 7) return 'Soğuk';
  if (h <= 14) return 'Serin';
  if (h <= 21) return 'Ilık';
  if (h <= 28) return 'Sıcak';
  return 'Çok sıcak';
}

export function zamanDilimi(t) {
  const s = saatOf(t);
  if (s >= 5 && s < 11) return 'sabah';
  if (s >= 11 && s < 14) return 'öğlen';
  if (s >= 14 && s < 17) return 'öğleden sonra';
  if (s >= 17 && s < 20) return 'akşamüstü';
  if (s >= 20) return 'akşam';
  return 'gece';
}

// Ana cümle (büyük yazılır) + ek cümleler (küçük)
export function ozetCumlesi(saatler, idx, gece) {
  const s = saatler[idx];
  const kalan = saatler.slice(idx, idx + 12);

  let gok;
  if (yagiyor(s)) gok = karliMi(s.kod) ? 'karlı' : 'yağmurlu';
  else if (s.kod === 45 || s.kod === 48) gok = 'sisli';
  else if (s.kod <= 1) gok = gece ? 'açık' : 'güneşli';
  else if (s.kod === 2) gok = 'parçalı bulutlu';
  else gok = 'kapalı';

  let ana = `${sicaklikSifati(s.hissedilen)} ve ${gok}`;
  if (yagiyor(s)) {
    // Dinme: art arda iki kuru saat
    const i = kalan.findIndex((x, j) => j > 0 && !yagiyor(x) && kalan[j + 1] && !yagiyor(kalan[j + 1]));
    ana += i > 0 ? `; ${zamanDilimi(kalan[i].t)} ${hhmm(kalan[i].t)} gibi diniyor` : '; kolay kolay dinmeyecek';
  } else {
    const i = kalan.findIndex((x, j) => j > 0 && yagiyor(x) && x.yagisOlasi >= 50);
    if (i > 0) ana += `; ${zamanDilimi(kalan[i].t)} ${hhmm(kalan[i].t)} gibi ${karliMi(kalan[i].kod) ? 'kar' : 'yağmur'} başlıyor`;
  }

  const ek = [];
  const hs = kalan.map(x => x.hissedilen);
  const enAz = Math.min(...hs), enCok = Math.max(...hs);
  if (enCok - enAz >= 8) ek.push(`Önümüzdeki saatlerde hissedilen ${Math.round(enAz)}° ile ${Math.round(enCok)}° arasında oynuyor.`);
  const enSert = kalan.reduce((a, b) => (b.ruzgar > a.ruzgar ? b : a));
  if (enSert.ruzgar >= 39) ek.push(`${ruzgarAdi(enSert.yon).ad} sert esiyor.`);

  return { ana: ana + '.', ek };
}
