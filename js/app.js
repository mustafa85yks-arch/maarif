import { ilceBul } from './veri/ilceler.js';
import { ayarlariOku } from './ayarlar.js';
import { kurulumGoster } from './kurulum.js';
import { havaGetir, TAZELIK } from './veri/hava.js';
import { TZ, simdiYerel, tarihOf, hhmm } from './zaman.js';
import { kodBilgi, geceMi, yagacakMi } from './mantik/gok.js';
import { ozetCumlesi } from './mantik/ozet.js';
import { uyarilar } from './mantik/uyarilar.js';
import { nemYorumu, CIY_ACIKLAMA } from './mantik/nem.js';
import { ruzgarYorumu, ruzgarAdi } from './mantik/ruzgar.js';
import { modelKarsilastir } from './mantik/modeller.js';
import { gunesBilgisi, ayBilgisi, aySvg } from './mantik/gokyuzu.js';
import { kiyafetOnerisi, gunduzPenceresi } from './mantik/kiyafet.js';
import { saglikNotlari, SAGLIK_NOTU } from './mantik/saglik.js';
import { kaliteOzeti, bant, uvEtiket } from './mantik/kalite.js';
import { ozelGunler, yaklasanlar, hicriTarih, rumiTarih, DINI_LISTE_SONU } from './veri/takvim.js';
import { vakitler, siradakiVakit, diyanetBolgesi } from './mantik/namaz.js';
import { ramazanDurumu } from './mantik/ramazan.js';
import { gunOzeti, gununHavasi, burcSatiri, gununSozu, yemekOnerisi } from './mantik/yaprak.js';
import { tarihteOku, tarihteGetir, vikipediBaglantisi } from './veri/tarihte.js';

const kok = document.getElementById('yaprak');
const yuvarla = x => (x == null ? '–' : Math.round(x));
const bolme = s => s.replaceAll(' ', '\u00a0'); // satır sonunda bölünmesin
// Dışarıdan gelen metin (Vikipedi) innerHTML'e girmeden önce
const kacir = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let sonVeri = null;
let kurulumda = false;
let aktif = 0; // ana ekranda büyük gösterilen semt (oturumluk)

function ayarlariAc() {
  kurulumda = true;
  kurulumGoster(kok, ayarlariOku(), () => { kurulumda = false; aktif = 0; window.scrollTo(0, 0); yukle(); });
}

async function yukle(zorla = false) {
  const ayar = ayarlariOku();
  const konumlar = ayar.semtler.map(ilceBul).filter(Boolean);
  try {
    sonVeri = await havaGetir(konumlar, { zorla });
    ciz();
  } catch (e) {
    hataGoster(`Hava bilgisi alınamadı. İnternet bağlantını kontrol et.<br><small>${e.message}</small>`);
  }
}

function hataGoster(metin) {
  kok.innerHTML = `<p class="hata">${metin}</p><p class="dip"><button class="dugme" id="yenile">Tekrar dene</button></p>`;
  kok.querySelector('#yenile').onclick = () => yukle(true);
}

