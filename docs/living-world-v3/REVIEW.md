# Yaşayan Dünya — V3 inceleme kaydı

Bu çalışma PR #33 içindeki `7072ef582e1b8cf5db8699f3d406bbc8267a5b61` dünyasının devamıdır. Oda, kemer, nehir, teras, köprü ve şelale korunmuştur. Ana sayfa dışında ürün tasarımı değiştirilmemiştir. Main birleştirmesi ve production yayını yapılmamıştır.

## Görüntü ve kaynak

| Özellik | Önceki film | Bu kalite geçişi |
| --- | --- | --- |
| Çözünürlük | 960 × 540 | Yerel 1920 × 1080 |
| Kare hızı | 12 FPS | 24 FPS |
| Süre | 30 saniye | 30 saniye / 720 ayrı render karesi |
| Kamera | Duraklarda hız kesen yumuşatma | Konum ve hedefte sürekli hızlı Hermite eğrisi |
| Üretim | Blender ortamı | Aynı Blender ortamının malzeme, su, bitki ve ışık iyileştirmesi |
| Web kontrolü | İlk entegrasyon | 4,9 saniye açılış, ardından gerçek belge kaydırmasına bağlı ileri/geri kontrol |

Fotoğraf geçişi, AI çevre görseli, kare enterpolasyonu veya AI büyütme kullanılmadı. `world-film.mp4` doğrudan gerçek sahnenin kamera kaydıdır. Native kaynak `world-source/living-world-refined.blend`; yeniden üretim yönergeleri `world-source/README.md` içindedir. Kaynak dosyada paketlenmiş özgün sayfa dokusu ve 720 karelik kamera zaman çizelgesi vardır. Nesne ve ışık kanıtı `scene-manifest.json`, gerçek kodlama bilgileri `render-metadata.json` içindedir.

Bağımsız `camera-master-1080p.mp4` filmi 6 Mbit/s tavanıyla kodlanmıştır (22.765.577 bayt). Önizleme aynı 720 kareyi, çözünürlük ve kare hızını koruyarak 3 Mbit/s tavanında sunar (11.376.430 bayt). Yükleme arayüzünün istek sınırı nedeniyle master Git içinde iki kayıpsız ikili parçada saklanır; `python3 docs/living-world-v3/restore-camera-master.py` komutu SHA-256 doğrulaması yaparak tam MP4 dosyasını birleştirir. Birleştirme sırasında video yeniden kodlanmaz.

Taş, kâğıt, ahşap ve kabuk yüzeyleri düzeltildi. Nehirdeki aşırı kalın dalgalar inceltildi. Şelaledeki yüzey kırıkları ve beyaz tel görünümü, sürekli su perdesi ve yüzey köpüğüyle değiştirildi. Kıyılar yumuşatıldı; çakıl ve yer bitkileri eklendi. Kamera yolu mevcut ortak dünya koordinatlarını kullanır.

## Ana sayfa davranışı

- Açılış otomatik ilerler; erken kullanıcı hareketi kamerayı mevcut konumdan devralır.
- Kaydırma, proje ve hikâye bölümlerinin gerçek konumlarını aynı film zaman çizelgesine eşler. Yolculuktan geri dönüldüğünde ilk kitap kamerasına kadar gidilebilir.
- Yinelenen `canplay` olayları, tema geçişi ve URL bölüm bağlantıları kamerayı başa atmaz.
- Byte-range isteklerini karşılamayan önizleme proxy'si için aynı kaynak film gerektiğinde tamamen belleğe alınır. `blob:` izni yalnızca medya politikasına eklenmiştir.
- İlk ekran eylemleri mobil görünüm yüksekliğine sığdırılmıştır. Tamponlama sırasında hazırlık durumu, otomatik oynatma engellenirse başlatma düğmesi görünür.
- Mobil film kadrajı, yalnızca su yüzeyine düşmek yerine kıyı mimarisini de içerecek şekilde sola alınmıştır. Sinematik eylem düğmesi ve oklar iki temada da açıkça ayrılır.
- Hareket azaltma, JavaScript kapalı veya medya hatası durumunda okunabilir HTML ve 3B sahneden üretilmiş poster kalır.
- Gerçek proje durumları ve bağlantıları korunur. QA araçları ürün sayfasında yer almaz.

## Kabul sınırları

