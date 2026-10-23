# Cinematic Experience 4.0 — sahne kararları

Başlangıç: main `9f61f699e2c5364c5e7db6e12e6566ca08d4c350` / 3.0. Beğenilen büyük giriş kelimeleri, sıcak kâğıt/grafit temaları, Hakkımda düzeni ve içerik gerçeği korunuyor. 3.0'daki bağımsız girişler ve halka motifi yerine birbirine bağlı tipografi ve dosya katmanları kullanılıyor. Genel okuma alanları sakin kalıyor.

| Deneyim | Kompozisyon / başlangıç | Etkileşim ve dönüşüm | Bitiş | Mobil | Erişilebilirlik | Performans |
| --- | --- | --- | --- | --- | --- | --- |
| Giriş | Aynı dört kelime, ayrı satır maskeleri | 105 ms arayla ortak yükselme; son hareket 835 ms içinde tamamlanır. Turuncu çizgi ilk kaydırmayı hikâyeye bağlar. | Durağan, hemen kullanılabilir ilk ekran | Aynı tipografi, taşmayan tek sütun | Statik kelimeler ve tek erişilebilir tam ifade; azaltılmış harekette anında | Yalnız transform/opacity, zorunlu bekleme yok |
| Bir fikrin yolculuğu | Üst üste duran aynı üç dosya yaprağı ve soru | Kaydırınca aynı yapraklar üç bağlı uygulama adımına; ardından sonuç kayıtlarına dönüşür | “Gerçekten işe yaradı mı?” ve mevcut proje | Her görünür sahnede kendi yapraklarının önceki durumdan yeni duruma tek seferlik dönüşümü | Tüm başlık ve açıklamalar normal HTML; dekorasyon aria-hidden | IO + WAAPI; ekran dışı ve arka planda iptal; sürekli döngü yok |
| Machiavelli | Gerçek kapak, üç gerçek davranış ilkesi | Kapak küçülerek tarih/kayıt akışına yer açar; son sahnede dürüst sonuç öne çıkar | Olumlu fakat kısmi; kayıt ve sınırlara normal bağlantılar | İlk gerçek kapak + her bölüme ait görünür sahne/başlık; gizli sticky panel hareket etmez | Aynı bilgiler anlamlı başlıklar ve listelerle statik üretilir | Mevcut kapak yeniden kullanılır; yeni görsel indirme yok |
| Düşünce keşfi | Arşivde kaynaklı bir sayfa | Kısa çıkış → kâğıt kenarı/çizgi → maskeli düşünce → yazar/kaynak | Hareket durur; kaynak ve paylaşım araçları okunur | Kısa ekranda seçilen metin görünür alana alınır | Kaynaklar değişmez; canlı durum bildirimi, klavye, anında azaltılmış hareket | Son seçim kazanır; sınırlı animasyon sayısı; ücretli servis yok |

Ortak hareket sistemi `motion.js`, statik sahne üretimi `scripts/render-scenes.js` ve `scripts/sync-site.js`. Proje gerçekleri yalnız `site-data.js` içinden gelir. 15 doğrulanmış düşüncenin metin/kaynakları bu çalışmanın kapsamı dışında, aynen korunur.

Normal bağlantılar ve tarayıcı geçmişi korunur. Sayfalar ortak gerçek kapak, tipografi ve giriş hareketi dilini kullanır. Denenen cross-document View Transition, Chrome geri/ileri kontrolünde opt-in iptal hatası verdiği için teslimden çıkarıldı; standart navigasyon bütün tarayıcılarda esas davranıştır. Payot'un dört aşaması ve Hakkımda'nın güçlü başlığı aynı kalır.

Yayın sınırı: ayrı dal/PR ve önizleme. 4.0 için kullanıcı onayı gelmeden main birleştirmesi veya üretim dağıtımı yapılmaz.
