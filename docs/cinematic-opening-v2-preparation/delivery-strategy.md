# Aynı sinematik görüntünün yüksek kaliteli sunumu — hazırlık, uygulanmadı

## Değişmeyecekler

Başlangıç kompozisyonu, kitaplar, mimari, renk atmosferi, kamera rotası, 4.8 saniyelik giriş ve mevcut mobil `object-position` korunur. Türkçe metinler video üzerine basılmaz; HTML olarak keskin kalır. Yeni tasarım veya dikey video yeniden üretimi yok.

## Master ve dağıtım kopyaları

- Upscaler'ın orijinal 4K çıktısı arşiv master'ı olur; mevcut V1 ham ve web dosyalarının üzerine yazılmaz.
- Çıktı boyutu, FPS, kare sayısı, renk bilgisi ve ses varlığı FFprobe ile doğrulanır. Hedef 24 FPS ve mevcut süre/kamera ritmidir; beklenmeyen FPS değişimi otomatik kabul edilmez.
- H.264 High / yuv420p MP4 genel geri dönüş biçimidir. 24 FPS korunur; `faststart`, yaklaşık 6–12 karelik GOP ve uyumlu keyframe noktaları ileri/geri seek için değerlendirilir. Kısa GOP dosyayı büyütebilir; son görsel karşılaştırmayla seçilir.
- Aynı master'dan 1920×1080, 2560×1440 ve 3840×2160 dağıtım sınıfları; kesin piksel ölçüsü, kaynak oranı ve kodlayıcının çift piksel gereksinimiyle doğrulanır. Mimariyi geren ölçekleme veya yeni crop yok.
- İlk deneme bitrate bütçeleri: 1080p yaklaşık 6–9 Mbit/s; 1440p 10–16 Mbit/s; 2160p 16–20 Mbit/s. Bunlar ölçülmüş nihai kalite iddiası değil, 10 saniyelik prototip için ayarlanacak hedeflerdir. Dosya ve görüntü önceliği birlikte değerlendirilir.
- AV1 yalnızca cihazın `MediaCapabilities.decodingInfo` sonucu `supported`, `smooth` ve uygun olduğunda `powerEfficient` ise ek seçenek olur; yalnız MIME desteği akıcı donanım çözme garantisi değildir. H.264 mevcut kalır. HEVC'ye zorunlu bağımlılık getirilmez.

## Cihaza göre seçim

Tam ekran cover video için yalnız CSS genişliğine bakılmaz. İhtiyaç, en-boy oranı ve DPR ile birlikte `max(viewportWidth / sourceWidth, viewportHeight / sourceHeight) × devicePixelRatio` üzerinden değerlendirilir. Portre ekranda yatay filmin küçük kısmı görünür; bu nedenle yüksek DPR'lı mobilde 720p/1080p bile yumuşayabilir.

1. Ekran ve decoder uygun olduğunda masaüstüne 1440p/2160p seç.
2. Uzun mobil ekranda aynı yatay kadrajı koru; 1440p'yi kalite varsayılanı, güçlü cihaz/bağlantıda 2160p'yi seçenek olarak değerlendir. Bütün telefonlara otomatik düşük kalite verme.
3. Save-Data, zayıf bağlantı veya verimsiz decode için 1080p geri dönüşü değerlendir; 4K oynuyor diye CPU'da takılan görüntüyü yüksek kaliteli sayma.
4. Kaynak seçimini bir kez, oynatma öncesi yap. Açılışın ortasında farklı film/zaman çizgisine atlama veya arka planı karartma.

## Ağ ve ilk kare

- Bugünkü Workers Static Assets video Range isteğine 200/tam gövde veriyor. Yeni 4K'yı yalnız daha büyük dosya olarak mevcut tam-Blob akışına takmak başlangıç yüklemesini uzatır.
- Sonraki uygulama aşamasında doğru `206 Partial Content`, `Content-Range` ve `Accept-Ranges` davranışı sağlanıp Safari/Android/Chrome'da doğrulanmalı. Gerekirse aynı statik dosya önüne dar kapsamlı Worker range route'u hazırlanır; bu görevde route veya production değiştirilmedi.
- Dosya başına Workers sınırı 25 MiB. Arşiv master'ı bundan büyükse saklama ve sunum yeri ayrıca seçilir; kullanıcı onayı olmadan yeni ücretli depolama açılmaz. 10 saniyelik tek web kopyası sınır altında hedeflenebilir.
- Filmin kendi yüksek çözünürlüklü ilk karesinden poster çıkar. Yükleme sırasında poster görünür kalsın; ilk video karesi çözüldükten sonra video öne gelsin. Aynı mimari/kadraj sayesinde boşluk veya görüntü atlaması oluşmasın.
- Sürümlü/hash'li video ve poster yollarını kullan; eski sayfanın yeni filmle yanlış eşleşmesini engelle. Yalnız kullanılacak kalite kopyasını indir.

## Yayın öncesi kalite kapısı

Ham V1 ve yeni 4K sonuç aynı zamanlarda (kitap, eşik, su) karşılaştırılır. Çerçeve/kamera yolu ve klip uzunluğu eşleşmeli; kitap sayfaları, taş birleşimleri ve yapraklar erimemeli, su aşırı keskin/metal gibi görünmemeli. 4K piksel ölçüsü tek başına görsel onay değildir. Büyük masaüstü ve 390 CSS piksel mobil; iki tema; otomatik/erken kaydırma/geri dönüş ve düşük hareket tercihi doğrulanır. Kullanıcı görsel kabulü olmadan üretim genişletilmez.