Bu teslim fotogerçekçi nihai sanat onayı değildir. Tekrarlayan bitki geometrisi, seyrek doğal çeşitlilik, basit mimari ve suyun fiziksel davranışı hâlâ geliştirme gerektirir. CPU ile tam filmde 4 Cycles örneği kullanılmıştır; normal/albedo destekli HDR denoise ince ayrıntı ve zamansal kararlılığı sınırlar. Daha yüksek çözünürlük otomatik olarak fotogerçekçilik anlamına gelmez.

Web sürümü Blender filmini kaydırma konumunda tutar. Kullanıcı durduğunda su ve yapraklar kameradan bağımsız hareket etmeye devam etmez. Filmdeki su/bitki/zaman animasyonu render betiğinde uygulanır; native `.blend` içindeki kamera zaman çizelgesi tek başına bu tam üretim animasyonunun yerine geçmez.

`world-review.html` önceki daha sade Three.js geometri incelemesidir; yeni filmin görsel kalitesini temsil etmez. Güncel film ve native Blender kaynağı bu kalite geçişinin esas çıktılarıdır.

Mobil kontroller gerçek Chrome içinde 390 × 844 CSS piksel görünümle yapılır; fiziksel Android testi değildir. Hareket azaltma kontrolü QA dalındaki `matchMedia` benzetimiyle yapılır. Tarayıcı testi başarısı görsel kalite kabulü yerine geçmez.

## Doğrulama ve kanıtlar

Son tarayıcı sonuçları `browser-results.json` içindedir: 72 kontrolün tamamı geçti.

| Chrome kontrolü | Sonuç |
| --- | --- |
| 1440 × 900 / koyu tema | 16 / 16 |
| 1440 × 900 / açık tema | 16 / 16 |
| 390 × 844 / koyu tema | 16 / 16 |
| 390 × 844 / açık tema | 16 / 16 |
| Hareket azaltma benzetimi | 2 / 2 |
| JavaScript kapalı | 2 / 2 |
| Erken kaydırma | 2 / 2 |
| Doğrudan bölüm bağlantısı | 1 / 1 |
| Medya hatası benzetimi | 1 / 1 |

Bu kontroller gerçek video elementinin 1920 × 1080 çözünürlükte açıldığını, otomatik ilerlediğini, 4,9 saniyede durduğunu, her bölümün beklenen kamera zamanına ulaştığını, temada sıfırlanmadığını ve geri kaydırmayla ilk kitap karesine döndüğünü doğruladı. Bölüm zamanları ayrıca yatay taşma koşuluyla denetlenir.

`desktop-dark.jpg`, `desktop-light.jpg`, `mobile-dark.jpg` ve `mobile-light.jpg` son görsel düzenin doğrudan tarayıcı ekran görüntüleridir. Masaüstü ekran görüntüsü 1280 × 720; davranış testinin geniş görünümü 1440 × 900'dür. `browser-projects.jpg`, `browser-sonuc.jpg`, `browser-archive.jpg` gerçek içerik ile kamera birlikteliğini gösterir.

`browser-recording.mp4` gerçek Chrome sekmesinin ekran kaydıdır: başlangıç, otomatik açılış, 24 saniyede belge boyunca kaydırma ve geriye dönüş. QA betiği normal belge kaydırmasını kullanır; kamera filmi ekran kaydı yerine konmamıştır. MediaRecorder değişken zaman damgalı ekran yakalamasının yalnızca önizleme alanı 1280 × 720 olarak kırpılmış, paylaşım için 24 FPS MP4'e kodlanmıştır. Bu tarayıcı kaydındaki zamanlama uyarlaması ile 720 ayrı Blender render karesi birbirinden farklıdır. Kamera master filmi de ayrıca sunulur.

Eski `preliminary-browser-modes.json` ilk başarısız bölüm bağlantısı testini de içerir; son durum sonucu olarak kullanılmaz.

Otomatik doğrulama: 108 Node testi geçti. Statik veri eşleşmesi, SEO çıktısı, bağlantılar, yayın kapıları ve 17 korunan dosyanın hash'leri temiz. Tam filmin codec/çözünürlük/kare/süre bilgisi FFprobe ile doğrulandı; tamamı hatasız decode edildi. Master film de 1920 × 1080, 24 FPS, 720 kare ve tam 30 saniye olarak doğrulandı.

PR taslak olarak açık tutulur. Önizleme ana dal ve production'dan ayrıdır.
