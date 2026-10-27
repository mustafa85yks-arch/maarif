// Takvim yaprağının arka yüzü için metinler. Burç, günün havası ve yemek cümleleri bu uygulama için
// yazılmış özgün metinlerdir; atasözleri ve deyimler halk malıdır.

// ---- Günün havası: esprili tek satır ----
export const GUNUN_HAVASI = {
  cumhuriyet: ['Bayraklar dalgalanıyor; bugün hava ne olursa olsun bayram havası.', 'Cumhuriyet Bayramı: balkonlar kırmızı beyaz, gönüller açık.'],
  bayram: ['Bayram havası: tatlılar hazır, misafir yolda.', 'Bugün el öpme, şeker toplama ve fazladan bir çay günü.'],
  kandil: ['Kandil akşamı; fırınlarda kandil simidi kokusu var.', 'Bu akşam kandil; bir dua, bir tatlı, bir telefon.'],
  kar: ['Kar yağıyor; İstanbul\'da bugün herkes acemi şoför.', 'Kar var: sahlep içmenin tam sırası.', 'Bugün çocuklar kardan adam, büyükler trafik derdinde.'],
  lodos: ['Lodos var, sabırlı ol; bugün herkes biraz gergin.', 'Lodos esiyor: vapur iptal, sabır seferde.', 'Lodoslu günde tartışmaya girme; rüzgar senden yana değil.'],
  saganak: ['Bugün şemsiye değil, kayık lazım.', 'Gök delindi; alt geçitler bugün havuz.', 'Sağanak var; ayakkabını değil, çizmeni seç.'],
  yagmur: ['İnce ince yağıyor; çay demlemenin tam vakti.', 'Yağmurlu gün: pencere kenarı rezerve edildi.', 'Bugün şemsiyeni unutursan, şemsiye de seni unutur.'],
  sis: ['Sis var; Boğaz bugün saklambaç oynuyor.', 'Sisli gün: vapur düdükleri konuşuyor, köprüler susuyor.'],
  poyraz: ['Poyraz kapıyı çalıyor; atkısız çıkan pişman olur.', 'Poyrazlı gün: hava temiz, kafa berrak, burun kırmızı.'],
  sicak: ['Bugün asfalt bile gölge arıyor.', 'Sıcak bastırdı; dondurmacının bayramı.', 'Klimanın en sevdiği gün bugün.'],
  soguk: ['Soğuk iliklere işliyor; bir kat daha, bir çay daha.', 'Ayaz var; burnunu koru, kalbini sıcak tut.', 'Bugün eldiveninin hatırı sorulur.'],
  bahar: ['Havada aşk kokusu var.', 'Erguvan havası: bugün herkes biraz romantik.', 'Bahar kapıda; ceketi çıkar, gönlünü aç.'],
  haftasonuGuzel: ['Tam sahile inilecek hava.', 'Bugün balkon günü; gerisi bekleyebilir.', 'Hava güzel, gün senin: bir vapur, bir simit.'],
  haftaiciGuzel: ['Bugün tam işe gidilir mi havası.', 'Hava o kadar güzel ki mesaiye haksızlık.', 'Pencereden bakıp iç geçirme günü.'],
  pazartesi: ['Pazartesi ve gri hava: ikisi birden fazla.', 'Pazartesi geldi; hava da sen de ısınmaya çalışıyorsunuz.'],
  cuma: ['Cuma geldi; hava ne olursa olsun moral yerinde.', 'Cuma havası: hafta sonu ufukta göründü.'],
  varsayilan: ['Gri bir gün; renkli bir şey giy.', 'Hava kararsız; sen kararlı ol.', 'Ne sıcak ne soğuk; tam düşünme havası.'],
};

// ---- Burç: element–hava eşleşmesi. Gün elementi: güneşli→ateş, yağışlı→su, rüzgarlı→hava, sakin→toprak ----
export const ELEMENT_AD = { ates: 'ateş', su: 'su', hava: 'hava', toprak: 'toprak' };
export const GUN_TARIFI = { ates: 'güneşli', su: 'yağışlı', hava: 'rüzgarlı', toprak: 'sakin' };

