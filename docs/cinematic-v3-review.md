# Sinematik deneyim 3.0 — inceleme ve yayın kaydı

21 Ekim 2026 · Mevcut `feature/cinematic-experience-v2` dalı / [PR #11](https://github.com/aligazaltr/Ali-Gazal-Site/pull/11).

**Önizleme hazır; üretim yayını kullanıcı onayını bekliyor.** Main/üretim sürümü `5d5005535cb4dcb32b706a1dac9d2c1836599836` olarak korundu. Auto-merge açılmadı. Bu kayıt önceki `cinematic-progress.md` raporunu silmez; aşağıdaki 3.0 bulguları önceki sürümün davranış ve sürelerini günceller.

## 1–3. Mobil hikâye hatası ve masaüstü

Önceki mobil düzen, masaüstü görsel panelini hikâye metinlerinin üstüne yerleştiriyordu. Aşağıdaki sahnelere kaydırıldığında denetleyici üstte, artık ekran dışında kalan panelin numara ve metinlerini güncelliyordu. Durum değişikliği testinin geçmesi, ziyaretçinin animasyonu gördüğü anlamına gelmiyordu.

Mobilde ayrı bir sahne denetleyicisi kullanılıyor. Her sahnenin kendi 01/02/03 numarası, etiketi, başlığı, açıklaması ve hafif çizgisel şekli var. Animasyon görünür sahnede bir kez başlıyor; sahne terk edildiğinde iptal ediliyor. Gizlenen masaüstü paneli mobilde güncellenmiyor. Ortak hareket sistemi de ekran dışındaki öğelere animasyon başlatmıyor. Genişlik değişince gözlemciler temizlenerek doğru düzen yeniden kuruluyor.

Masaüstünde sticky panel korunuyor. 1024 px tarayıcı görünümünde gerçek kaydırmayla 0 → 1 → 2 sahne, numara ve açıklama değişimleri doğrulandı. Ana sayfanın DÜŞÜN / SORGULA / DENE / KEŞFET girişi korundu. Hikâyenin hemen ardından aynı yöntemi tekrarlayan eski üç kart kaldırıldı.

## 4–5. Düşünce Arşivi ve keşif

Başlık, kitap seçkisi, arama yüzeyi, kart tipografisi ve kaynak hiyerarşisi yeniden düzenlendi. Açık temada sıcak kâğıt, koyu temada grafit/oranj kimlik korunuyor. Destekleyen tarayıcılarda kaynak ayrıntıları yerel `details` davranışını koruyarak açılıp kapanıyor.

Rastgele düşünce artık küçük araç çubuğunun içinde değil, ayrı bir okuma alanında gösteriliyor. Çıkış 150 ms; yeni metin maskeli girişle, çizgi, yazar ve kaynak da sıralı olarak görünüyor. Mobil metin girişi 560 ms, masaüstü 720 ms. Düğme kısa bir tepki veriyor. Seçim yalnız etkin filtrelerdeki doğrulanmış içerikten yapılıyor; art arda aynı seçim engelleniyor. Hızlı tıklamalar son seçime yerleşiyor. Filtre ve geçmiş değişince eski keşif temizleniyor.

390×740 görünümde yeni metin ve yazarın görünmesi, 390×480 görünümde yatay taşma olmaması ve hareketlerin sona ermesi kontrol edildi. Çok kısa ekranda tam kartı okumak için doğal dikey kaydırma gerekiyor. Klavye odağı rastgele düğmesinde kalıyor; içerik kullanılmak için animasyon bitişini beklemiyor.

## 6. Hakkımda

“Sadece anlatmak değil, gerçekten denemek.” başlığı, mevcut biyografi, AG işareti, bilmek/uygulamak ayrımı ve Araştır/Uygula/Değerlendir bölümleriyle editoryal bir sayfa oluşturuldu. Yeni başarı veya biyografi uydurulmadı. Şeffaflık ve kanıt sınırları açık tutuldu.

## 7. Projeler, Machiavelli ve İrade Terbiyesi

Ortak `editorial.css` başlık, boşluk ve bölüm dilini birleştiriyor. Proje listesi düz yapıda kalıyor. Machiavelli’nin final kapağı, üç ilkesi, dört anonim kaydı ve kısmi sonucu korunuyor; giriş, aşamalar ve sonuç daha belirgin sunuluyor. Payot’un dört aşaması ve okuma durumunun hiyerarşisi geliştirildi; deney başlatılmış gösterilmiyor.

`site-data.js`, `content/archive.json`, `archive-data.js` ve gerçek kapak bu turda değiştirilmedi. Sahte video, URL, yayın tarihi, chapter veya başarı yüzdesi eklenmedi.

## 8–10. Paylaşım sorununun nedeni ve adresler

Asıl neden sürüm karışıklığıydı: önizlemede paylaşım için üretim canonical adresi kullanılıyordu. Paylaşılan sayfa ve oradan ana sayfaya dönüş, henüz yeni tasarım yayımlanmadığı için eski üretim sürümünü açıyordu. Bu sonuç tek başına önbellek hatası değildi.

Yeni `share-context.js`, SEO adresleriyle kullanıcının paylaşacağı adresi ayırıyor. Önizlemede açık bir “henüz canlıya alınmadı” bandı ve sürüm seçimi var.

| Bağlantı | Hedef |
| --- | --- |
| Önizlemede normal paylaş / bağlantıyı kopyala | İçinde bulunulan önizleme alan adı, doğru sayfa ve düşünce kimliği |
| Önizlemede “Canlı site” seçerek paylaş | `https://ali-gazal-site.aliicerikmedya.workers.dev/` üzerindeki ilgili sayfa |
| “Canlı siteyi aç” | İlgili üretim sayfası |
| Canonical, Open Graph, yapılandırılmış veri | Üretim adresleri; SEO için değiştirilmedi |
| Menü, breadcrumb ve içerik içi yerel bağlantılar | Bulunulan ortamda gezinme |
| Üretimde normal paylaşım | Üretim adresi; önizleme bandı gösterilmez |

Düşünce ve proje paylaşım düğmelerinin gerçek oluşturduğu yükler, tarayıcı testinde yerel paylaşım/pano taklitleriyle kaydedildi. Önizleme bağlantıları yeni sekmede açıldı; ana sayfaya dönüş ve tarayıcı geri işlemi aynı önizlemede kaldı. Üretim adresleri de açıldı ve mevcut eski sürüm gözlendi. Hiçbir WhatsApp mesajı gönderilmedi.

`motion.js` HTTP kontrolünde 200 ve `cache-control: public, max-age=0, must-revalidate` döndü; önizlemede `x-robots-tag: noindex` var. Normal yeniden yükleme yeni tasarımı ve açık tema seçimini korudu. Özel pencere, zorla önbellek temizliği ve başka cihaz önbellekleri ayrıca sınanmadı.

## 11. Başarılı kontroller

- **38/38 Node testi.** Mobil yerel sahne, masaüstü sıra, genişlik değişiminde gözlemci temizliği, ekran dışı animasyon engeli ve paylaşım ortamı için regresyon testleri eklendi.
- `sync-site.js --check`, `build-archive.js --check`, `check-site.js`, JavaScript sözdizimi ve `git diff --check` geçti.
- **96/96 düzen kontrolü:** altı sayfa × 320/360/375/390/430/768/1024/1440 px gerçek iframe içerik genişliği × iki tema. Yatay taşma, görünmez ana içerik veya denetlenen 43 px altı form/düğme/menü hedefi saptanmadı. Satır içi metin bağlantıları bu hedef ölçümüne dahil değil.
- **12/12 arşiv davranış kontrolü:** yazar/kitap filtresi, filtreye uygun seçim, tekrar etmeme, hızlı seçim, odağın korunması, animasyonun sona ermesi, boş sonuç, eski seçkinin temizlenmesi, Türkçe İRADE araması, kaynak ayrıntılarının açılıp kapanması, sayfa hataları.
- İlk davranış testi sabit bekleme süresine bağlı iki yanlış negatif verdi. Test gerçek `animation.finished` tamamlanmasını bekleyecek şekilde düzeltildi; 12 kontrol geçti. Başarısız deneme gizlenerek geçiş sayısı üretilmedi.
- Gerçek tarayıcıda mobil sahne görünürlük kayıtları ve masaüstü üç sahne geçişi alındı; sona erdiğinde aktif animasyon 0.
- JS çalıştırma izni olmayan iframe’de 15 statik düşünce görünüyor; arama kontrolleri gizleniyor; kaynak ayrıntısı Enter ile açılıp okunuyor.
- JS `matchMedia` azaltılmış hareket taklidiyle rastgele düşünce değişiminde WAAPI çağrısı yok. CSS azaltılmış hareket kuralları kod kontrolüyle doğrulandı.
- Tema, menü bağlantıları, Kısa Sonuç içindekiler bağlantısı ve okuma ilerlemesi çalışıyor. Altı önizleme sayfasının canonical adresi üretime ait.
- Kaydedilen testlerde uygulama hatası yok. Tarayıcı eklentisinin metadata hataları uygulama hatalarından ayrıldı.

Ham kayıtlar: [cinematic-v3-evidence](cinematic-v3-evidence/). Düzen ve davranış testleri `607f0d9` / `abb4044` önizlemelerinde yürütüldü. Son temizlik yalnız geçici QA sayfasını, öncül scripti ve HTML test bağlantılarını kaldırır; bu dosyalar yayımlanacak sürümde bulunmaz. Belgeler `.assetsignore` sayesinde web dağıtımına dahil değildir.

## 12–13. Sınırlar ve performans

Bu kontroller fiziksel Android cihazında değil, Chrome tarayıcısında mobil boyutlu iframe’lerde yapıldı; mobil kullanıcı aracısı veya dokunmatik donanım testi diye sunulmuyor. Firefox Android, gerçek işletim sistemi hareket tercihi, ekran okuyucu, yerel paylaşım menüsü ve cihaz panosu uçtan uca test edilmedi. JS azaltılmış hareket taklidi CSS medya tercihini değiştirmez; tek başına bütün CSS hareketlerinin durduğunu kanıtlamaz.

Yeni framework, ağır paket, uzak servis veya sürekli animasyon yok. Görünürlük denetimi, bir defalık gözlemci, hareket azaltma/arka plan iptali ve en çok 12 eşzamanlı WAAPI kaydı var. Hareketler ağırlıkla opacity/transform; başlık ve görsel maskeleri sınırlı clip-path kullanıyor. FPS, LCP, CLS ve INP ölçülmedi; 60 FPS veya fiziksel cihaz performansı garantisi verilmiyor.

`abb4044` sürümünde motion JS/CSS, archive JS/CSS, editorial CSS ve share-context JS dosyalarının yerel gzip toplamı 15.4 KiB olarak hesaplandı. Bu hesap gerçek ağ transferi ya da bütün sayfa ağırlığı ölçümü değildir.

## 14–18. Kayıtlar, önizleme ve kalan yayın adımı

- `741f39a`: mobil görünür hikâye ve paylaşım ortamı ayrımı.
- `607f0d9`: arşiv/keşif, Hakkımda ve ortak editoryal tasarım.
- `abb4044`: keşfedilen düşüncenin görünürlüğü ve gerçek animasyon bitişini bekleyen kontroller.
- Bu belgeyi içeren dal HEAD’i: son QA temizliği ve teslim kaydı. Tam son SHA ve Cloudflare sonucu PR açıklamasında tutulur.
- [Çalışan dal önizlemesi](https://feature-cinematic-experience-v2-ali-gazal-site.aliicerikmedya.workers.dev/)
- [PR #11](https://github.com/aligazaltr/Ali-Gazal-Site/pull/11)
- [Mevcut canlı site](https://ali-gazal-site.aliicerikmedya.workers.dev/)

Son istemin “Canlı yayın kuralı” gereğince kullanıcı tasarımı gördükten sonra açık onay vermeli. Onaydan sonra PR birleştirme, Cloudflare üretim dağıtımı ve gerçek üretim paylaşım/ana sayfa akışı ayrıca doğrulanacak. Bu çalışma sırasında canlı site değiştirilmedi.
