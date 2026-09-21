ALI GAZAL SİTESİ — TÜRKÇE İLK SÜRÜM

Amaç:
YouTube kanalındaki gerçek hayat deneylerini destekleyen ücretsiz proje ve rehber merkezi.

Sayfalar:
- index.html              Kanalın ana sayfası
- rehberler.html          Proje ve rehber arşivi
- machiavelli.html        Aktif Machiavelli / Prens deney dosyası
- marcus-aurelius.html    Eski proje adresi için güvenli yönlendirme
- hakkimda.html           Kanalın amacı ve yayın ilkeleri
- styles.css              Ortak görünüm ve mobil düzen
- theme.js                Sistem temasını izler; elle seçimi yerel olarak saklar
- favicon.svg             Var olan AG işaretinin küçük sekme simgesi
- 404.html                Bilinmeyen adresler için dönüş sayfası

Tasarım:
- Koyu/açık yüzeyler ve sıcak turuncu vurgu
- Kanalın "fikirleri hayatta test etme" kimliğine uygun deney dosyası yaklaşımı
- Telefon ve bilgisayarda okunabilir statik yapı; JavaScript kapalıyken
  sistem teması ve içerik çalışır, yalnızca manuel tema seçimi görünmez

Bilinçli olarak eklenmeyenler:
- Üyelik veya kullanıcı hesabı
- Ödeme ve premium içerik
- Veritabanı
- Arama ve filtreler
- Çoklu dil
- Karmaşık framework

Yerelde açmak için index.html dosyasını tarayıcıda açmak yeterlidir.
Alternatif: bu dizinde `python3 -m http.server 8123` çalıştırıp
`http://localhost:8123/` adresini aç.

İçerik ilkesi:
Kesinleşmemiş deney sonuçları yayımlanmış gibi gösterilmez. Machiavelli
sayfasındaki üç davranış kuralı, sonuç ve video alanları yalnız doğrulanmış
proje devri geldikçe güncellenir.

Site Handoff Card (Machiavelli sayfasında güncellenecek üç alan):
1. Kurallar: her ilkenin kesin metni, Prens bölüm/kaynak bağlamı,
   etik uyarlama, tetikleyici → davranış → kanıt.
2. Sonuç: doğrulanmış kayıt sayısı, fırsat yok/kaçan günler, yayımlanabilir
   kanıt, başarısızlık, belirsizlik ve yorum sınırı.
3. Video: nihai başlık, tam YouTube URL'si, yayın tarihi ve onaylı kapak.

Kesin canlı alan adı bilinmeden canonical, sitemap veya sahte paylaşım
görseli eklenmez. Sayfalarda başlık/açıklama ve metin tabanlı Open Graph var.
