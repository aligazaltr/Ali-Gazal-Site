# Hero Opening Direction V1

> İlk sürümün tasarım raporu. Güncel Chromium incelemesi ve düzeltme için [görsel denetim raporuna](qa/REPORT.md) bakın.

## İzole açılış denemesi — görsel onay verilmedi

Temel main: a1cc3a3504df5757eb4444215606f40e33fea76b.
Çalışma dalı: feature/hero-opening-direction-v1.
Önizleme sayfası: /hero-opening-v1.
Önceki PR #24 değiştirilmez. Root index.html aynen korunur.

### Önceki denemeden çıkarılan karar

CSS ile yüzeylerin açı ve ölçeğini değiştirmek, gerçek bir mekânın içinde
kamera hareketi hissini yeterince kurmadı. Bir sonraki denemede büyük
harflere veya daha fazla gradyana dönmek yerine, gerçek geometrili tek
bir sahne kullanıldı: yayımlanmış kapağın sahnelendiği kalın bir yüzey,
kenar malzemesi, kaide ve ışık alan zemin.

Bu fiziksel nesne bir **sunum nesnesidir**. Gerçek çekim, gerçek deney anı
veya yeni bir Ali Gazal fotoğrafı gibi sunulmaz. Ön yüzde onaylı, bütün
Machiavelli kapağı vardır; farklı bir görsel üretilmedi.

Referans videoları bu oturumda oynatarak inceleyemedim. Kullanıcının
verdiği estetik özet esas alındı; videolar incelenmiş gibi gösterilmedi.

### Açılış yönetimi: ışığa giren deney dosyası

| Zaman | Sahne kararı |
| --- | --- |
| 0–2 sn | Karanlık stüdyo, kenar ışığı, yandan yaklaşan kamera. Soru tek blok olarak bir maskenin ardından açılır; harfler parçalanmaz. |
| 2–4 sn | Amber ışık kapak yüzeyini tarar. Kamera yandaki konumdan ön görünüme yaklaşırken kenar kalınlığı ve kaide perspektifi değişir. |
| 4–6 sn | Kapak tam pozlanır, vaat ve kapak açıklaması yerleşir. Kamera yavaşça durur. CTA'lar bütün süre boyunca erişilebilir. |
| İlk scroll | Aynı kamera daha yakına ve karşı yana ilerler. Soru geriye çekildikten sonra ayrı bölgede gerçek deney açıklaması ve araştırma bağlantısı görünür. |

İlk belirgin reveal 2–3 saniye içinde hedeflenir; tüm kompozisyonun
yerleşmesi 6 saniyeye yayılır. Açılışı atla ve Tekrar izle denetimleri
bulunur. İlk kaydırma veya bağlantıya klavye odağı girişi beklemeyi
bitirir. Scroll engellenmez, wheel yakalanmaz.

### Teknik yaklaşım

Bağımlılıksız WebGL 1.0 kullanıldı. View/projection matrisleri ve derinlik
tamponu gerçek 3D geometrisini çizer. Kamera uzaklığı, açısı ve lens
kadrajı birlikte hesaplanır. Tek shader programı, tek mevcut kapak
dokusu, beş mesh ve toplam 40 üçgen vardır. Three.js, video arka planı,
post-processing, yeni API veya ücretli servis eklenmedi.

Zemindeki ışık ve temas gölgesi shader içinde yaklaşık olarak
hesaplanır; bunlar fiziksel ışın izleme veya gerçek volumetrik ışık
değildir. Kapak normal pozuna geldiğinde kaynak görüntünün rengini
korur. Yüzleri kesen yazı, merkez rayı veya harf tüneli yoktur.

Metin ve bağlantılar HTML olarak kalır. Canvas erişilebilirlik ağacına
tekrarlı içerik eklemez; gerçek kapak, alternatif metni ve bağlantısı
DOM'da bulunur. WebGL kurulumu veya ilk frame hata verirse statik
kompozisyona dönülür. Reduced-motion, veri tasarrufu, büyük kök yazı
ve kısa ekran durumlarında WebGL başlatılmaz. Context kaybında da
statik içerik geri gelir.

