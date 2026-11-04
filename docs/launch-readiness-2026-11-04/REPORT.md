# Ali Gazal — yayın hazırlığı, 4 Kasım 2026

**Durum:** İnceleme ve önizleme. Main ve canlı site değiştirilmedi. Bu belge teknik bulguları kaydeder; tüm güvenlik risklerinin giderildiğine veya hukuki uygunluğa ilişkin garanti değildir.

## A. Gerçek altyapı

`aligazal.com`, Cloudflare ağı üzerinden mevcut statik site çıktısını sunuyor. NS kayıtları `elinore.ns.cloudflare.com` ve `sullivan.ns.cloudflare.com`; A/AAAA kayıtları Cloudflare adresleri. Yeni alan adındaki Projeler, Arşiv, Hakkında, İrade Terbiyesi HTML'leri; merkezî `site-data.js`, tema betiği ve final JPEG, GitHub main `7b238f1` dosyalarıyla bayt düzeyinde eşleşti. Eski Workers adresindeki ana sayfa, Machiavelli, veri dosyası ve kapak da aynı kaynakla eşleşti. Daha sonraki HTTP ve tarayıcı gözlemleri ana sayfa/Machiavelli erişimini doğruladı.

WordPress'e ait `wp-content`, `wp-includes`, `wp-json` veya WordPress generator çıktısı gözlenmedi. Depoda PHP, WordPress kurulumu, üyelik, veritabanı veya yönetim paneli yok. `wrangler.jsonc`, Cloudflare Workers static-assets dağıtımını tanımlıyor; GitHub commit'lerinde aynı `ali-gazal-site` servisine ait Workers Builds sonuçları var. **Bu kanıtlar aynı statik Workers çıktısına güçlü biçimde işaret eder; Cloudflare hesabındaki Custom Domain → Worker bağlamasını hesap erişimi olmadan ayrıca göremedim.** WordPress'e yönelik eklenti/hosting müdahalesi yapılmadı.

İlk toplu HTTP isteğinde iki proxy CONNECT zaman aşımı oldu; bunlar site hatası sayılmadı veya kayıttan silinmedi. Ek HTTP gözlemleri ve gerçek Chrome sayfalarıyla ayrıştırıldı. Kaynaklar: `evidence/production-http.json`, `http-retry-and-preview.json`, `dns.json`.

## B. Alan adı ve HTTPS

| Konu | Gözlem / durum |
| --- | --- |
| `https://aligazal.com` | Ana site ve alt sayfalar erişilebilir; mevcut içerik doğru. |
| HTTPS | Chrome'da sertifika uyarısı olmadan açıldı; cURL HTTPS yanıtları doğrulama sonucu 0 ile geldi. İstek ortamının egress proxy'si nedeniyle origin sertifikasının veren/son kullanma ayrıntıları ayrıca doğrulanamadı. Doğrudan TLS soketi bu ortamın DNS çözümlemesinde başarısız oldu; bu bir origin sertifika hatası iddiası değildir. |
| `www` | Google Public DNS sorgusunda A ve CNAME için NXDOMAIN. Bu yüzden yönlendirme henüz hazır değil. HTTP aracının 503 yanıtı origin uygulama hatası diye yorumlanmadı. |
| HTTP → HTTPS | İnceleme isteğinde HTTP 200 görüldü; 301/308 gözlenmedi. Egress etkisi mümkün olduğundan dış cihazdan da kontrol edilmeli; panelde kanonik yönlendirme hazırlanmalı. |
| Eski Workers adresi | 200 ile eski bağlantıları açıyor; sunucu tarafında yeni alana kalıcı yönlendirme yok. |
| DNSSEC | Public DNS sorgusunda DS/DNSKEY cevabı ve doğrulanmış AD zinciri görülmedi. Etkin DNSSEC doğrulanamadı. |
| Domain Lock | Verisign RDAP `client transfer prohibited` bildiriyor: kayıt kuruluşu düzeyinde transfer kilidi gözleniyor. Hesap/yenileme ayarı değildir. |
| Yenileme | RDAP bitişi 4 Kasım 2027. Otomatik yenileme ve ödeme yöntemi hesap erişimi olmadan bilinmiyor. |

**Hazırlanan kod:** Tek üretim adresi `https://aligazal.com`. `site-data.js`, üretilen arşiv verisi/JSON-LD, altı sayfanın canonical/OG alanları, gerçek kapak URL'leri, paylaşım geri dönüşü, robots ve sitemap birlikte güncellendi. Yeni `scripts/sync-seo.js` tekrar üretim ve `--check` sağlar. Ana sayfanın sosyal kartı mevcut final kapağı kullanır; yeni görsel üretilmedi.

