// Nem: bağıl nem tek başına yanıltır; çiy noktası + sıcaklık birlikte okunur.
export function nemYorumu(s) {
  const T = s.sicaklik, ciy = s.ciy, nem = s.nem;
  let cumle;
  if (nem < 30) cumle = 'Hava çok kuru; boğazı ve cildi kurutur, bol su iç.';
  else if (T <= 12 && nem >= 80) cumle = 'Soğuk ve nemli; bu soğuk kemiğe işler.';
  else if (T >= 25 && ciy >= 20) cumle = 'Sıcak ve çok nemli; bunaltıcı, ter kurumaz.';
  else if (T >= 22 && ciy >= 17) cumle = 'Nem hissediliyor; hava biraz yapış yapış.';
  else if (nem < 40) cumle = 'Hava kuruca; dudak ve boğaz kuruyabilir.';
  else cumle = 'Nem dengeli; rahatsız etmez.';

  const fark = Math.round(s.hissedilen - T);
  let hiss;
  if (fark <= -2) {
    hiss = `Hissedilen ${Math.round(s.hissedilen)}°, termometreden ${-fark}° daha soğuk: `
      + (s.ruzgar >= 10 ? 'rüzgar vücut ısısını üstünden alıp götürüyor.' : 'nemli hava ısıyı vücuttan çekiyor.');
  } else if (fark >= 2) {
    hiss = `Hissedilen ${Math.round(s.hissedilen)}°, termometreden ${fark}° daha sıcak: `
      + (ciy >= 16 ? 'nem terin buharlaşmasını engelliyor.' : 'güneş ve durgun hava ısıtıyor.');
  } else {
    hiss = 'Hissedilen sıcaklık termometreyle hemen hemen aynı.';
  }
  return { cumle, hiss };
}

export const CIY_ACIKLAMA = 'Çiy noktası, havadaki nemin su damlasına dönüştüğü sıcaklıktır. '
  + 'Sıcaklığa ne kadar yakınsa hava o kadar nemli hissettirir: 16°\'nin üstü bunaltır, 5°\'nin altı kurudur.';
