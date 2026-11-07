# Yalnız hesap sahibinin yapması gerekenler

DNS ve hesap ayarları bu çalışmada değiştirilmedi. Parola, özel token, 2FA veya kurtarma kodu paylaşmayın.

1. **www:** Cloudflare DNS'te `www` için ana alana işaret eden proxied CNAME oluşturun. Ardından `www.aligazal.com` hostunu `https://aligazal.com` adresine 301/308 ile taşıyan Single Redirect hazırlayın; path aynı kalmalı, query korunmalı. DNS tek başına URL yönlendirmesi yapmaz. TLS sertifikası www'yi kapsadıktan sonra `https://www.aligazal.com/machiavelli?from=test` isteğinin `https://aligazal.com/machiavelli?from=test` adresine gittiğini doğrulayın. Apex/Worker kaydını silmeyin; önizleme hostlarını bu kurala dahil etmeyin.
2. **HTTPS:** SSL/TLS → Edge Certificates altında Always Use HTTPS durumunu kontrol edin. Ara proxy HTTP isteğine 200 döndürdüğü için burada gerçek 301 zinciri bağımsız doğrulanamadı. Normal bağlantıdan HTTP→HTTPS'i doğrulayın; DNSSEC/HSTS ile karıştırmayın.
3. **DNSSEC:** Public RDAP kayıt operatörünü **Cloudflare, Inc. / IANA 1910** olarak doğruladı. Cloudflare Registrar ekranında Manage Domains → alan adı → Configuration → Enable DNSSEC kullanın. Public DS ve DNSKEY sorgularında ikisi de yok; RDAP delegationSigned false. Etkinleştirme ancak parent DS, child DNSKEY ve doğrulayan resolver birlikte güvenli zincir gösterince tamamlanmış sayılır. Registrar otomasyonu 1–2 gün sürebilir. Tahmini DS yazmayın ve nameserver'ları değiştirmeyin.
4. **WAF / hesaplar:** Cloudflare Security panelinde Free Managed Ruleset ve Security Events'i kontrol edin. Resmî dokümanda Free planda varsayılan dağıtım bilgisi vardır, fakat bu hesabın ayarları görülmediği için aktif ilan edilmedi. Ücretli paket veya agresif bot engellemesi gerekmez. Cloudflare ve GitHub 2FA/passkey, domain auto-renew/ödeme yöntemi, üyeler ve token kapsamlarını kendi hesap ekranlarınızda kontrol edin. Domain transfer kilidi public RDAP'ta doğrulandı; auto-renew bundan anlaşılamaz.
5. **GitHub:** Main public branch metadata `protected:false`, repo rulesets boş. Main'e PR üzerinden değişiklik, başarılı Workers Builds kontrolü ve force-push/silme kısıtlaması hazırlayın. Hesap sahibi ayrıntıları görmeden solo projeyi kilitleyecek zorunlu başka onaylayıcı eklemeyin. Koruma ayarını bu çalışma değiştirmedi; yönetim endpoint'i entegrasyona 403 döndürüyor.
6. **İçerik ve son onay:** Gerçek YouTube URL'si, kesin başlık, yayın tarihi, süre ve varsa doğrulanmış chapter'ları gönderin. Gerçek 4:5 portre, çekim/kitap karelerini gönderin. Mevcut author-portrait stili ve editoryal yerleşim korunacak; boş yer veya yapay fotoğraf eklenmedi. V6.1 önizlemesini telefonda kaydırıp onaylayın; PR ancak sonraki açık yayın onayıyla birleştirilecek.

Resmî kaynaklar (7 Kasım 2026 kontrolü):
- https://developers.cloudflare.com/registrar/get-started/enable-dnssec/
- https://developers.cloudflare.com/dns/dnssec/
- https://developers.cloudflare.com/waf/get-started/

HSTS/preload bu çalışmada açılmadı. www ve HTTPS kapsamı tamamlanmadan includeSubDomains veya preload eklemeyin.
