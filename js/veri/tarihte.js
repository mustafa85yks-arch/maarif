// Tarihte bugün: Türkçe Vikipedi (api.wikimedia.org "onthisday" beslemesi, CORS açık).
// Önce Vikipedi editörlerinin ana sayfa için seçtiği 5 olay ("selected") kullanılır; uygun olay kalmazsa günün tüm olaylarına düşülür.
// Takvim yaprağına uymayan olaylar (ölüm, saldırı, savaş…) ayıklanır; en çok 3 olay, Türkiye'yle ilgili olan üstte.
// Gün başına bir kez çekilir, localStorage'da saklanır.
const ONBELLEK = 'maarif_tarihte_v2';
// Kelime başı gerekenler (öl-, esir, asıl-) ayrı: \b Türkçe harflerde çalışmaz; "kaza" "kazandı"yı elemesin
const KARANLIK = /(?:^|[\s"'(])(?:öl(?:dü|üm|en|dür|mesi)|esir|asıl(?:dı|arak))|idam|katliam|saldır|bomba|terör|suikast|intihar|darbe|savaş|harekât|cephe|işgal|patlama|deprem|kaza(?!n)|yangın|hayatını kaybet|kurşun|PKK|IŞİD|isyan|ayaklanma|soykırım|kıyım|yakılarak|tutukla|gözaltı|kuşatma|çatışma|çarpışma|yaralan|vefat|muharebe|ordu|asker|fethedil|ele geçir|ilhak|kurtulabil|düştü|düşmesi|denize uçtu|batt[ıi]|enkaz|hapis|hapse|mahkûm|ceza|nükleer|füze|silah|ambargo|kanser|virüs|pandemi|salgın|devir(?:di|ildi)|sıkıyönetim|Konseyi|Komitesi|Kenan Evren|görevden|toplatıl|kapatıl|soruşturma|dava|diploma|seçim|Başbakan|Devlet Başkanı|parti|Parti|Fırka|Antisemit|dini lider|Humeyni/i;
// Olumlu olaylar (açılış, kuruluş, keşif, ilkler) önce seçilir
const OLUMLU = /açıldı|açılış|kuruldu|başladı|(?:^|\s)ilk |yayımlan|keşf|bulundu|icat|tanıtıldı|sahnelendi|hizmete|fırlatıldı|kazandı|ödül|müze|temeli atıldı|gösterime|yayına/i;
const YEREL = /Türk|İstanbul|Osmanlı|Atatürk|Mustafa Kemal|Ankara|TBMM|İzmir|Boğaz/;
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const vikipediBaglantisi = gun => `https://tr.wikipedia.org/wiki/${+gun.slice(8, 10)}_${AYLAR[+gun.slice(5, 7) - 1]}`;

export function tarihteOku(gun) {
  try {
    const k = JSON.parse(localStorage.getItem(ONBELLEK));
    return k && k.gun === gun ? k.olaylar : null;
  } catch {
    return null;
  }
}

const denendi = new Set(); // aynı oturumda başarısız günü tekrar tekrar isteme

export async function tarihteGetir(gun) {
  if (denendi.has(gun)) return null;
  denendi.add(gun);
  const cek = async tur => {
    const r = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/tr/onthisday/${tur}/${gun.slice(5, 7)}/${gun.slice(8, 10)}`);
    if (!r.ok) throw new Error(`Vikipedi yanıtı: ${r.status}`);
    return ((await r.json())[tur] ?? [])
      .filter(e => e.year && e.text && !KARANLIK.test(e.text))
      .map(e => ({ yil: e.year, metin: e.text }));
  };
  // Olumlu olaylar öne, kendi içinde sıra korunur
  const oncelikli = d => [...d.filter(e => OLUMLU.test(e.metin)), ...d.filter(e => !OLUMLU.test(e.metin))];

  let secilen = [];
  try {
    const s = await cek('selected');
    const ataturk = e => /Atatürk|Mustafa Kemal/.test(e.metin);
    const yerel = s.filter(e => YEREL.test(e.metin)).sort((x, y) => ataturk(y) - ataturk(x)), dunya = oncelikli(s.filter(e => !YEREL.test(e.metin)));
    secilen = [...yerel, ...dunya].slice(0, 3);
  } catch { /* yedek yönteme düş */ }

  if (!secilen.length) {
    const olaylar = await cek('events');
    const sec = d => d.filter(e => OLUMLU.test(e.metin)).length ? d.filter(e => OLUMLU.test(e.metin)) : d;
    const yerel = sec(olaylar.filter(e => YEREL.test(e.metin))), dunya = sec(olaylar.filter(e => !YEREL.test(e.metin)));
    const g = +gun.replaceAll('-', '');
    secilen = [yerel[g % (yerel.length || 1)], dunya[(g >> 3) % (dunya.length || 1)]].filter(Boolean);
  }
  try { localStorage.setItem(ONBELLEK, JSON.stringify({ gun, olaylar: secilen })); } catch { /* yok say */ }
  return secilen;
}