function ciz() {
  const ayar = ayarlariOku();
  const konumlar = sonVeri.konumlar;
  if (aktif >= konumlar.length) aktif = 0;
  const k = konumlar[aktif];
  const simdi = simdiYerel();
  const idx = k.saatler.findIndex(s => s.t.slice(0, 13) === simdi.slice(0, 13));
  if (idx < 0) return hataGoster('Elimdeki tahmin artık güncel değil. İnternete bağlanınca yenilenecek.');

  const s = k.saatler[idx];
  const gece = geceMi(s.t, k.gunler);
  const kb = kodBilgi(s.kod, gece);
  const ozet = ozetCumlesi(k.saatler, idx, gece);
  const uy = uyarilar(k.saatler, idx);
  const kiyafet = kiyafetOnerisi({ konumlar, idx, ayar });
  const saglik = saglikNotlari({ saatler: k.saatler, idx, gunler: k.gunler, ayar });

  const tarihYaz = o => new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, ...o }).format(new Date());
  const gunAdi = tarihYaz({ weekday: 'long' });
  const gun = simdi.slice(0, 10);
  const takvimAcik = ayar.takvim !== false;
  // Takvim kapalıysa yalnız resmi tatiller ve bayramlar kalır
  const ozel = ozelGunler(gun).filter(o => takvimAcik || ['resmi', 'bayram', 'arefe'].includes(o.tur));
  const kirmiziGun = gunAdi === 'Pazar' || ozel.some(o => o.tatil === true);
  const ozelEtiket = ozel.map(o => o.ad + (o.tur === 'kandil' ? ' · bu gece' : o.tatil === 'yarim' ? ' · 13:00\'ten sonra tatil' : '')).join(' · ');
  const ramazan = takvimAcik ? ramazanDurumu(k, simdi, k.saatler) : null;
  const gunO = gunOzeti(k.saatler, gun);
  const havaSatiri = takvimAcik ? gununHavasi(gunO, gun, ozel) : '';
  // Tarihte bugün: önbellekte yoksa arka planda çek, gelince yeniden çiz
  const tarihte = takvimAcik ? tarihteOku(gun) : null;
  if (takvimAcik && !tarihte) tarihteGetir(gun).then(x => { if (x && !kurulumda) ciz(); }).catch(() => {});
  const ust = `${tarihYaz({ month: 'long' })} ${tarihYaz({ year: 'numeric' })}`.toLocaleUpperCase('tr-TR');

  // Yeniden çizimde açık bölümler açık kalsın
  const acik = new Set([...kok.querySelectorAll('details[open]')].map(d => d.dataset.id));

  kok.innerHTML = `
    <h1 class="ust">${ust}</h1>
    ${takvimAcik ? `<p class="takvim-alt">${bolme(hicriTarih(gun))} <span>·</span> ${bolme(`Rumi ${rumiTarih(gun)}`)}</p>` : ''}
    ${ramazanHtml(ramazan, k)}
    <section class="bas">
      <div class="blok">
        <div class="dev${kirmiziGun ? ' kirmizi' : ''}">${tarihYaz({ day: 'numeric' })}</div>
        <div class="etiket${kirmiziGun ? ' kirmizi' : ''}">${gunAdi.toLocaleUpperCase('tr-TR')}</div>
        ${ozelEtiket ? `<div class="ozel-gun">${ozelEtiket}</div>` : ''}
      </div>
      <div class="dikey"></div>
      <div class="blok">
        <div class="dev">${yuvarla(s.sicaklik)}°</div>
        <div class="alt">${kb.isaret} ${kb.ad}<br>hissedilen ${yuvarla(s.hissedilen)}°</div>
      </div>
    </section>
    <p class="konum-etiket">${k.ad}</p>
    <p class="ozet">${ozet.ana}</p>
    ${ozet.ek.map(e => `<p class="ek">${e}</p>`).join('')}
    ${havaSatiri ? `<p class="gunun-havasi">${havaSatiri}</p>` : ''}
    <p class="kiyafet"><b>${kiyafet.gun === 'Yarın' ? 'Yarın giy' : 'Giy'}</b>${kiyafet.satir}</p>
    ${kiyafet.detay.length ? `<p class="kiyafet-detay">${kiyafet.detay.join(' ')}</p>` : ''}
    ${uy.map(u => `<div class="uyari" role="alert"><b>${u.baslik}</b>${u.metin}</div>`).join('')}
    ${saglikHtml(saglik)}
    ${semtlerHtml(konumlar, idx)}
    ${saatlikBolum(k, idx)}
    ${modelBolum(k, idx)}
    ${nemBolum(s)}
    ${ruzgarBolum(k, idx)}
    ${kaliteBolum(k, idx)}
    ${gokBolum(k, simdi)}
    ${takvimBolum(gun, takvimAcik)}
    ${takvimAcik ? namazBolum(k, simdi) : ''}
    ${takvimAcik ? yaprakBolum(gunO, gun, ayar, tarihte) : ''}
    <footer class="dip">
      ${sonVeri.eski ? '<strong>Bağlantı yok — son alınan veri gösteriliyor.</strong><br>' : ''}
      Son güncelleme ${new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(sonVeri.zaman)}
      · ECMWF, ICON, GFS ortancası · Open-Meteo<br>
      <button class="dugme" id="yenile">Yenile</button>
      <button class="dugme" id="ayarlar">Ayarlar</button>
    </footer>`;

  kok.querySelectorAll('details').forEach(d => { if (acik.has(d.dataset.id)) d.open = true; });
  kok.querySelector('#yenile').onclick = () => yukle(true);
  kok.querySelector('#ayarlar').onclick = ayarlariAc;
  kok.querySelectorAll('[data-semt]').forEach(d => {
    d.onclick = () => { aktif = +d.dataset.semt; ciz(); window.scrollTo(0, 0); };
  });
}

