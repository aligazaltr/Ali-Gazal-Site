# Mahalle açılışı ve tasarım önizlemesi

Bu dal ana sayfa, Machiavelli / Prens, Kontrol Bende mi? ve Düşünce Arşivi için değerlendirme sürümüdür.

## Medya

- Açılış, ChatGPT’de oluşturulmuş iki özgün mahalle taslağından üretildi. Yatay ve dikey görüntüler ayrı kompozisyonlar. Görseller Ali Gazal'ın mahallesinde çekilmiş fotoğraflar olarak sunulmuyor.
- Geçici dosyalar `neighborhood-desktop.mp4`, `neighborhood-mobile.mp4` ve bunların WebP posterleridir. Render, taş köşeyi, sıvalı cepheyi ve sokağı farklı mesafelerde projekte eden çevrimdışı kamera hareketi kullanır. Bu bir derinlik kompoziti. H.264 dosyaları sessiz, altı saniye ve döngüsüzdür.
- Üçüncü taraf stok görsel, harici video servisi, API anahtarı veya satın alınan medya kullanılmadı. Oluşturulan çıktı için [OpenAI kullanım koşulları](https://openai.com/policies/terms-of-use/) geçerlidir. Bu, sahnenin gerçek bir mekânı belgelediği veya çıktının benzersiz olduğu iddiası değildir.
- Gerçek çekim hazır olduğunda iki MP4 ve iki poster aynı yollar üzerinden güncellenebilir. Yatay ve dikey sürümde vardığı son kadrajın benzer olması ve ilk karenin posterle eşleşmesi beklenir. Mobil ve masaüstünde metnin hizalandığı sıvalı duvar alanı korunmalıdır.
- Depodaki Machiavelli fotoğrafları, onaylı yayımlanmış kapak, proje bilgileri ve mevcut iki animasyonun uygulama dosyaları aynen kullanıldı. Portre için yeni bir tarihsel atıf yapılmadı.

## Uygulama

Menü, başlık, vaat ve keşif bağlantısı HTML'de. Hareket, ekran dışına çıkınca durur. Sistem hareketi azaltmayı istiyorsa veya veri tasarrufu bildiriyorsa poster kullanılır. Oynatma reddedilirse kullanıcı sahneyi başlatabilir. Video yüklenemezse poster, poster de yoksa okunabilir tema yüzeyi görünür. Son sahne, normal kaydırmayla açılan deney listesine bağlanır.

Deney listesi `site-data.js` üzerinden statik olarak üretilir. Video bağlantıları mevcut geçerlilik ve yayımlanma kontrolüne tabidir. Açılış sahnesinde proje veya video yayın verisi yoktur.

Düşünce Arşivi aynı kayıt, arama, filtre, keşif ve kaynak kodunu kullanır. Proje dosyalarının içerikleri, kapakları, canonical adresleri ve güvenlik başlıkları korunur.

## Kontrol

```sh
node scripts/sync-site.js --check
node scripts/build-archive.js --check
node scripts/sync-seo.js --check
node scripts/check-site.js
node --test scripts/test-*.js
```

Gerçek Android üzerinde oynatma ve performans ayrı bir onay adımıdır.
