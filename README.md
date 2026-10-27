# Maarif

İstanbul için mobil öncelikli hava durumu ve dijital Saatli Maarif Takvimi yaprağı.

- Hava: Open-Meteo (ECMWF, ICON, GFS ortancası), hava kalitesi ve polen (CAMS)
- Namaz vakitleri: adhan.js, Diyanet vakitlerine göre düzeltilmiş (fark en çok 1 dk)
- Takvim: Hicri/Rumi tarih, kandiller, bayramlar, resmi tatiller, Ramazan geri sayımı
- Yaprağın arkası: günün havası, atasözü, burç, sofra önerisi, tarihte bugün (Vikipedi)

Sunucu yok, API anahtarı yok. Ayarlar yalnızca tarayıcının localStorage'ında durur, hiçbir yere gönderilmez.

Yerelde çalıştırmak için:

```
python3 -m http.server 8765
```

Ayrıntılar ve bakım notları: [PROJE.md](PROJE.md)
