# Kontrol Bende mi? — The 60 Portal V2

12 Kasım 2026. **Kullanıcı incelemesine hazır. Canlıya alınmadı.**

## A — Yeni sinematik animasyon

Tek ilerleme değeri beş bağlantılı sahneyi yönetiyor: büyük 60; sıfırın boşluğuna yaklaşma; ortak kaçış noktasına sahip dokuz sade zaman düzlemi; açılan rayların arasından oluşan KONTROL / BENDE Mİ?; aynı başlığın 16:9 editoryal çerçeveye yerleşmesi. Kaydırma mesafesi sahne yüksekliğinin 1,95 katı. Tekerlek engelleme, scroll snap, süreye bağlı açılış veya boşta çalışan döngü yok.

## B — Portal

Gerçek bir SVG açıklığı uygulandı. DejaVu Sans Condensed Bold rakamlarının vektör konturları kullanıldı; font indirilmez, lisansı bu dizindedir. Sıfırın gerçek iç konturu maskeyi oluşturur. Görünen rakam ile açıklığa aynı matris uygulanır; koridor bu açıklığın arkasında görünür. Ön katman, açıklık sahnenin tamamını kaplamadan kaybolmaz. Yalnızca büyük rakamı solduran bir geçiş değildir.

## C — Geometri

İç konturun alan merkezinin koordinatları `(934.229732, 407.262155)`. Bütün rakamın kutu merkezi kullanılmadı. Her yerleşim ölçümünde gerçek kontur 256 noktada örneklenir; örnek aralığı düşülerek güvenli bir iç yarıçap elde edilir. Gerekli ölçek, odak noktasından en uzak sahne köşesine göre hesaplanır.

Yedi genişlikte iki tema ve 11 ilerleme noktası denendi. %43 noktasında tarayıcının `isPointInFill` kontrolü sahnenin dört köşesinin de gerçek açıklık içinde olduğunu doğruladı. Rakam ve maske matrisleri aynı; ileri/geri örnekleri deterministik. İlk yükleme, yeniden ölçüm ve sahne ortasında yenileme denendi.

## D — Görsel kalite

V1, zaten görünür olan başlığın yanında 60 çizgiyi hareket ettiriyordu. V2'de sıfırın kenarları yaklaşarak görüş alanını açıyor; görünen koridor daha sonra başlığın sınırlarını oluşturuyor. Soru işareti, mevcut turuncu vurgu, tipografi ve iki tema korunuyor. Son sahne sahte thumbnail veya oynatıcı içermiyor.

## E — Performans

Gerçek tarayıcı ölçümleri `evidence/matrix-*.json` ve `matrix-summary.json` dosyalarında. Bunlar iframe ile yapılan laboratuvar gözlemleridir; saha Core Web Vitals veya Lighthouse puanı değildir.

- 14 ekran/tema çalışmasında biriken küçük layout-shift kayıtları yaklaşık **0,0009–0,0074** aralığında. İlk prototipte görülen büyük ilk yerleşim değişikliği için mevcut erken `data-scene-ready` rezervasyonu kullanıldı.
- Matris boyunca gözlenen en uzun `PerformanceObserver` long-task kaydı **53 ms**. Konsol/CSP kayıtlarında ürün hatası yok.
- İki animasyon JS dosyası toplam **7.560 bayt**; sıkıştırma ölçümleri `runtime-size.json` içinde. Yeni framework, 3D motoru, font veya resim isteği eklenmedi.
- DOM geometrisi kaydırma başına ölçülmez. Scroll olayları rAF ile birleştirilir; görünmeyen sahnede boşta döngü yok. Maskede blur/filtre yok.
- Programlı kaydırma sırasında LCP adayları da değiştiği için bunlardan normal ilk yükleme LCP puanı çıkarmadım. FPS ve GPU kare maliyeti ölçülmedi.

Fiziksel Android ve gerçek düşük güçlü bilgisayar testi yapılmadı. Ek işlem yükü denemesi, adım başına 12 ms ana iş parçacığı çalışması ekleyen açıkça etiketlenmiş QA senaryosudur; gerçek CPU yavaşlatması veya cihaz testi değildir.

## F — Testler

| Kontrol | Sonuç |
|---|---|
| `sync-site --check`, `build-archive --check`, `sync-seo --check`, `check-site` | Geçti |
| Node testleri | **84/84** |
| 320/360/390/430/768/1024/1440 px, iki tema | **14/14**, 154 ilerleme durumu; ek geri sarma ve %43 kontrolleri |
| No-JS, reduced-motion, eksik observer, büyük metin, kısa ekran, eksik motor, geç motor | **7/7** |
| Hızlı/yavaş/geri kaydırma, yatay-dikey dönüş, sahne ortasında reload, ek işlem yükü | 17 kayıt; son koşuda başarısız beklenti yok |
| Klavye odağı ve gerçek Enter ile `#deney` geçişi | Geçti; hedef üst konumu 24,3 px |
| CSP / ürün hata kayıtları | 0 ihlal / 0 hata |
| Cloudflare temiz ürün ve izole QA derlemeleri | Başarılı |

