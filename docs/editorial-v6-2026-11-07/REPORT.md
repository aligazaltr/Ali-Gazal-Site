# V6 — Cinematic Editorial Documentary

7 Kasım 2026. [PR #16](https://github.com/aligazaltr/Ali-Gazal-Site/pull/16), ürün kodu `b04d51bce835f581d58a0f206117cc8df84a861b`. V5 teknik temeli ayrı [PR #15](https://github.com/aligazaltr/Ali-Gazal-Site/pull/15)'tedir. Main/üretim değiştirilmedi.

## A. V5 durumu

Geçici görsel yüklenmesinden kurtarma, gerçek image error/load ayrımı, %200 metin akışı, native video kapısı ve ilk boyama geometrisi düzeltildi. Node **64/64**, büyük metin **28/28**, yayın düzeni **28/28**, video davranışı **11/11**, arşiv **17/17**, no-JS/reduced-JS **28/28**, enforced CSP ve temiz HTTP **33/33** geçti. Üç kontrollü laboratuvar yüklemesinde CLS **0,117759→0**. V5 raporundaki örnekler alan performansı veya fiziksel Android sonucu değildir.

Önemli sınırlama: normal toplu iframe matrisi V5'te 84/98, V6'da 88/98 geçti; yükleme/CSS hazırlığı sorunlu kalan 14/10 senaryo **aynı koşullarla tek tek** tekrar edilip tamamı geçti. Kesintisiz 98/98 tur iddiası yok. İlk başarısız kayıtlar, tekrarlar ve tanılar silinmedi. Bu otomasyon kararlılığı eksikliği raporda açık kalır.

## B. V6 görsel değişiklikleri

**Hakkımda — yazarın çalışma yazısı.** Eski manifesto/kart ritmi yerine yayın künyesi, büyük edebî tez, kişisel okuma sütunu, kenarda AG işareti, sıralı yöntem satırları ve etik kolofon. Gerçek fotoğraf olmadan tamamlanmış bir kompozisyon; boş portre kutusu yok.

**Projeler — yayın dizini.** Genel kart listesi yerine güçlü sayfa başlığı, kişisel giriş ve mevcut final kapağın baskın olduğu asimetrik birinci dosya. İkinci dosya Payot'nun gerçek okuma/araştırma aşamasını gösterir; yapılmamış deney gibi sunulmaz. Marcus yalnız arşiv bağlantısında kalır. Yeni proje uydurulmadı. İndeks, kullanıcının bu görevde açıkça izin verdiği editoryal sayısal dizindir; eski yamuk deney kartları yeniden eklenmedi.

**Machiavelli — bulgu odaklı dosya.** Korunan açılışın ardından gerçek kısa sonuç ve açılabilir sınırlamalar gelir. Tarih/durum şeridi, kompakt aşamalar ve dört bölüm bağlantısı okumayı yönlendirir. Kayıtlar tarih sütunlu bir dosya çizelgesine dönüşür. Dört gerçek kayıt, B/C kanıt sınırları, üç ilke, kaynak ayrımı ve bütün sınırlama metinleri korunur. Yöntem ve bulgu aynı şeymiş gibi sunulmaz.

Ana sayfa kelimeleri, AG halkaları, FİKİR→DENEY→SONUÇ, 4.2 portre→kapak anlatımı, final kapak, iki tema ve mevcut tokenlar korunur. Yeni framework, backend, ücretli API, font servisi, GSAP veya Three.js yok. Yeni `editorial-v6.css` yalnız üç okumalı sayfaya bağlanır; yayın manifesti 34 ürün varlığıdır. [Ürün gerçeği](../../PRODUCT.md), [tasarım kararları](../../DESIGN.md).

## C. Araçlar — bu defa gerçekten yapılanlar

| Araç | Gerçek işlem | Sınır |
|---|---|---|
| Impeccable | Kaynak `c3bb418`, skill 4.8.0; resmî engine 0.1.18 indirildi/doğrulandı; `context` ve hedef kaynak `detect` çalıştırıldı; iki bağımsız değerlendirme yapıldı | URL/CDP/headless tarama ve mutable overlay yapılmadı; otomatik AI kalite puanı üretilmedi |
| Taste 2.5.0 | Kaynak `9b4bf93`; gerçek Node layout dealer iki kompozisyon ailesi verdi: `word` / `statement`; iki çalışan alternatif tasarlandı/render edildi | Kurumsal kategori yalnız fotoğrafsız tipografi için araç vekiliydi; sabit ekran/fotoğraf kotası kopyalanmadı; retired `editorial` reçetesi kullanılmadı; Taste headless sertifikası yok |
| Jakub | Kaynak `60bf140`; interface-review/better-interface ve ilgili tipografi/layout/erişilebilirlik yönergeleri gerçek diff ve tarayıcı denetimine uygulandı | Ayrı bir CLI çalıştırılmış gibi sunulmaz |

Engine SHA256: `736ed785e74ae2344d3036127f614ddde5ab520a527d8bc82a891612ef71f648`. Araçlar ürün dışında çalıştırıldı, yeni runtime bağımlılığı oluşturmadı. [Context](context.txt), [Taste A](taste-variant-a.json), [Taste B](taste-variant-b.json).

İki ayrı değerlendirme kendi sabit V5 kaynağını ve tarayıcı sekmesini kullandı. A, detector/B sonuçlarını okumadan tamamlandı; B, A raporunu kullanmadı. [A](ASSESSMENT-A.md), [B](ASSESSMENT-B.md). A'nın 21/32 değeri insan değerlendirmesi ve yalnız uygulanabilir heuristik paydasıdır; otomatik estetik puanı veya V6 sonrası puanı değildir. Kullanıcının ayrıntılı yönü ve uygulama yetkisi bulunduğu için yeni bir görüşme/alternatif seçimiyle çalışma durdurulmadı.

Başlangıç detector komutunda üç hedefe ek olarak `.` kapsamı da vardı: **279 ham kayıt**, yinelenen hedefler ve başka dosyalar dahil. Yalnız üç hedefin bir geçişinde **56** bulgu vardı. Son dar kapsamda **63** bulgu: cramped-padding 36, undersized-ui-text 11, dark-glow 4, overused-font 3, repeating-stripes 3, tiny-text 3, italic-serif-display 2, hero-eyebrow 1. İlk/son kapsam ve tasarım bağlamı aynı olmadığından sayısal iyileşme iddiası yok. [Önce ham](detector-before.json), [sonra ham](detector-after.json).

Bu bulgular otomatik düzeltme listesi değildir. Mantıksal padding/cascade kaynaklı sıkışıklık işaretleri tarayıcı geometrisiyle değerlendirildi; body ve destek metinlerinin font boyutları kayıtlarda var. Büyük edebî serif/emphasis bu kitap merkezli sayfalarda bilinçli seçimdir. Korunan grafit/turuncu ışık, halka ve çizgiler sırf dedektör sayısı azalsın diye kaldırılmadı. Kalan küçük metadata uyarıları tüm metnin büyük/erişilebilir olduğu iddiasına dönüşmez; gerçek ekran okuyucu ve cihaz incelemesi hâlâ gereklidir.

## D. Gerçek önce/sonra ve alternatifler

Görüntüler gerçek Chrome çıktısıdır; üretilmiş mockup değildir. Masaüstü 1363×936, telefon karşılaştırması 390×740 CSS px iframe, açık tema. Telefon iframe scrollbarı 15 px iç alan kullanabilir; fiziksel Android değildir. Önceki Hakkımda/Projeler V5 gövdesi üretim tabanıyla aynı kompozisyondur. Machiavelli karşılaştırması açılıştan sonraki araştırma başlangıcını gösterir; iki sürümde aynı mutlak scroll pikseline zorlanmadı.

| Sayfa | Masaüstü | Telefon |
|---|---|---|
| Hakkımda | [Önce](evidence/about-before-desktop-light.jpg) / [Sonra](evidence/about-after-desktop-light.jpg) | [Önce](evidence/about-before-mobile-light.jpg) / [Sonra](evidence/about-after-mobile-light.jpg) |
| Projeler | [Önce](evidence/projects-before-desktop-light.jpg) / [Sonra](evidence/projects-after-desktop-light.jpg) | [Önce](evidence/projects-before-mobile-light.jpg) / [Sonra](evidence/projects-after-mobile-light.jpg) |
| Machiavelli dosyası | [Önce](evidence/dossier-before-desktop-light.jpg) / [Sonra](evidence/dossier-after-desktop-light.jpg) | [Önce](evidence/dossier-before-mobile-light.jpg) / [Sonra](evidence/dossier-after-mobile-light.jpg) |

Seçilen A: kişisel yazar yazısı + büyük kapaklı yayın açılımı. B yalnız renk farkı değildir: bölünmüş çalışma defteri ve daha kompakt proje çizelgesi. [B Hakkımda](evidence/alternative-b-about-desktop-light.jpg), [B Projeler](evidence/alternative-b-projects-desktop-light.jpg). A daha kişisel ve belgesel yayın yönüne uygundur; B'nin yoğunluğu ilk tanışmayı zayıflatıyordu. B kaynakları `scripts/v6-qa/variants` altında, ürün manifesti dışında. [Korunan açılış](evidence/protected-opening-desktop-light.jpg), [koyu tema](evidence/about-after-desktop-dark.jpg).

Mobil karşılaştırmalar ve geniş matris teknik merge `145d588` üzerindedir. Son `b04d51b` yalnız iki HTML'nin ifadelerini/metasını, el yapımı SVG oklarını ve QA/karar belgelerini tamamlar; aynı kompozisyon korunur. Son temiz sürümde masaüstü görüntüleri yeniden alındı; 33 HTTP kontrolü HTML baytlarını yerel son kaynakla eşleştirir. Bu ayrım gizlenmez.

## E. GitHub ve değişen dosyalar

V5 ayrı PR #15. V6 PR #16'nın tabanı teknik daldır; bu, aynı teknik düzeltmeleri görsel diff'te tekrar incelememek için bilinçli bir bağımlılıktır. V5 son teknik commit'i `1c2aa56`; V6 ilk görsel commit'i `e9b2ef8`, teknik temel birleştirmesi `145d588`, son ürün `b04d51b`. Sonraki rapor/evidence commit'leri public varlıkları değiştirmez.

Ürün değişiklikleri: `hakkimda.html`, `rehberler.html`, `machiavelli.html`, `editorial-v6.css`, `.assetsignore`. Merkezi kayıtlar yeniden gömülmedi; static marker/render senkronizasyonu korunur. `PRODUCT.md`, `DESIGN.md`, QA alternatifleri ve bu raporlar dağıtıma girmez.

## F. Önizleme ve doğrulama

Temiz V6: https://acf4d81c-ali-gazal-site.aliicerikmedya.workers.dev/hakkimda

Projeler: https://acf4d81c-ali-gazal-site.aliicerikmedya.workers.dev/rehberler

Dosya: https://acf4d81c-ali-gazal-site.aliicerikmedya.workers.dev/machiavelli#deney-asamasi

Cloudflare build başarılı. Node 64/64, sync-site/build-archive/sync-seo/check-site geçti. Temiz HTTP **33/33**, ek public CSS/özel V6 yolları **8/8**: doğru CSS 200, alternatifler/QA/PRODUCT/DESIGN/rapor 404. Canonical/OG/robots/sitemap resmî `https://aligazal.com`; preview response noindex. CSP enforce korunur. [HTTP](evidence/v6-http-final.json), [ek yollar](evidence/v6-http-extra.json).

V6 arşiv **17/17**, no-JS/reduced-JS **28/28**, root metin %200 **28/28**, yayın fixture **28/28**, video focus/kapı **11/11**, CSP canary geçti. Normal matris ilk 88/98 ve 10/10 ayrı tekrar yukarıda açıklanır. [İlk matris](evidence/v6-layout-ready.json), [tekrar](evidence/v6-layout-retries.json). Herhangi bir hata silinerek başarı elde edilmedi.

Temiz sayfada tema koyuya geçirildi, reload sonrası korundu, sonra inceleme için açığa döndürüldü. Ürün kaynaklı konsol hatası gözlenmedi; tarayıcı eklentisinin metadata taşıma hataları ayrı görüldü, site hatası sayılmadı. [Tarayıcı kontrolü](evidence/clean-browser-checks.json).

## G. Üretim değişmedi

Main hâlâ `1701231db40ab44bb125917dd4617018a5ebc899`. Resmî alan adının ana sayfa, Machiavelli ve Hakkımda gerçek HTML baytları bu commit'le aynı. [Doğrulama](evidence/production-unchanged.json). PR birleştirmesi, üretim version promotion veya DNS değişikliği yapılmadı.

## H. Gerçek eksikler

- Fiziksel Android/touch, native browser zoom, OS düzeyi CSS reduced-motion, gerçek ekran okuyucu dinlemesi, Lighthouse ve alan INP yapılmadı. 7 dış CSS genişlik ve iki tema iframe'de denendi.
- Toplu iframe otomasyonu tamamen kararlı değil; son normal tur başarısızlıkları ayrı tekrarlarda geçmesine rağmen kesintisiz otomasyon başarısı iddia edilmiyor. Network/CSS erken hazır olma nedeninin tamamı kesinleşmedi.
- Gerçek YouTube URL/başlık/tarih/süre yok. Ürün `published:false`/boş URL olarak kalır. Native fixture testi gerçek YouTube oynatımı değildir.
- Onaylı portre ve 2–3 araştırma karesi yok. Sahte fotoğraf, stok veya boş placeholder eklenmedi. Önceki [medya teslim planı](../authentic-v5-2026-11-06/REAL-MEDIA-HANDOFF.md) ve `DESIGN.md` gerçek 4:5 portreyi AG kenar işareti yerine, kayıtla ilgili gerçek kareleri ilgili metin yanına koymayı tarif eder. EXIF, yüz/özel bilgi izni, alt metin ve responsive boyutlar dosya geldiğinde denetlenmeli.
- Gerçek sosyal platform önizleme önbellekleri test edilmedi; metadata/görsel erişimi HTTP ile doğrulandı.

## I. İki ayrı hazır olma kararı

**V5:** Düzeltmeler ve kanıtlar teknik inceleme/onay için hazır. Bilinen uygulama senaryoları ayrı tekrarlar dahil doğrulandı; otomasyonun kesintisizliği açık sınırlamadır. Koşulsuz merge/üretim sertifikası verilmez. Main'e otomatik alınmadı.

**V6:** Belirgin üç sayfa dönüşümü, iki çalışan alternatif ve masaüstü/telefon karşılaştırmaları görsel onay için hazır. Önce V5 teknik temeli, sonra V6 ayrı değerlendirilmelidir. Kullanıcının açık onayı olmadan ikisi de canlıya alınmaz.