function ramazanHtml(r, k) {
  if (!r) return '';
  return `<div class="ramazan" role="status">
    <div class="ramazan-bas"><b>${r.baslik}</b>${r.kalan ? `<span class="geri">${r.kalan}</span>` : ''}</div>
    ${r.saat ? `<div class="ramazan-saat">${r.saat} · ${k.ad}</div>` : ''}
    ${r.not ? `<p>${r.not}</p>` : ''}
  </div>`;
}

function yaprakBolum(o, gun, ayar, tarihte) {
  const burc = ayar.burc ? burcSatiri(o, gun, ayar.burc) : null;
  const satir = (baslik, ic) => `<div class="yaprak-satir"><b>${baslik}</b>${ic}</div>`;
  const tarihHtml = tarihte === null
    ? '<p class="not">Vikipedi\'den alınıyor…</p>'
    : tarihte.length
      ? `<ul>${tarihte.map(e => `<li><b>${kacir(e.yil)}</b> — ${kacir(e.metin)}</li>`).join('')}</ul>
         <p class="not"><a href="${vikipediBaglantisi(gun)}" target="_blank" rel="noopener">Vikipedi</a>, CC BY-SA</p>`
      : '<p class="not">Bugün için uygun bir kayıt bulunamadı.</p>';
  return bolum('yaprak', 'Yaprağın arkası', 'söz · sofra · tarih', `
    ${satir('Günün sözü', `<p class="soz">${gununSozu(o, gun)}</p>`)}
    ${burc ? satir('Burç', `<p class="not">${burc.baslik}</p><p>${burc.metin}</p>`) : ''}
    ${satir('Sofrada', `<p>${yemekOnerisi(o, gun)}</p>`)}
    ${satir('Tarihte bugün', tarihHtml)}
    ${burc ? '<p class="not">Burç satırı eğlence içindir.</p>' : ''}`);
}

function namazBolum(k, simdi) {
  const v = vakitler(k, simdi.slice(0, 10));
  const sira = siradakiVakit(k, simdi);
  const simdiki = v.filter(x => x.t <= simdi).at(-1);
  const satirlar = v.map(x => `<tr${x === simdiki ? ' class="simdiki"' : ''}><td>${x.ad}</td><td class="sag"><b>${hhmm(x.t)}</b></td></tr>`).join('');
  return bolum('namaz', 'Namaz vakitleri', `${sira.ad} ${sira.saat} · ${sira.kalan}`, `
    <p><b>${sira.ad} vaktine ${sira.kalan} var</b> (${sira.saat}).</p>
    <table><tbody>${satirlar}</tbody></table>
    <p class="not" style="margin-top:8px">Diyanet'in ${diyanetBolgesi(k)} vakitlerine göre hesaplanır; ölçülen fark en çok 1 dakika.</p>`);
}