Yeni alan adının yanlışlıkla “önizleme” sayılması, merkezî adresin düzeltilmesiyle giderilir. Eski **tam** üretim origin'i paylaşımda üretim takma adı olarak tanınır ve yeni canonical bağlantıyı paylaşır. Gerçek branch önizlemeleri kendi origin'inde kalır; yalnız kullanıcı açıkça “Canlı site” seçerse üretim bağlantısı paylaşılır. Bu, HTTP 301/308 yerine geçmez.

**Yönlendirme sınırı:** Workers static-assets `_redirects`, host/domain düzeyinde kuralları desteklemiyor. Bu dosyaya etkisiz bir host kuralı veya bütün önizlemeleri üretime gönderecek genel kural eklenmedi. `www`/HTTP için Cloudflare zone yönlendirmesi önerisi `OPERATIONS.md` içindedir. `workers.dev` Cloudflare'a ait ayrı bir zone olduğundan kullanıcının domain kuralıyla kontrol edilemez; tam eski-host 308 için Worker istek işleyicisi ve `run_worker_first` gerekir. Bu, mevcut assets-only çalışma biçimini ve istek kotasını etkileyebileceğinden bu sürüme eklenmedi. Eski bağlantılar çalışır ve canonical yeni alana işaret edecek; tam 308 bu aşamada **tamamlanmadı**.

## C. Güvenlik

### Gerçekte aktif olan ile hazırlananı ayır

Canlı yanıtlarda bu inceleme sırasında CSP, nosniff, frame koruması, Referrer/Permissions Policy veya HSTS görülmedi. HTTPS ve Cloudflare üzerinden servis ayrı doğrulandı; bunlardan WAF/hesap güvenliği sonucu çıkarılmaz.

PR #13'ün ilk `42160fe8` önizlemesinde nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy ve **Content-Security-Policy-Report-Only** gerçek HTTP yanıtında görüldü. Tema ve arşiv etkileşimleri gerçek Chrome'da çalıştı; siteye ait CSP ihlali görülmedi. **Report-Only herhangi bir içeriği engellemez.**

Yeni aday `_headers`, `Content-Security-Policy` ile zorunlu politika hazırlar: kaynaklar yerel; executable inline script/eval açılmıyor; inline olay işleyicileri, object ve web worker yasak; frame-ancestors aynı origin; form-action/base-uri aynı origin. CSS değişkenleri ve mevcut animasyon stilleri için `style-src 'unsafe-inline'` bilinçli olarak korunur. Bu nedenle “tamamen inline'sız strict CSP” denmez. JSON-LD veri betiği çalıştırılabilir JavaScript değildir. Politikanın gerçek engelleme testi ve uyumluluk sonuçları doğrulama kaydındadır. **Yeni korumalar yalnız aday önizlemede; main'e yayın onayı verilmedi.**

HSTS, includeSubDomains ve preload eklenmedi. Önce `www` ve gerekli HTTPS kapsamı tamamlanmalı; preload bu iş için gerekli değil.

### Dosyalar ve kaynak

- `.assetsignore` artık bütün kamu varlıklarını tek tek izinli sayar; yeni bir HTML/JS/CSS/fotoğraf dosyası yanlışlıkla köke konduğunda otomatik yayına girmez. Gerekli 32 kamu dosyası korunur; `_headers` yalnız dağıtım metaverisidir ve asset izin listesine alınmaz.
- Canlı ve aday önizlemede `wrangler.jsonc`, `.git/config`, `content/archive.json`, `docs/`, test betikleri ve README erişim denetimi yapıldı. İlk aday önizlemede `!/_headers` istisnasının varsayılan dışlamayı geri aldığı ve 641 baytlık politika dosyasını 200 ile indirmeye açtığı görüldü (gizli anahtar içermiyordu). Wrangler 4.157.0 kaynak kodu, başlık dosyasının asset izin listesinden bağımsız metaveri olarak okunduğunu gösterdi. `317be83` düzeltmesiyle istisna kaldırıldı. Son HTTP kanıtı hem dosyanın 404 olmasını hem güvenlik başlıklarının uygulanmasını birlikte denetler; yalnız bir regex testinin geçmesine güvenilmedi.
- Sınırlı current-tree gizli anahtar taramasında özel anahtar/GitHub token/Cloudflare secret ataması eşleşmesi bulunmadı. Bu tüm git geçmişi veya dış hesap token'larının denetlendiği anlamına gelmez.
- `.github/workflows` dosyası yok; otomatik dağıtım Cloudflare'ın GitHub bağlantısındaki Workers Builds olarak gözleniyor. Dağıtım token'ı kaynak kodda görülmedi. Bağlantının hesap yetkileri incelenemedi.
- GitHub main `protected:false`, görülebilen ruleset listesi boş. Hesap ayarı değiştirilmedi. PR ve zorunlu build kontrolü, force-push/silme sınırı önerilir. Tek geliştiricili repoda uygulanamayacak zorunlu ikinci kişi onayı varsayılmaz.
- WAF, Free Managed Ruleset, Bot Fight Mode, Security Events, Cloudflare SSL modu, hesap rolleri ve 2FA durumu erişim yokluğunda **bilinmiyor**. Etkin veya kapalı diye uydurulmadı. Statik sitede bulunmayan SQL/oturum/üyelik sorunları üretilmedi.

