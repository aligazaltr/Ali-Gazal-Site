# Cinematic Experience 4.1 — teslim ve inceleme

Bu çalışma PR #12 üzerinde 4.0'ın ardından yapıldı. Canlı 3.0 korunur; 4.1 için yayın yetkisi verilmedi.

1. **AG halkaları:** Geri geldi. Ana sayfadaki kâğıt/dosya yapraklarının yerini üç geometrik halka ve ortadaki AG aldı.
2. **AG hareketi:** Aynı halkalar FİKİR'de dengeli elipsler, DENEY'de karşılaşan halkalar, SONUÇ'ta ortak merkezli çemberler oluşturur. Hareket yalnız sahne değişiminde çalışır; sürekli dönme yoktur. Kesilen hareket mevcut görsel konumdan devam eder.
3. **Korunan 4.0 yazıları:** Girişteki 520 ms / 105 ms sıra, ortak easing, 560/720 ms maskeli metin görünüşleri korundu. DÜŞÜN–SORGULA–DENE–KEŞFET kompozisyonu aynı kaldı.
4. **Küçük dosyalar:** `idea-folio`, `folio-leaf` ve ilgili üretim/stiller kaldırıldı.
5. **Giriş bağlantısı:** Görünür KEŞFET satırı kaydırmayla hafifçe küçülüp yer değiştirir; hikâye başlığında aynı turuncu çizgi uzar. Mobil tek sütunda çizgi bağlantıyı taşır. Kaydırma kilitlenmez; görünmeyen bağlantılar için sürekli bir animasyon döngüsü çalışmaz.
6. **Machiavelli kartları:** Üç sahnelik ikinci sunum, küçük ilke/kayıt panelleri ve tekrar eden kapak kaldırıldı. Mevcut araştırma bölümleri, dört anonim kayıt ve kanıt sınırları korunur.
7. **Yeni açılış:** Büyük MACHIAVELLI, italik PRENS, tek gerçek kapak ve kısa açıklama. Başlık/alt başlık/kapak sıralı açılır; kapak görünürken kaydırmada çok hafif ölçek ve konum değişir. Yeni bir resim üretilmedi.
8. **Büyük tipografi:** Mevcut hikâyenin FİKİR–DENEY–SONUÇ etiketlerinde. Önceki kelime aynı maskeden yukarı çıkarken yenisi aşağıdan yerleşir. Mobilde büyük yerel etiket halka ile aynı sahnede görünür. Ek bölüm veya uzun kaydırma eklenmedi.
9. **Sayfa çevirme:** 180 ms çıkıştan sonra kâğıt yüzeyi süpürür; maskeli metin, yazar ve kaynak sıralı görünür. Hareket yaklaşık 780 ms'de durur. İlk seçimde çıkış beklenmez. Kısa/uzun alıntı için tipografi ayarlanır; hızlı tıklamada son seçim kazanır.
10. **Mobil:** 320, 360, 375, 390, 430, 768, 1024, 1440 px genişlikler; iki tema. Gerçek Chrome içindeki boyutlandırılmış viewport testidir; fiziksel Android değildir. İlk prototipteki 8 px halka taşması düzeltilmiştir.
11. **Performans:** Yeni bağımlılık, görsel veya harici istek eklenmedi. `asset-budget.json` ham/gzip farklarını içerir. Animasyonlar sınırlı WAAPI ve görünürlükle çalışan scroll/rAF kullanır. Güvenilir saha LCP/INP veya düşük donanımlı cihaz ölçümü olmadan hız garantisi verilmez.
12. **Dosyalar:** `signature.css`, `motion.js`, `archive.js`, `archive.css`, `index.html`, `machiavelli.html`, `scripts/render-scenes.js`, `scripts/sync-site.js`, `scripts/test-motion.js`; bu rapor, sahne kararları ve test kanıtları. Geçici QA araçları son teslimden kaldırıldı.
13. **Otomatik kontroller:** 42 Node testi; statik veri senkronizasyonu, arşiv üretimi, yerel bağlantılar, canonical, başlıklar ve yayın kapıları temiz. 96 düzen, 18 AG sahne, 12 JavaScript kapalı görünüm ve son arşiv düzeltmesi üzerinde 12 davranış kontrolü geçti. Kaynaklı metin/bağlantı/yerel paylaşım verileri test ikameleriyle kontrol edildi; gerçek cihaz paylaşımı değildir. Giriş bağlantısının transform değişimi ölçüldü. Sonuçlar aynı klasördeki kanıt dosyalarındadır.
14. **Yapılamayanlar:** Fiziksel Android/iPhone, Safari, gerçek ekran okuyucu kullanımı, gerçek cihazın yerel paylaşım menüsü ve saha Core Web Vitals ölçümü. Azaltılmış hareketin JS dalı tarayıcıda simüle edildi: 0 WAAPI çağrısı, düşünce anında görünür. Bu simülasyon CSS medya sorgusunu değiştirmez (anlık kayıtta 1 normal CSS geçişi vardı); gerçek işletim sistemi tercihi test edilmedi. CSS azaltma kuralı kaynakta korunuyor.
15. **Commit:** Prototip `40b5060`; ana 4.1 uygulaması `9b473f4`. Son temiz teslim commit'i PR #12'nin en son commit'idir.
16. **PR:** https://github.com/aligazaltr/Ali-Gazal-Site/pull/12 — `feature/cinematic-signature-experience-v4`.
17. **Önizleme:** https://feature-cinematic-signature-experience-v4-ali-gazal-site.aliicerikmedya.workers.dev/ — son temiz sürüm doğrulaması PR açıklamasına kaydedilir.
18. **Canlı:** Değiştirilmedi. `main` başlangıçta `9f61f699e2c5364c5e7db6e12e6566ca08d4c350`.
19. **İncelemen gerekenler:** Ana sayfayı normal hızda kaydırarak AG'nin üç durumunu; Machiavelli'nin tek açılışını; arşivde art arda iki düşünce keşfini; telefonda açık temayı dene.
20. **Sınır:** Ağır 3D sayfa simülasyonu, sürekli dönen halkalar veya yeni sahne kartları eklenmedi. Standart sayfa gezinmesi korunur; daha önce hata veren çapraz sayfa View Transition API geri getirilmedi.