function takvimBolum(gun, takvimAcik) {
  const tarih = g => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' }).format(new Date(`${g}T12:00Z`));
  const kalanGun = g => Math.round((Date.parse(`${g}T12:00Z`) - Date.parse(`${gun}T12:00Z`)) / 864e5);
  const liste = yaklasanlar(gun, 6).filter(o => takvimAcik || ['resmi', 'bayram', 'arefe'].includes(o.tur)).slice(0, 4);
  if (!liste.length) return '';
  const ilk = liste[0];
  const satirlar = liste.map(o => {
    const n = kalanGun(o.gun);
    const etiket = o.tatil === true ? ' <small class="kirmizi">tatil</small>' : o.tatil === 'yarim' ? ' <small>yarım gün</small>' : '';
    return `<tr><td>${tarih(o.gun)}<br><b>${o.ad}</b>${etiket}</td><td class="sag">${n === 1 ? 'yarın' : `${n} gün`}</td></tr>`;
  }).join('');
  const sinir = takvimAcik && gun > DINI_LISTE_SONU.slice(0, 4) + '-10-01'
    ? '<p class="not">Dini günler listesi 2027 sonuna kadar; yeni yılın listesi eklenmeli.</p>' : '';
  return bolum('takvim', 'Yaklaşan günler', `${ilk.ad} · ${kalanGun(ilk.gun) === 1 ? 'yarın' : `${kalanGun(ilk.gun)} gün`}`, `
    <table><tbody>${satirlar}</tbody></table>
    ${takvimAcik ? '<p class="not" style="margin-top:8px">Dini günler Diyanet takviminden. Kandil, o günün akşamıdır.</p>' : ''}
    ${sinir}`);
}

// En önemli 4 not görünür, kalanı açılır listede
function saglikHtml(notlar) {
  if (!notlar.length) return '';
  const li = n => `<li>${n}</li>`;
  const kalan = notlar.slice(4);
  return `<div class="saglik"><b>Sağlık</b><ul>${notlar.slice(0, 4).map(li).join('')}</ul>
    ${kalan.length ? `<details class="diger" data-id="saglik-diger"><summary>${kalan.length} not daha</summary><ul>${kalan.map(li).join('')}</ul></details>` : ''}
    <small>${SAGLIK_NOTU}</small></div>`;
}

// Diğer semtler: tek satır özet; dokununca o semt ana ekrana gelir.
// Aralık kıyafet önerisiyle aynı gündüz penceresi, böylece ikisi çelişmez.
function semtlerHtml(konumlar, idx) {
  if (konumlar.length < 2) return '';
  const p = gunduzPenceresi(konumlar[0].saatler[idx].t);
  const satirlar = konumlar.map((k, i) => {
    const s = k.saatler[idx];
    const kb = kodBilgi(s.kod, geceMi(s.t, k.gunler));
    const gunduz = k.saatler.filter(x => x.t >= p.bas && x.t <= p.son);
    const sic = gunduz.map(x => x.sicaklik);
    const u = uyarilar(k.saatler, idx);
    const yagis = gunduz.find(yagacakMi);
    const not = u.length ? u.map(x => x.baslik).join(', ')
      : yagis ? (yagis.t === s.t ? 'yağış var' : `${hhmm(yagis.t)} yağış`) : 'yağış yok';
    return `<li><button type="button" class="semt${i === aktif ? ' secili' : ''}" data-semt="${i}"${i === aktif ? ' aria-current="true"' : ''}>
      <span class="semt-ad">${k.ad}<small>${yuvarla(Math.min(...sic))}°–${yuvarla(Math.max(...sic))}° · <span class="${u.length ? 'kirmizi' : ''}">${not}</span></small></span>
      <span class="semt-hava"><span title="${kb.ad}">${kb.isaret}</span> <b>${yuvarla(s.sicaklik)}°</b> <small>his ${yuvarla(s.hissedilen)}°</small></span>
    </button></li>`;
  }).join('');
  return `<section class="semtler"><h2>Semtlerin</h2><ul>${satirlar}</ul><p class="not">Dokunduğun semt yukarıda büyük görünür. Aralık: ${p.gun === 'Yarın' ? 'yarın' : 'bugün'} gündüz (21:00'e kadar).</p></section>`;
}

function bolum(id, baslik, kisa, icerik) {
  return `<details data-id="${id}"><summary>${baslik}<span class="kisa">${kisa}</span></summary><div class="icerik">${icerik}</div></details>`;
}

