# Sinematik deneyim 2.0 — 21 Ekim 2026

Dal: `feature/cinematic-experience-v2` · PR: #11
Temel: main / 5d50055. Son özellik commit’i: 27fb495.
Bu dosyayı içeren son commit, QA temizliği ve teslim kaydıdır; tam SHA için dalın HEAD kaydını kullanın.

## Tamamlananlar
- `site-data.js → experience`: değiştirilebilir giriş ve yeniden kullanılabilir hikâye verisi.
- `sync-site.js`: dört kelime ve üç tam hikâye sahnesini statik HTML'e üretir; JS kapalıysa metinler kaybolmaz.
- `index.html`, `motion.css`: büyük tipografi ve gerçek final kapağıyla yeni giriş. Marka vaadi, CTA'lar ve içerikler korunur.
- `motion.js`: tek motion sistemi, IO ile bir defalık reveal, mobilde 18px/520ms ve masaüstünde 32px/720ms; en çok 10 eşzamanlı animasyon; odak/arka plan/hareket tercihi iptali. Eski setupMotion kaldırıldı.
- Ana sayfa Fikirden Deneye: üç gerçek scroll sahnesi; masaüstünde sticky kompozisyon, değişen başlık/açıklama/geometrik çizimler ve vurgu. Mobilde doğal akış; reduced-motion'da sticky kaldırılır. Görseller sonuç grafiği veya başarı ölçümü değildir.
- Machiavelli: büyük bölüm başlığı, gerçek final kapakta scale/reveal ve sıralı metin/bağlantılar. Gerçek kitap görseli bulunmadığından iki görsel arasında crossfade üretilmedi; mevcut kapak korunur.
- Payot girişi ve dört aşaması ortak reveal sistemini kullanır; proje durumu değiştirilmedi.
- Arşiv: kart reveal/hover, yerel details açılırken hafif içerik geçişi. Rastgele düşünce aynı alanda gerçek içerik değiştirir; ilk giriş 350ms, sonraki seçimler 110ms çıkış + 240ms giriş. Filtre ve tekrar etmeme mantığı korunur; filtre değişince eski seçki gizlenir; URL geçmişi statik ayrıntılara döner. Klavye odağındaki içerik geçiş sırasında değiştirilmez.
- Geçici QA HTML ve prelude son commit'te kaldırıldı. Üretime ağır paket, yeni görsel, framework veya servis eklenmedi. Arşiv verisi ve mevcut kaynak metinleri değişmedi.

## Doğrulama
- 31/31 Node testi; sync-site --check, build-archive --check, check-site ve değişen JS sözdizimi kontrolleri geçti.
- Gerçek Chrome tarayıcısında dört sayfa × 320/360/390/430/768/1440 iframe genişliği × iki tema = 48/48 düzen kontrolü. Taşma veya denetlenen küçük form/düğme/menü hedefi yok. Kaydırma çubuğu gerçek içerik alanını 15px daraltıyor. Ham sonuç: cinematic-layout-qa.json.
- Dört intro kelimesinin 0/130/260/390ms gecikmeli animasyonları tarayıcıdan kaydedildi. Hikâye aktif durumu kaydırmayla 0 → 1 → 2 oldu; farklı kompozisyonlar gerçek ekran görüntülerine alındı.
- Arşiv kart reveal, rastgele alanın 110/240ms geçişleri ve farklı seçilen kimlikler tarayıcı kaydıyla doğrulandı. Nihai düzeltmede ilk giriş 350ms olarak ayrıca doğrulandı.
- 390px dolu rastgele kartta taşma/küçük denetim görülmedi. Payot filtresi yalnız ilgili seçkiden seçim yaptı; İRADE araması 7/15, olmayan arama 0/15 ve pasif rastgele düğmesi verdi.
- Açık/koyu tema ve sayfalar arası kalıcılık denendi. Payot bağlantısı açıldı, dört aşama ve deney başlamadı durumu korundu.
- JS izni olmayan iframe'de dört kelime ve üç tam sahne okundu. JS hareket tercihi emülasyonunda animasyon kaydı boş ve aktif animasyon 0 oldu. Gerçek OS tercihi / fiziksel Android cihazı test edilmedi.
- Uygulama kaynaklı konsol hatası görülmedi; tarayıcı eklentisinin metadata hatası uygulamadan ayrıldı.
- Kopyalama durum mesajı ve mevcut kaynaklı paylaşım testleri geçti. OS yerel paylaşım menüsü ve cihaz panosu uçtan uca doğrulanmadı. FPS/Core Web Vitals ölçümü yapılmadı; sayısal performans iddiası yok.

## Devam / yayın
Önizleme: https://feature-cinematic-experience-v2-ali-gazal-site.aliicerikmedya.workers.dev/
PR: https://github.com/aligazaltr/Ali-Gazal-Site/pull/11
Canlı site/main değişmedi. Otomatik merge etkinleştirilmedi. Son Cloudflare önizlemesini doğrula, kullanıcı tasarımı onaylarsa mevcut PR akışıyla yayınla.
