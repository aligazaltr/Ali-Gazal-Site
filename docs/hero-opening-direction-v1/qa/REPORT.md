# Hero Opening V1 görsel denetimi

İlk sürüm: `6c8fa932055126844922e6a6a6940aee7c94da66`, PR #25.
İnceleme ve düzeltme aynı taslak PR'a aittir.

Cloudflare önizlemesini Chromium'da açınca `getContext('webgl')` boş
döndü. V1'in konsolunda `Hero direction: static fallback. Error: No WebGL`
vardı. Shader derleme aşamasına geçilmedi. Kapak dosyası yüklendi ancak
beş boyut/tema görünümünde hareket hiç başlamadı. 1440×900'de ana eylem
y=1337 civarındaydı; 390×844'te y=853, 360×844'te y=828. Dolayısıyla
sonuncusunda düğmenin sadece üstü ekrana giriyordu. Sayfa tümüyle
siyah kalmadı; mevcut içerik uzun bir dikey akışta görüldü.

## Düzeltme

WebGL bulunmadığında aynı kamera matrisleriyle daha hafif bir çizim
yolu devreye giriyor. Canvas 2D, kaide ve kenar yüzlerinin perspektife
göre konumunu çiziyor. Gerçek kapak, aynı köşelere CSS perspektifiyle
yerleşiyor; kırpılmıyor. Kapak, kaide, açılış ve ilk kaydırma aynı
geometriyi kullanıyor. WebGL yolu öncelikli kalıyor. Başlatma hatasında
veya bağlam kaybı olayında ikinci çizim yolu kullanılabiliyor.
Hareket kapalıysa başlık, kapak ve bağlantılar daha kısa bir statik
yerleşimde görünüyor. Kapak yüklenemezse ad ve bağlantı korunuyor.

Düzeltme turunun ilk karelerinde başlık maskesi harfleri kısmen
kesiyordu. Başlık bütünüyle açı değiştirerek açılacak biçimde
ayarlandı. Açıklamanın yeri kaidenin alt sınırına bağlandı.
Işık geçişi erkene çekildi. Erken kaydırma açılışı son kareye
sıçratmıyor. Düşük kare sıklığı açılış saatini uzatmıyor.

## Görsel kanıt

Her panel ilk sürümün statik karesiyle başlar. Diğer karelerde
yerel Chromium test sayfası gerçek çiziciyi belirtilen anda
dondurur. Beş görünümde 0, 1, 2,5, 4 ve 6 saniye ile kaydırma
sırasındaki iki konum toplam 35 kare eder. CSS viewport boyutları
gerçektir. 1440 piksel görünüm ekran görüntüsüne sığması için
%89 oranında gösterilmiştir. Android cihaz emülasyonu veya
gerçek cihaz ölçümü yapılmadı.

- [1440 koyu](1440-dark.jpg) ve [1440 açık](1440-light.jpg)
- [390 koyu](390-dark.jpg) ve [390 açık](390-light.jpg)
- [360 koyu](360-dark.jpg)

| An | Chromium'da gözlenen |
| --- | --- |
| 0 sn | Menü ve düğmeler hazır. Kapak yandan ve loş. Koyu temada ilk kare geniş bir karanlık alan bırakıyor. |
| 1 sn | Soru bütün olarak görünür hâle geliyor. Kaide ve kapak kenarı seçiliyor. |
| 2,5 sn | Soru okunaklı. Kapak daha aydınlık ve önden görünmeye başlıyor. |
| 4 sn | Kapak büyük ölçüde açılmış. Vaat ve açıklama daha düşük kontrastla yerleşiyor. |
| 6 sn | Kapak, soru ve iki ana bağlantı görünür. Kapak açıklaması kaidenin altında. |
| Kaydırma | Kapak açısı değişmeye devam ediyor. Soru çekilip deney açıklamasına yer veriyor. |

İncelenen karelerde yatay taşma, görünür açıklama ile kapak çakışması
ve ana CTA'ların örtülmesi görülmedi. Işık ve açı farkı anlaşılır,
ancak dar ekranda dönüş daha hafif. Kaide bazı açılarda sade bir ürün
standı gibi duruyor. Koyu temada ilk saniye loş ve kompozisyonda belirgin
boşluk var. Açık tema daha okunaklı, atmosferi daha az dramatik.
Bu aşama görsel yayın onayı değildir.

## Davranış ve doğrulama

- Normal sayfada 390px'te tekrar oynatma açılışı yeniden başlattı.
  Atlama 6,000 saniyeye götürdü. Gerçek kaydırma ilerlemesi
  0 → 0,4349 → 1 → 0 olarak gözlendi.
- Aynı belgede 390 → 360 → 390 genişlik değişimi denendi. Çizim
  tamponu yeniden boyutlandı ve yatay taşma gözlenmedi.
- JavaScript kapalı sandbox, azaltılmış hareket sorgusu taklidi,
  550px kısa ekran ve bozuk kapak URL'si Chromium'da kontrol edildi.
  Gerçek işletim sistemi tercihi ve cihaz yönü değişimi denenmedi.
- WebGL bağlamı bulunmaması gerçek Chromium oturumunda gözlendi.
  Shader başarısızlığı ve bağlam kaybı kontrollü Node testleriyle
  sınandı. Donanımsal GPU, gerçek shader derlemesi ve gerçek GPU
  bağlam kaybı bu oturumda gözlenemedi.
- Statik üretim, arşiv, SEO, site bütünlüğü ve 99 Node testi geçti.
  Kare sayısı veya süre bir FPS ölçümü olarak kullanılmadı.
- Canlı ana sayfa ve proje sayfaları bu dalda değiştirilmedi.
  Yeni Cloudflare sürümü, bu PR'ın açıklamasında kayıtlıdır.

[İlk ölçümler](original.json) · [35 kare ölçümü](frames.json) ·
[Statik senaryolar](fallback.json) · [Kaydırma](wheel.json) ·
[Boyut değişimi](resize.json) · [Node sonucu](node-tests.txt)
