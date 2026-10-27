// İlçe adlarına Türkçe hal ekleri: Esenyurt'ta, Bayrampaşa'dan
const KALIN = 'aıou', UNLU = 'aıoueiöü', SERT = 'çfhkpsşt';

function sonUnlu(ad) {
  for (let i = ad.length - 1; i >= 0; i--) {
    const c = ad[i].toLocaleLowerCase('tr-TR');
    if (UNLU.includes(c)) return c;
  }
  return 'e';
}

export const bulunma = ad =>
  `${ad}'${SERT.includes(ad.at(-1).toLocaleLowerCase('tr-TR')) ? 't' : 'd'}${KALIN.includes(sonUnlu(ad)) ? 'a' : 'e'}`;

export const ayrilma = ad => bulunma(ad) + 'n';
