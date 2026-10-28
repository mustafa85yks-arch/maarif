# Maarif — devir notu

İstanbul için mobil öncelikli hava durumu + dijital Saatli Maarif Takvimi yaprağı.
Statik site (HTML/CSS/JS, derleme yok). Şimdilik sadece bu bilgisayarda; GitHub Pages sonra.

## Çalıştırma

```
cd ~/Documents/Maarif && python3 -m http.server 8765
```
Tarayıcıda http://localhost:8765 — ES modülleri `file://` ile açılmaz, sunucu şart.

## Yayın

- Canlı: https://mustafa85yks-arch.github.io/maarif/
- Depo (açık): https://github.com/mustafa85yks-arch/maarif — GitHub Pages, `main` dalının kökünden
- Güncellemek için: değişikliği commit'le, `git push` — Pages 1 dakika içinde yeniler
- Commit kimliği depoya özel: GitHub noreply adresi (kişisel e-posta görünmez)
- Varsayılan semt nötr (Fatih); kişisel ayarlar sadece telefonda, depoda yok

## Aşamalar

| | Durum |
|---|---|
| 1. Çekirdek hava ekranı | ✅ 27 Eki 2026 |
| 2. Kurulum + kıyafet + sağlık + hava kalitesi + semt listesi | ✅ 27 Eki 2026 |
| 3. Namaz / Ramazan / özel günler (Diyanet karşılaştırması) | ✅ 27 Eki 2026 |
| 4. Yaprağın arkası: günün havası, söz, burç, sofra, tarihte bugün | ✅ 27 Eki 2026 |
| 5. GitHub + Pages yayını | ✅ 27 Eki 2026 |
| 6. PWA (ana ekrana ekleme, çevrimdışı) | ✅ 27 Eki 2026 |
| 7. Günün fıkrası (yaprağın arkası) | ✅ 28 Eki 2026 |

## Yapı

- `js/veri/hava.js` — Open-Meteo, 3 model × en çok 6 semt tek istek, saat başı ortanca, 30 dk localStorage önbelleği
- `js/mantik/` — özet, nem, rüzgar (İstanbul rüzgar gülü), uyarılar, model uyumu, güneş/ay
- `js/ayarlar.js` — ayar şeması (`semtler` listesi, en çok 6; eski ev/iş ayarı otomatik listeye çevrilir), hassasiyet/burç listeleri
- `js/kurulum.js` — 5 adım: semtler (ekle/sırala/çıkar) · ulaşım · yaş · hassasiyet · burç. Ayarlar düğmesiyle tekrar açılır, "tüm verileri sil" var
- Ana ekran: listedeki ilk semt büyük; "Semtlerin" listesinde her semt tek satır, dokununca o semt büyük görünür (oturumluk)
- `js/mantik/kiyafet.js` — gündüz penceresi (20:00 sonrası yarın 07–21, yoksa bugünün kalanı), tüm semtlerin en soğuk hissedileni + ulaşım düzeltmesi (yürüyüş −3, toplu −2, servis −1, araç +4) → katman; şemsiye/bot/rüzgarlık/gözlük; katmanlı giyin; semtler arası fark. Semt listesi aynı pencereyi kullanır
- `js/mantik/saglik.js` — hassasiyete göre notlar (65+ için sıcak/soğuk eşiği daha düşük); ekranda ilk 4, kalanı açılır
- `js/mantik/kalite.js` — EAQI bantları, polen, UV etiketi
- `js/dil.js` — ilçe adlarına hal ekleri (Esenyurt'ta, Bayrampaşa'dan)
- `lib/suncalc.js` — suncalc@1.9.0 (unpkg), ay evresi ve doğuş/batışı
- `lib/adhan.umd.min.js` — adhan@4.4.3 (unpkg), namaz vakti hesabı
- `manifest.webmanifest`, `icons/` (Pillow + DIN Condensed ile üretildi; maskelemeye uygun), `js/pwa.js` (kayıt + "ana ekrana ekle" ipucu: Android'de düğme, iPhone'da Paylaş tarifi)
- `sw.js` — service worker: kendi dosyalar önce ağ (3 sn zaman aşımı), yoksa önbellek; yazı tipleri önce önbellek; API'lere dokunmaz. **Yeni dosya eklenince DOSYALAR listesine yaz ve SURUM'u artır**, yoksa kurulum o dosyayı önbelleğe almaz (listedeki tek eksik dosya kurulumu tamamen bozar)
- `js/mantik/namaz.js` — adhan Türkiye yöntemi + yılın gününe göre mevsimsel düzeltme eğrisi (KATSAYI). Diyanet'in ayrı vakit verdiği 18 ilçe kendi koordinatıyla, diğer semtler "İstanbul" (41.019, 28.949) ile hesaplanır
- `js/mantik/ramazan.js` — en üstteki imsak/iftar geri sayımı + iftar saatindeki hava
- `js/veri/takvim.js` — Diyanet dini günleri (2027 sonuna kadar), resmi tatiller (her yıl), Hicri tarih (Diyanet ay başları + Ümmülkurâ yedek), Rumi tarih
- `js/veri/yaprak_metin.js` — günün havası, burç (4 element × 4 gün tipi), atasözleri, yemek metinleri. Burç/hava/yemek cümleleri özgün; atasözleri halk malı
- `js/mantik/yaprak.js` — bugünün 07–21 özetine göre seçim; seçimler tarih tohumuyla sabit (gün içinde değişmez)
- `js/veri/fikralar.js` — 88 fıkra (Hoca 42, Temel 37, Bektaşi 9), halk fıkraları yeniden anlatıldı. `yaprak.js` → `gununFikrasi`: gün no × listeyle aralarında asal adım, liste bitmeden tekrar yok. Fıkra eklemek için listeye yeni satır yeterli; `sw.js` SURUM'u artır
- `js/veri/tarihte.js` — Türkçe Vikipedi onthisday (api.wikimedia.org, CORS açık). KARANLIK süzgeci (ölüm, savaş, kaza, siyaset…) + OLUMLU öncelik (açıldı, kuruldu, ilk…); 1 Türkiye + 1 dünya olayı; günde bir çekilir. Metin innerHTML öncesi kaçırılır; CC BY-SA bağlantısı var
- Ayarlarda "Takvim yaprağı" aç/kapa (yaprağın arkası da buna bağlı): kapalıyken namaz, Hicri/Rumi, kandil ve Ramazan gizlenir; resmi tatil/bayram kalır

