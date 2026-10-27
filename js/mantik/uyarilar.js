import { lodosMu } from './ruzgar.js';
import { karliMi } from './gok.js';
import { hhmm, saatOf } from '../zaman.js';

// Önümüzdeki 18 saat için hava uyarıları. Sağlık uyarıları 2. aşamada ayrı gelecek.
export function uyarilar(saatler, idx) {
  const ileri = saatler.slice(idx, idx + 18);
  const enCok = (dizi, alan) => Math.round(Math.max(...dizi.map(x => x[alan])));
  const u = [];

  const lodos = ileri.filter(s => lodosMu(s) && (s.ruzgar >= 30 || s.hamle >= 50));
  if (lodos.length) {
    u.push({
      baslik: 'Lodos',
      metin: `${hhmm(lodos[0].t)} sonrası hamleler ${enCok(lodos, 'hamle')} km/s'e çıkıyor. `
        + 'Vapur seferleri aksayabilir; çatı, tabela ve ağaç altından uzak dur.',
    });
  }

  const firtina = ileri.filter(s => !lodosMu(s) && s.hamle >= 70);
  if (firtina.length) {
    u.push({ baslik: 'Fırtına', metin: `${hhmm(firtina[0].t)} sonrası hamleler ${enCok(firtina, 'hamle')} km/s'e ulaşıyor.` });
  }

  const toplam = ileri.slice(0, 12).reduce((t, s) => t + (s.yagis || 0), 0);
  const siddetli = ileri.find(s => s.yagis >= 7);
  if (siddetli || toplam >= 20) {
    const ilk = siddetli ?? ileri.find(s => s.yagis >= 2);
    u.push({
      baslik: 'Kuvvetli yağış',
      metin: `${hhmm(ilk.t)} civarı yoğunlaşıyor (12 saatte ~${Math.round(toplam)} mm). Alt geçitlerde su birikebilir.`,
    });
  }

  const kar = ileri.find(s => karliMi(s.kod) && s.yagis >= 0.2);
  if (kar) u.push({ baslik: 'Kar', metin: `${hhmm(kar.t)} gibi kar bekleniyor; yollarda kayganlık olabilir.` });

  const gok = ileri.find(s => s.kod >= 95);
  if (gok) u.push({ baslik: 'Gök gürültüsü', metin: `${hhmm(gok.t)} civarı gök gürültülü sağanak ihtimali var.` });

  const don = ileri.find(s => s.sicaklik <= 0);
  if (don) u.push({ baslik: 'Buzlanma', metin: `${hhmm(don.t)} gibi sıcaklık sıfırın altına iniyor; zemin buz tutabilir.` });

  const sicak = ileri.filter(s => s.hissedilen >= 35);
  if (sicak.length) u.push({ baslik: 'Aşırı sıcak', metin: `Hissedilen ${enCok(sicak, 'hissedilen')}°'ye çıkıyor; öğle güneşinden kaçın, su iç.` });

  const sis = ileri.find(s => (s.kod === 45 || s.kod === 48) && saatOf(s.t) >= 5 && saatOf(s.t) <= 10);
  if (sis) u.push({ baslik: 'Sis', metin: `Sabah ${hhmm(sis.t)} civarı sis var; görüş düşük olabilir.` });

  return u;
}
