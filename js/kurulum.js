import { ILCELER } from './veri/ilceler.js';
import { ULASIM, YASLAR, HASSASIYETLER, BURCLAR, EN_COK_SEMT, ayarlariYaz, hepsiniSil } from './ayarlar.js';

const GIZLILIK = 'Bu bilgiler yalnızca bu telefonda saklanır, hiçbir yere gönderilmez. '
  + 'Hava verisi sadece ilçe merkezinin koordinatıyla istenir.';

const secenek = (deger, ad, secili) => `<option value="${deger}"${secili ? ' selected' : ''}>${ad}</option>`;
const radyo = (ad, deger, baslik, not, secili) => `
  <label class="secim"><input type="radio" name="${ad}" value="${deger}"${secili ? ' checked' : ''}>
    <span><b>${baslik}</b>${not ? `<small>${not}</small>` : ''}</span></label>`;

const ADIMLAR = [
  {
    baslik: 'Semtlerin',
    html: t => `
      <p class="gizlilik">${GIZLILIK}</p>
      <p class="soru">Havasını görmek istediğin semtleri ekle (en çok ${EN_COK_SEMT}). İlki ana ekranda büyük görünür.</p>
      <ol class="semt-liste">
        ${t.semtler.map((ad, i) => `<li><span>${ad}</span><span class="semt-dugmeler">
          <button type="button" data-islem="yukari" data-i="${i}" aria-label="${ad} yukarı"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" data-islem="asagi" data-i="${i}" aria-label="${ad} aşağı"${i === t.semtler.length - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" data-islem="cikar" data-i="${i}" aria-label="${ad} çıkar">✕</button>
        </span></li>`).join('')}
      </ol>
      ${t.semtler.length < EN_COK_SEMT
        ? `<label class="alan">Semt ekle
            <select name="yeniSemt">${secenek('', 'Seç…', true)}${ILCELER.filter(i => !t.semtler.includes(i.ad)).map(i => secenek(i.ad, i.ad, false)).join('')}</select></label>`
        : `<p class="not">En çok ${EN_COK_SEMT} semt eklenebilir.</p>`}`,
    gecerli: t => t.semtler.length > 0 || 'En az bir semt ekle.',
  },
  {
    baslik: 'Ulaşım',
    html: t => `
      <p class="soru">Gün içinde genelde nasıl dolaşıyorsun? Kıyafet önerisi buna göre ayarlanır.</p>
      ${ULASIM.map(u => radyo('ulasim', u.id, u.ad, u.not, u.id === t.ulasim)).join('')}`,
  },
  {
    baslik: 'Yaş',
    html: t => `
      <p class="soru">Yaş aralığın? Sıcak ve soğuk uyarılarının eşiği buna göre ayarlanır.</p>
      ${YASLAR.map(y => radyo('yas', y, y, '', y === t.yas)).join('')}`,
    gecerli: t => !!t.yas || 'Bir yaş aralığı seç.',
  },
  {
    baslik: 'Hassasiyetler',
    html: t => `
      <p class="soru">Varsa işaretle; seçmeden de geçebilirsin. Seçtiklerine göre kısa notlar gösterilir.</p>
      ${HASSASIYETLER.map(g => `
        <fieldset><legend>${g.grup}</legend>
          ${g.secenekler.map(([id, ad]) => `<label class="kutu"><input type="checkbox" name="hassas" value="${id}"${t.hassas.includes(id) ? ' checked' : ''}> ${ad}</label>`).join('')}
        </fieldset>`).join('')}
      <p class="not">Bu notlar genel bilgilendirmedir, tıbbi tavsiye değildir.</p>`,
  },
  {
    baslik: 'Takvim yaprağı',
    html: t => `
      <label class="kutu"><input type="checkbox" name="takvim" value="1"${t.takvim !== false ? ' checked' : ''}>
        Namaz vakitleri, Hicri tarih, kandiller ve Ramazan geri sayımı gösterilsin</label>
      <p class="soru" style="margin-top:14px">İstersen burcunu seç; havayla eşleşen eğlence satırı için.</p>
      <div class="burclar">
        ${BURCLAR.map(([id, ad]) => radyo('burc', id, ad, '', id === t.burc)).join('')}
        ${radyo('burc', '', 'Söylemeyeyim', '', !t.burc)}
      </div>
      <p class="gizlilik">${GIZLILIK}</p>
      <p><button type="button" class="baglanti" data-sil>Bu telefondaki tüm Maarif verilerini sil</button></p>`,
  },
];

export function kurulumGoster(kok, ayar, bitince) {
  const taslak = { ...ayar, hassas: [...ayar.hassas], semtler: [...ayar.semtler] };
  let adim = 0;

  function ciz(hata = '') {
    const a = ADIMLAR[adim];
    kok.innerHTML = `
      <h1 class="ust">KURULUM · ${adim + 1} / ${ADIMLAR.length}</h1>
      <form class="kurulum">
        <h2>${a.baslik}</h2>
        ${a.html(taslak)}
        ${hata ? `<p class="hata-kucuk" role="alert">${hata}</p>` : ''}
        <div class="adim-dugmeler">
          ${adim > 0 ? '<button type="button" class="dugme" data-geri>Geri</button>' : '<span></span>'}
          <button type="submit" class="dugme dolu">${adim === ADIMLAR.length - 1 ? 'Kaydet' : 'İleri'}</button>
        </div>
      </form>`;
    const form = kok.querySelector('form');
    form.addEventListener('change', () => oku(form));
    form.addEventListener('submit', e => {
      e.preventDefault();
      oku(form);
      const sonuc = a.gecerli ? a.gecerli(taslak) : true;
      if (sonuc !== true) return ciz(sonuc);
      if (adim < ADIMLAR.length - 1) { adim++; ciz(); window.scrollTo(0, 0); return; }
      taslak.kurulum = true;
      ayarlariYaz(taslak);
      bitince(taslak);
    });
    kok.querySelector('[data-geri]')?.addEventListener('click', () => { oku(form); adim--; ciz(); });
    // Semt listesi: seçince ekle, okla taşı, çarpıyla çıkar
    form.querySelector('[name="yeniSemt"]')?.addEventListener('change', e => {
      if (e.target.value) { taslak.semtler.push(e.target.value); ciz(); }
    });
    form.querySelectorAll('[data-islem]').forEach(d => d.addEventListener('click', () => {
      const i = +d.dataset.i, l = taslak.semtler;
      if (d.dataset.islem === 'cikar') l.splice(i, 1);
      else {
        const j = d.dataset.islem === 'yukari' ? i - 1 : i + 1;
        [l[i], l[j]] = [l[j], l[i]];
      }
      ciz();
    }));
    kok.querySelector('[data-sil]')?.addEventListener('click', () => {
      if (!confirm('Ayarların ve kayıtlı hava verisi bu telefondan silinsin mi?')) return;
      hepsiniSil();
      location.reload();
    });
  }

  function oku(form) {
    const v = new FormData(form);
    for (const ad of ['ulasim', 'yas', 'burc']) if (v.has(ad)) taslak[ad] = v.get(ad);
    if (form.querySelector('[name="takvim"]')) taslak.takvim = v.has('takvim');
    // Hassasiyet adımındaysak işaretsiz kutular da "seçilmedi" demektir
    if (form.querySelector('[name="hassas"]')) taslak.hassas = v.getAll('hassas');
  }

  ciz();
}