## D. SEO, paylaşım, performans ve gizlilik

### SEO / sosyal paylaşım

Canonical, OG URL, Machiavelli görseli, ana sayfa sosyal görseli, Twitter kartları, arşiv structured-data bağlantıları, paylaşım geri dönüşü, robots ve altı URL'lik sitemap yeni üretim adresini kullanır. 404 ve Marcus arşiv sayfası site haritasına eklenmez. Başlık/açıklama/h1 ve yerel bağlantı denetimleri var; içerik gerçek HTML'de bulunur, JavaScript beklemez. 404 gerçek 404 durumuyla gelir.

Cloudflare branch önizlemelerinde gerçek `X-Robots-Tag: noindex` gözlendi. Önizleme canonical'ı üretimi tarif eder; inceleme bağlantıları önizlemede kalır. Bu davranış yönlendirmeyle karıştırılmaz.

WhatsApp/Telegram/Discord/Facebook/X uygulamalarında gerçek bir paylaşım gönderimi veya o platformların önbellek yenilemesi yapılmadı. Doğrulama, erişilebilir HTML metaverisi ve kapak URL'si düzeyindedir. Önbelleğin hemen değişeceği vaat edilmez. Search Console hesabı veya site sahipliği doğrulaması yapılmadı.

### Performans ve korunma

Yeni framework, veritabanı, analitik servisi, dış font veya sürekli animasyon eklenmedi. Tüm tasarım CSS'leri, tema, sahne/motion kodu ve final kapak main ile aynı kaldı; body içerikleri alan adına ait paylaşım URL'si dışında korunur. Senkron 2 KB tema betiği tema parlamasını önlemek için mevcut yerindedir; diğer uygulama betikleri defer ile yüklenir. Cloudflare'ın `max-age=0, must-revalidate` davranışı, hashesiz dosya adlarında eski sürümün uzun süre tutulmasını önler.

Final JPEG 197.054 bayt; portreler 78.846/159.010 bayt. Bunlar sayfa başına zorunlu toplam indirme iddiası değildir; responsive seçim/önbellek/lazy-loading etkiler. Bütçe ve hash kaydı kanıt klasöründedir. Wrangler 4.157.0 gerçek `deploy --dry-run` tamamlandı; bu üretim yayını değildir. Lighthouse/gerçek cihaz ve saha LCP/INP ölçümü bu ortamda yapılmadı; performans puanı uydurulmadı. Chrome viewport testleri fiziksel Android/iPhone testi değildir.

### Gizlilik

Kamu kodunda aktif analitik/reklam pixel'i, üçüncü taraf script/font, gömülü YouTube player, üyelik veya iletişim formu görülmedi. YouTube/kaynaklar dış bağlantıdır. Tema seçimi tarayıcıda `ag-theme` localStorage anahtarını kullanır. `project.js` içinde gelecek “Kendin Dene” takip depolaması kodu vardır; her iki projede feature kapalı ve guard depolama erişiminden önce döner. Bu incelemede aktif bir not toplama sistemiymiş gibi sunulmadı.

HTTP gözlemlerinde uygulama Set-Cookie başlığı görülmedi; bu Cloudflare'ın her koşulda hiç cookie kullanmayacağı anlamına gelmez. Yanıtlarda Cloudflare NEL/Report-To teknik ağ hatası raporu alanları da görüldü; bu yüzden “hiç veri işlenmez” denmez. Cloudflare teknik istek bilgilerini ve güvenlik günlüklerini işleyebilir; hesaptaki ayrıntılı saklama süreleri incelenmedi. Gereksiz bir çerez pop-up'ı eklenmedi. Tema tercihi için hukuki işleme şartı, site sorumlusu bilgisi ve sınır ötesi hizmet kullanımı gerektiğinde KVKK yönünden ayrıca değerlendirilmelidir; bu denetim hukuki uygunluk belgesi değildir.

