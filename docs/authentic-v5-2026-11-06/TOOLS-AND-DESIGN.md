# V5 — araç değerlendirmesi ve tasarım kararı

6 Kasım 2026. Kapsam: mevcut ana sayfa → Machiavelli dosyası/video akışı, arşiv filtreleri ve altı temel sayfanın genel kimliği. Başlangıç main: 1701231db40ab44bb125917dd4617018a5ebc899. Statik HTML/CSS/Vanilla JS, iki tema, Workers Static Assets; yeniden yazım yok.

## Gerçekte kullanılan yöntem

**Belge rehberli manuel denetim.** Bu bir çalıştırılmış Impeccable CLI/detector veya bağımsız çift ajanlı critique raporu değildir. Otomatik bir “AI tasarım puanı” verilmedi. İlgili kaynaklar okunup kendi tarayıcı ve kaynak denetimlerimize uygulandı. Hiçbir araç kurulumu, hook, engine indirmesi, yetki atlaması veya haricî araçlara proje/hesap verisi gönderimi yapılmadı.

| Kaynak | İncelenen sürüm | Kullanım ve sınır |
|---|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable/tree/c3bb418ee38ee49a6b999b7752c1368f3123a2bd) | c3bb418ee38ee49a6b999b7752c1368f3123a2bd | README, skill ve audit/critique/craft-floor belgeleri incelendi. critique/audit/polish/distill/typeset/optimize adlarının güncel belgede varlığı doğrulandı. CLI/context/detect/overlay çalıştırılmadı. README'deki otomatik hook/engine ve live-copy'nin onayları atlayan CLI yolu bu işte kullanılmadı. |
| [Jakub Krehel](https://github.com/jakubkrehel/skills/tree/60bf140e43c98b248e6594487384ec967e89d98a) | 60bf140e43c98b248e6594487384ec967e89d98a | better-interface, typography, layout, accessibility, colors, writing, UI ve interface-review kaynakları okundu; ölçülebilir bulgular, native link, focus ve gerçek tema/ölçü kullanıldı. Kurulu komut/eklenti gibi sunulmaz. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill/tree/9b4bf937a1f69348126959c15d2f99a73e65699b) | tasteskill 2.5.0 / 9b4bf937a1f69348126959c15d2f99a73e65699b | README ve güncel SKILL okundu. Şirket sitesi türleri, starter, palette/font dealer, zorunlu ekran yüksekliği, fotoğraf kotaları ve caption kaldırma kuralları kişisel deney arşivine uygun değil. Paket kopyalanmadı; checker/perf scriptleri çalıştırılmadı. Gerçek görüntü ve anlamlı kompozisyon ilkesi fotoğraf planında kullanıldı. |

Yeni framework, GSAP, Three.js, font servisi veya stok görsel eklenmedi. Haricî aracın yönergeleri kullanıcı tarafından korunması istenen tasarımların yerine geçmez.

## Sayfa incelemesi

| Sayfa | Güçlü taraf / korunan | Gerçek fırsat ve karar |
|---|---|---|
| Ana sayfa | Dört kelime, gerçek final kapak ve tek aktif proje siteye ait; AG/FİKİR-DENEY-SONUÇ kimliği belirgin. | Video yayınlandığında kapak hedefi netleşmeli. Proje dosyası yolu ayrı tutuldu; yeni genel pazarlama bölümü yok. |
| Machiavelli | Portreden gerçek kapağa geçen sahne ve dört anonim kaydın sınırları içeriğe özgü. | Yayınlanan kapak link değildi. Native bağlantı + focus görünürlüğü; küçük açıklamalar okunur hâle getirildi. Sahne zamanlaması/çerçeve örneklemesi korunur. |
| Projeler | Tek tamamlanmış deney ile Payot araştırmasını ayıran yalın arşiv. | Yeni bilgi sunmayan büyük bir kart sistemi eklenmedi; mevcut düzen korundu. |
| Düşünce Arşivi | Yazar/kitap/kaynak ile kişisel yorumun ayrılması gerçek değer taşıyor. Tekrarlanan içerik birimleri burada işlevsel. | Seçici sınırları ölçümde zayıftı; mevcut tokenla düzeltildi. Siyah geçiş eklenmedi. |
| Hakkımda | Editoryal hiyerarşi ve birinci tekil anlatım tutarlı. | Gerçek portre en güçlü eksik; onaylı fotoğraf yok. Mevcut AG alanı korundu; sahte/boş fotoğraf alanı eklenmedi. |
| İrade Terbiyesi | Gerçek araştırma aşamasını henüz başlamamış uygulamadan ayırıyor. | Kaynak durumu korunur. Kullanıcı bitirdiğini doğrulamadan kitap/deney tamamlandı denmedi. |

“SaaS şablonu” benzerlikleri kanıtlanmış kusur kabul edilmedi. Eyebrow, sistem fontu, turuncu/paper yüzeyler ve büyük kelimeler kullanıcının onaylı dünyasıdır; dış aracın genel yasaklarını uygulamak için silinmedi.

## En fazla üç görsel müdahale

| Müdahale | Kanıt / çözüm | Dosyalar | Risk |
|---|---|---|---|
| Kapak bağlantısının anlaşılması ve klavye odağı | Yayımlanmış test durumunda kapak native a olur; yeni sekme adı, küçük izleme etiketi ve klavyeyle gizli klibi aşan çift renkli focus vardır. Araştırma bağlantısı kalır. | render-machiavelli-scene, sync-site, site, project, video-links; scene CSS | Orta: gelecekteki yayın durumu ve animasyon kesişimi; ayrı fixture ve odak testiyle kontrol edilir. |
| Machiavelli destek metni | Mobil kapak açıklaması 8,48 px, kaynak notu 10,4 px idi. Caption kısaltılıp 11 px, kaynak notu 13 px yapılır; tarih/durum okunabilirliği artırılır. Küçük font tek başına bir WCAG başarısızlığı olarak sunulmaz. | site-data, scene CSS ve üretilen Machiavelli HTML | Düşük/orta: kısa pencerede taşma; aynı genişlik/tema ve kısa pencere kontrolü gerekir. |
| Arşiv filtre sınırları | Gerçek koyu Chrome ölçümünde seçici sınırı/iç yüzey 1,9708:1 idi; mevcut muted tokenıyla 7,7317:1 olur. 1.4.11'in 3:1 bileşen sınırı değerlendirmesi. Arama alt çizgisi de aynı tokenı kullanır; sayaç tabular numerals. | archive.css | Düşük: görsel ağırlık; mevcut renk sistemi korunur. Mobil seçiciler zaten 16 px: gereksiz mükerrer font kuralı çıkarıldı. |

Karşılaştırma görüntüleri ve ham ölçümler evidence/ içinde; aynı Chrome iframe genişliği/tema ve aynı sahne sonu kullanılır. Preview çubuğu üretim özelliği değildir.

## İnceleme kapsamı ve sınırlar

Accessibility: native semantik/klavye/odak, ölçülen kontrol kontrastı, JS kapalı ve JS reduced-motion simülasyonu. Layout: yedi genişlik ve kısa pencereler. Typography: gerçek hesaplanmış fontlar ve Türkçe içerik. Writing: yayın/test ayrımı ve hedef adları. Colors: özellikle opak select zemini/alpha border ölçüldü; gradyanlı sayfanın bütün pikselleri ölçülmüş gibi sunulmaz. UI: hover gerektirmeyen kapak, kalıcı etiket, ek döngü olmaması.

Gerçek ekran okuyucu dinlemesi, fiziksel Android dokunması, Safari/Firefox ve OS/CSS reduced-motion ayarı yapılmadı. Native Chromium girişinde AT-SPI hatası alındı; gerçek tarayıcı zoom/Lighthouse çalıştı denmez. Metin %200 simülasyonu ayrı etiketlenir.

Son değişiklik incelemesi, başlangıç 1701231 ile adayın diff'i ve doğrudan tüketicileri (ana sayfa, Machiavelli, arşiv, Payot) üzerinde yapılır. Üretim yayını için son kullanıcı onayı gerekir.
