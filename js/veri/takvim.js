// Dini günler: Diyanet İşleri Başkanlığı 2026–2027 dinî günler takvimi (haberlerden derlendi, 27 Eki 2026).
// Liste 2027 sonuna kadar. Her yıl Diyanet yeni takvimi yayımlayınca elle eklenmeli.
// Kandil tarihleri Diyanet'teki gibi: o günün akşamı kandil gecesidir.
const DINI = [
  ['2026-12-10', 'Üç ayların başlangıcı', 'dini'],
  ['2026-12-10', 'Regaip Kandili', 'kandil'],
  ['2027-01-04', 'Miraç Kandili', 'kandil'],
  ['2027-01-22', 'Berat Kandili', 'kandil'],
  ['2027-02-08', 'Ramazan başlangıcı', 'ramazan'],
  ['2027-03-05', 'Kadir Gecesi', 'kandil'],
  ['2027-03-08', 'Ramazan Bayramı arefesi', 'arefe'],
  ['2027-03-09', 'Ramazan Bayramı 1. gün', 'bayram'],
  ['2027-03-10', 'Ramazan Bayramı 2. gün', 'bayram'],
  ['2027-03-11', 'Ramazan Bayramı 3. gün', 'bayram'],
  ['2027-05-15', 'Kurban Bayramı arefesi', 'arefe'],
  ['2027-05-16', 'Kurban Bayramı 1. gün', 'bayram'],
  ['2027-05-17', 'Kurban Bayramı 2. gün', 'bayram'],
  ['2027-05-18', 'Kurban Bayramı 3. gün', 'bayram'],
  ['2027-05-19', 'Kurban Bayramı 4. gün', 'bayram'],
  ['2027-06-06', 'Hicri yılbaşı', 'dini'],
  ['2027-06-15', 'Aşure Günü', 'dini'],
  ['2027-08-13', 'Mevlid Kandili', 'kandil'],
  ['2027-11-29', 'Üç ayların başlangıcı', 'dini'],
  ['2027-12-02', 'Regaip Kandili', 'kandil'],
  ['2027-12-24', 'Miraç Kandili', 'kandil'],
];
export const DINI_LISTE_SONU = '2027-12-31';

// Ramazan 1448: 1 Ramazan → arefe (29 Ramazan)
export const RAMAZAN = { bas: '2027-02-08', son: '2027-03-08' };

// Her yıl aynı olan resmi tatiller (2429 sayılı kanun)
const RESMI = [
  ['01-01', 'Yılbaşı', 'resmi'],
  ['04-23', 'Ulusal Egemenlik ve Çocuk Bayramı', 'resmi'],
  ['05-01', 'Emek ve Dayanışma Günü', 'resmi'],
  ['05-19', 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', 'resmi'],
  ['07-15', 'Demokrasi ve Millî Birlik Günü', 'resmi'],
  ['08-30', 'Zafer Bayramı', 'resmi'],
  ['10-28', 'Cumhuriyet Bayramı arifesi', 'arefe'],
  ['10-29', 'Cumhuriyet Bayramı', 'resmi'],
];

// tatil: true tam gün, 'yarim' 13:00'ten sonra, false iş günü
const TATIL = { resmi: true, bayram: true, arefe: 'yarim', kandil: false, dini: false, ramazan: false };

export function ozelGunler(gun) {
  const yil = gun.slice(0, 4);
  const hepsi = [
    ...RESMI.map(([g, ad, tur]) => [`${yil}-${g}`, ad, tur]),
    ...DINI,
  ];
  return hepsi.filter(([g]) => g === gun).map(([, ad, tur]) => ({ ad, tur, tatil: TATIL[tur] }));
}

// Bugünden sonraki ilk n özel gün (bayramların 2.–4. günleri tekrar sayılmaz)
export function yaklasanlar(gun, n = 4) {
  const yil = +gun.slice(0, 4);
  const hepsi = [
    ...[yil, yil + 1].flatMap(y => RESMI.map(([g, ad, tur]) => [`${y}-${g}`, ad, tur])),
    ...DINI,
  ]
    .filter(([g, ad]) => g > gun && !/ [2-4]\. gün$/.test(ad))
    .sort((a, b) => a[0].localeCompare(b[0]));
  return hepsi.slice(0, n).map(([g, ad, tur]) => ({ gun: g, ad, tur, tatil: TATIL[tur] }));
}

// ---- Hicri tarih ----
const HICRI_AY = ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir',
  'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'];

// Diyanet'in bilinen ay başları [miladi, ay no (1–12), hicri yıl]. Tarayıcının Ümmülkurâ takvimi
// Diyanet'le çoğu zaman tutuyor ama 10 Kas 2026'da bir gün sapıyor; bilinen aylar buradan gelir.
const AY_BASLARI = [
  ['2026-10-12', 5, 1448], ['2026-11-10', 6, 1448], ['2026-12-10', 7, 1448], ['2027-01-09', 8, 1448],
  ['2027-02-08', 9, 1448], ['2027-03-09', 10, 1448], ['2027-05-07', 12, 1448], ['2027-06-06', 1, 1449],
  ['2027-08-03', 3, 1449], ['2027-11-29', 7, 1449],
];
const gunFarki = (a, b) => (Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 864e5;

export function hicriTarih(gun) {
  const i = AY_BASLARI.findLastIndex(([g]) => g <= gun);
  if (i >= 0) {
    const [bas, ay, yil] = AY_BASLARI[i];
    const sonraki = AY_BASLARI[i + 1];
    const fark = gunFarki(bas, gun);
    // Sonraki bilinen başlangıç bir sonraki aysa ya da 29. günü geçmediysek kesin
    const ardisik = sonraki && sonraki[1] === (ay % 12) + 1;
    if (ardisik || fark < 29) return `${fark + 1} ${HICRI_AY[ay - 1]} ${yil}`;
  }
  try {
    const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
      .formatToParts(new Date(`${gun}T12:00Z`));
    const al = t => parseInt(p.find(x => x.type === t).value, 10);
    return `${al('day')} ${HICRI_AY[al('month') - 1]} ${al('year')}`;
  } catch {
    return '';
  }
}

// ---- Rumi tarih: Jülyen takvimi, mali yıl 1 Mart'ta başlar, yıl = miladi − 584 ----
const RUMI_AY = ['Kânunusani', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos',
  'Eylül', 'Teşrinievvel', 'Teşrinisani', 'Kânunuevvel'];

export function rumiTarih(gun) {
  // 1900–2099 arasında Jülyen takvimi 13 gün geride
  const d = new Date(Date.UTC(+gun.slice(0, 4), +gun.slice(5, 7) - 1, +gun.slice(8, 10)) - 13 * 864e5);
  const ay = d.getUTCMonth();
  const yil = d.getUTCFullYear() - (ay >= 2 ? 584 : 585);
  return `${d.getUTCDate()} ${RUMI_AY[ay]} ${yil}`;
}
