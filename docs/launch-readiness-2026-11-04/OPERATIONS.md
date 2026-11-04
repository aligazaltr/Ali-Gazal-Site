# İşletim, panel işlemleri ve geri dönüş

4 Kasım 2026. Bu adımlar hazırlanmıştır; uygulanmış hesap ayarları gibi okunmamalıdır. Main veya DNS değişikliği için sahibin ayrıca onayı gerekir.

## Öncelik 1 — Alan adı ve tek ana adres

1. Cloudflare → `aligazal.com` → DNS: mevcut kayıtları **export** et; rastgele kayıt silme. Workers & Pages → `ali-gazal-site` → Domains & Routes ekranında `aligazal.com` Custom Domain bağlamasını ve aktif sertifikayı doğrula. `www` şu an public DNS'te yok.
2. `www` için mevcut kayıt olmadığını tekrar kontrol et. Yoksa proxied CNAME `www` → `aligazal.com` hazırlığı uygundur; aynı isimde A/AAAA/CNAME varsa önce çakışmayı çöz. Apex'in çalışan kaydını değiştirme. Universal SSL'de `aligazal.com` ve gerekli `www` kapsamının aktifliğini doğrula.
3. Rules → Redirect Rules / Single Redirect: kaynak koşulu `(http.host eq "www.aligazal.com") or (http.host eq "aligazal.com" and http.request.scheme eq "http")`. Hedef dinamik ifade `concat("https://aligazal.com", http.request.uri.path)`, **preserve query string**, durum **308**. Böylece www ve bu iki hostun HTTP trafiği tek kanonik adrese gider. Hedef host bu koşula HTTPS ile tekrar eşleşmediğinden döngü oluşmaz. Zone'da başka kurallar varsa öncelik/çakışma testi yap; aynı işi yapan ikinci kural ekleme.
4. Şu dört adresi dış cihazdan dene: `http://aligazal.com/machiavelli?ref=test`, `http://www.aligazal.com/machiavelli?ref=test`, `https://www.aligazal.com/machiavelli?ref=test`, `https://aligazal.com/machiavelli?ref=test`. İlk üçü kalıcı yönlendirme, sonuncusu 200; yol/sorgu korunmalı. Önizleme `*.workers.dev` adresleri bu zone kuralına dahil edilmez.
5. Eski Workers adresindeki tam 308 bu zone kuralıyla sağlanamaz. Assets-only `_redirects` host eşleştirmesi desteklemez. İleride gerçekten gerekirse exact-host kontrolü olan Worker request handler, ASSETS binding ve run_worker_first ayrı değişiklik olarak hazırlanmalı; önizlemeler hariç tutulmalı, yanıt başlıkları yeniden uygulanmalı ve Worker istek kotası değerlendirilmelidir. Şimdilik eski linkler çalışır, yeni canonical/paylaşım adresi kullanılır.
6. PR #13'ün temiz önizlemesini incele. Yayın onayı gelince merge → başarılı üretim build'i → canlı header/canonical/OG/404/tema/paylaşım kontrolü sırası izlenir. DNS ayarı ile kod onayının birbirinin yerine geçtiğini varsayma.

## Öncelik 2 — Hesap güvenliği

- Cloudflare/GitHub/registrar hesaplarında benzersiz parola, passkey veya authenticator 2FA; kurtarma kodlarını güvenli çevrimdışı konumda tut. Şifre/OTP/kurtarma kodunu sohbet, repo veya belgeye yazma.
- Cloudflare API token/app yetkilerini en az gerekli hesap/Worker/zone kapsamına indir; kullanılmayan erişimi kaldır. Bu denetimde token/rol ekranları görülemedi.
- Security → WAF/Managed Rules: Free Managed Ruleset durumunu kontrol et. Ücretli OWASP/Pro gereksinimi varsayma. Search botlarını ve paylaşım botlarını bozacak toplu challenge açma. Security Events üzerinden gerçek engellemeleri izle; Bot Fight Mode'u ölçüsüz etkinleştirme.
- DNSSEC: Cloudflare'ın ürettiği DS bilgisini registrar ile **eşleştirerek** etkinleştir ve doğrulanmış zinciri kontrol et. Eski/yanlış DS bırakmak alan adını erişilemez yapabilir. Registrar/hesap bilgisi doğrulanmadan burada hiçbir kayıt değiştirilmedi.
- Domain transfer kilidi RDAP'ta görülüyor. Otomatik yenileme, ödeme yöntemi ve bildirim e-postasını panelden doğrula; bitiş 4 Kasım 2027. Son güne bırakma.
- GitHub → repository Rules/Branches: main için PR, başarılı build/check, force-push/silme sınırını değerlendir. İncelemede protected=false/rulesets=[] görüldü. Tek sahipli akışta kendisinin veremeyeceği ikinci kişi onayını zorunlu yapma; gerçek ikinci reviewer varsa ayrıca kullan.
- HSTS/preload şimdilik kapalı değişikliktir: eklenmedi. HTTPS kapsamı istikrarlı olduktan sonra ayrı karar ver; includeSubDomains/preload'u deneme amacıyla açma.

