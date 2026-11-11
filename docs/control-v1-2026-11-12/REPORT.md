# Kontrol Bende mi? — inceleme teslimi

12 Kasım 2026. Üretim V6.1 korunmuştur. Bu çalışma canlıya alma onayı bekleyen PR #18'dir.

## A — Genel sonuç

Yeni statik deney dosyası, merkezi kayıt, proje sıralaması, iki sinematik açılış, minimal zaman çizelgesi, A/C kapak taslakları ve SEO entegrasyonu hazır. Yeni framework, backend, hesap, izleme veya ücretli servis eklenmedi.

## B — Sinematik tasarım

1. **Editorial Control:** 60 ince çizgili yatay kompozisyon; büyük zaman vurgusu, sonra ana soruya odak. Birincil adayım bu: mevcut editoryal V6 ile daha sakin ve tutarlı.
2. **Cinematic Control:** açık saat kompozisyonu; altmış çizgi çevrede hareket ederken tipografi öne gelir. Aynı animasyonun renk varyantı değildir.

Çizgiler dekoratif zaman metaforudur; başarılı gün, günlük olay veya sonuç grafiği değildir. Machiavelli'nin portre-kapak motoru değiştirilmedi.

[Beş gerçek mobil kaydırma karesi](evidence/editorial-five-states.jpg) · [İkinci açılışın üç gerçek karesi](evidence/cinematic-three-states.jpg)

Son tablet incelemesinde ikinci açılışın GÜN etiketi sorudan ayrıldı. Bu değişiklik sonrasında 768 px açık temada 0/50/100% kareleri yeniden incelendi. Son bağlantı işaretlerinde mevcut sitenin SVG okları kullanıldı.

## C — Thumbnail

- [A / psikolojik belgesel taslağı](thumbnail-A.png): 1280×720; gerçek portre için açıkça işaretlenmiş boş yer. Fotoğraf gelmeden final kapak değildir.
- [C / minimal sinematik taslak](thumbnail-C.png): 1280×720; tamamen tipografik ve daha boşluklu.
- SVG kaynakları ve tekrar üretilebilir grafik betiği saklandı. Kullanıcının yüzü üretilmedi, başka bir yüz veya eski fotoğraf kullanılmadı. Bu taslaklar ürün dağıtımına dahil değildir.
- Sitedeki paylaşım grafiği bunlardan bağımsız, nötr bir proje görselidir. Bir video yayını ima etmez. Görsel performans/CTR puanı veya yayımlanmamış bir videoya ait analiz uydurulmadı.

## D — Projeler sayfası

**01 Machiavelli → 02 Kontrol Bende mi? → 03 Jules Payot / İrade Terbiyesi.**

Mevcut düz editoryal dizin korundu. Yeni proje gerçek bir dosya bağlantısına sahip. Payot sayfasında yalnızca video projesinin sıra etiketi üçüncü olarak değişti; araştırma kayıtları korundu.

## E — Yeni proje dosyası

Deney sorusu, neden 60 gün, genel ölçüm yöntemi, dört native açılır dönem açıklaması, yayımlanmamış sonuç, video durumu ve sınırlılıklar çalışıyor. Dönüm noktaları yalnızca onaylı genel dönem kapsamını anlatır. Gizli günlük verisi veya gün bazlı başarı işareti yok.

Durum **Deney devam ediyor**. 21 Eylül başlangıcı ve 19 Kasım planlanan 60. gün. Tamamlanma takvimden otomatik üretilmez. Video URL'si/başlığı/süresi/tarihi boş, `published: false`; sonuç ve kanıt alanları kapalı.

Gelecekte gerçek video ve final kapak sağlandığında standart HTTPS YouTube bağlantısı kullanılır; kapak tıklanır ve dosya ayrı kalır. Gerçek video olmadığı için telefonun YouTube uygulamasını açma davranışı fiziksel cihazda doğrulanmadı.

## F — Gizlilik

Yalnızca bu görevde izin verilen proje kimliği, genel amaç, süre, tarihler ve genel yöntem kullanıldı. Özel günlük dosyaları bu çalışmaya alınmadı. Kişisel olay, ruh hâli, özel tetikleyici/ortam/cihaz bilgisi, başka kişiler veya onaylanmamış istatistikler kod, test, PR ya da dağıtıma taşınmadı.

Ürün izin listesi yalnızca yeni ana sayfayı, küçük sahne dosyalarını ve nötr paylaşım görselini ekler. İnceleme sayfaları, alternatif HTML, A/C taslakları, belgeler ve testler temiz ürün önizlemesinde 404 döner.

## G — Teknik kalite ve gerçek testler

