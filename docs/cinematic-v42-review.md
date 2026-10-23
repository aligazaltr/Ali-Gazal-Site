# Cinematic Experience 4.2 — teslim kaydı

4.2, PR #12'nin mevcut 4.1 görünümü üzerinde yalnız Machiavelli açılışını ve arşivdeki keşif geçişini değiştirir. Canlı site için yeni yayın onayı verilmedi; main/canlı değiştirilmeyecek.

1. **Portre kaynağı:** Kullanıcının sağladığı 1672 × 941 özgün final kapak. Kaynak ve işlem kaydı: [cinematic-v42-portrait.md](cinematic-v42-portrait.md).
2. **Kapak uyumu:** Özgün PNG ve sitedeki JPEG yan yana incelendi. Sağ figürün bakışı, saç/yaka/giysi ve ışığı esas alındı. Aynı tarihî tablo kaynağı doğrulanamadı; dijital tasvir olduğu açıkça belirtildi. Birebir piksel kesimi veya kusursuz fiziksel morph iddiası yoktur.
3. **Portre işlemleri:** Imagegen ile ayrı alfa kanallı portre, örtülü giysinin tamamlanması; ardından oran korunarak 640/960 px WebP. Final kapak değişmedi. Üretken düzenleme bazı ayrıntıları yeniden üretir; bu sınırlama kaynak kaydında açıklanır.
4. **Dört kare:** Büyük başlık ve gölgeli portre → merkeze yaklaşan büyümüş portre → yüz merkezine hizalanan portre ve sağdan açılan kapak → final kapak, gerçek tarih/durum ve araştırma bağlantısı. [Görsel kararlar](cinematic-v42-storyboard.md).
5. **Dönüşüm:** Tek portre ve tek kapak, konum/ölçek/opacity/clip-path ile aynı sahnede ilerler. Kapak aşağıdan yeni kart olarak gelmez; portre onun sağındaki yüz alanına yaklaşırken maske genişler. Sabit arka ışık, sürekli hareket eden efekt değildir.
6. **Telefon:** Dikey kompozisyon, daha sınırlı büyüme, tam içerik genişliğinde kapak. 600 px'ten kısa telefonlarda final kapak yukarı alınır; metin/bağlantı alanı ayrılır. 420 px'ten kısa viewport'ta, hareket azaltmada ve JS kapalıyken normal dikey akış vardır.
7. **Siyah efekt:** `discovery-turn` ve `discovery-leaf` DOM/CSS üretimi tamamen kaldırıldı. Yeni perde/yaprak eklenmedi.
8. **Korunan hareketler:** Arşiv açılışı ve kart girişleri, kısa metin/yazar/kaynak girişi, buton ve odak tepkileri; ana sayfanın mevcut açılış zamanları ve AG sahneleri korunur. Keşifte 180 ms metin çıkışı, 14 px / 420 ms giriş, yazar/kaynak için 100/160 ms gecikme vardır. Son seçim ve iptal davranışı korunur.
9. **Ana sayfa:** 4.1'e göre HTML, signature.css, styles.css ve editorial.css değişmedi. Hakkında/Projeler/Payot da aynı. `protected-content.json` bunu dosya hash'leriyle kaydeder. Machiavelli'nin proje bilgileri bölümünden sayfanın sonuna kadar içerik birebir aynıdır.
10. **Dosyalar:** `machiavelli.html`, `machiavelli-scene.css`, `machiavelli-scene.js`, `machiavelli-frames.js`, iki portre WebP, `scripts/render-machiavelli-scene.js`, `scripts/sync-site.js`, `archive.js`, `archive.css`, `motion.js`, ilgili testler ve bu rapor/kanıtlar. Üç geçici QA dosyası ve altı sayfadaki test betiği son teslimden kaldırıldı.
11. **Testler:** 49 Node testi, veri/HTML senkronizasyonu, arşiv üretimi ve site bütünlük denetimleri geçti. Tarayıcı sonuçları ve test sınırları aşağıda kaydedildi.
12. **Yapılamayanlar:** Fiziksel Android/iPhone, Firefox/Safari (bu ortamda yalnız Chrome var), gerçek ekran okuyucu ve gerçek cihazın yerel paylaşım menüsü. Güvenilir saha LCP/INP veya düşük donanımlı cihaz performans ölçümü yapılmadı. JavaScript hareket tercihi simülasyonu gerçek işletim sistemi/CSS medya sorgusu testi değildir.
13. **Görsel kanıtlar:** Önce dört sabit HTML/CSS prototip karesi masaüstü/390 px telefonda incelendi; ardından gerçek kaydırma denetleyicisi yazıldı. [Sekiz sahne karesi ve arşiv görünümü](cinematic-v42-evidence/README.md) gerçek Chrome ekran görüntüleridir; arayüz maketi değildir. Telefon görüntüleri viewport simülasyonudur.
14. **Commit izi:** `25e2f67` dört kare ve siyah katmanın kaldırılması; `ed325e5` geçici responsive prototip; `c628db3` kaydırma denetleyicisi; `bc11686` kısa ekran düzeni; `8b0a74` erişilebilir portre açıklaması; `1ef98f4` kısa ekran metin ayrımı. Son temiz teslim SHA'sı PR açıklamasında yer alır.
15. **PR:** https://github.com/aligazaltr/Ali-Gazal-Site/pull/12 — aynı `feature/cinematic-signature-experience-v4` dalı.
16. **Önizleme:** Son doğrulanmış temiz Cloudflare sürüm bağlantısı PR açıklamasına kaydedilir. Prototip/QA adresleri son kullanıcı tesliminin yerine geçmez.
17. **Canlı:** Main `9f61f699e2c5364c5e7db6e12e6566ca08d4c350`; bu çalışma ana dala birleştirilmez veya canlıya alınmaz.
18. **Sınırlar:** Kullanılan portre, kapağa uyumlu üretken dijital düzenlemedir; doğrulanmış tarihî tablo değildir. Yeni 3D motor, framework, harici API veya yeni özellik yoktur. Eski araştırma verileri ve yayın kapıları korunur. Video yayımlandığında mevcut merkezi veri ve video paneli gerçek bağlantıyı üretir; sahne sahte izleme bağlantısı oluşturmaz.

