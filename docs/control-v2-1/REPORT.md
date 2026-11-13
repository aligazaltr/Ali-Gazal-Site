# Control V2.1 — Son görsel düzeltme

13 Kasım 2026. **PR #19 üzerinde, yalnızca önizleme. Canlı yayın yapılmadı.**

## A — Mobil karelenme

**Görünen bir dikdörtgen kesilme kaynağı doğrulandı; telefondaki bütün kırılmaların nedeni kesinleştirilmedi.** Üst etiketlerin ve alt bağlantının düz arka planları, büyüyen rakamın üstünü dikdörtgenler halinde örtüyordu. Ardışık gerçek tarayıcı karelerinde bu örtüşme görüldü. Bu kutular kaldırıldı; kontrast, yalnızca yazının çevresinde 1 px, bulanıklık içermeyen kenar gölgesiyle korunuyor. Son DOM kontrolünde üç öğenin de arka planı tamamen şeffaf (`labels.json`). Rakam bulanıklaştırılmadı.

İkinci olarak luminance maskesi kaldırıldı. Aynı gerçek sıfır konturu `clipPath` içinde kullanılıyor. Rakam ve açıklık, büyütülen grup katmanı yerine sahne koordinatlarına dönüştürülmüş vektör yolları olarak çiziliyor. Orijinal kontur, merkez, ölçek hesabı ve kamera ritmi değişmedi. Konturlar bir kez ayrıştırılıyor; her karede yalnızca affine koordinatları güncelleniyor. Ayrı alfa/luminance maskesi ve büyüyen grup dönüşümü gerekmiyor.