| Kontrol | Sonuç |
| --- | --- |
| sync-site / build-archive / sync-seo / check-site | Geçti |
| Node | **75/75** |
| İki kompozisyon × 7 genişlik × 2 tema | **28/28** |
| Kaydırma örnekleri | **140**, ayrıca ileri/geri karşılaştırmaları |
| Genişlikler | 320, 360, 390, 430, 768, 1024, 1440 px |
| JavaScript kapalı, reduced-motion simülasyonu, Observer yokluğu, büyük metin, kısa ekran, yeniden boyutlandırma | **6/6**, son sahne sürümünde |
| Native dönem açıklamaları | 4; gerçek Enter ile açılma ve görünür klavye odağı doğrulandı |
| Paylaşım | Doğru önizleme kapsamı ve kopyalandı geri bildirimi; pano köprüsünden geri okuma doğrulanamadı |
| İlk temiz önizlemede HTTP | **33 + 11** kontrol geçti |
| Son tipografi sürümünde kritik HTTP | **9/9** |
| Üretim koruması | Ana sayfa, Machiavelli HTML'i ve 3 sinematik varlık V6.1 ile aynı |

Tam ekran matrisi `e8534adf` inceleme sürümünde yürütüldü. Son caption düzeltmesinin hedefli gerçek kareleri ve altı geri dönüş testi `31d1bc1a` sürümünde tekrarlandı. SVG ok düzeltmesi statik üretim ve Node kontrollerinden geçti. İlk yerel önizleme koşusu paylaşılan ortam başka uygulamaya geçtiği için kullanılmadı; nihai ölçümler Cloudflare inceleme ortamından alındı.

Bunlar Chromium içindeki gerçek render ve viewport/capability emülasyonlarıdır. Fiziksel Android/iOS/CNC donanımı, gerçek işletim sistemi paylaşım menüsü, Safari ve Lighthouse/alan performansı ölçümü yapılmadı. JS sahne kodu toplam yaklaşık 3 KB; opacity/transform kullanıyor, sürekli çalışan animasyon döngüsü yok. Bu boyut bir hız puanı değildir.

Koyu/açık tema, statik içerik, bir H1, canonical, Open Graph, sitemap, yerel bağlantılar, CSP ve dağıtım izinleri denetlendi. CSP zayıflatılmadı. Harici sosyal uygulamaların gerçek önizleme önbellekleri test edilmedi.

## H — GitHub

[PR #18](https://github.com/aligazaltr/Ali-Gazal-Site/pull/18)

Dal: `feature/control-experiment-cinematic-v1`. Ayrı, birleştirilmeyecek inceleme dalı: `qa/control-cinematic-v1-20261112`.

Kod ve ölçüm kaynakları bu PR'dadır. Son commit SHA'sı PR başlığında ve teslim mesajında bulunur. Ana dal değiştirilmedi.

## I — Açılabilir önizlemeler

- [Birincil açılış ve yeni dosya](https://feature-control-experiment-cinematic-v1-ali-gazal-site.aliicerikmedya.workers.dev/kontrol-bende-mi)
- [İkinci sinematik açılış](https://qa-control-cinematic-v1-20261112-ali-gazal-site.aliicerikmedya.workers.dev/control-alternative)
- [Yeni proje dizini](https://feature-control-experiment-cinematic-v1-ali-gazal-site.aliicerikmedya.workers.dev/rehberler)
- [İki tasarımı ve A/C kapakları karşılaştır](https://qa-control-cinematic-v1-20261112-ali-gazal-site.aliicerikmedya.workers.dev/control-qa)

İnceleme araçları yalnızca ayrı QA dalındadır; üretime alınacak manifestte bulunmaz. Önizlemeler noindex olarak sunuluyor. Canonical resmî `aligazal.com` adresini tarif eder; paylaşım düğmesi varsayılan olarak içinde bulunulan önizlemeyi paylaşır.

## J — Kalan materyaller

A için gerçek portre; ileride gerçek YouTube URL'si, kesin başlık/yayın tarihi/süre ve onaylı final kapak; deneyden sonra yalnızca paylaşılmasına izin verilen anonim sonuç özeti. Bunlar sayfanın bugünkü incelemesini engellemiyor.

## K — Canlı site

**Değişmedi.** Üretim V6.1 tabanı `29d99b30dd2d519dd58542909c8db1ef1602c01d`. PR birleştirilmedi, üretim dağıtımı başlatılmadı, DNS/hesap güvenliği ayarları değiştirilmedi.

## L — Son karar

**Kullanıcı incelemesine hazır.** Birincil aday Editorial Control; ikinci seçenek ve iki kapak taslağı korunuyor. Canlı yayın için kullanıcının son seçimi ve açık onayı bekleniyor.
