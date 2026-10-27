import { MODELLER, MODEL_ADI } from '../veri/hava.js';

const liste = adlar => adlar.length > 1 ? `${adlar.slice(0, -1).join(', ')} ve ${adlar.at(-1)}` : adlar[0];

// Önümüzdeki 24 saatte üç model ne kadar anlaşıyor?
export function modelKarsilastir(saatler, idx, n = 24) {
  const dilim = saatler.slice(idx, idx + n);
  const sonuc = MODELLER.map(m => {
    const v = dilim.map(s => s.modeller[m]).filter(x => x.sicaklik != null);
    return {
      ad: MODEL_ADI[m],
      enDusuk: Math.min(...v.map(x => x.sicaklik)),
      enYuksek: Math.max(...v.map(x => x.sicaklik)),
      yagis: v.reduce((t, x) => t + (x.yagis || 0), 0),
      ruzgar: Math.max(...v.map(x => x.ruzgar)),
    };
  });

  const aralik = alan => Math.max(...sonuc.map(x => x[alan])) - Math.min(...sonuc.map(x => x[alan]));
  const yuksekFark = aralik('enYuksek'), dusukFark = aralik('enDusuk');
  const yagisli = sonuc.filter(x => x.yagis >= 1);
  const kuru = sonuc.filter(x => x.yagis < 1);
  const yagisUyum = !yagisli.length || !kuru.length;

  const notlar = [];
  if (!yagisUyum) {
    notlar.push(`Yağış konusunda anlaşamıyorlar: ${liste(yagisli.map(x => x.ad))} yağmur diyor, ${liste(kuru.map(x => x.ad))} kuru diyor.`);
  } else if (yagisli.length === 3) {
    const mm = sonuc.map(x => x.yagis);
    if (Math.max(...mm) >= 5 && Math.min(...mm) < Math.max(...mm) / 3) {
      notlar.push(`Hepsi yağmur diyor ama miktarda ayrışıyorlar (${sonuc.map(x => `${x.ad} ${Math.round(x.yagis)} mm`).join(', ')}).`);
    }
  }
  if (yuksekFark > 2) notlar.push(`En yüksek sıcaklıkta ${Math.round(yuksekFark)}° fark var.`);
  if (dusukFark > 2) notlar.push(`En düşük sıcaklıkta ${Math.round(dusukFark)}° fark var.`);

  let guven;
  if (!notlar.length) guven = 'yüksek';
  else if (!yagisUyum && (yuksekFark > 3 || dusukFark > 3)) guven = 'düşük';
  else guven = 'orta';

  const cumle = notlar.length ? notlar.join(' ') : 'Üç model de aynı şeyi söylüyor; tahmin sağlam.';
  return { sonuc, guven, cumle };
}