## Görsel karşılaştırma

| Alan | 3.0 | 4.0 | 4.1 |
| --- | --- | --- | --- |
| İmza | Küçük AG, üç halka, kutulu ortak sahne | Kâğıt yaprakları | Büyük AG, kutusuz geometrik kompozisyon |
| Mobil hikâye | Yerel geometrik küçük işaretler | Yerel kâğıt minyatürleri | Görünür AG ve büyük sahne etiketi |
| Machiavelli | Başlık ve kapak iki sütun | Ek üç sahne, kayıt/ilke panelleri | Tek büyük başlık ve gerçek kapak; doğrudan araştırma |
| Keşif | Metin geçişi | Kâğıt kenarı ve metin görünüşü | Sayfa yüzeyi hareketi + uzunluğa göre metin |

3.0 canlı tarayıcı görünümü ve 4.0'ın mevcut teslim ekran görüntüleri karşılaştırma referansıdır. 4.1'in ilk iki sahnesi `e3e9fc88` prototipinde telefon ve masaüstünde incelendikten sonra kalan sahneler uygulandı. Görsel tercihin son değerlendirmesi kullanıcıya aittir.

## Düzeltme ve doğrulama izi

- İlk prototip `40b5060`: AG ve giriş, gerçek masaüstü/telefon görsel kontrolü.
- `9b473f4` / `f7099502`: 96 düzen, 18 sahne, 12 JS kapalı, arşiv ve paylaşım kontrolleri.
- `ae58b21` / `7e367ce7`: sayfa katmanının başlangıç transformu görünürlük kontrolüne takılıyordu; taban konumu düzeltilerek 5 gerçek sayfa yüzeyi animasyonu, 0 hata ve hareket sonunda 0 aktif animasyon kaydedildi. Arşivdeki 12 davranış kontrolü yeniden geçti.
- Sahne taraması 390 ve 1440 px genişliklerde 480/640/900 px yükseklikleri içerir. Düzen matrisi 740 px yüksekliktedir.
