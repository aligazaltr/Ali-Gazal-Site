# Düşünce Arşivi — ilk sürüm

Mevcut statik siteye eklendi. Yeni servis, framework, veritabanı, API anahtarı
veya ücretli bağımlılık yok. Üretim yayını kullanıcı onayını bekler.

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

- Niccolò Machiavelli / Prens: 5 boş taslak.
- Jules Payot / İrade Terbiyesi: 5 boş taslak.
- Marcus Aurelius / Kendime Düşünceler: 5 boş taslak.
- Yayımlanmış alıntı: 0. Mevcut okuma özetleri ve deney ilkeleri birebir alıntı değildir.
- Marcus’un eski video adresi arşiv yönlendirmesi olarak kaldı; yeni video projesi açılmadı.

Eksik çevirmen, baskı veya sayfa alanları tahmin edilmedi. Metinler kullanıcıyla
birlikte kaynak baskıdan seçilecek. Dosyada yer ayrılması yayına izin vermez.

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