export const BURC_METIN = {
  ates: {
    ates: ['Güneş senin tarafında; bugün ne başlatsan ateşi tutuşur.', 'Güneşli gün ateş burcuna yakıt; enerjini öğlene sakla.'],
    su: ['Yağmur ateşini biraz söndürebilir; acele kararları yarına bırak.', 'Islak bir gün; sabır senin en iyi şemsiyen.'],
    hava: ['Rüzgar ateşini körüklüyor; fikirlerin hızlı yayılır, ağzından çıkana dikkat.', 'Esintili gün: cesaretin yüksek, frenini de yanına al.'],
    toprak: ['Sakin bir gün; ateşini küçük bir işe harca, büyük yangın çıkarma.', 'Hava durgun, sen değil; enerjini bir yürüyüşe dök.'],
  },
  su: {
    su: ['Yağmur senin dilinden konuşuyor; bugün sezgilerin keskin.', 'Islak gün su burcuna ev gibi; içinden geleni dinle.'],
    ates: ['Güneş seni biraz kurutabilir; bol su iç, duygularını da biriktirme.', 'Parlak gün; içine kapanma, biraz ışığa çık.'],
    hava: ['Rüzgar dalga yapıyor; küçük şeyleri büyütme, liman yakında.', 'Esintili gün; kafandaki fırtınayı bir sohbetle dindir.'],
    toprak: ['Sakin hava su gibi yatağını buldurur; yarım kalan işleri toparla.', 'Durgun gün, durgun su; derin düşüncelere iyi gelir.'],
  },
  hava: {
    hava: ['Rüzgar senin elementin; bugün söz senin, fikirler havada uçuşuyor.', 'Esintili gün tam senlik; bir telefon, yeni bir kapı açabilir.'],
    ates: ['Güneş fikirlerini aydınlatıyor; bir sohbetten güzel bir plan çıkabilir.', 'Aydınlık gün; aklındakini yazıya dökmenin sırası.'],
    su: ['Yağmur kanatlarını ıslatabilir; bugün uçmak yerine yürü, acelesiz.', 'Islak gün; kafandaki on işi ikiye indir.'],
    toprak: ['Hava durgun, sen kıpır kıpır; sabrını kısa bir yürüyüşle tazele.', 'Sakin gün sana dar gelebilir; bir arkadaşı ara.'],
  },
  toprak: {
    toprak: ['Sakin hava tam senlik: düzen, plan, sıcak bir çay.', 'Durgun gün, sağlam adımlar; bugün listeni bitirirsin.'],
    su: ['Yağmur toprağı besler; emeğinin karşılığına bir adım daha yaklaştın.', 'Islak gün bereketlidir; bugün ektiğin yarın yeşerir.'],
    ates: ['Güneş toprağı ısıtır ama kurutur da; işini bölüp dinlenmeyi unutma.', 'Parlak gün; inatla değil, keyifle çalış.'],
    hava: ['Rüzgar planlarını savurabilir; B planını cebinde taşı.', 'Esintili gün; değişikliğe direnme, yön değiştirmek de ilerlemektir.'],
  },
};

// ---- Günün sözü: atasözleri ve deyimler, havaya göre ----
export const SOZLER = {
  ruzgar: ['Rüzgar eken fırtına biçer.', 'Rüzgara göre yelken açmak.', 'Lodosun gözü yaşlı olur.'],
  yagmur: ['Damlaya damlaya göl olur.', 'Yağmurdan kaçarken doluya tutulmak.', 'Islanmış yağmurdan korkmaz.', 'Bulut olmayınca yağmur yağmaz.'],
  kis: ['Sakla samanı, gelir zamanı.', 'Zemheri zürafası.', 'Karda yürüyüp izini belli etmemek.', 'Ak akçe kara gün içindir.'],
  sicak: ['Güneş balçıkla sıvanmaz.', 'Güneş girmeyen eve doktor girer.', 'Gölge etme, başka ihsan istemem.'],
  soguk: ['Demir tavında dövülür.', 'Ak akçe kara gün içindir.', 'Sakla samanı, gelir zamanı.', 'Ateş düştüğü yeri yakar.'],
  bahar: ['Bir çiçekle bahar olmaz.', 'Mart kapıdan baktırır, kazma kürek yaktırır.', 'Gülü seven dikenine katlanır.', 'Ağaç yaşken eğilir.'],
  guz: ['Civcivler güzün sayılır.', 'Ne ekersen onu biçersin.', 'Sakla samanı, gelir zamanı.', 'Her gecenin bir sabahı vardır.'],
  genel: ['Sabreden derviş muradına ermiş.', 'Az olsun, öz olsun.', 'Her gecenin bir sabahı vardır.', 'Bugünün işini yarına bırakma.', 'Tatlı dil yılanı deliğinden çıkarır.'],
};

// ---- Yemek önerisi ----
// Ay ay İstanbul balığı (genel mevsim bilgisi)
export const MEVSIM_BALIGI = {
  1: 'hamsi', 2: 'hamsi', 3: 'istavrit', 4: 'istavrit', 5: 'sardalya', 6: 'sardalya',
  7: 'sardalya', 8: 'sardalya', 9: 'palamut', 10: 'palamut', 11: 'hamsi', 12: 'hamsi',
};

export const YEMEKLER = {
  ramazan: ['İftarda mercimek çorbası, ardından fırın sütlaç.', 'İftara ezogelin, sahura menemen.', 'İftarda tarhana çorbası, tatlıya güllaç.'],
  soguk: ['Tarhana çorbası, yanına kızarmış ekmek.', 'Etli kuru fasulye ve pirinç pilavı.', 'Akşama sıcak bir sahlep, üstüne tarçın.', 'Etli nohut, yanında turşu.'],
  lodos: ['Lodos var; {balik} tava ve roka salatası tam yerinde.', 'Lodos esiyor; bugün sofrada {balik} olsun, yanında bol limon.'],
  yagmur: ['Mercimek çorbası, yanında sıcak pide.', 'Ezogelin çorbası ve bir dilim limon.', 'Yağmurlu güne mantı yakışır; bol yoğurt, bol pul biber.'],
  kestane: ['Akşamüstü bir kese kestane kebap.'],
  sicak: ['Zeytinyağlı taze fasulye, yanında cacık.', 'Soğuk ayran ve kısır; ağır yemeğe gerek yok.', 'Akşama karpuz-peynir, başka şey isteme.', 'Zeytinyağlı barbunya ve bir tabak çoban salata.'],
  bahar: ['Zeytinyağlı enginar; bahar sofraya böyle gelir.', 'Taze bakla ve dereotlu yoğurt.'],
  guzel: ['Sahilde {balik} ekmek ve bir bardak şalgam.', 'Kahvaltıda menemen, yanında demli çay.', 'Öğlene su böreği, yanına ayran.'],
  varsayilan: ['Fırında tavuk ve bulgur pilavı.', 'Karnıyarık ve cacık.', 'İzmir köfte, yanında pilav.', 'Sebzeli bulgur pilavı ve yoğurt.'],
};