## Bilinenler

- UV: hava modellerinden yalnızca GFS veriyor; hava kalitesi API'sinin CAMS UV'si de alınıp yüksek olanı kullanılıyor.
- Polen CAMS Avrupa alanından; mevsim dışında sıfır gelir, o zaman "Polen yok denecek kadar az" yazar.
- Yağış ihtimali üç modelde de dolu geliyor (27 Eki testinde).
- Ay doğuş/batışı telefonun yerel gece yarısına göre hesaplanıyor; telefon İstanbul saatinde değilse kayabilir.
- Tahmin `past_days=1` ile çekiliyor: dünle sıcaklık farkı ve 24 saatlik basınç değişimi için.
- Uyarı ve sağlık eşikleri makul varsayımlar (lodos hamle 50, PM2.5 25, basınç 6 hPa, UV 6/8…); kullandıkça ayarlanacak.
- Ev/iş ve yolculuk kartları 27 Eki'de kaldırıldı; yerine serbest semt listesi.
- "Semt" şimdilik 39 ilçe. Gerçek semt/mahalle seçimi için Open-Meteo yer arama denenmedi (sonraya kalan).

## Diyanet karşılaştırması (27 Eki 2026)

- Kaynak: Diyanet'in İstanbul sayfası (namazvakitleri.diyanet.gov.tr, 9541) — arşiv kopyalarında 2025–2026 yıllık tablo (730 gün); ilçeler için ezanvakti.emushaf.net aynası (Diyanet'le birebir aynı olduğu 27–28 Eki'de doğrulandı), 1 ay.
- Düzeltmesiz adhan: ikindi/akşam/yatsı mevsime göre ±1,3 dk sapıyor (kışın geç, Ağu–Eki erken). Sabit dakika eklemek çözmüyor.
- Düzeltme eğrisi 2025 ile kuruldu, 2026'da denendi; uygulamanın kendi kodu 730 günün hiçbirinde 2 dk sapmadı. Birebir oran: merkez %87–98, Esenyurt/Silivri/Şile %66–97 (vakte göre); geri kalan günler 1 dk.
- Her yıl: Diyanet yeni yılın dini günler takvimini yayımlayınca `takvim.js` → DINI, RAMAZAN, AY_BASLARI güncellenmeli. 2027 Ekim'den sonra ekranda hatırlatma çıkar.
- Dini gün tarihleri Diyanet'in resmi sayfasından değil, ona atıf yapan haberlerden (Evrensel, Milli Gazete, sorularlaislamiyet) — üç kaynak birbirini tuttu. Diyanet'in kendi formu oturum istediği için doğrudan çekilemedi.

## PWA testi (27 Eki 2026)

- Uygulama içindeki tarayıcı paneli (Electron) service worker kaydetmiyor; test ekransız gerçek Chrome + CDP ile yapıldı.
- Sonuç: SW kontrol ediyor, 34 dosya + 5 yazı tipi önbellekte, Chrome yüklenebilirlik hatası yok.
- Çevrimdışı: site sunucusu kapalı + sayfa interneti kesik + hava önbelleği bayat → uygulama açıldı, son veri ve "Bağlantı yok" uyarısı, namaz ve yazı tipleri yerinde.
- iPhone'da denenmedi (Safari "Ana Ekrana Ekle").
