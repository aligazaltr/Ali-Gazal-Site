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
- project.js              Machiavelli paylaşımı; yerel menü veya bağlantı kopyalama
- favicon.svg             Var olan AG işaretinin küçük sekme simgesi
- 404.html                Bilinmeyen adresler için dönüş sayfası
- wrangler.jsonc          Bağlı Cloudflare Worker'a statik dosya dağıtımı
- .assetsignore           Yalnızca site varlıklarını yükler; repo dosyaları dışarıda

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

Machiavelli üç ilke ve ziyaretçi için 7 günlük takip rehberi kodda hazırdır.
Deney/video yayımlanmadan görünmez: `project.js` içindeki tek görünürlük alanı
`showSevenDayGuide: false` olarak tutulur. Doğrulanmış yayın devri geldiğinde
bu değer `true` yapılınca rehber, iki içindekiler bağlantısı ve güncel kaynak
notu birlikte açılır; bekleyen-kural açıklaması aynı anda gizlenir.

Onaylı kapak gelince index.html ve rehberler.html dosyalarındaki ilgili
.project-card öğesinin ilk çocuğu olarak gerçek görseli ekle:
<img class="project-cover" src="onayli-kapak.webp" width="1280" height="720"
     alt="Gerçek kapağı betimleyen kısa metin" loading="lazy">
16:9 görüntü stili hazırdır; kapak ve gerçek video URL'si gelmeden boş alan,
oynatıcı veya video düğmesi gösterilmez. Video bağlantısı machiavelli.html
dosyasındaki video durumuna dış bağlantı olarak eklenir.

Doğrulanmış varsayılan üretim adresi
`https://ali-gazal-site.aliicerikmedya.workers.dev/`.
Ana sayfa ve Machiavelli için canonical ve metin tabanlı Open Graph bu
adrese bağlıdır. Onaylanmış sosyal paylaşım görseli yoktur; yeni bir özel
alan adı bağlanırsa canonical ve Open Graph adresleri güncellenmelidir.

Cloudflare Workers Builds bağlantısı önizleme dallarında
`npx wrangler versions upload` kullanır. Wrangler yapılandırması kökteki
statik varlıkları mevcut `ali-gazal-site` Worker'ına yönlendirir ve eski
`.html` URL'lerini çalışan sayfalara yönlendirir. `.assetsignore` herkese
açık olmayan depo ve belgelendirme dosyalarının dağıtıma girmesini önler.
