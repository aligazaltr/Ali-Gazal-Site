# Düşünce Arşivi — ilk sürüm

Mevcut statik siteye eklendi. Yeni servis, framework, veritabanı, API anahtarı
veya ücretli bağımlılık yok. Kullanıcı 19 Ekim 2026'da içeriklerin tamamlanmasını
ve PR #9 üzerinden üretim yayınını açıkça onayladı.

## Veri akışı

| Kaynak | Görev |
| --- | --- |
| `content/archive.json` | Yazarlar, kitaplar, kategoriler, editoryal alıntılar ve özgün düşünceler |
| `site-data.js` | Mevcut projeler ve videolar; `source.authorId/bookId` ile kitap bağlantısı |
| `scripts/build-archive.js` | İlişki/doğrulama/yayın kontrolleri, kamuya açık veri ve statik HTML üretimi |
| `archive-data.js` | Üretilmiş, yalnızca yayımlanmış içerik; elle düzenlenmez |
| `archive-core.js` | Türkçe arama, filtre URL’leri, rastgele seçim ve paylaşım metni |
| `archive.js` | Var olan HTML’ye arama, keşif ve paylaşım davranışları ekler |
| `dusunce-arsivi.html`, `archive.css` | Tek arşiv sayfası, kaynak/yorum ayrıntıları ve mevcut temayla uyumlu düzen |

Video için ikinci bir kayıt merkezi oluşturulmadı. İlişkiler `projectId` ile
mevcut projeye gider. Video kimliği, başlık, URL, kapak ve süre bu kaynaktan
okunur. Yayımlanmamış video veya doğrulanmamış zaman damgası bağlantıya dönüşmez.

## İlk içerik durumu

- Niccolò Machiavelli / Prens: 5 kaynak kontrollü serbest çeviri; XV, XVIII, XXIII, XXV.
- Jules Payot / İrade Terbiyesi: 5 kaynak kontrollü serbest çeviri; s. 8, 9, 11, 129, 137.
- Marcus Aurelius / Kendime Düşünceler: 5 kaynak kontrollü serbest çeviri; V.1, VIII.47, V.20, X.16, XII.17.
- Toplam 15 yayımlanmış düşünce. Hepsi `free-translation`; modern Türkçe baskılardan birebir alıntı değildir.
- Marcus’un eski video adresi arşiv yönlendirmesi olarak kaldı; yeni video projesi açılmadı.

Türkçe metinler ve editoryal yorumlar yapay zekâ desteğiyle hazırlandı. Özel günlük
ayrıntıları veya doğrulanmamış kişisel anılar yayımlanmadı. Machiavelli'nin ilk üç
düşüncesi mevcut deney kuralları ve açıkça belirtilen kısmi sonuçla ilişkilidir.
Payot ve Marcus için yeni deney sonucu veya video bağlantısı üretilmedi.

### Kaynaklar ve doğrulama