function saatlikBolum(k, idx) {
  const dilim = k.saatler.slice(idx, idx + 24);
  let gun = tarihOf(dilim[0].t);
  const satirlar = dilim.map(s => {
    let ayrac = '';
    if (tarihOf(s.t) !== gun) { gun = tarihOf(s.t); ayrac = '<tr class="gun-ayrac"><td colspan="5">Yarın</td></tr>'; }
    const kb = kodBilgi(s.kod, geceMi(s.t, k.gunler));
    const yagis = s.yagisOlasi >= 20 || s.yagis >= 0.1
      ? `%${yuvarla(s.yagisOlasi)}${s.yagis >= 0.1 ? ` <small>${s.yagis.toFixed(1)}</small>` : ''}`
      : '–';
    return `${ayrac}<tr>
      <td>${hhmm(s.t)}</td>
      <td class="isaret" title="${kb.ad}">${kb.isaret}</td>
      <td><b>${yuvarla(s.sicaklik)}°</b> <small>${yuvarla(s.hissedilen)}°</small></td>
      <td>${yagis}</td>
      <td class="sag">${ruzgarAdi(s.yon).kisa} ${yuvarla(s.ruzgar)}</td></tr>`;
  }).join('');
  const sic = dilim.map(s => s.sicaklik);
  return bolum('saatlik', 'Saatlik', `${yuvarla(Math.min(...sic))}° – ${yuvarla(Math.max(...sic))}°`, `
    <table>
      <thead><tr><th>Saat</th><th></th><th>°C <small>his.</small></th><th>Yağış <small>mm</small></th><th class="sag">Rüzgar</th></tr></thead>
      <tbody>${satirlar}</tbody>
    </table>
    <p class="not" style="margin-top:8px">Rüzgar km/s; harfler esiş yönü (K kuzey, GB güneybatı…).</p>`);
}

function modelBolum(k, idx) {
  const m = modelKarsilastir(k.saatler, idx);
  const satirlar = m.sonuc.map(x => `<tr>
    <td><b>${x.ad}</b></td><td>${yuvarla(x.enDusuk)}°</td><td>${yuvarla(x.enYuksek)}°</td>
    <td>${x.yagis.toFixed(1)}</td><td class="sag">${yuvarla(x.ruzgar)}</td></tr>`).join('');
  return bolum('modeller', 'Modeller', `uyum ${m.guven}`, `
    <p>${m.cumle}</p>
    <table>
      <thead><tr><th>24 saat</th><th>En düşük</th><th>En yüksek</th><th>Yağış mm</th><th class="sag">Rüzgar</th></tr></thead>
      <tbody>${satirlar}</tbody>
    </table>
    <p class="not" style="margin-top:8px">ECMWF Avrupa, ICON Alman, GFS Amerikan hava modeli. Ekrandaki değerler üçünün ortancası.</p>`);
}

function nemBolum(s) {
  const n = nemYorumu(s);
  return bolum('nem', 'Nem ve hissedilen', `%${yuvarla(s.nem)}`, `
    <p><b>${n.cumle}</b></p>
    <p>${n.hiss}</p>
    <p>Nem %${yuvarla(s.nem)}, çiy noktası ${yuvarla(s.ciy)}°.</p>
    <p class="not">${CIY_ACIKLAMA}</p>`);
}

function ruzgarBolum(k, idx) {
  const r = ruzgarYorumu(k.saatler, idx);
  // Ok rüzgarın gittiği yönü gösterir: kuzeyden esen rüzgar güneye iter
  const ok = `<span class="ok" style="transform:rotate(${Math.round(k.saatler[idx].yon)}deg)">↓</span>`;
  return bolum('ruzgar', 'Rüzgar', `${r.ad} · ${r.etiket}`, `
    <div class="ruzgar-bas">${ok}<div><div class="ruzgar-ad">${r.ad.toLocaleUpperCase('tr-TR')}</div><div class="not">${r.yon}den esiyor</div></div></div>
    <p>${r.cumle}</p>
    ${r.donus ? `<p>${r.donus}</p>` : ''}
    <p class="not">${r.not}</p>`);
}

