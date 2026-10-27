// WMO hava kodları → Türkçe ad + tek renkli işaret (︎: emoji değil yazı karakteri olarak çiz)
const KODLAR = {
  0: ['Açık', '☀'], 1: ['Az bulutlu', '☀'], 2: ['Parçalı bulutlu', '⛅'], 3: ['Kapalı', '☁'],
  45: ['Sisli', '≡'], 48: ['Kırağılı sis', '≡'],
  51: ['Hafif çisenti', '☂'], 53: ['Çisenti', '☂'], 55: ['Yoğun çisenti', '☂'],
  56: ['Dondurucu çisenti', '☂'], 57: ['Dondurucu çisenti', '☂'],
  61: ['Hafif yağmur', '☂'], 63: ['Yağmur', '☂'], 65: ['Kuvvetli yağmur', '☂'],
  66: ['Dondurucu yağmur', '☂'], 67: ['Dondurucu yağmur', '☂'],
  71: ['Hafif kar', '❄'], 73: ['Kar', '❄'], 75: ['Yoğun kar', '❄'], 77: ['Kar taneleri', '❄'],
  80: ['Hafif sağanak', '☂'], 81: ['Sağanak', '☂'], 82: ['Şiddetli sağanak', '☂'],
  85: ['Kar sağanağı', '❄'], 86: ['Yoğun kar sağanağı', '❄'],
  95: ['Gök gürültülü sağanak', 'ϟ'], 96: ['Dolulu fırtına', 'ϟ'], 99: ['Dolulu fırtına', 'ϟ'],
};

export function kodBilgi(kod, gece = false) {
  let [ad, isaret] = KODLAR[kod] ?? ['—', '·'];
  if (gece && kod <= 2) isaret = '☾';
  return { ad, isaret: isaret + '︎' };
}

export const yagisliMi = kod => kod >= 51;
export const karliMi = kod => (kod >= 71 && kod <= 77) || kod === 85 || kod === 86;
export const yagiyor = s => s.yagis >= 0.2 && yagisliMi(s.kod);

export function geceMi(t, gunler) {
  const g = gunler.find(x => x.gun === t.slice(0, 10));
  return g ? t < g.dogus || t > g.batis : false;
}
export const yagacakMi = s => yagiyor(s) || (s.yagisOlasi >= 50 && s.yagis >= 0.2);