## Doğrulama

Testler gerçek Chrome'da, geçici aynı-origin iframe düzeneğinde yapıldı. Genişlikler **320 / 360 / 375 / 390 / 430 / 768 / 1024 / 1440 px**. Aşağıdaki JSON dosyaları `cinematic-v42-evidence/` içindedir.

| Kontrol | Gözlenen sonuç | Kanıt |
| --- | --- | --- |
| Sahne, 8 genişlik × 3 yükseklik (480/740/900) × 2 tema × 4 durum | İlk 192 kontrolün 10'unda kısa telefon finalinde metin çakışması bulundu; yatay taşma/görsel yükleme/uygulama hatası yoktu. | `scene-matrix-initial.json` |
| Kısa telefon düzeltmesi, 5 genişlik × 2 tema × 4 durum | 480 px yükseklikte 40 kontrolün tamamı geçti. | `short-scene-retest.json` |
| Birleşik sahne kapsamı | İlk matristeki 40 kısa telefon kaydı yeni sonuçlarla değiştirilince 192/192 geçti. Bu, düzeltmeden sonra 192 kontrolün tamamının yeniden çalıştırıldığı anlamına gelmez. | `scene-coverage.json` |
| Altı kritik sayfa × 8 genişlik × 2 tema, 740 px yükseklik | 96/96; yatay taşma, küçük dokunma hedefi ve gizli ana içerik saptanmadı. | `layout-matrix.json` |
| JS kapalı, altı sayfa × 390/1440 px, 480 px yükseklik | 12/12; içerik, navigasyon ve Machiavelli statik akışı kullanılabilir. | `nojs.json` |
| Hareket azaltma, 390/1440 px | JS tercihi simülasyonunda sahne normal akışa döndü; iki görsel yüklendi, 0 WAAPI animasyonu ve 0 uygulama hatası. Gerçek OS/CSS tercih emülasyonu değildir. | `reduced-motion-js.json` |
| Arşiv etkileşimleri | 12/12; filtre, Türkçe arama, boş sonuç, son tıklamanın geçerliliği, arka arkaya tekrar etmeme, odak, detay açma/kapama ve animasyonun durması. | `archive-behavior.json` |
| Kopyalama ve paylaşma | Navigator test çiftlerine doğru metin/kaynak ve aynı önizleme origin'inde alıntı bağlantısı iletildi. Siyah katman sayısı 0. Gerçek OS paylaşım menüsü/clipboard testi değildir. | `archive-share-motion.json` |
| Korunan içerik | 14 karşılaştırmanın tümü 4.1 ile birebir aynı; Machiavelli araştırma dosyası ve gerçek kapak dahil. | `protected-content.json` |
| Node | 49/49; kaydırma hesabı, görünürlük, azaltılmış hareket, kısa pencere ve görsel hata geri dönüşleri dahil. | `node-tests.txt` |

İlk geniş matris ve düzen kontrolleri `7e42889c` önizlemesinde; 40 kısa ekran tekrar testi, no-JS, arşiv ve hareket azaltma kontrolleri `381d80f6` önizlemesinde yapıldı. Sekiz son görsel de `381d80f6` sürümünden alındı. Sonraki temiz teslim test araçlarını kaldırır; ürünün sahne kodunu değiştirmez. Temiz Cloudflare sürümünün son navigasyon/tema/konsol kontrolü ve kesin URL/SHA PR açıklamasında tutulur.

Tarayıcı günlüğünde görülen `chrome-extension://…` kaynaklı metadata mesajları site hatası olarak sayılmadı. QA iframe'inin zamanlama ölçümleri saha performans ölçümü değildir; LCP/INP başarısı iddia edilmez.

## Performans yaklaşımı

Portre için 78.846 / 159.010 baytlık iki responsive alternatif vardır; tarayıcı uygun olanı seçer. Boyutlar HTML'de ayrılmıştır. Üç yeni sahne dosyası yalnız Machiavelli sayfasında yüklenir. Görünür sahneye pasif scroll + tek rAF işi; geometri scroll dışında ölçülür, sekme arka plana geçince iş iptal edilir. Herhangi bir saha performans puanı iddia edilmez. Ayrıntılı ham/gzip bütçe: `cinematic-v42-evidence/asset-budget.json`.
