# Gerçek materyal entegrasyonu

Bu görevde onaylı Hakkımda portresi, 2–3 Machiavelli görseli veya gerçek yayın URL'si eklenmedi. Eksik materyal bağımsız geliştirmeleri durdurmadı; sahte fotoğraf, stok yüz, boş figure veya kırık görsel alanı oluşturulmadı.

## Gerekli minimum teslim

1. Hakkımda için bir gerçek portre ve yayımlanmasına onay. Yüzü değiştirilmez; kırpma yüz/elleri kesiyorsa önce orijinal oran korunur.
2. Machiavelli için 2–3 seçilmiş gerçek çekim/kitap/araştırma görüntüsü ve her birinin neyi gösterdiği. Deney anı olmayan çekim görüntüsü “olay kanıtı” diye sunulmaz.
3. Video yayınlandığında gerçek URL, kesin başlık, yayın tarihi, süre ve varsa doğrulanmış chapter zamanları. Hazırlık videosu bitti diye published=true yapılmaz.

## Yerleşim kararı

- Hakkımda: sağdaki kimlik alanının editoryal kenarına tek portre; sol büyük başlık ve sayfanın genel hiyerarşisi korunur. Gerçek fotoğrafın oranı görüldükten sonra crop belirlenir. Sıradan yeni bir yuvarlak kart veya uydurulmuş fotoğraf eklenmez.
- Machiavelli: çekim karesi video anlatımına, kitap görüntüsü kaynak bölümüne; gerekiyorsa anonim not kendi kanıt sınırıyla kayıt bölümüne. Birbirinden kopuk galeri yok. Açılış sahnesi ve final thumbnail değişmez.
- Her görsel figürünün caption'ı yalnız doğrulanmış bağlamı söyler; başka kişilerin yüzleri, mesajlar, işyeri ayrıntıları ve kişisel notlar ayrıca incelenir.

## Teknik kabul

Mevcut allowlist düz kök dosyaları tercih ediyor. Örnek teslim adları ali-gazal-portre-640.webp / -960.webp ve machiavelli-cekim-640.webp / -1024.webp olabilir; bunlar bu PR'da varmış gibi HTML'ye yazılmadı.

Dosya geldiğinde gerçek en-boy oranı, width/height, srcset/sizes, anlamlı alt metin ve açıklama kullanılır. İlk ekran dışındakiler lazy/async; birincil portre gereksiz büyütülmez. WebP/AVIF kararı gerçek görsel kalite/boyut ölçümüne göre alınır; zorunlu bir format veya sahte “optimize edildi” sonucu yok. GPS/EXIF ve diğer özel metadata temizlenip yeniden kontrol edilir. Her kamu dosyası .assetsignore'a tek tek eklenir; özel orijinal fotoğraf/kayıt/test dosyaları izin listesine alınmaz.

Ardından merkezi içerik kaydı ve statik HTML birlikte güncellenir, aynı tema/genişlikte karşılaştırılır ve ayrı küçük değişiklikte onaya sunulur. Bu plan, fotoğraf entegrasyonu uygulanmış demek değildir.