function kaliteBolum(k, idx) {
  const q = kaliteOzeti(k.saatler, idx);
  if (!q) return bolum('kalite', 'Hava kalitesi', 'veri yok', '<p class="not">Hava kalitesi verisi şu an alınamadı.</p>');
  const s = q.simdi;
  const satir = (ad, deger, birim, etiket) => `<tr><td>${ad}</td><td>${deger}${birim ? ` <small>${birim}</small>` : ''}</td><td class="sag">${etiket}</td></tr>`;
  const polen = q.polenler.length
    ? q.polenler.map(p => `${p.ad} ${p.seviye}`).join(', ') + '.'
    : 'Polen yok denecek kadar az.';
  const kotulesme = q.enKotu.aqi >= s.aqi + 10
    ? `<p>${hhmm(q.enKotu.t)} civarı endeks ${q.enKotu.aqi}'e çıkıyor (${bant('pm25', q.enKotu.pm25) === 'iyi' ? 'ozon' : 'partikül'} kaynaklı).</p>` : '';
  return bolum('kalite', 'Hava kalitesi ve polen', `${q.etiket} · ${s.aqi}`, `
    <p><b>Hava ${q.etiket}.</b> Avrupa hava kalitesi endeksi ${s.aqi}.</p>
    ${kotulesme}
    <table><tbody>
      ${satir('PM2.5', yuvarla(s.pm25), 'µg/m³', bant('pm25', s.pm25))}
      ${satir('PM10', yuvarla(s.pm10), 'µg/m³', bant('pm10', s.pm10))}
      ${satir('Ozon', yuvarla(s.ozon), 'µg/m³', bant('ozon', s.ozon))}
      ${satir('Çöl tozu', yuvarla(s.toz), 'µg/m³', s.toz >= 50 ? 'var' : 'yok')}
      ${satir('UV', s.uv == null ? '–' : s.uv.toFixed(1), '', `${uvEtiket(s.uv)}; 12 saatte en çok ${q.uv.uv == null ? '–' : q.uv.uv.toFixed(1)}`)}
    </tbody></table>
    <p style="margin-top:10px">${polen}</p>
    <p class="not">Kaynak: Copernicus (CAMS) tahmini. İstasyon ölçümü değil; ilçe ortalamasıdır.</p>`);
}

function gokBolum(k, simdi) {
  const g = gunesBilgisi(k.gunler, simdi);
  const a = ayBilgisi(k.lat, k.lon);
  // Dolunay yeni geçtiyse "29 gün var" demek garip kaçar
  const dolunay = a.ad === 'Dolunay' || a.dolunay > 25 ? '' : a.dolunay === 1 ? ' Dolunay yarın.' : a.dolunay ? ` Dolunaya ${a.dolunay} gün var.` : '';
  const ayZaman = [a.dogus && ['doğuş', a.dogus], a.batis && ['batış', a.batis]].filter(Boolean)
    .sort((x, y) => x[1].localeCompare(y[1])).map(([ad, saat]) => `${ad} ${saat}`).join(', ');
  return bolum('gok', 'Güneş ve ay', g.kisa, `
    <p><b>${g.ana}</b></p>
    <p>Doğuş ${g.dogus}, batış ${g.batis}. ${g.gun}</p>
    <div class="ay-satir">${aySvg(a.fraction, a.phase)}
      <div><b>${a.ad}</b>, %${a.yuzde} aydınlık.${dolunay}<br><span class="not">${ayZaman ? `Ay bugün ${ayZaman}.` : ''}</span></div>
    </div>`);
}

// Dakikada bir geri sayımları güncelle; veri eskidiyse yeniden çek
function tazele() {
  if (!sonVeri || kurulumda) return;
  if (Date.now() - sonVeri.zaman > TAZELIK) yukle(); else ciz();
}
setInterval(tazele, 60 * 1000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tazele(); });

if (ayarlariOku().kurulum) yukle(); else ayarlariAc();