**Önerilen kısa bilgilendirme taslağı (henüz ürün arayüzüne eklenmedi):** “Bu sitede üyelik, reklam ve ziyaretçi analitiği kullanılmaz. Tema tercihin cihazındaki yerel depolamada saklanır. Barındırma ve güvenlik hizmeti Cloudflare teknik istek verilerini işleyebilir. YouTube ve kaynak bağlantıları dış sitelerde açılır.” Yayımlamadan önce gerçek veri sorumlusu/iletişim bilgisi ve Cloudflare sözleşmesiyle tamamlanmalı; şirket, adres veya saklama süresi uydurulmamalıdır.

## E. GitHub ve değişiklikler

PR #13 korunarak geliştirildi: https://github.com/aligazaltr/Ali-Gazal-Site/pull/13 . İlk taslak `8cac379`; ürün değişiklikleri `74b7c21`, `_headers`/kapalı varlık izin listesi düzeltmesi `317be83`. Son dokümantasyon/kanıt commit'i PR açıklamasında kaydedilir. Ana dal `7b238f140a67c840b425933eba09bee33afb76a0` korunur; merge yapılmaz.

Temel dosyalar: `_headers`, `.assetsignore`, `site-data.js`, `share-context.js`, `scripts/sync-seo.js`, ilgili testler, `wrangler.jsonc`, altı HTML, `archive-data.js`, `robots.txt`, `sitemap.xml`. CSS, portre/kapağın dosyaları ve animasyon denetleyicileri değişmedi. Geçici test aracı ayrı **`qa/launch-readiness-20261104`** dalına kondu; PR #13'ün yayın dosyaları arasında yok. Tekrar üretilebilir test kaynağı `scripts/launch-qa/` altında, dağıtım izin listesinin dışında tutulur.

## F. Önizleme ve doğrulama

Ürün önizlemesi `eb69ec6d` sürümünde test edilmeye başlandı. Gerçek matris, aynı ürün ağacı ve aynı zorunlu güvenlik politikası üzerine yalnız test araçları eklenen ayrı QA sürümünde yürütülür. Son temiz PR önizlemesi, SHA/build bilgileri ve kesin sonuçlar `VALIDATION.md` ile PR açıklamasında tutulur. Test dalı ürün önizlemesinin yerine teslim edilmez.

## G. Kullanıcı işlemleri

Öncelikli ve sıralı panel adımları: [OPERATIONS.md](OPERATIONS.md). Yayımlama onayı gelmeden kod merge edilmez; panel ayarı/DNS silme/transfer/ücretli satın alma/video durum değişikliği yapılmaz. Özellikle `www`, kanonik HTTPS yönlendirmesi ve DNSSEC hesap sahibinin kontrolünü bekler. Google Domain Property doğrulamasındaki TXT değerini Google üretir; burada sahte değer hazırlanmaz.

## H. Açık kalanlar

Cloudflare hesap içi bağlama/SSL/WAF/rol/2FA/yenileme kontrolleri; `www` DNS/yönlendirmesi; HTTP yönlendirmesinin gerçek cihazdan son doğrulaması; DNSSEC aktivasyonu; eski Workers hostunun sunucu tarafı 308'i; Search Console sahiplik/sitemap gönderimi; gerçek sosyal platform önizleme/önbelleği; fiziksel cihaz, Firefox/Safari, ekran okuyucu ile dinleme, OS/CSS reduced-motion emülasyonu, Lighthouse ve saha performansı tamamlanmış sayılmaz.

Bu eksiklerin hiçbiri yeni grafik/animasyon üretimiyle kapatılmaya çalışılmadı. Video hâlâ yayımlanmamış durumda; gerçek URL, kesin başlık, tarih, süre ve doğrulanmış chapter bilgisi geldiğinde mevcut merkezî yayın akışı kullanılacak.

## Birincil teknik kaynaklar

- Cloudflare Workers [Headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/), [Static asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/), [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
- Cloudflare [HTTPS enforcement](https://developers.cloudflare.com/ssl/edge-certificates/encrypt-visitor-traffic/), [Managed Rules](https://developers.cloudflare.com/waf/managed-rules/).
- MDN [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).
- Google [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080).
- KVKK [Çerez Uygulamaları Hakkında Rehber](https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber).
- Verisign RDAP: `https://rdap.verisign.com/com/v1/domain/aligazal.com` (yalnız status/tarih bilgileri kaydedildi).
