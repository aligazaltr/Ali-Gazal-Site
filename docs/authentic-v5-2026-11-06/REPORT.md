# Ali Gazal — Authentic Experience V5

6 Kasım 2026. İnceleme tabanı: `1701231db40ab44bb125917dd4617018a5ebc899`. Üretim için birleştirme veya dağıtım yapılmadı. [PR #15](https://github.com/aligazaltr/Ali-Gazal-Site/pull/15) ayrı daldadır.

## 1. Genel sonuç

Statik mimari korunarak native YouTube kapak bağlantısı, yayın doğrulama kapısı ve üç sınırlı görsel/erişilebilirlik müdahalesi uygulandı. Fotoğraflar ve gerçek YouTube yayını sağlanmadığı için bunlar etkinleştirilmedi. Çalışma yalnızca öneri değildir; kod ve çalışan temiz önizleme vardır. Test sınırları aşağıdadır.

## 2. Gerçek geliştirmeler

- `video-links.js`: HTML üreticisi ve tarayıcı için tek HTTPS/YouTube/video kimliği/yayın kapısı. Kanal, yönlendirme sayfası, kullanıcı bilgisi, farklı port ve benzer alan adı reddedilir. Bu biçim doğrulaması videonun YouTube'da gerçekten yayımlandığını kanıtlamaz; gerçek yayının kullanıcıyla doğrulanması gerekir.
- `scripts/render-machiavelli-scene.js`, `scripts/sync-site.js`: yayımlanmış ve geçerli kayıtta native `a`, açık hedef adı, `_blank` ve `noopener noreferrer`. JS kapalıyken de çalışır. Yayın geri çekilirse bağlantı statik üretimde kaldırılır. Ana sayfanın ayrı araştırma dosyası bağlantısı korunur.
- `site.js`, `project.js` ve üç HTML tüketicisi: paylaşılan doğrulama, öncelik tutarlılığı, merkezi veriyle eşleşen linkler. Geçersiz yayımlanmış veri build'i durdurur.
- `site-data.js`: yalnızca kapak açıklaması sadeleştirildi. Gerçek video kaydı hâlâ `published: false`, URL boştur. Deney tarihi, ilkeler, dört kayıt ve sonuçlar korunur.
- `archive.css`, `machiavelli-scene.css`: aşağıdaki ölçülü müdahaleler.
- `.assetsignore`: gerekli tek yeni public modül bilinçli eklenir; toplam 33 izinli varlık. QA, fixture, kaynak içerik ve belgeler temiz dağıtıma girmez.
- `scripts/test-video-links.js`, `scripts/release-fixture.js`: üretimden ayrı test senaryoları. `scripts/v5-qa/`: yeniden üretilebilir, yalnız QA dalında yayımlanan tarayıcı düzeneği.

## 3. Görsel kalite

1. Kapak hedefi ve klavye odağı: yayımlandığında küçük izleme etiketi, iki renkli focus sınırı, focus sırasında kapağı gösterme. Hover gerekmez; araştırma yolu ayrıdır.
2. Machiavelli destek metni: mobil caption 8,48 → 11 px; kaynak notu 10,4 → 13 px; tarih/durum 11/12 px. Caption daha kısadır. Normal sahne hareketi değişmez.
3. Arşiv filtre sınırları: koyu temada opak select sınırının iç yüzeye oranı 1,9708:1 → 7,7317:1. Mevcut muted tokenı kullanılır. Arama alt çizgisi aynı tokenla güçlendirilir. Mobil kontroller önceden de 16 px idi; yeni bir font düzeltmesi gibi sunulmaz.

Karşılaştırmalar: [Machiavelli önce](evidence/machiavelli-before-dark-390.jpg) / [sonra](evidence/machiavelli-after-dark-390.jpg), [arşiv önce](evidence/archive-before-dark-390.jpg) / [sonra](evidence/archive-after-dark-390.jpg). Aynı Chrome, 390 CSS px iframe ve koyu tema. İframe'in dikey scrollbarı içerik alanından 15 px alır; fiziksel Android ekranı değildir. Makine ölçümleri üstteki QA alanında görünür. Kontrast sayısı yalnız ölçülen opak kontrol içindir; tüm gradyanların ölçümü değildir.

## 4. GitHub araçları

[TOOLS-AND-DESIGN.md](TOOLS-AND-DESIGN.md) kaynak sürümlerini, sayfa kararlarını ve riskleri içerir. Impeccable `c3bb418`, Jakub `60bf140`, Taste 2.5.0 / `9b4bf93` belgeleri okunup manuel denetime uygulandı. Kurulum, CLI, detector, AI tasarım puanı veya bağımsız çift ajan incelemesi çalıştırılmadı. GSAP, Three.js, framework, ücretli servis veya yeni font eklenmedi.

## 5. Machiavelli

Native bağlantı hazırlığı tamamlandı. Gerçek kayıtta sahte URL yoktur. Test dalındaki açıkça işaretli yayın fixture'ı yalnız sentaktik `TESTFIXTURE` kimliğini kullanır; tıklama testte yakalanır, YouTube'a gönderilmez. Bu fixture üretim/temiz önizlemede 404'tür.

Doğrudan açılan test sayfasında gerçek Shift+Tab/Enter ve pointer click yapıldı: odak kapakta, clip `none`, z-index `6`, hedef `_blank`, `noopener noreferrer`; klavye `isTrusted:true/detail:0`, pointer `isTrusted:true/detail:1`. [Ham kayıt](evidence/top-level-keyboard.json), [etkinleştirmeler](evidence/native-activations.json), [odak görüntüsü](evidence/published-keyboard.jpg). Görüntü bir yayın senaryosudur, videonun gerçek yayın duyurusu değildir. Yeni sekmede gerçek videonun oynatılması, URL verilmediği için test edilmedi.

## 6. Fotoğraflar

Onaylı gerçek portre ve 2–3 çekim/araştırma karesi yok. Sahte/stoğa dayanan resim veya boş görsel alanı eklenmedi. [REAL-MEDIA-HANDOFF.md](REAL-MEDIA-HANDOFF.md) yerleşim, dosya boyutları, alt metin, EXIF/özel bilgi kontrolü ve entegrasyon sırasını içerir.

## 7. Performans ve erişilebilirlik

Ölçüm: aynı QA origin'inde doğrudan üst seviye Chrome sayfası, 1363×936 CSS px, DPR 1, koyu tema; üç önce + üç sonra yükleme. Ağ/throttle/cold-cache kontrol edilmedi; ardışık örnekler önbellekten etkilenebilir. QA ölçüm kodu ürün varlığı değildir. [Ham ölçümler](evidence/performance.json).

| Laboratuvar gözlemi | Önce | Aday |
|---|---|---|
| LCP örnekleri, ms | 568 / 416 / 208 | 188 / 300 / 232 |
| LCP medyanı, ms | 416 | 232 |
| CLS, her örnek | 0,11776 | 0,11776 |
| Gözlenen uzun görev | 0 / 0 / 0 | 0 / 0 / 0 |

Bu küçük örnek nedensel hızlanma veya gerçek mobil Core Web Vitals başarısı kanıtı değildir. CLS 0,1'in üstünde ve her iki sürümde aynıdır; kaldırılmış gibi gösterilmez. Kapak eager/low, ilk portre high tutuldu. Yeni modül küçüktür; yeni ağır bağımlılık yok. Mevcut görünürlük/rAF/reduced-motion yönetimi incelendi; sahne controller/frames kodları yeniden yazılmadı.

Native semantik, bağlantı adı, gerçek klavye odağı ve kontrol kontrastı doğrulandı. Tam WCAG 2.2 AA uygunluğu, gerçek ekran okuyucu dinleme, alan INP ve fiziksel Android testi iddia edilmez. Native Chromium girişinde AT-SPI sağlayıcı hatası nedeniyle gerçek browser zoom/Lighthouse ölçülemedi. %200 root metin simülasyonu browser zoom değildir; sonuçları ayrıca raporlanır.

## 8. Testler

- Node v24.22.1: **62/62** geçti. Mevcut 57 + 5 anlamlı yayın/link testi.
- Merkezî veri/statik HTML, arşiv üretimi, SEO üretimi, yerel link/kimlikler ve JS sözdizimi kontrolleri geçti. Workers branch build başarılı. Temayı düğmeyle değiştirip yenileyince seçim korundu; [kayıt](evidence/theme-persistence.json).
- Normal ekran matrisi: **98/98** geçti: 7 sayfa × 7 genişlik × 2 tema; viewport, taşma, temel hedef boyutu, canonical, h1/main, tema, konsol/CSP.
- Geri dönüş: **28/28** geçti: 7 sayfa × 390/1440 × JS kapalı / JS reduced-motion simülasyonu. Simülasyon OS/CSS tercih testi yerine geçmez.
- Arşiv/paylaşım: **17/17** geçti; Türkçe arama, filtre, rastgele seçim/tekrar, hızlı seçim/odak, boş sonuç, kaynak ayrıntısı, kopya atıfları ve preview/production link ayrımı. Share/clipboard adaptörleri testte mock; gerçek WhatsApp vb. paylaşım platformları test edilmedi.
- CSP canary: inline script çalışmadı; `script-src-elem`, `disposition: enforce` görüldü. Politika yalnız Report-Only değildir.
- Temiz branch HTTP: **33/33** geçti; altı ana rota, metadata/canonical/OG, kapaklar, robots/sitemap, 404/redirect, güvenlik başlıkları ve private/test dosyalarının dışlanması. Yeni modül erişilebilir, test video/QA/belgeler 404.

Yayın animasyonu, metin büyütme ve kısa pencere sonuçları: %200 metin simülasyonunda **14/28 başarısız** (taşma). Ana sayfa ve Hakkımda'nın 390 px örneklerindeki aynı taşma main 1701231 kopyasında da ayrıca doğrulandı; diğer başarısızlıkların her biri için önce/sonra eşdeğerliği iddia edilmiyor, kısa pencerelerde **4/4** taşmasız/hatasız gözlem. Yayın davranışında **9/11 geçti**, **2/11 başarısız**: gömülü testte controller statik fallback'te kaldı, dolayısıyla directed focus z-index 6 doğrulanamadı. QA DOM enstrümantasyonu portrede `complete:true/naturalWidth:0` kaydetti. Aynı adayın doğrudan üst seviye sayfasında controller/odak/gerçek Enter ve tıklama geçti. QA yüklemeleri sıraya alındıktan sonra da bu iki başarısızlık tekrarlandı; nedeni yalnız test düzeneği diye kesinleştirilmiyor. Kullanıcıca korunan animasyon kodu bu farkı gizlemek için değiştirilmedi. [Yayın davranışı](evidence/video-behavior-final.json), [metin](evidence/text-28.json), [kısa pencere](evidence/short-windows.json). Son yayın düzeni matrisi: **20/28 geçti; 8 örnekte directed sahne koşulu geçmedi**. [Ham matris](evidence/published-layout-28-final.json). Başarısız örnekler ham sonuçlarda korunur; gizlenmez.

## 9. GitHub ve önizleme

Dal: `feature/authentic-design-and-video-integration`.
Ürün commit'leri: `9a2c89200b37e67dd631e7700b94576907934396`, `6bc8c2c9eb0ac4480471a008866e015c878db8a8`.
PR: [#15](https://github.com/aligazaltr/Ali-Gazal-Site/pull/15).
Temiz ürün önizlemesi: https://dac39239-ali-gazal-site.aliicerikmedya.workers.dev/
Machiavelli: https://dac39239-ali-gazal-site.aliicerikmedya.workers.dev/machiavelli
Bu ürün commit'inin Workers build'i: `292ce4e8-8aef-47af-b0fe-4cb95467fa57`, version `dac39239-c669-4849-980f-66ca35cf2150`.

`qa/authentic-v5-20261106` yalnız test düzeneğidir; main'e birleştirilmemelidir. QA varlık manifesti ve sentetik yayın verisi özellikle ürün manifestinden ayrıdır.

## 10. Canlı site

https://aligazal.com/ ve /machiavelli HTTP 200; HTML SHA-256'ları önceki main 1701231 ile aynı. [Kanıt](evidence/production-unchanged.json). Güncel main de 1701231 olarak doğrulandı. Hiçbir main merge, üretim deploy veya DNS işlemi yapılmadı. AG halkaları, dört açılış kelimesi, FİKİR/DENEY/SONUÇ, Machiavelli controller/frames ve gerçek final görseli korunur; [dosya hash karşılaştırması](evidence/protected-assets.json).

Mevcut enforce CSP, nosniff, SAMEORIGIN, referrer ve permissions başlıkları HTTP'de var. `_headers` politikası zayıflatılmadı. Çerez/analitik/form eklenmedi. Preview noindex; üretim canonical/OG ve sitemap `aligazal.com`.

## 11. Kalan işler

- Gerçek video yayımlandığında URL, kesin başlık, tarih, süre ve doğrulanmış chapter varsa alınmalı; merkezi veri güncellenip statik sync/test çalıştırılmalı. Şimdi yayımlanmış işaretlenmedi.
- Bir onaylı portre + 2–3 anlamı/izinleri belirtilmiş gerçek proje karesi gerekiyor.
- Alan INP/CWV, gerçek Android, Safari/Firefox, OS reduced-motion ve ekran okuyucu testi yapılamadı. Gerçek browser zoom ve Lighthouse çalıştırılamadı.
- Son DNS sorgusunda `www` NXDOMAIN; DS/DNSKEY yanıtı yok, DNSSEC doğrulanmadı. Mevcut çalışan apex'e dokunulmadı. Cloudflare panelinde www için proxy'li doğru route/custom-domain kaydı + kalıcı apex yönlendirmesi ve DNSSEC/registrar DS eşleşmesi kontrol edilmeli. WAF, hesap 2FA, yetkiler ve otomatik domain yenileme hesabın içinden doğrulanmadı; etkin diye raporlanmaz.
- Search Console sahipliği kullanıcı tarafından zaten doğrulandı; tekrar istenmiyor. Hesaba erişim olmadığı için sitemap gönderimi/indeksleme tamamlandı denmez.
- Yayın onayı yalnız kullanıcıya aittir. Geri dönüş: merge sonrası gerekirse PR'ı Git revert ile geri alıp aynı build kontrollerini çalıştır; mevcut main/son çalışan Workers version'ı tekrar yayımla. Hesap kurtarma kodları repoya konulmaz.

## 12. Son karar

**Kısmen — PR taslak kalır.** Node/HTTP/standart ekran kontrolleri temiz ve native bağlantı doğrudan tarayıcıda doğrulandı. Ancak gömülü yayın animasyonu/odak ve %200 metin büyütme kontrollerinin tamamı geçmedi; koşulsuz merge önerilmiyor. Üretim korunur. Eksik gerçek medya veya video için sahte veriyle yayın yapılmaz. Son onay olmadan PR birleştirilmez.
