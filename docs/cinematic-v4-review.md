# Ali Gazal — Cinematic Experience 4.0 teslim raporu

3.0 temelinin devamı. Başlangıç main: `9f61f699e2c5364c5e7db6e12e6566ca08d4c350`. Yeni site kurulmadı. Onaylı içerik ve gerçek final kapak korundu.

1. **Dört imza deneyimi:** birbirine bağlı maskeli giriş kelimeleri, dönüşen fikir dosyası, Machiavelli araştırma sahnesi, kâğıt/çizgi/metin sıralı düşünce keşfi.
2. **Ana sayfa:** DÜŞÜN. SORGULA. DENE. KEŞFET. aynı kompozisyonda. Kelimeler 105 ms aralıkla ortak hareket kullanır; son kelime 835 ms içinde durur. İnce turuncu vurgu ilk kaydırmayı hikâyeye bağlar. Hiçbir bağlantı animasyon bitmesini beklemez.
3. **Fikir → Deney → Sonuç:** aynı üç DOM katmanı önce bir dosya, sonra bağlı uygulama adımları, sonunda düzenlenmiş kayıtlar olur. Son sorunun tipografisi öne çıkar. Yalnız metin değiştirilmez; kalıcı öğelerin konumu, ölçeği ve opaklığı gerçekten dönüşür.
4. **Machiavelli:** mevcut gerçek kapak üç ilkeden tarih/kayıt düzenine, oradan “Olumlu. Fakat kısmi.” değerlendirmesine yer açar. 21–27 Eylül 2026, dört anonim kayıt ve öz-bildirim sınırları merkezî veriden gelir. Ayrıntı bağlantıları mevcut kurallara, kanıt defterine ve sonuca gider. Video bağlantısı uydurulmadı.
5. **Düşünce Arşivi:** 15 doğrulanmış düşünce, yazar, kitap, kaynak, açıklama ve yorum aynen korundu. Keşfedilen düşünce ayrı bir kâğıt yüzeyine yerleşir; sıra numarası mevcut arşivdeki yeridir, yeni bir başarı/ziyaret istatistiği değildir.
6. **Rastgele keşif hareketi:** kısa çıkış → sayfa kenarı/çizgi → maskeli alıntı → yazar/kaynak → durağan okuma. Hızlı seçimlerde son istek kazanır; odaktaki metin eski animasyon yüzünden değiştirilmez. Filtre değişince eski keşif kapanır.
7. **Mobil kararlar:** gizli masaüstü paneli güncellenmez. Her görünür yerel sahnenin kendine ait dönüşümü vardır. 480 px gibi kısa pencerede düşünce ve yazarı görünür alana alınır; kullanıcı normal kaydırmaya devam eder. 560 px altındaki kısa masaüstü penceresinde uzun sticky panel normal akışa döner.
8. **Teknoloji:** statik HTML, CSS, vanilla JS, IntersectionObserver, Web Animations API; ağırlık opacity/transform üzerinde. `motion.js` ortak motor, `scripts/render-scenes.js` statik sahne üreticisidir. Veri ve HTML senkronizasyonu devam eder.
9. **Bağımlılık:** yeni framework, paket, ücretli API, backend, WebGL, video arka planı veya görsel dosyası yok. Eski kullanılmayan halka/glif CSS'i temizlendi.
10. **Performans:** yerel gzip karşılaştırmasında ortak hareket JS'i +530 bayt; arşiv JS'i +180 bayt. İlgili CSS toplamı +2.030 bayt. Final kapak aynı 197.054 bayt ve bayt düzeyinde değişmedi. Chrome iframe ortamında 3.0/4.0 için 12 yükleme denemesi yapıldı. LCP çoğu örnekte gelmedi; CLS kayıtları iframe boyutlandırma/önizleme koşullarından etkilendi; INP için yeterli gerçek etkileşim ölçümü oluşmadı. Güvenilir Core Web Vitals karşılaştırması veya performans puanı iddia edilmiyor. [Ham ölçüm](cinematic-v4-evidence/v4-performance-qa.json), [dosya bütçesi](cinematic-v4-evidence/asset-budget.json).
11. **Otomatik testler:** 41 Node testi geçti. Türkçe arama, yayın/doğrulama kapıları, kaynak ve telif alanları, rastgele seçim, paylaşım ortamı, no-JS, hareket azaltma, hızlı seçim/iptal, ekran dışı hareket, merkezî veri, dört Payot aşaması ve içerik senkronizasyonu kapsandı. Statik HTML, yerel bağlantı, metadata/canonical ve yayın dosyası kontrolleri geçti.
12. **Gerçek tarayıcı:** Chrome'da 6 sayfa × 8 genişlik × 2 tema = 96 düzen; ana sayfa/Machiavelli × 2 genişlik × 3 yükseklik × 3 sahne = 36 sahne; 12 no-JS görünüm; 12 arşiv davranış kontrolü geçti. Genişlikler: 320/360/375/390/430/768/1024/1440. Sahne yükseklikleri: 480/640/900. Normal bağlantılar, geri/ileri, tema kalıcılığı, içindekiler, okuma ilerlemesi ve kaynak açılışı ayrıca elle denendi. Paylaşım/kopyalama **yükleri QA kaydıyla** doğrulandı; gerçek işletim sistemi paylaşım menüsü testi sayılmaz.
13. **Test edilemeyenler:** fiziksel Android, Android Chrome/Firefox ve açılıp kapanan gerçek adres çubuğu; iOS/Safari; fiziksel ekran okuyucu; işletim sistemi paylaşım menüsü ve pano izinleri. Hareket azaltma Node ve tarayıcıdaki JS tercihi simülasyonuyla denendi; gerçek cihaz/OS tercihi testi değildir. Kısa ekran görüntüleri responsive Chrome iframe'idir.
14. **Dal:** `feature/cinematic-signature-experience-v4`.
15. **Commit:** ilk uygulama `6ccc8a5`, sahne/ölçüm denetim temeli `245cfb0`. Bu raporu içeren teslim commit'i PR'ın güncel head'idir; nihai SHA teslim mesajında ve PR açıklamasında verilir.
16. **PR:** [#12 — Cinematic Experience 4.0](https://github.com/aligazaltr/Ali-Gazal-Site/pull/12).
17. **Önizleme:** [4.0 ana sayfa](https://feature-cinematic-signature-experience-v4-ali-gazal-site.aliicerikmedya.workers.dev/). Gerçek tarayıcıda açılıp denetlendi. Geçici QA sayfaları ve erken ölçüm script'i teslimden kaldırıldı; ham kanıtlar yalnız dağıtım dışındaki `docs/` içindedir.
18. **Canlı:** bu çalışma main'e birleştirilmedi; mevcut 3.0 üretim sürümüne yayın yapılmadı.
19. **Kalanlar:** fiziksel cihaz denetimi ve güvenilir saha Core Web Vitals ölçümü. Kısa ekran videosu üretilmedi; gerçek ekran görüntüleri alındı. Yeni içerik, video tarihi/süresi/URL'si veya alıntı üretimi bu çalışmaya eklenmedi.
20. **Onay öncesi:** kullanıcı dört imza sahnesini önizlemede incelemeli. Geri/ileri kontrolünde denenen cross-document View Transition, Chrome'da `ViewTransition opt-in disabled` hatası verdi; isteğe bağlı bu API efekti teslimden çıkarıldı. Görsel süreklilik ortak kapak, tipografi, yüzey ve giriş hareketleriyle sürüyor; standart bağlantılar korunuyor. 4.0 için açık yayın onayı gelmeden PR birleştirilmeyecek.

## Önce / sonra değerlendirmesi

| Bölüm | 3.0 başlangıcı | 4.0 değişikliği | Anlam ve sınır |
| --- | --- | --- | --- |
| İlk ekran | Beğenilen dört kelime, ayrı kısa girişler | Birbirine geçen maskeler ve ilk kaydırmaya devam eden çizgi | Kimlik korunur; durağan görüntüde devrim iddia edilmez, asıl fark harekettedir. |
| Hikâye | Halka motifi, mobilde basit glifler | Aynı üç dosya katmanının üç düzen arasında yolculuğu | Kaynak → uygulama → değerlendirme anlamını taşır; sayısal sonuç değildir. |
| Machiavelli | Güçlü kapak ve klasik proje okuması | Gerçek kapak, ilkeler, kayıtlar ve sınırların özel sahnesi | Kısmi sonuç ve kanıt eksikliği saklanmaz. |
| Keşif | Metin/çizgi geçişi, sade yüzey | Sayfa katmanı ve kaynakla birlikte sıralı açılış | İçerik değişmeden okuma deneyimi güçlenir. |
| Hakkımda / Payot | Güçlü editoryal başlık / dört araştırma aşaması | Ana düzen korunur; Payot akışında ince bağlayıcı çizgi | İkinci ana sayfa veya yeni deney sonucu eklenmez. |

Fotoğraflar gerçek tarayıcıdan alındı; telefon kareleri responsive emülasyondur. 3.0 giriş fotoğrafı bu turda, önceki diğer 3.0 karşılaştırma kareleri önceki çalışmada alınmıştı. Durağan fotoğraf akıcılığı tek başına kanıtlamaz; hareket davranışı [36 sahnenin ham kaydı](cinematic-v4-evidence/v4-scenes-qa.json) ile birlikte değerlendirilmiştir.

[96 düzen](cinematic-v4-evidence/v4-layout-qa.json) · [no-JS](cinematic-v4-evidence/v4-nojs-qa.json) · [arşiv davranışı](cinematic-v4-evidence/v4-archive-qa.json) · [paylaşım yükleri](cinematic-v4-evidence/v4-share-qa.json) · [JS hareket azaltma](cinematic-v4-evidence/v4-reduced-qa.json) · [ilk gezinme kaydı](cinematic-v4-evidence/v4-navigation-qa.json) · [Node test çıktısı](cinematic-v4-evidence/node-tests.txt)
