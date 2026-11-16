# Aşama A — Proje durumu ve yayın tutarlılığı

Durum referansı: 16 Kasım 2026. Teknik hazırlık: 17 Kasım 2026.
Başlangıç: `31cf2005592b7ffc21b842c3c39dea2982c07354`.
Çalışma dalı: `feature/project-status-publication-sync-v1`.
Bu çalışma ayrı bir PR/Cloudflare önizlemesidir; main veya production'a alınmaz.

## Kapsam ve teslim

- Machiavelli: gerçek video URL'si, başlık ve 15 Kasım yayın tarihi korunur.
  Araştırma dosyası ve yayımlanmış sınırlı sonuçlar değişmez. Mevcut
  yayın metinleri yayın/yayından çekme koşullarından türetilir; kaynak dosyadaki
  eski hazırlık metinleri yalnız yayımlanmamış durumun açık koşulunda kalır.
- İrade Terbiyesi: okuma, yöntem seçimi ve modern bilimsel inceleme tamamlandı;
  16–22 Kasım yedi günlük uygulama sürüyor. Kitabın kesin bitiş günü eklenmedi.
  Yöntemler 1, 2 ve 12 seçim numaralarıyla kayıtlı; sayfada 01–03 olarak sunulur.
  Bilimsel incelemenin tamamlanması, bütün kaynakların sitede yayımlandığı
  veya yöntemlerin etkili bulunduğu anlamına gelmez.
- Kontrol Bende mi?: devam ediyor, planlanan 60. gün 19 Kasım. Gerçek günlük,
  özel ölçüm, sonuç, başarı oranı veya yeni video eklenmedi.
- Mevcut CSS, medya, Machiavelli V6.1 ve Control V2.2 aynen korunur.
  Yöntemler mevcut principle-list stillerini kullanır.
- Güncel özetler, durum kartları, yöntemler ve HTML/SEO/arşiv çıktıları
  mevcut site-data.js → sync-site/build-archive/sync-seo hattından üretilir.
- Güncel kopya, yayın kapıları, metin kaçışları ve tarihin deneyleri kendiliğinden
  tamamlamaması için testler eklendi. Eski başlangıç durumunu varsayan araştırma
  testleri açık senaryolar kullanır. Yayın geri çekme testleri korunur.

## Doğrulama

Cloudflare önizleme derlemesi mevcut wrangler.jsonc komutunu çalıştırır:
`node scripts/sync-site.js --check`,
`node scripts/build-archive.js --check`,
`node scripts/sync-seo.js --check`,
`node scripts/check-site.js`,
`node --test scripts/test-*.js`.

Bu oturumda yerel Node/terminal ve tarayıcı aracı yoktur.
Kaynak/üretilmiş metin tutarlılığı JavaScript içinde ayrıca denetlendi;
bu kontrol yerel Node testi veya gerçek mobil/masaüstü görsel kontrol sayılmaz.
Native Node sonucu ve önizleme adresi PR'nin Cloudflare kontrolünde izlenir.
Fiziksel telefon, mobil/masaüstü görsel QA ve native paylaşım henüz doğrulanmadı.
Bu kontroller kullanıcı yayını onaylamadan önce tamamlanmalıdır.

Koruma hash'leri yalnız kasıtlı veri/metin değişiklikleri için yenilenir.
Animasyon, CSS ve medya dosyalarının yeni sürümü oluşturulmaz.

## PR #20 ile uyumluluk notu

PR #20 taslak, başlığı: Payot Cinematic V1.
İncelenen head: `a97dfafa289992d675069aad1c9d4d69b3f4bd2b`.
Bu PR'ye commit, rebase, başlık/durum değişikliği veya merge yapılmaz.

İleride birleştirilirken:

1. İrade Terbiyesi HTML'si iki dalda değiştiğinden araştırma açılışı, başlık
   seviyesi ve yeni yöntemler alanı birlikte korunmalı.
2. sync-site.js üzerindeki Payot renderer import'u ve giriş marker'ı,
   bu daldaki durum/yöntem renderer'larıyla birlikte birleştirilmeli.