- **Machiavelli:** [Wikisource, 1814 baskı transkripsiyonu](https://it.wikisource.org/wiki/Indice:Il_Principe.djvu).
  Seçilen İtalyanca pasajlar ilgili bölüm metni ve bağlamıyla karşılaştırıldı.
  Modern bir çeviri kullanılmadı; konum bölüm numarasıyla verildi.
- **Payot:** [Wellcome Collection, b28050101](https://wellcomecollection.org/works/fbnfek8v).
  OCR, beş basılı sayfanın taramasıyla tek tek karşılaştırıldı. İç kapak (tarama 7)
  **Félix Alcan, Paris, 7. baskı, 1898** gösterir; katalogdaki 1897 yerine fiziksel
  nüshadaki tarih kullanıldı. Sayfalar 8/9/11/129/137, taramalar 32/33/35/153/161.
  Kurum nüshayı Public Domain Mark ile sunuyor. Kaynak kredisi: Wellcome Collection.
- **Marcus:** [Project Gutenberg #15877](https://www.gutenberg.org/ebooks/15877),
  George Long (1800–1879) İngilizce çevirisi. Kayıt dijital yayını 2005 olarak verir;
  bu sayı özgün eserin veya basılı çevirinin tarihi gibi sunulmaz. Her pasaj kitap
  ve madde numarasıyla doğrulandı. Türkçe çeviri İngilizce ara kaynaktan yapılmıştır.

Kaynak kontrolü Codex tarafından 19 Ekim 2026'da yapıldı; insan editör veya
akademik çeviri incelemesi yapılmış gibi gösterilmez. `source.originalText` kamuya
açık kaynak pasajıdır ve ayrıntılarda kaynak diliyle gösterilir. Serbest çeviri
etiketi kopyalanan/paylaşılan metinde de korunur. Modern Türkçe baskı eşleştirmesi
bu seçkinin dayanağı değildir; ileride yapılırsa ayrıca baskı/çevirmen kontrolü gerekir.

## İçerik ekleme

1. Kaydı kalıcı `id` ve `slug` ile doldur. Türler: `direct-quote`,
   `free-translation`, `paraphrase`, `original-insight`.
2. Birebir metni, kitap/yazar ilişkisini, dili, yayınevini, baskıyı ve sayfa
   veya bölüm konumunu kaydet. Çeviri baskısında çevirmen gereklidir.
3. Doğrulayan kişi, tarih ve dayanağı ile `verification.status=verified`
   kaydet. Serbest çeviride kaynak metin ve çeviren ayrıca gereklidir.
4. Kullanım hakkının dayanağı değerlendirildikten sonra `rights.status=approved`
   yap. Bu alan hukuki değerlendirmeyi otomatik yapmaz; tamamlanmış incelemeyi kaydeder.
5. Yazarın anlamı, bizim yorumumuz, uygulama ve eleştiri alanlarını gerekiyorsa
   doldur. Ali’nin yaşamadığı deneyimi veya söylemediği görüşü onun adına yazma.
6. Yayına hazır olduğunda `status=published` ve gerçek `publishedAt` tarihini gir.
   Video ilişkisi için `videoRefs: [{projectId, seconds, timestampVerified}]`
   kullan; zaman bilinmiyorsa `seconds=null`, `timestampVerified=false`.
7. Aşağıdaki üretim/kontrol komutlarını çalıştır; PR incelemesi ve yayın onayını bekle.

```sh
node scripts/sync-site.js
node scripts/build-archive.js
node scripts/check-site.js
node --test scripts/test-*.js
```

Yanlışlıkla yayımlanmış işaretlenen eksik kayıt sessizce atlanmaz; build hata
verir. Wrangler’ın mevcut build akışına senkronizasyon ve test kapıları eklendi.
Kamuya açık veri, izin verilen alanlardan oluşturulur. Editoryal notlar ve
doğrulama kanıtının iç metni dışarı aktarılmaz. Mevcut `.assetsignore` izin
listesi `content/`, `scripts/` ve `docs/` dizinlerini dağıtım dışında tutar.
GitHub deposunun görünürlüğü bundan ayrıdır; özel günlük ve izin belgesi gibi
kişisel içerikleri bu depoya koyma, gerekiyorsa güvenli kaynağın referansını tut.

## URL ve SEO

- Ana URL: `/dusunce-arsivi`.
- İçerik bağlantısı: `/dusunce-arsivi#dusunce-<slug>`.
- Arama/filtreler: `q`, `yazar`, `kitap`, `kategori`; canonical ana arşivdir.
- Kaynak/yorum ayrıntıları native `details` ile aynı sayfada; ayrı ince sayfalar yok.
- Sıfır yayımlanmış içerikte arşiv `noindex,follow`; sitemap’e eklenmez.
- İlk doğrulanmış yayınla build, index etiketini, CollectionPage/ItemList
  verisini ve sitemap kaydını oluşturur. Son yayımlanmış içerik kaldırılınca geri kapatır.
- Machiavelli sayfasındaki ilgili düşünceler de aynı üretimde güncellenir.

## Kullanım ve genişleme

Arama bir kez oluşturulan yerel dizinde çalışır. `İ/ı/I/i`, aksanlar ve Türkçe
harflerin sade karşılıkları eşleşir; birden fazla kelime AND mantığıyla aranır.
Yazar/kitap/kategori birlikte daraltır. Keşfet düğmesi görünür yayımlanmış
sonuçlardan seçer; birden fazla sonuç varsa aynı kayıt peş peşe seçilmez.

JavaScript kapalıyken metinler, kaynaklar ve ayrıntılar statik HTML’de okunur;
çalışmayan filtre ve paylaşım düğmeleri gösterilmez. Kopyalama başarısızsa
seçilebilir metin sunulur. Yerel paylaşım iptali hata sayılmaz.

Yüzlerce kayıt için yeni kimlikler ve ilişkiler eklemek yeterli. Ayrı yazar/kitap
sayfaları, sosyal görsel üretimi, semantik arama ve kişiselleştirme bu sürümde yok.

## İlk sürüm doğrulaması — 19 Ekim 2026

- 18 Node testi: yayın kapıları, kaynak/telif eksikleri, Türkçe arama, filtreler,
  türler, video/zaman damgası, paylaşım metni, güvenli HTML ve veri senkronizasyonu.
- Cloudflare dal önizlemesinde arşiv, sentetik içerikli arşiv, ana sayfa ve
  Machiavelli: 320/360/390/430/768/1440 px × iki tema = 48 düzen kontrolü.
  Yatay taşma ve 44 px altı form/düğme/ana menü hedefi görülmedi.
- Tarayıcıda arama, birleşik filtreler, boş sonuç, kopyalanan metnin içeriği,
  paylaşımın bağlantı kopyalama yedeği, rastgele keşif, hash yenileme/geri gezinme,
  klavyeyle ayrıntı açma, görünür odak ve tema kalıcılığı denendi.
- JavaScript çalıştırılmayan iframe içinde test metinleri, kaynaklar ve native
  ayrıntılar kullanılabildi. Uzun test metni taşmadı. Uygulama kaynaklı konsol
  hatası görülmedi; tarayıcı eklentisinin kendi hata kayıtları ayrı tutuldu.
- `content/archive.json` önizleme sunucusunda 404 döndü. Bu kontrolde fark edilen
  iç içe 404 adreslerindeki göreli bağlantılar kök base adresiyle düzeltildi.
- Yeni arşivde hareketli giriş yok; azaltılmış hareket kuralları CSS'de korunuyor.
  Fiziksel Android cihazı, cihazın yerel paylaşım menüsü ve işletim sistemi
  hareket tercihi bu ortamda doğrudan test edilmedi. Boyut testleri tarayıcı
  iframe görünümüdür; gerçek cihaz testi yerine geçmez.
- Gerçek yazarlara atfedilmeyen sentetik test sayfaları nihai daldan kaldırıldı.