Animasyon yalnız ilk 6 saniyede sürekli frame ister; sonra scroll,
resize veya tema değişimi için tek frame planlanır. Sekme gizlenince
ve sahne ekran dışına çıkınca döngü durur. Mobilde çizim sıklığı 30
frame/sn ile sınırlandırılır; bu gerçek cihazda 30 FPS ölçüldüğü
anlamına gelmez. Çizim tamponu mobilde yaklaşık 1.25 milyon,
masaüstünde 2.1 milyon piksel ile sınırlandırılmıştır.

### Mobil ve masaüstü

| Karar | Masaüstü | Mobil / dar kompozisyon |
| --- | --- | --- |
| Yerleşim | Soru sol, sahne sağ | Soru üstte, kapak aşağıda ortalanır |
| Başlangıç kamera açısı | 58° | 36° |
| Son açılış açısı | 15° | 10° |
| İlk scroll yayı | 26° | 16° |
| Ek scroll alanı | 620 px | 430 px |
| Görsel güvenli alanı | Ayrı sağ bölge | %6–94 yatay aralık |
| Menü | Tek sıra | İki sıra |
| Düşük hareket tercihi | Statik HTML | Statik HTML |

1000px ve altı için ayrı kompozisyon kullanılır. 700px'ten kısa ekranlar
statik sürüme döner; kısa ekrana sinematik sahne sıkıştırılmaz.

### Yapılan kontroller

Bu oturumda executor ve görsel tarayıcı kullanılamıyor. Bu nedenle
aşağıdaki ayrım önemlidir:

- JavaScript kaynaklarının V8 ayrıştırması kontrol edildi.
- 9 ekran genişliği × 6 zaman noktası × 7 scroll noktası = **378**
  matematiksel projeksiyon durumu kontrol edildi.
- Kamera derinlik seyri, deterministik ileri/geri örnekleme, ayrı
  başlıkların çakışmama zamanları ve statik fallback mantığı kontrollü
  V8 fixture'larında kontrol edildi.
- Kısa ekran, reduced-motion, veri tasarrufu, büyük yazı, eksik GPU ve
  shader hatası durumlarının frame döngüsü başlatmaması denetlendi.
- Aynı dört test Node test dosyasına eklendi. Mevcut statik üretim ve
  Node testleri Cloudflare'ın mevcut build komutunda çalıştırılır.
  Uzak build sonucu PR'ın teslim bölümünde yer alır.

**Yapılmayanlar:** gerçek tarayıcı görüntü kontrolü, GPU'da shader
derleme doğrulaması, gerçek Android/Safari testi, ileri/geri hareketin
görsel izlenmesi, ekran kaydı, FPS/CLS/LCP/INP ölçümü. Projeksiyon
testleri font metriklerini, ışık kalitesini ve gerçek cihaz hissini
kanıtlamaz. Bu testler yapılmış gibi sunulmaz.

Görsel bir düzeltme turu gözlemlenen karelere dayanmalıdır. Bu oturumda
böyle bir tur yapılamadı; kod üzerinden yapılan hata kontrolleri görsel
düzeltme turu olarak sayılmadı.

### Korunan kapsam

Mevcut ana sayfa ve bütün alt bölümler, Machiavelli V6.1, Control V2.2,
Payot araştırma dosyası, site-data.js, global CSS/JS, SEO, _headers ve
PR #20 değiştirilmedi. Yeni dosyalar dağıtım izin listesine tek tek
eklendi; eski koruma manifestinde yalnız .assetsignore hash'i
güncellendi. Main'e merge ve production yayını yoktur.

İzole prototipin statik video bağlantısı şu anki doğrulanmış yayıma
bağlıdır. Canlı entegrasyon öncesinde bu yeni HTML şablonunun da kalıcı
statik renderer/yayın geri çekme akışına dahil edilmesi gerekir.
Runtime bağlantıları mevcut video doğrulayıcısını kullanır.

### Dürüst görsel değerlendirme

Bu, önceki denemeye göre farklı ve gerçek geometrili bir teknik
yaklaşımdır. Ancak görüntüyü görmeden “wow etkisi yakalandı” ya da
“sinematik kalite tamamlandı” diyemem. Işık dengesi, tipografi ritmi ve
mobil hissi **henüz doğrulanmadı**. Teslim, çalışan bir açılış yönünü
incelemeye açmayı amaçlar; görsel kabul veya yayın onayı değildir.

### Kaynaklar

WebGL matrisleri:
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection

WebGL kaynak bütçesi ve context kaybı:
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