3. PR #20'deki test-payot-scene.js hâlâ “Deney henüz başlamadı” bekliyor.
   Bu varsayım kaldırılıp gerçek devam eden deney ve dinamik durum sınanmalı.
   Animasyondaki “7 GÜN · PLANLANAN UYGULAMA” süresi bir başarı iddiası değildir;
   diğer durum yazıları da güncel deneyle uyumlu gözden geçirilmeli.
4. PR #20'nin test-control-portal.js normalizasyonu güncel araştırma HTML'sini
   geri üretmeli; bu daldaki koruma hash'leri geri alınmamalı.
5. Bu dalın güncel site-data.js kaydı korunmalı. Eski okuma/deney durumunu geri
   getiren bir dosya seçimi yapılmamalı.
6. Bu not bir deneme merge'i veya tarayıcı onayı değildir; yalnız kaynak diff
   ve test incelemesidir. #20 ayrı inceleme ve açık yayın onayı gerektirir.

## YouTube → site için kullanıcı hesabı kontrolü

Site → video bağlantısı: https://youtu.be/6MxLFTRudaQ
Deney dosyası: https://aligazal.com/machiavelli

YouTube açıklamasındaki site/dosya bağlantısını ve isteniyorsa sabit yorumu
hesap sahibi kontrol edebilir. Açıklama veya sabit yorum bu görevde okunmadı
ve değiştirilmedi; eksik oldukları iddia edilmez.

## Geri dönüş

Bu PR merge edilmeden kapatılabilir. Production ve main bu aşamada değişmez.
Gelecekte onaylı bir merge geri alınacaksa bu PR'nin commit'i hedeflenerek
normal revert kullanılmalı; force push veya DNS işlemi gerekmez.

## Sonraki aşamalar — uygulanmadı

### B — Merkezî yayın altyapısı

1. Araştırma, deney ve video durumlarını ayrı modellemek.
2. Doğrulanmış yayın geçişleri; tarihle otomatik tamamlama yok.
3. Ortak durum kartları.
4. Gerçek içerik güncellemesine bağlı son güncelleme tarihi.
5. Video, kapak, tarih, kaynak, SEO, mobil ve erişilebilirlik yayın kontrolü.
6. Yeni projeler için tekrar kullanılabilir, boş veriyi sonuç saymayan şablon.

### C — YouTube ve final deney hazırlığı

1. Araştırmadan performans analizine 15 adımlı video üretim kontrol listesi.
2. Tek aktif kurgu merkezi.
3. Mevcut ekipman için çekim öncesi teknik kontrol.
4. Gerçek çekimlerden B-roll arşivi.
5. Dosya/klasör adlandırma şablonu; mevcut dosyaları otomatik taşımamak.
6. Senaryo iddiası / kanıt / sınır / görüntü eşleştirmesi.
7. Bir ana kalite kontrolü, gerekli hedefli düzeltme, ardından yayın.
8. Onaylı sekiz aşamalı thumbnail süreci; fotoğraf olmadan final üretmemek.
9. Başlık, açıklama, kaynak, altyazı, kapak ve görünürlük yayın kontrolü.
10. Gerçek Studio verileri için boş analiz şablonu; erişim iddiası yok.
11. Kontrol Bende mi? final kayıt denetimi, eksik veri, grafik ve hikâye şablonları.
    Gerçek özel günlükler veya sağlık/cinsel davranış ayrıntıları public repo'ya konmaz.

### D — İçerik geliştirmeleri

1. Proje durumlarını merkezîleştirme.
2. Yayın sonrası güncel metin kontrolü.
3. Araştırma ve deney ayrımı.
4. Seçilen uygulama yöntemlerinin sunumu.
5. Machiavelli bağlantı kontrolü.
6. Ortak yayın kontrol listesi.
7. Gerçek son güncelleme tarihi.
8. Gerçek yayın durumuna bağlı rozet.
9. Video yayın şablonu.
10. Doğrulanmış araştırma kaynakları.
11. Mevcut arşiv verisini koruyan kitap/yazar/proje ilişkileri.
12. Soru, yöntem, ölçüm, bulgu, belirsizlik ve sınır alanlarından sonuç şablonu.

B, C ve D kullanıcı başlatmadan uygulanmaz. Yeni CMS, backend, üyelik,
çoklu dil, bülten veya büyük yeniden tasarım bu PR'nin kapsamında değildir.
