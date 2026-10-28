// Kullanıcı ayarları yalnızca bu cihazın localStorage'ında durur, hiçbir yere gönderilmez.
const ANAHTAR = 'maarif_ayarlar_v1';

export const VARSAYILAN = {
  kurulum: false,
  semtler: ['Fatih'], // ilki ana ekranda büyük görünür; kurulumda değiştirilir
  yas: '',
  hassas: [],
  burc: '',
  takvim: true, // namaz vakitleri, Hicri/Rumi tarih, dini günler
};
export const EN_COK_SEMT = 6;

export const YASLAR = ['18–39', '40–64', '65+'];

export const HASSASIYETLER = [
  { grup: 'Solunum', secenekler: [['astim', 'Astım'], ['koah', 'KOAH'], ['rinit', 'Alerjik rinit'], ['sinuzit', 'Sinüzit / geniz akıntısı'], ['farenjit', 'Kronik farenjit']] },
  { grup: 'Kalp ve tansiyon', secenekler: [['kalp', 'Kalp ve tansiyon']] },
  { grup: 'Eklem ve kas', secenekler: [['eklem', 'Eklem ve kas ağrıları']] },
  { grup: 'Baş ağrısı', secenekler: [['migren', 'Baş ağrısı / migren']] },
  { grup: 'Cilt', secenekler: [['cilt', 'Hassas cilt']] },
  { grup: 'Göz', secenekler: [['goz', 'Göz kuruluğu / hassasiyet']] },
  { grup: 'Dolaşım', secenekler: [['dolasim', 'Soğukta el-ayak morarması (Raynaud)']] },
  { grup: 'Ruh hali', secenekler: [['ruhhali', 'Kışın moral düşüklüğü']] },
  { grup: 'Hassas gruplar', secenekler: [['cocuk', 'Evde bebek / çocuk var'], ['hamile', 'Hamilelik']] },
];

export const BURCLAR = [
  ['koc', 'Koç', 'ates'], ['boga', 'Boğa', 'toprak'], ['ikizler', 'İkizler', 'hava'], ['yengec', 'Yengeç', 'su'],
  ['aslan', 'Aslan', 'ates'], ['basak', 'Başak', 'toprak'], ['terazi', 'Terazi', 'hava'], ['akrep', 'Akrep', 'su'],
  ['yay', 'Yay', 'ates'], ['oglak', 'Oğlak', 'toprak'], ['kova', 'Kova', 'hava'], ['balik', 'Balık', 'su'],
];

export function ayarlariOku() {
  try {
    const kayit = JSON.parse(localStorage.getItem(ANAHTAR) || '{}');
    // Eski ev/iş ayarını semt listesine çevir
    if (!kayit.semtler && kayit.ev) kayit.semtler = [kayit.ev, kayit.is].filter(Boolean);
    for (const eski of ['ev', 'is', 'sabah', 'aksam', 'sure']) delete kayit[eski];
    return { ...VARSAYILAN, ...kayit };
  } catch {
    return { ...VARSAYILAN };
  }
}

export function ayarlariYaz(ayar) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(ayar));
  } catch { /* gizli sekme vb. — ayar bu oturumla sınırlı kalır */ }
}

// Ayarları ve önbelleğe alınmış hava verisini siler
export function hepsiniSil() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith('maarif_')).forEach(k => localStorage.removeItem(k));
  } catch { /* yok say */ }
}