Bu, alternatif bir çizim yolu ve doğrulanmış kutu örtüşmesi düzeltmesidir; kullanıcının cihazındaki GPU/compositor arızasının kesin teşhisi olarak sunulmuyor. Maske/birleştirme ayrımı için [W3C CSS Masking](https://www.w3.org/TR/css-masking-1/) ve [Chromium compositor belgesi](https://github.com/chromium/chromium/blob/main/docs/how_cc_works.md) incelendi. Bu belgeler belirli bir telefondaki nedeni tek başına kanıtlamaz.

**Gerçek test ortamı:** masaüstü Chrome, iframe içinde gerçek CSS genişlikleri ve doğal scroll olayları. Gerçek browser `devicePixelRatio=1`. Fiziksel Android Chrome ve mobil Firefox erişimi yoktu. Eski sürümde kullanıcının bildirdiği GPU benzeri yırtılmayı bu ortamda yeniden üretemedim.

**Yoğunluk karşılaştırması:** 360/390/430 px, iki tema, üç yaklaşma noktası ve 1x/2x/3x raster boyutu: 54 eski/yeni çift. Gerçek SVG konturları aynı düz arka plan üzerinde izole edilerek tarayıcı canvas'ına çizildi. En büyük renk kanalı farkı 10/255; 24/255 üzerindeki fark oranı bütün çiftlerde sıfır. Bu test kontur eşdeğerliğini destekler; gerçek cihaz DPR'sini değiştirmez ve Android GPU karo davranışını test etmez (`density.json`).

## B — Zaman koridoru

Dokuz yaklaşan dikdörtgen düzlem kaldırıldı. Açıklığın arkasında, aynı kaçış merkezinden genişleyen tek ve yumuşak bir radyal ışık/gölge alanı var. Mevcut `--surface`, `--surface-strong`, `--bg-raised` ve `--bg` kullanılıyor; yeni palet, neon, filtre veya blur yok. Bu alan soru oluşurken sakin biçimde söner, finalde opaklığı sıfır olur. Ayrı bir sahne veya yeni içerik eklenmedi.

## C — Çizgiler

`.portal-gate`, `.portal-rays`, `.portal-horizon` ve `.portal-rails` DOM öğeleri kaldırıldı. Bunların CSS kuralları, projeksiyon, ışın/haç ve ray koordinatı hesapları da temizlendi. Başlığın yatay açılma sınırı ve harf hareketi çizgiler olmadan aynen devam ediyor. Ölçüm için tutulan orijinal sıfır konturu hâlâ controller tarafından kullanılıyor; ölü bir görsel katman değildir.

## D — Metin

“Zamanın görsel bir yorumu. Sonuç veya başarı göstergesi değildir.” metni `scripts/render-control-scene.js` kaynağından silindi; `sync-site` ile HTML yeniden üretildi. Boş `<small>` veya bu öğeye ait CSS kalmadı. **Deney dosyasını oku ↓** bağlantısı, dokunma alanı ve klavye odağı korundu. Araştırma dosyasının metodolojik sınırlılıkları değiştirilmedi.

## E — Arka plan

Eski giriş düz `--bg` kullanırken body turuncu radyal vurgu ve tekrarlanan çizgi dokusu taşıyordu; gerçek eski/yeni stil ve görüntülerle karşılaştırıldı. Yalnızca `body[data-project="kontrol-bende-mi"]` mevcut `--bg` tabanına eşitlendi. Sahne, çevre boşluklar ve araştırma dosyası aynı tabanı paylaşıyor. Koyu grafit ve sıcak açık krem korunuyor. Geçişin iç ışığı finalden önce sıfırlanıyor.

Genel `styles.css`, tema değişkenleri, ana sayfa ve diğer projelerin arka planları değiştirilmedi. Giriş sonu ve dosya görüntüleri ile gerçek computed-style kayıtları `join.json` ve `dossier-*.jpg` içinde. İlk konum okumaları smooth-scroll sırasında alınmıştı; son görüntüler iki hedef de 24,17 px konumuna yerleştikten sonra yenilendi.

## F — Korunan sahneler

- Onaylı V2 motoruyla 5 genişlik × 201 ilerleme noktası = **1.005 örnekte** kamera matrisi, merkez, ölçek, başlık ölçüsü, konumu, açılma miktarı ve final çerçevesi birebir eşleşiyor.
- Bütün özgün kontur kontrol noktaları yeni vektör çizimine en fazla 0,000051 CSS px yuvarlama farkıyla taşınıyor.
- Devasa 60'ın konturu, tipografisi ve başlangıç yerleşimi, sıfıra yaklaşma, başlık açılışı, soru işareti, final ve 1,95 sahne yüksekliğindeki scroll mesafesi korundu.
- Girişten sonraki bütün araştırma dosyası, önceki güvenli sürümle bayt düzeyinde aynı. 16 korunan dosyanın hash testi geçiyor: merkezî veri, proje sırası, diğer sayfalar, Machiavelli motoru, güvenlik başlıkları, yayın manifesti ve A/C taslakları.
- Özel günlük veya yeni sonuç/istatistik eklenmedi. Video yayın durumu ve YouTube bağlantısı değiştirilmedi.

## G — Testler

| Kontrol | Sonuç |
|---|---|
| `sync-site --check`, `build-archive --check`, `sync-seo --check`, `check-site` | Geçti |
| Node testleri | **87/87** |
| Son CSS ile 360/390/430/1024/1440 px, iki tema, 11 ilerleme noktası | **110 durum**, başarısız sonuç yok; ek geri sarma ve %43 köşe kapsamı kontrolleri |
| No-JS, reduced-motion, eksik observer, büyük metin, kısa ekran, eksik/geç motor | **7/7** |
| Hızlı/yavaş ileri ve geri kaydırma, yatay-dikey dönüş, sahne ortasında reload, kontrollü ek işlem yükü | **17 kayıt**, başarısız beklenti yok |
| Klavye odağı, dosya bağlantısı ve gerçek hedefe geçiş | Geçti; hedef konumu 24,17 px |
| Ürün konsol/CSP kayıtları | 0 hata / 0 ihlal |
| Yoğunluk karşılaştırması | **54 çift**, geometrik görüntü farkı en fazla 10/255 |
| Cloudflare ürün ve ayrı QA derlemesi | Başarılı |

87 test içindeki yeni kontroller, onaylı V2 hareketini ve vektör kontrol noktalarını koruyor; silinen öğelerin geri gelmesini, kaynak renderer'da metnin kalmasını ve etiket kutularının tekrar eklenmesini engelliyor. Test gereksinimleri gevşetilmedi.

Son 110 durum sırasında long-task gözlemcisi kayıt üretmedi; bu FPS veya gerçek cihaz performansı garantisi değildir. Gerçek FPS/GPU ölçümü, Android/Firefox ve gerçek cihaz piksel yoğunluğu testi yapılmadı. Önceki karelenme bu ortamda üretilemediği için “bütün cihazlarda kesin çözüldü” sonucu verilmiyor.

## H — GitHub

Mevcut dal: `feature/control-cinematic-portal-v2`.

Güncellenen PR: [#19](https://github.com/aligazaltr/Ali-Gazal-Site/pull/19).

Geri dönüş / onaylı V2: `80d449b095bd0f578b72da762a218b2200c538e7`.

V2.1 çizim düzeltmesi: `f0f1cb4fddebdf7c9d06a6fc178536f538c3685f`.

Son görsel kod, kutu örtüşmesi düzeltmesi: `3f83b334b2c29db9159b46e06c6f1179a8633765`.

Bu raporu içeren sonraki commit kanıtları kaydeder. PR #18 silinmedi, değiştirilmedi veya birleştirilmedi. PR #19 aynı geçmiş üzerinde devam ediyor. Ayrı QA dalı `qa/control-portal-v21-20261113`, üretime birleştirilecek bir dal değildir.

## I — Önizleme ve görsel kanıt

[Yeni temiz ürün önizlemesi](https://47ec40b6-ali-gazal-site.aliicerikmedya.workers.dev/kontrol-bende-mi)

[V2 / V2.1 karşılaştırması ve test kontrolleri](https://dece1234-ali-gazal-site.aliicerikmedya.workers.dev/portal-qa)

İki adres de gerçek tarayıcıda açılarak doğrulandı. Sonraki kanıt commit'i ürüne yeni davranış eklemez.

- [Masaüstü koyu tema: önce/sonra](evidence/comparison-1440.jpg)
- [Mobil açık tema: önce/sonra](evidence/comparison-390.jpg)
- [Mobil yaklaşma: 12 ardışık scroll konumu](evidence/approach-sequence.jpg)
- 32 ham sahne karesi, iki dosya görüntüsü, ilk ürün görünümü ve konum/geometri kayıtları `evidence/` içinde.

Kolajlar gerçek tarayıcı görüntülerinin görünür sahne alanını kırpıp yan yana dizer; üretilmiş maket değildir. Özellikle telefon iframe'inin en alt kısmı bazı ham karelerde görünüm dışında kalır; tam yerleşim ayrıca DOM testleriyle denetlendi. Ardışık kareler kontrollü scroll konumlarıdır; kesintisiz hareket videosu olarak sunulmuyor. Gerçek ekran kaydı alınamadı.

## J — Kalan sorunlar ve karar

**Kullanıcı incelemesine hazır; fiziksel mobil karelenmenin bütünü henüz doğrulanmış biçimde kapatılmış değil.** Görünen dikdörtgen kutu örtüşmesi düzeltildi. Maskesiz çizim yolu, aynı hareketi ve konturu koruyarak devreye alındı. Ancak Android Chrome ve mobil Firefox'ta gerçek cihaz onayı gerekiyor.

Yeni önizlemede özellikle yaklaşık %10–43 arasını yavaş ileri/geri kaydırarak denemek önemli. Karelenme sürüyorsa kısa gerçek ekran kaydı, kullanılan tarayıcı/sürüm ve açık/koyu tema bilgisi kalan sorunu daraltacaktır. Kullanıcıdan özel günlük, parola veya hesap erişimi gerekmiyor.

**Main'e merge, üretim dağıtımı, DNS veya hesap güvenliği değişikliği yapılmadı.** Yeni tasarım, framework, thumbnail veya deney verisi üretilmedi. Canlıya alma için ayrıca açık onay gereklidir.
