# V5 technical recovery — 7 Kasım 2026

[PR #15](https://github.com/aligazaltr/Ali-Gazal-Site/pull/15). Üretim tabanı `1701231db40ab44bb125917dd4617018a5ebc899`; test edilen ürün kodu `1c2aa56504adc4f1230aad8ac1aff08052dceb45`. Main birleştirmesi, üretim dağıtımı veya DNS değişikliği yapılmadı.

## Sonuç ve yayın sınırı

Native video kapısı, geçici görsel yüklenme durumundan kurtarma, büyük metin akışı ve ilk boyama geometrisi düzeltildi. Node 64/64; statik veri, arşiv, SEO ve bağlantı kontrolleri geçti. Temiz Workers build başarılı. Kod kullanıcı incelemesine hazırdır. Kesintisiz 98/98 otomatik tarayıcı matrisi iddiası yoktur: ilk toplu turdaki 14 başarısız yükleme ayrı tekrarlarla doğrulandı. Bu test düzeneği sınırlaması aşağıda açıkça korunmaktadır. Koşulsuz üretim/merge sertifikası verilmez; son karar kullanıcıdadır.

Temiz ürün önizlemesi: https://c3a438fd-ali-gazal-site.aliicerikmedya.workers.dev/machiavelli

## 1. Görsel yüklenmesi ve sahne

Eski controller, `complete && naturalWidth === 0` anını kalıcı başarısızlık sayıyordu. QA görüntü olaylarında `load` sırasında bu geçici durum görüldü; sonrasında gerçek intrinsic genişlik oluştu. Gerçek `error` olayı ile henüz hazır olmayan metadata aynı durum değildir.

Controller artık gerçek hata durumunu izler; `error` statik okunabilir akışa geçirir, sonraki `load` yeniden ölçüp kurtarır. Kalıcı hata durumunda sahne zorlanmaz. VM testi geçici complete/0, gerçek hata ve daha sonraki yüklenmeyi ayrı doğrular. QA'da ayrıca görselin gerçek intrinsic genişliğinin oluşması beklenir. Portre, kapak, hareket yörüngesi ve easing değiştirilmedi.

İlk tanı turundaki 21/28 ve tarihsel 20/28 sonuçlar başarı diye yeniden adlandırılmadı. `recovery-published-layouts.json` ara başarısızlıkları içerir. Düzeltme sonrası yayın matrisi **28/28**, son tekrar **28/28**; davranış testi **11/11**. Test URL'si açıkça fixture'dır, gerçek video değildir ve tıklama test içinde yakalanır. Gerçek YouTube oynatımı iddia edilmez.

Gerçek Chrome klavye Enter ve pointer tıklaması da uygulandı: `isTrusted:true`, klavye detail 0, pointer detail 1. Odak gerçek native anchor üzerinde; clip `none`, z-index `6`, `_blank`, `noopener noreferrer`. [Klavye](evidence/native-keyboard-recovery.json), [etkinleştirmeler](evidence/native-activations-recovery.json).

## 2. Büyük metin

Min-content baskısı için grid çocuklarına `min-inline-size:0`; uzun sözcük ve ana başlıklara güvenli satır kırılması; dar faz satırında durum etiketine ikinci satır; dekoratif okuma çizgisine maksimum genişlik getirildi. Başlıklar kesilerek veya tüm sayfa taşması gizlenerek düzeltilmedi. Root font 24 px üzerindeyse sinematik sahne okunabilir statik akışı kullanır; olağan boyutta korunan sahne sürer.

Önceki 14/28 başarısız büyük metin senaryosu sonrası son **28/28 geçti**: 7 sayfa × 2 tema × 390/768 px. Bu **root font %200 simülasyonudur; native tarayıcı zoom testi değildir**. Ara 24/28 sonucu da ham kayıtta tutuldu.

## 3. CLS — kaynak, değişiklik ve ölçüm

LayoutShift source attribution eklendi. Önizleme bandının geç DOM eklenmesi ana içeriği yaklaşık **64,19 px**, tema düğmesinin sonradan açılması gezinmeyi yaklaşık **119,95 px**, statik→directed ilk geçiş ise başlık geometrisini yaklaşık **32,97 px** oynatıyordu. Bu değerler farklı düğümlerin rect değişimleridir; toplanıp yeni bir CLS oranı üretilmez.

Önizleme bandı altı HTML'de statik olarak var; erken origin kararı yalnız önizlemede CSS ile gösterir. JS mevcutsa tema düğmesine ilk boyamada yer ayrılır. Uygun ekran/tercihte directed geometri erken rezerve edilir; controller bu ilk durumu tüketir, fallback bunu kaldırır. JS kapalı ve hareket azaltılmış akışlar normal belge düzenindedir. CSP gevşetilmedi.

| Aynı sessiz üst seviye Chrome laboratuvarı | Önce | Recovery |
|---|---|---|
| Üç yükleme CLS | 0,117759 / 0,117759 / 0,117759 | 0 / 0 / 0 |
| LCP, ms | 380 / 260 / 176 | 188 / 208 / 176 |
| LCP medyanı, ms | 260 | 188 |

1363×936 CSS px, DPR 1, koyu tema; ağ throttling/cold-cache kontrolü yok. Önizleme bandı üretimde görünmez; bu **üretim alan verisi veya mobil hız vaadi değildir**. Field INP yok. Aynı origin'de tema değiştiren başka QA çalışmasıyla kirlenen ara ölçümler yalnız tanı dosyasında korunur; yukarıdaki karşılaştırmaya dahil edilmedi. [Kontrollü ham kayıt](evidence/performance-controlled-lab.json), [attribution tanısı](evidence/cls-attribution.json).

## 4. Gerçek tarayıcı kapsamı

| Kontrol | Gerçek sonuç |
|---|---|
| Normal düzen: 7 sayfa × 2 tema × 320/360/390/430/768/1024/1440 | İlk toplu tur 84/98; kalan 14 senaryo ayrı UI tekrarında 14/14 |
| JS kapalı / JS reduced-motion simülasyonu | 28/28 |
| Arşiv arama, filtre, random tekrar önleme, kopya/paylaşım adaptörü | 17/17 |
| Yayın fixture düzenleri | 28/28, son tekrarda da 28/28 |
| Video kapısı ve focus davranışı | 11/11 + gerçek Enter/pointer |
| Root metin %200 | 28/28 |
| Enforced CSP inline canary | Çalışmadı; `enforce` ihlali yakalandı, test geçti |
| Temiz önizleme HTTP/metadata/asset/özel dosya | 33/33 |

Toplu matrisin hataları stylesheet/theme hazır olma deadline'ları ve CSS uygulanmamış 17 px kontrollerdi; hata listesi silinmedi. Test iframe yaşam döngüsü ve CSS hazırlığı için güçlendirildi. Buna rağmen toplu otomasyon tamamen kararlı olmadı. Aynı 14 kombinasyon UI üzerinden ayrı yüklenince **aynı canonical, viewport, tema, başlık, taşma, minimum hedef ve konsol/CSP koşullarıyla** geçti. Bu, tüm senaryoların ayrı ayrı doğrulandığını gösterir; ilk turun kesintisiz geçtiğini veya ağ kaynaklı bütün nedenlerin kesin çözüldüğünü göstermez. [İlk tur](evidence/recovery-layout-ready.json), [tam tekrarlar](evidence/recovery-layout-retries.json).

Paylaşım testleri navigator adaptörüne teslim edilen payload'ı ölçer; Android yerel paylaşım sayfasını fiziksel cihazda kullanma testi değildir. JS motion tercihi simülasyonu OS/CSS media emülasyonu değildir. Fiziksel Android, native browser zoom, gerçek ekran okuyucu dinlemesi, Lighthouse ve alan Core Web Vitals yapılmadı. QA iframe'inde scrollbar içerikten 15 px alabilir; istenen dış viewport ayrıca doğrulandı.

## 5. Dağıtım ve veri güvenliği

Enforced CSP, `_headers`, `share-context.js`, robots ve sitemap korunur. `.assetsignore` 33 açık izinli ürün varlığı içerir. Test fixture'ları, QA araçları, kaynak içerik ve raporlar temiz önizlemede 404. Gerçek video `published:false`, URL boş. Tarihler, üç ilke ve dört kayıt değişmedi. Main hâlâ `1701231`; https://aligazal.com ana sayfa, Machiavelli ve Hakkımda gerçek HTML baytları bu commit'le aynı bulundu. [HTTP](evidence/v5-http-final.json), [üretim karşılaştırması](evidence/production-unchanged.json).

## 6. Geri alma / sonraki adım

Onaydan önce PR birleştirmesi ve üretim sürüm değişimi yok. Onay verilirse önce PR #15 teknik değişikliği değerlendirilmeli; V6 ayrı PR #16'dadır. Geri alma önceki main commit'ine revert PR ve mevcut Cloudflare yayın akışıyla yapılır; DNS değişimi gerekmez. Video ancak gerçek URL/başlık/tarih/süre doğrulandıktan sonra merkezi veri ve statik üreticiyle açılır.
