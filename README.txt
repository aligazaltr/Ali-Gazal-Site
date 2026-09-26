ALİ GAZAL SİTESİ — DENEY DOSYALARI

Amaç:
YouTube kanalındaki gerçek hayat deneylerini destekleyen ücretsiz proje ve
rehber merkezi. Video hikâyeyi; site yöntem, durum ve doğrulanmış kanıt
sınırlarını taşır.

Teknik yapı:
- Statik HTML, CSS ve bağımlılıksız JavaScript
- GitHub → Cloudflare Workers Builds yayın hattı
- Koyu/açık tema ve sıcak turuncu marka dili
- Telefon, tablet ve masaüstünde erişilebilir düzen
- Framework, veritabanı, üyelik ve site içi video oynatıcı yok

Ana dosyalar:
- index.html              Kanalın ana sayfası
- rehberler.html          Proje arşivi
- machiavelli.html        Aktif deney dosyası
- marcus-aurelius.html    Arşivlenen eski adres için güvenli yönlendirme
- hakkimda.html           Amaç ve yayın ilkeleri
- 404.html                Bilinmeyen adresler için dönüş sayfası
- styles.css              Ortak tema, mobil düzen ve mikro hareketler
- theme.js                Sistem teması ve saklanan kullanıcı tercihi
- site-data.js            Tek merkezî, herkese açık proje/yayın verisi
- site.js                 Ortak veri alanları, kapak ve okuma ilerlemesi
- project.js              Aşama, paylaşım ve yayın kapılı proje araçları
- scripts/check-site.js   Bağımlılıksız statik bütünlük denetimi
- wrangler.jsonc          Cloudflare statik varlık dağıtımı

Yerel önizleme:
  python3 -m http.server 8123

Kontrol:
  node scripts/check-site.js
  node --check site-data.js
  node --check site.js
  node --check project.js
  node --check theme.js

MERKEZÎ PROJE VERİSİ

Yeni proje veya yayın güncellemesi site-data.js içindeki projects kaydından
yönetilir. Arama arayüzü henüz yoktur; title, slug, summary, topics, status,
phase, duration, source, publishedAt ve searchable alanları ileride arama ve
filtreleme eklenebilmesi için şimdiden standartlaştırılmıştır.

Yayın kapıları:
- Video published=false iken URL, başlık ve zaman kodu boş kalır.
- Final kapak yoksa thumbnail.src ve thumbnail.alt boş kalır.
- Sonuç published=false iken özet ve sınırlar boş kalır.
- Kanıt Defteri, video zaman çizelgesi ve Kendin Dene kendi feature bayrakları
  ile veri koşullarının ikisi de sağlanmadan görünmez.
- Kapalı özelliklerin yayımlanmamış içeriği site-data.js veya HTML içine
  konmaz. HTML hidden gerçek gizlilik sayılmaz.
- Meta başlıkları crawler uyumluluğu için HTML'de statiktir; yayın devrinde
  site-data.js ile birlikte güncellenir ve check-site.js ile URL'ler denetlenir.

DENEY AŞAMALARI

site-data.js içindeki phase alanı şu değerlerden birini alır:
- preparing  → Hazırlanıyor
- testing    → Deneniyor
- reviewing  → İnceleniyor
- published  → Video yayında

Machiavelli şu anda testing / Deneniyor durumundadır. Bu değer yalnız gerçek
proje durumu değiştiğinde güncellenir; tarihe bakarak otomatik ilerletilmez.

GELECEK ARAÇLAR

project.js içinde üç araç gerçek veri geldiğinde çalışacak biçimde hazırdır:

1. Kendin Dene
   - features.tryIt ve tryIt.enabled true olmalı.
   - tryIt.rules ve tryIt.guide doğrulanmış kamuya açık metin içermeli.
   - Kayıtlar ag:experiment:<slug>:v<sürüm> anahtarıyla yalnız tarayıcıda
     saklanır; kullanıcı başlatmadan veri yazılmaz.

2. Kanıt Defteri
   - features.evidenceLedger ve evidence.published true olmalı.
   - En az bir public kanıt kaydı bulunmalı.
   - Kayıt; olay, kanıt türü, neyi desteklediği ve neyi kanıtlamadığı alanlarını
     birlikte taşımalıdır.

3. Video zaman çizelgesi
   - features.videoTimeline ve video.published true olmalı.
   - Gerçek YouTube URL'si ve doğrulanmış chapter saniyeleri bulunmalı.
   - Bağlantılar site içi oynatıcıya değil, ilgili YouTube dakikasına gider.

ONAYLI KAPAK VE PAYLAŞIM

Final kapak geldiğinde site-data.js içindeki video.thumbnail alanına dosya,
alternatif metin, genişlik ve yükseklik eklenir. Gerçek dosya repo kökünde
optimize edilmiş biçimde bulunmalıdır. Aynı görsel sosyal paylaşım için
kullanılacaksa index.html ve machiavelli.html içindeki statik Open Graph ve
Twitter kart alanları gerçek üretim URL'siyle güncellenir. Var olmayan görsel
og:image olarak yazılmaz.

SITE HANDOFF CARD

Video yayımlandığında aşağıdaki doğrulanmış bilgiler yeterlidir:
- Proje slug'ı
- Güncel aşama
- Final video başlığı ve tam YouTube URL'si
- Final kapak dosyası ve kısa alternatif metni
- Yayın tarihi
- Kamuya açık kesin ilkeler
- Kendin Dene rehberi
- Kısa nihai sonuç ve yorum sınırları
- Kamuya açılabilecek kanıt kayıtları
- Video bölümleri ve kesin zaman kodları
- Açılacak özellikler: Kendin Dene / Kanıt Defteri / video zaman çizelgesi

Doğrulanmış varsayılan üretim adresi:
https://ali-gazal-site.aliicerikmedya.workers.dev/

Özel alan adı bağlanırsa canonical ve Open Graph adresleri birlikte
güncellenmelidir.