## Öncelik 3 — Google ve sosyal paylaşım

1. Google Search Console → Domain Property: `aligazal.com`. Google'ın ürettiği gerçek TXT değerini DNS'e ekle; mevcut TXT/MX kayıtlarını silme. Doğrulama başarılı olmadan kurulmuş sayma.
2. Kod canlıya alındıktan ve sitemap yeni alan adında doğru olduktan sonra `https://aligazal.com/sitemap.xml` gönder. URL Inspection ile ana sayfa ve Machiavelli'yi kontrol et. İndeksleme garanti edilmez.
3. Gerçek cihazda ana sayfa/Machiavelli bağlantısını WhatsApp, Telegram, Discord, Facebook ve X'te önizle; gereksiz herkese açık gönderi gerekmez. Mevcut önbellek değişimi hemen göstermeyebilir. İncelemede platform hesaplarına paylaşım gönderilmedi.
4. Video yayımlandığında gerçek URL, kesin başlık, yayın tarihi, süre ve varsa doğrulanmış chapter listesini kullan. Bunlar olmadan published=true yapılmaz.

## Yedekler ve geri alma

### Yedek

GitHub, kaynak/optimize görseller/önceki commit'leri tutar; aynı hesaptaki repo tek başına bağımsız yedek sayılmaz. Ayrı güvenli disk/hesapta `git clone --mirror` veya `git bundle create <güvenli-yol>/ali-gazal.bundle --all` sakla. Özgün kapak/çekim/görsel kaynaklarını da ayrı yedekle; videoların veya kullanıcı orijinal dosyalarının hepsinin bu repoda olduğunu varsayma. DNS export'unu tarihleyerek sakla. Kurtarma kodlarını repo/bundle içine koyma. Bu işte off-platform yedek yaratılmış gibi raporlanmadı.

### Kod geri dönüşü

- Şu an doğrulanmış üretim kodu: `7b238f140a67c840b425933eba09bee33afb76a0`.
- Yeni sürüm sonrasında sorun varsa önce hatayı/başarısız build'i belirle. Çalışan main tarihçesini force-push ile değiştirme.
- Hatalı yayın commit'i için **yeni dalda revert commit + PR + test** hazırla; merge ancak sahibin onayıyla yapılır. DNS değişiklikleri git revert ile geri alınmaz.
- Acil durumda Cloudflare → Worker → Deployments/Versions → son çalışan **üretim** sürümünü rollback/redeploy seç; preview sürümünü yanlışlıkla üretim sanma. Bindings ve config uyumluluğunu kontrol et. Dış domain/zone redirect kuralları rollback ile otomatik geri dönmeyebilir.
- Değişiklik öncesi DNS export ve kural ekran görüntüsü ile yalnız sorunlu farkı geri al; bütün DNS'i silme, nameserver'ı rastgele değiştirme.

### Site açılmıyorsa kontrol sırası

1. Başka ağdan `https://aligazal.com` ve eski Workers adresini dene: ikisi de mi, yalnız domain mi?
2. DNS NS/A/AAAA, www ve DS/DNSKEY zincirini kontrol et. Yeni DNSSEC/DS hatası varsa resolver SERVFAIL ayır.
3. Sertifika/HTTPS ve yönlendirme zincirini incele; döngü, yanlış host ve kırık www ayrımını yap.
4. Cloudflare Security Events/challenge ve Worker Deployments/build log'larını incele.
5. HTML durumu, asset 404'leri, CSP hataları ve cache/revalidation kontrolü yap.
6. Son çalışan sürüme kontrollü geri dön; sonra gerçek kök nedeni ayrı PR'da düzelt.
