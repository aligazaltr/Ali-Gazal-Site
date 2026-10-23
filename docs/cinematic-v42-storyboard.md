# Machiavelli: portreden gerçek deneye

Önce çalışan HTML/CSS prototipi üretildi (`25e2f67`, `ed325e5`), dört kare masaüstünde ve 390 px telefon viewport'unda tarayıcıda incelendi. Kaydırma denetleyicisi bundan sonra eklendi (`c628db3`). Ekran görüntüleri yapay zekâ ile üretilmiş arayüz maketleri değildir.

| Kare | Görsel kompozisyon | Aynı nesnenin devamlılığı | Telefon farkı |
| --- | --- | --- | --- |
| 01 · Beliriş | Geniş MACHIAVELLI, turuncu italik PRENS. Sağdaki portre gölgede. Solda üç düşünce/yedi gün/gerçek hayat. | Başlık, portre ve kapak ilk andan aynı DOM sahnesinde. | Başlık üstte, portre altındaki dikey alanı doldurur. |
| 02 · Portre | Başlık sol üstte küçülür. Portre büyüyüp ortaya yaklaşır; aydınlık yüz ana odak olur. | Aynı portre konum ve ölçek değiştirir. | Portre yüksekliğe sığacak şekilde daha az büyür; yüz görünür alan içinde kalır. |
| 03 · Dönüşüm | Portre kapağın sağ yüz alanına yaklaşır, ölçeği azalır. Gerçek kapak sağdan açılan maske ile genişler. | Portre ile kapak yüzlerinin yaklaşık merkezi hizalanır; öndeki portre kısa süre kapağın kenarını aşar. Bu, iki farklı dosya arasında kusursuz fiziksel morph iddiası değildir. | Kapak tüm içerik genişliğinde. Aynı yüz konumu hesabı telefon geometrisine uygulanır. |
| 04 · Gerçek deney | Tam final kapak, mevcut durum ve tarihler, araştırma bağlantısı. | Portre katmanı çekilir, kapak yerinde kalır; yeni kart aşağıdan eklenmez. | Bilgiler kapağın altında; araştırma bağlantısı sahne boyunca kullanılabilir. |

## Hareket

İlerleme eşikleri 0 / .32 / .68 / .94; son %6 sabit bitiş. Ara değerler smoothstep ile hesaplanır. Tek portre ve tek gerçek kapak kullanılır. Kaydırma, ölçülmüş sahne başlangıcı ve sahnenin kendi geometrisine göre sınırlanmış mesafe üzerinden ilerler. Portre transform/opacity, başlık transform/opacity, kapak clip-path/scale kullanır. Işık sabit bir CSS yüzeyidir; hareketli siyah perde yoktur.

Scroll dinleyicisi pasif; görünür sahne için tek requestAnimationFrame işi planlar. Sürekli rAF döngüsü, wheel/touch yakalama, kaydırma kilidi, zamanla otomatik sahne değiştirme yoktur. Geometri resize/load/pageshow'da okunur; scroll sırasında her öğe için layout ölçümü yapılmaz. Sekme arka plana geçince bekleyen iş iptal edilir.

## Erişilebilir akış

JavaScript yokken başlık, portre, final kapak, durum, tarihler ve bağlantı normal dikey akıştadır. Hareket azaltmada aynı statik düzen kullanılır. 420 px'ten kısa ekranlarda da normal akış tercih edilir. Araştırma dosyasına atlama bağlantısı animasyonun sonunu beklemez. Güncel gerçek bilgiler ayrıca mevcut proje bilgi bölümünde aynen korunur; kapak alternatifi, H1, yerel bağlantılar ve bölüm başlıkları erişilebilir kalır.

## Arşiv

`discovery-turn` ve `discovery-leaf` DOM/CSS üretimi tamamen kaldırıldı. Mevcut içerik 180 ms opacity ile çıkar. Yeni metin 14 px aşağıdan 420 ms'de yerleşir; yazar 100 ms, kaynak 160 ms gecikmeyle 320 ms'de görünür. Kart yerinde kalır; art arda tıklamalarda son seçim korunur. Mevcut girişler, tipografi, çerçeveler, hover/basma/odak, arama, filtre ve paylaşma akışı korunur.
