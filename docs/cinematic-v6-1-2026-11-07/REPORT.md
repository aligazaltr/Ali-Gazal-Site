# Ali Gazal — Cinematic Finishing V6.1

7 Kasım 2026. Taban ve korunmuş üretim: `0b3f0d02c240a8c19a0e3fbd232fcc0b90d066ab`. [PR #17](https://github.com/aligazaltr/Ali-Gazal-Site/pull/17). Test edilen ürün kodu: `b2e5996daa07cbc7c491bcd882d95335a1fec644`. Yeni tasarım yapılmadı. Main, DNS, hesap ayarları ve üretim yayını değiştirilmedi.

## A. Machiavelli animasyonu

**Tek yerleşme ve şeffaf kapak geçişi uygulandı.** Eski yaklaşık yüz ankrajı ile ayrı ölçeklenen kapak aynı koordinat sistemini kullanmıyordu. Portre kaybolurken alttaki farklı konumdaki yüzün görünmesi ikinci bir yerleşme izlenimi oluşturabiliyordu. Film transform-origin'i, caption dahil figure yüksekliği ve tamsayı offset ölçümleri de gerçek görüntü koordinatıyla aynı şey değildi.

Onaylı 960×1140 portre ile değiştirilmeyen 1280×720 final kapak arasında SIFT eşleşmeleriyle bir benzerlik dönüşümü ölçüldü: 74 aday, 51 RANSAC inlier, kapak pikselinde medyan 0,669 artık hata. Analiz filtresi ratio .68, kapakta x>780, portrede y<850; RANSAC reprojection eşiği 2 px. Ham eşleşmeler [image-registration.json](evidence/image-registration.json)'dadır. OpenCV yalnız geçici analiz ortamında kullanıldı; ürün/build bağımlılığı değildir. Onaylı görsellerin SHA256 değerleri Node testinde kilitlidir.

Dönüşüm yaklaşık `x'=0,575843x+0,002237y+708,824841`, `y'=-0,002237x+0,575843y−20,867641`. Bunlar tahmini DOM piksel yamaları değil, sabit kaynak görsellerin intrinsic koordinatlarıdır. Controller gerçek fractional CSS boyutlarını ve transform-origin'i okur. Kapak dönüşümü her karede `P × inverse(M)` olarak portre dönüşümünden türetilir; böylece fade sırasında iki yüz aynı geometriyi paylaşır. Normal portre yolculuğu korunur; hedefe yaklaşık %78'de ulaşılır ve sonrasında konum sabit kalır.

`filmClip` ve yönlü `clip-path` açılması kaldırıldı. Kapak yaklaşık %48–84 arasında opacity 0→1 olur. Kaynak portre, alttaki yüz yeterince görünür olmadan kaybolmaz; %76–94 aralığında söner. Büyük başlık/önceki metinler söner, sonuç metni kısa opacity girişi yapar; yeni metin hareketi en fazla 6 px. Başlangıç kimliği, tipografi, final kapak, Projeler ve Hakkımda tasarımı değişmedi.

**Gerçek Chrome sonucu:** 7 genişlik × 2 tema = 14/14 senaryo, altı ilerleme noktasıyla 84 kare. Her karenin 51 yüz ayrıntısı karşılaştırıldı. Senaryo başına medyan hizalama hatasının en büyüğü **0,596 CSS px**, bütün tekil ayrıntıların en büyük farkı **2,036 px**. %78 ile %95 arasında örnek portre noktasının en büyük konum değişimi **0,000686 px**. Bu sonuçlar test edilen render koşullarına aittir; her cihaz için sıfır piksel hata garantisi değildir.

Örneğin %75'te görünür yüz katmanlarının medyan farkı telefonda **10,16→0,18 px**, 1024 px masaüstünde **23,24→0,38 px** ölçüldü. %95'te eski portre zaten görünmez; o andaki gizli katman farkı görünür hata diye sunulmaz.

### Gerçek önce / sonra kareleri

390×740 koyu tema ve 1024×740 açık tema, aynı Chrome ve aynı ilerleme yüzdeleri. Tam tarayıcı ekran görüntüsündeki gri alan test cihazının dışında kalan alandır. Dikey iframe scrollbarı içerik genişliğinden 15 px alabilir. 1440 px ayrıca matris içinde test edildi. Bunlar fiziksel Android görüntüsü veya üretilmiş mockup değildir.

| An | Telefon | Masaüstü |
|---|---|---|
| %55 | [Önce](evidence/before-mobile-55.jpg) / [Sonra](evidence/after-mobile-55.jpg) | [Önce](evidence/before-desktop-55.jpg) / [Sonra](evidence/after-desktop-55.jpg) |
| %75 | [Önce](evidence/before-mobile-75.jpg) / [Sonra](evidence/after-mobile-75.jpg) | [Önce](evidence/before-desktop-75.jpg) / [Sonra](evidence/after-desktop-75.jpg) |
| %95 | [Önce](evidence/before-mobile-95.jpg) / [Sonra](evidence/after-mobile-95.jpg) | [Önce](evidence/before-desktop-95.jpg) / [Sonra](evidence/after-desktop-95.jpg) |

[84 kare ve geri kaydırma ham ölçümü](evidence/matrix-final.json), [12 karşılaştırma anı](evidence/comparison-samples.json), [temiz önizleme gerçek görünümü](evidence/clean-preview-desktop.jpg).

## B. YouTube

Merkezi `site-data.js` ve `video-links.js` korunur. Gerçek kayıtta video **published:false**, URL **boş**. Standart HTTPS video URL'si, gerçek yayın durumu ve başlık kapısı dışında link açılmaz; statik yayın doğrulaması tarih/süreyi de ister. `youtube:`, intent şeması, üçüncü taraf yönlendirme veya izlenme manipülasyonu eklenmedi.

Yayımlandığında thumbnail native bağlantı olur; araştırma dosyası ayrı kalır. Yerel uygulamanın açılması uygulama kurulumuna, OS ilişkilendirmesine ve tarayıcı/varsayılan bağlantı tercihlerine bağlıdır. HTTPS tarayıcı yolu çalışır; uygulama açılacağı garanti edilmez. Gerçek video URL'si olmadığı için gerçek videoda Android/iOS uygulama açılışı veya oynatım testi yapılmadı.

Yalnız QA fixture'ında sentaktik `TESTFIXTURE` URL'si vardır, her tıklama yakalanır, YouTube'a gönderilmez. Gerçek Chrome Enter ve pointer olayları `trusted:true`, detail 0/1 verdi. Native focus kapağı görünür yapar, `_blank` ve `noopener noreferrer` korunur. [Olaylar](evidence/native-activations.json), [odak](evidence/native-focus.json). Bu fixture temiz önizleme/üretim varlığı değildir.

## C. Ana sayfa

Mevcut proje alanına yayın doğrulandıktan sonra **“Videoyu YouTube’da izle”** native metin bağlantısı üretilecek bir statik marker eklendi. Kapak da videoya gider; ayrı dosya bağlantısı korunur. Yayın geri çekilince izleme bağlantısı kaldırılır. Yayın/geri çekme/idempotency ve gerçek yayımlanmamış durum test edilir.

Gerçek yayın bilgisi yokken marker boştur; görünür yeni bölüm, boş kart veya erken yayın duyurusu yok. DÜŞÜN/SORGULA/DENE/KEŞFET, AG halkaları, FİKİR→DENEY→SONUÇ ve mevcut V6 kompozisyonu korunur. Durum hâlâ **“Deney tamamlandı · video hazırlanıyor”**.

## D. Donanım uyumluluğu

CNC bilgisayarının gerçek sebebi doğrulanmadı ve donanım yetersizliği varsayılmadı. O tarayıcıda/cihazda ölçüm yapılmadı. Kısa pencere (<420 px), root metin >24 px, hareket azaltma, eksik IntersectionObserver/rAF/matchMedia veya sticky/transform desteği ve gerçek görsel hatası bilinçli statik akış nedenleridir.

Altı statik durum (JS kapalı, reduced-JS, 390 px yükseklik, %200 root metin, Observer yok, sticky desteği yok), erken gerçek görsel hatası, daha sonraki yüklenmeyle kurtarma, geciken gerçek görsel, 390×740→768×430 viewport dönüşü ve yeniden yükleme/ölçüm: **11/11 geçti**. İlk turdaki iki sorun saklanmadı: cached error dinleyiciden önce gelebiliyordu; viewport dönüşünde eski geometri örneklenebiliyordu. Cached decode reddi aynı source/complete/zero-width koşuluyla sonraki karede doğrulanır; geç başarılı yükleme kurtarır. Resize ölçümü rAF ile birleştirilir; varsa ResizeObserver gerçek kutu değişimini izler. Ağır animasyon zorlanmaz.

Gerçek temiz sayfada native scroll ile %73,19'a gidildi, geri kaydırmada %0'a dönüldü ve reload sonrası sahne/görsel doğru kaldı. [Native gözlem](evidence/native-scroll-reload.json). Hızlı %95→%40 geri geçişi ayrıca her matris senaryosunda ölçüldü. Önceki PageDown/PageUp anlık gözlemleri ara durumdur, ayrı performans başarısı sayılmaz.

Fiziksel Android/iOS/CNC, CPU throttling, gerçek OS/CSS reduced-motion emülasyonu, native browser zoom ve ekran okuyucu dinlemesi yapılmadı. Reduced-motion burada JS tercihi simülasyonu ve statik CSS kaynak kontrolüdür. Lighthouse veya alan INP/LCP puanı uydurulmadı. Sürekli rAF döngüsü, scroll interception veya yeni runtime kütüphane yok.

## E. Güvenlik

| Madde | Sonuç | Kanıt / sınır |
|---|---|---|
| Apex DNS / NS | **DOĞRULANDI** | elinore/sullivan Cloudflare NS; A 172.67.192.127 ve 104.21.68.88; AAAA bağımsız resolver tekrarıyla doğrulandı |
| Tam DNS zone dökümü / gereksiz kayıtlar | **HESAP ERİŞİMİ GEREKİYOR** | Public sorgular bütün kayıtları listelemez |
| Cloudflare hizmeti / proxy | **DOĞRULANDI** | Cloudflare A/AAAA/NS ve mevcut Worker çıktısı; panelde her kaydın proxy düğmesi ayrıca görülmedi |
| www DNS | **EKSİK** | İki resolver NXDOMAIN döndürüyor |
| www→apex kalıcı yönlendirme | **EKSİK** | DNS yokken çalışır 301/308 zinciri kurulmuş sayılamaz |
| Apex HTTPS | **DOĞRULANDI** | HTTPS 200, curl TLS doğrulama sonucu 0, Chrome'da uyarısız açılış. Ölçüm ortamının ara proxy'si nedeniyle origin sertifika tarihleri ayrı doğrulanmadı |
| HTTP→HTTPS kalıcı durum kodu | **UYGULANAMADI** | Ara proxy HTTP URL'sine 200 döndürdü, gerçek sunucu 301 zinciri bağımsız doğrulanamadı |
| SSL modu / Always Use HTTPS ayarı | **HESAP ERİŞİMİ GEREKİYOR** | Panel görülmedi; mevcut mimari static Worker, ayrı WordPress/origin kurulumu yok |
| Mixed content | **DOĞRULANDI** | Ürün kaynaklarında aktif HTTP asset URL'si görülmedi; temiz tarayıcıda site kaynaklı hata gözlenmedi |
| DNSSEC zinciri | **EKSİK** | Cloudflare+Google resolver: DS/DNSKEY yok; Verisign RDAP delegationSigned:false. Zincir etkin değil |
| Registrar / transfer kilidi | **DOĞRULANDI** | Cloudflare, Inc. / IANA 1910; client transfer prohibited |
| Auto-renew / ödeme yöntemi | **HESAP ERİŞİMİ GEREKİYOR** | Public bitiş 4 Kasım 2027; bu auto-renew kanıtı değildir |
| Free Managed Ruleset / Security Events | **HESAP ERİŞİMİ GEREKİYOR** | Resmî dokümanda Free plan için varsayılan dağıtım yazması bu hesabın durumunu kanıtlamaz |
| Cloudflare/GitHub 2FA / passkey | **HESAP ERİŞİMİ GEREKİYOR** | Parola/kod/token istenmedi |
| Üyeler / token kapsamları / deploy yetkileri | **HESAP ERİŞİMİ GEREKİYOR** | GitHub içerik bağlantısı var; yönetim yetkileri görülmedi |
| Main dal koruması | **EKSİK** | Public branch protected:false; repo rulesets []; yönetim ayrıntı endpoint'i 403 |
| Beş güvenlik başlığı | **DOĞRULANDI** | CSP enforce, nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy gerçek yanıtta var |
| HSTS / preload | **EKSİK** | Header görülmedi; kapsam tamamlanmadan açılmadı, preload yapılmadı |
| Gizli dosyaların yayın dışı olması | **DOĞRULANDI** | Aynı 34 varlık allowlist'i, temiz önizleme private fixture/QA yolları 404 |
| Kaynak token/private-key imza taraması | **DOĞRULANDI** | Sınırlı imza taraması dosya isabeti vermedi; tam güvenlik garantisi değildir |

[DNS ham sonuçları](evidence/dns.json), [AAAA tekrarı](evidence/dns-aaaa-retry.json), [RDAP](evidence/rdap.json), [registrar adı](evidence/registrar.json), [HTTP](evidence/domain-http.json), [GitHub](evidence/github-security.json), [sınırlı kaynak taraması](evidence/source-security.json).

WAF saldırı probu, DNS değişikliği, HSTS preload, ücretli servis veya hesap yetkisi değişikliği yapılmadı. Cloudflare bağlantısı arandı; kullanılabilir hesap yönetim bağlantısı bulunamadı. Mevcut CSP gevşetilmedi; QA inline script canary'si çalışmadı ve `enforce` ihlali kaydedildi.

## F. GitHub ve önizleme

Dal: `fix/machiavelli-cinematic-finish-v6-1`; [PR #17](https://github.com/aligazaltr/Ali-Gazal-Site/pull/17), main tabanlı ve taslak. Ürün commit'i `b2e5996daa07cbc7c491bcd882d95335a1fec644` için Cloudflare build **başarılı**. Son rapor/QA kaydı commit'i public ürün varlıklarını değiştirmez.

**Temiz önizleme:** https://0444aef4-ali-gazal-site.aliicerikmedya.workers.dev/machiavelli

QA ve kaynak belgeleri üretim manifestine eklenmedi. `qa/machiavelli-v6-1-20261107` yalnız ölçüm dalıdır, birleştirilmemelidir. Test preview'ı gerçek videoyu yayımlanmış saymaz.

## G. Testler

| Test | Sonuç |
|---|---|
| Node | **69/69** |
| sync-site / build-archive / sync-seo / check-site | **Geçti** |
| 320/360/390/430/768/1024/1440 × koyu/açık | **14/14**, altı an = **84 ölçüm**; ayrıca hedef/son/geri kaydırma |
| JS kapalı / reduced / kısa ekran / metin / API yok / görüntü / resize / reload | **11/11** son tur |
| Native yayın kapısı / odak / ayrı dosya / ana sayfa / no-JS | **6/6**, ayrıca trusted Enter ve pointer |
| CSP inline canary | **Geçti: engellendi, enforce** |
| Temiz preview HTTP/SEO/header/private asset | **33/33** |
| V6.1 private fixture yolları ve tam yeni controller baytları | **8/8**; clean-extra-http.json |
| Cloudflare ürün build | **Başarılı** |

İlk yaşam döngüsü testi **9/11**, kaynak düzeltmesinden sonra timer tabanlı örnekleme **10/11** idi. Hatalar [ilk tur](evidence/fallbacks-initial.json) ve [ara tur](evidence/fallbacks-after-source-fix.json) olarak korundu. Son test gerçek rAF karelerini bekler; eski ilerleme değeri aynı diye yeni layout'un boyandığı varsayılmaz. [Son 11/11](evidence/fallbacks-final.json).

İlk QA tanısı caption yüksekliğini görselin yüksekliği gibi kullanıyor ve arka plandaki sahnenin henüz boyanmamış konumunu okuyabiliyordu. Bu geçersiz ölçüm başarı diye sunulmadı. Görselin kendi content box'ı ile DOMMatrix ölçülür, gerçek ilerleme ve çizim kareleri beklenir. Önceki tanı snapshot'ı [korunmuştur](evidence/initial-snapshot-diagnostic.json). Başarı elde etmek için controller zorla aktive edilmedi, failed sınıfı silinmedi veya hizalama toleransı gevşetilmedi. Baseline fixture'ında açılıştan sonraki editorial-v6.css ve video-links.js yollarının manifestte eksik olduğu son HTTP kontrolünde görüldü; tekrar üretim builder'ı tüm V6 baseline varlıklarını açıkça izinli yapacak şekilde düzeltildi. Önce kareleri yalnız açılışı gösterir; eksik dosyalar normal temadaki korunan açılış hareketini değiştirmez. Baseline'ın bütün alt sayfa paketinin hatasız yüklendiği iddia edilmez.

Son üretim koruma kontrolünde cache-bypass istekleri ara proxy timeout'u verdi; bu site değişikliği diye sunulmadı. Tek normal tekrar ana sayfa ve üretim animasyon dosyasını taban V6 ile bayt düzeyinde eşleştirdi. Main de aynı `0b3f0d0` commit'indedir. [İlk ağ kaydı](evidence/production-unchanged.json), [başarılı tekrar](evidence/production-retry.json).

## H. Kullanıcıya kalan işler

Yalnız hesap sahibinin işlemleri [OWNER-ACTIONS.md](OWNER-ACTIONS.md)'de sırayla verilmiştir: www DNS+redirect+TLS, Always Use HTTPS kontrolü, Cloudflare Registrar DNSSEC aktivasyonu ve zincir doğrulaması, WAF/2FA/passkey/auto-renew/izinler, main koruması. Cloudflare Registrar resmî DNSSEC yolu ve olası 1–2 günlük DS otomasyon süresi belgede kaynaklıdır. Bunlar yapılmış gibi işaretlenmedi.

Gerçek YouTube URL/başlık/tarih/süre ve onaylı gerçek portre/çekim/kitap fotoğrafları bekliyor. Fotoğrafsız V6 tasarımı tamamlanmış kalır; sahte resim veya boş kart yok. Gerçek fotoğraf geldiğinde mevcut author-portrait/editoryal yerleşim küçük içerik değişikliğiyle kullanılabilir.

5–6 kişilik gerçek test **henüz yapılmadı**. İstenen beş soruluk, cihaz ve takılma notu içeren [kısa çerçeve](USER-TEST.md) hazır. Geri bildirim veya katılımcı sonucu uydurulmadı. Kullanıcının telefonundaki son hareket onayı beklenir.

## I. Son karar

**KISMEN.** Animasyon/bağlantı kodu ve temiz önizleme kullanıcı incelemesine hazır; son kodda başarısız uygulama testi kalmadı. Tam alan adı/hesap güvenliği kapanışı için www, DNSSEC, main koruması ve erişilemeyen panel durumları açık kalır. Fiziksel cihaz onayı yapılmış gibi sunulmaz. PR kullanıcı görmeden birleştirilmez ve V6.1 canlıya alınmaz. Mevcut V6 üretimi korunur.
