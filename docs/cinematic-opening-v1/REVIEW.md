# İlk sinematik açılış prototipi

Mevcut PR #33 ve bütün ürün sayfaları korunur. Yeni çalışma `feature/cinematic-opening-v1` dalında, `915145ce20802287ccf7a7489917b71c9ea5d90b` üzerine eklenmiştir. Ana sayfanın ilk yolculuğu `/cinematic-opening` adresinde izole edilmiştir; mevcut `index.html` değişmemiştir.

- [Üç alternatif](alternatives.webp), [seçilen 02](selected.webp), [beş kamera karesi](storyboard.webp).
- [Gerçek üretilen hareket](generated-motion-original.mp4). Kaynak film 854×480, 24 FPS, 241 kare, 10.041667 saniyedir. Görseller kavramsal storyboard'dur, hareket kanıtı değildir.
- Web filmi `../../cinematic-film.mp4`; gerçek HTML başlıkları, 4.8 saniye otomatik açılış ve devamında ileri/geri kaydırma.

## Üretim kararı

Mevcut üç özgün alternatif yeniden üretilmedi. İkinci alternatifin taş sövesi, kitaplar, yanal ışık, metin boşluğu ve aynı avluya açılan kemeri en güçlü bağlantıyı veriyor. Dört panelli önceki storyboard ve gerçek başlangıç görseli beş kavramsal adımda korunmuştur.

Higgsfield `hf_mult_motion_control`: daha önce oluşturulmuş Blender kamera filminin ilk 10 saniyesi yalnızca hareket referansıdır. Onaylı ikinci alternatif görünüm referansıdır. Tek ücretsiz üretim hakkı kullanıldı; teklif 0 kredi, bakiye işlemden sonra hâlâ 10 kredi. Satın alma, deneme başlatma veya hak sıfırlama yok.

## Görsel değerlendirme

Kamera kitapların yanından ilerliyor, taş kemerden dışarı açılıyor ve akan suya yaklaşıyor. Fotoğraf yakınlaştırması, fotoğraf çözülmesi, dairesel portal ve boş siyah geçiş kullanılmadı. Malzeme/ışık dili önceki prosedürel Blender filminden daha ayrıntılıdır.

Bu bir nihai yüksek çözünürlüklü teslim değildir: 480p büyük ekranlarda yumuşar; AI taş/bitki ayrıntıları yer yer oynar. Manzara bu kısa çekimde avlu/nehir ölçeğinde kalır. Üretilen film bir 3D model dosyası değildir. Kaydırma durunca filmin su hareketi de durur. Kullanıcının görsel kabulü verilmemiştir.

## Kontroller

108 mevcut Node testi ve statik site kontrolleri geçti. Yeni dosyalar için yayın izin listesine yalnızca yedi öğe eklendi; bu nedenle koruma fixture'ında yalnızca `.assetsignore` hash'i güncellendi. Machiavelli, Control, Projeler, Düşünce Arşivi, Hakkımda ve proje verilerinin içerikleri değişmedi. Tarayıcı kontrolleri ve çalışan önizleme doğrulaması henüz bekleniyor; ayrı kanıt dosyasında güncellenecek.

Main'e merge ve production yayını yok. İlk yolculuğun ötesine geçilmedi.
