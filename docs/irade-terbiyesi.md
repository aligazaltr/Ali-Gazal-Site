# İrade Terbiyesi — proje sunumu

PR #9'un birleştiği `6691fee` ana dalı üzerine, ayrı dalda eklendi. Mevcut
statik mimari, Machiavelli prodüksiyonu, final kapak ve 15 düşüncelik arşiv korunur.
Yeni video prodüksiyonu veya bilimsel literatür araştırması başlatılmadı.

## Ziyaretçinin yolu

- Ana sayfada Machiavelli dosyasından sonra **Sıradaki projemiz** bölümü.
- Projeler sayfasında aktif Machiavelli'den ayrı bir sonraki araştırma alanı.
- `/irade-terbiyesi`: soru, yazar/kitap, güncel durum ve dört araştırma aşaması.
- Projeden mevcut `/dusunce-arsivi?kitap=irade-terbiyesi#arsiv` görünümüne bağlantı.
- Mevcut beş Payot düşüncesinden proje dosyasına dönüş; aynı alıntı verisi kullanılır.

Yeni kapak, sahte video, sayfa/okuma yüzdesi, sonuç veya kesinleşmemiş ilke yok.
Güncel okuma durumu kullanıcının talimatına göre yalnız **Kitap okunuyor.**
Özel günlük notları veya kişisel ölçümler kamuya aktarılmadı.

## Tek merkezden güncelleme

Kayıt: `site-data.js → projects['irade-terbiyesi']`.

1. Dört araştırma aşaması `research.stages` içinde bulunur. Her aşamanın
   `status` değeri `not-started`, `in-progress` veya `completed` olur.
   Şu anda ilk aşama `in-progress`, diğer üçü `not-started`.
2. İlerlerken biten aşamayı `completed`, başlayan sonraki aşamayı `in-progress`
   yap. Görünen güncel aşama ve kısa durum aynı kayıttan türetilir; yüzde hesaplanmaz.
3. Yeni doğrulanmış bilgiler geldikçe aşamanın `description`/`goal`, projenin
   `summary`, `duration.label`, `research.videoLabel`, `seo.description` ve
   `lastUpdated` alanlarını gerçekleşen duruma göre güncelle. Plan anlatımı
   kendiliğinden deney bulgusuna dönüşmez. Araştırma sırası ve dört aşama korunur.
4. Yöntemler kesinleşmeden `principles` boş kalır. Sonuç, kanıt veya kişisel
   ölçüm ayrı yayın değerlendirmesi olmadan eklenmez.
5. Dört araştırma aşaması tamamlandıktan ve prodüksiyon gerçekten başladıktan
   sonra `video.productionStatus='preparing'` yapılabilir. Video hazırlığı
   **beşinci araştırma aşaması değildir**. İlk dört aşama bitmeden bu durum reddedilir.
6. Video gerçekten yayımlandığında mevcut yayın sistemi kullanılır:
   `video.published=true`, gerçek `video.url`, `video.title`,
   `video.durationSeconds` ve `publishedAt`. Varsa onaylı kapak
   `video.thumbnail` içine eklenebilir. Geçersiz veya eksik video yayını build'i durdurur.
7. Payot ile ilişkili yeni doğrulanmış düşünceler mevcut `content/archive.json`
   kaynağında tutulur. Proje bağlantıları `source.bookId` ilişkisiyle üretilir.

Her veri güncellemesinden sonra:

```sh
node scripts/sync-site.js
node scripts/build-archive.js
node scripts/check-site.js
node --test scripts/test-*.js
```

Ana sayfa/proje listesi önizlemeleri ve araştırma aşamaları, mevcut
`sync-site.js` üretiminin küçük bir uzantısıdır. Tarayıcı aynı veriyi indirse de
bu metinler JavaScript'e bağımlı değildir. Yeni framework, CMS, veri tabanı,
API, üyelik, ücretli servis veya JavaScript dosyası eklenmedi.

## Yayın

Değişiklikler `feat/irade-terbiyesi-2026-10-19` dalında incelenir. Cloudflare dal
önizlemesi üretim yayını değildir. Bu yeni entegrasyon için kullanıcı incelemesi
ve birleştirme/yayın onayı beklenir; PR #9'un eski onayı yeni kapsamın onayı sayılmaz.