Düzeltilen test/önizleme sorunları: ilk geometri testi dar ekran alt köşelerinin kapsamını yakaladı; hesap düzeltildi. Bir önizleme isteği 1101 verdi ve tek yenilemede açıldı. QA'daki ek iframe-rAF beklemesi arka planda zaman aşımına uğradı; gereksiz bekleme kaldırıldı. Yön değiştirme beklentileri gerçek yeniden ölçüm tamamlandıktan sonra okunacak şekilde düzeltildi. İlk iç içe V1 karşılaştırma yolu 404 verdi; düz, açıkça izin verilen dosyalara taşındı. Geçersiz 404 görüntüleri teslim edilen gerçek V1 kareleriyle değiştirildi. Önceki başarısız QA denemeleri ilgili JSON dosyalarında saklanıyor.

## G — GitHub

- Dal: `feature/control-cinematic-portal-v2`.
- PR: [#19](https://github.com/aligazaltr/Ali-Gazal-Site/pull/19).
- Bağımlılık: [PR #18](https://github.com/aligazaltr/Ali-Gazal-Site/pull/18); PR tabanı onun özellik dalıdır. #18 birleştirilmedi veya değiştirilmedi.
- Korunan başlangıç/geri dönüş: `9531e92ccecae87e3ae42a6f960447fa17f9efd7`.
- Ürün kodu ve temiz önizleme commit'i: `4f707b040a9de3f53d52f1c083a298d9885391ef`. Sonraki kanıt commit'i bu raporu, görüntüleri ve QA araçlarını kaydeder; ürünün izin verilen dosyalarının aynı olduğu ayrıca denetlenir.
- Ayrı `qa/control-portal-v2-20261112` dalı yalnızca karşılaştırma/test laboratuvarıdır; main'e birleştirilmemelidir.

## H — Önizleme

[Temiz ürün önizlemesi](https://ce97e856-ali-gazal-site.aliicerikmedya.workers.dev/kontrol-bende-mi)

[İlerleme, genişlik, tema ve gerçek V1 karşılaştırması](https://fa02fb4f-ali-gazal-site.aliicerikmedya.workers.dev/portal-qa)

Her iki adres tarayıcıda açılarak doğrulandı. QA sayfası üretim manifestine dahil değildir. Ürünün mevcut CSP başlıkları korunmuştur.

## I — Görsel kanıt

390 ve 1440 px için %0/10/20/30/40/50/60/70/80/90/100 olmak üzere **22 gerçek yeni kare**; V1'in gerçek kodundan %0/30/80/100 noktalarında **8 eski kare**.

- [Masaüstü önce/sonra](evidence/comparison-1440.jpg)
- [Telefon önce/sonra](evidence/comparison-390.jpg)
- [Masaüstü 11 kare](evidence/sequence-1440.jpg)
- [Telefon 11 kare](evidence/sequence-390.jpg)
- Ham JPEG'ler ve gerçek ilerleme/matris/boyut bilgileri: `evidence/` ve `capture-metadata.json`.

Kolajlar gerçek ekran görüntülerinin görünür sahne alanlarını kırpıp yan yana dizer; yeniden çizim veya üretilmiş tasarım görseli değildir. Telefon iframe'inin alt kenarındaki bir bölüm bazı ham görüntülerde tarayıcı görünümünün dışında kalır; tam yerleşim ayrıca DOM testleriyle kontrol edildi. Ekran kaydı alınamadı. Tek kare veya kolaj, hareket kalitesini tek başına kanıtlamaz; çalışan önizleme esas inceleme aracıdır.

## J — Korunan bölümler

Girişten sonraki bütün deney dosyası başlangıç commit'iyle **bayt düzeyinde aynı**. Ayrıca 16 dosya hash'iyle koruma testi var: merkezî veri, ana sayfa, Projeler, Hakkında, Düşünce Arşivi, İrade Terbiyesi, Machiavelli motoru/CSS'si, video bağlantıları, güvenlik başlıkları, üretim manifesti ve A/C PNG/SVG taslakları.

01 Machiavelli / 02 Kontrol / 03 Payot sırası, yöntem, süre, zaman çizelgesi, sınırlılıklar, gizlilik, sonuç/video bekleme durumu değişmedi. Özel günlük içe aktarılmadı. Sonuç veya başarı grafiği üretilmedi. Gerçek YouTube URL'si hâlâ yok; yayın kapısı ve mevcut gelecekteki kapak/HTTPS video bağlantısı sistemi korunuyor. Portal finalindeki 16:9 geometri ileride gerçek görselle kullanılabilir; şu anda tipografik kalır.

## K — Canlı site

Main, son denetimde `29d99b30dd2d519dd58542909c8db1ef1602c01d` üzerinde. Bu çalışma main'e birleştirilmedi; üretim dağıtımı, DNS ve hesap güvenliği ayarlarına dokunulmadı. Üretim HTTP dosya karşılaştırması yürütme ortamında 403 ile engellendi; bu nedenle canlı dosyaların yeni byte karşılaştırması yapılmış gibi raporlanmıyor (`production-http-unverified.json`).

Geri dönüş, özellik dalındaki güvenli PR #18 commit'idir. Üretim değişmediği için bu görev kapsamında üretimde rollback gerekmiyor.

## L — Son karar

**Evet, kullanıcı incelemesine hazır.** Teknik kontroller ve gerçek kareler mevcut. Sinematik yoğunluğun son değerlendirmesi için önizlemeyi kendi telefonunda ve bilgisayarında kaydırarak incelemen gerekiyor. Canlı yayın için ayrıca açık onay beklenir; PR #18 ve #19 otomatik birleştirilmez.
