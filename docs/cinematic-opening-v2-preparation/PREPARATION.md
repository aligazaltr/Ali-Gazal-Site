# Cinematic Opening V2 — üretim hazırlığı

26 Kasım 2026. Yalnızca analiz ve hazırlık; hiçbir üretim işi gönderilmedi, kredi harcanmadı. Tasarım, başarılı V1 kompozisyonu, kamera ve web dosyaları değiştirilmedi.

Temel: `feature/cinematic-opening-v1`, `0a487e7cb524f9ec659ea7374da49f54a98da0c8`. Hazırlık ayrı `feature/cinematic-opening-v2-preparation` dalındadır. V1, main ve PR #33 korunur.

## 1. Kaynaklar ve yeniden üretilebilirlik

61 kaynak/kayıt dosyasının envanteri boyut, SHA-256 ve mevcut olan Git blob kimlikleriyle `source-inventory.json` içindedir. V1 bütün kaynakları temel commit üzerinden korunuyor. En yüksek kaliteli girişler ayrıca `inputs/` altında saklandı.

| Kaynak | Doğrulanan kayıt |
|---|---|
| Asıl görsel | `inputs/approved-reference-original.png`; 1672×941; 2.967.591 bayt; SHA-256 `d5e0a933ace1d11ae0e700c089659705eda75bcb42b3536d4dc7667175c2357f` |
| Higgsfield görsel kimliği | `4a34e55b-c123-4e3a-a9cb-d2714b23cc5a` |
| Kamera kılavuzu | `inputs/camera-guide-10s.mp4`; 1280×720; 24 FPS; 10.000 s; 8.339.246 bayt |
| Kılavuz kimliği | `70150e5b-a616-4507-aa91-c9125df188c4`; mevcut Blender filminin ilk 10 saniyesi; üçüncü taraf referans videosu değil |
| Gerçek üretim | `hf_mult_motion_control` / Genjutsu; job `8caa7a82-da1b-4be0-a7d4-5be228ab830d` |
| Eski parametreler | `resolution=480p`, `duration=10`, `count=1`, `use_free_gens=true`; image + video referansları |
| Orijinal prompt | Tam ve değiştirilmemiş metin `inputs/original-generation-request.json` içinde. JSON'daki `params.prompt` asıl talimattır. |
| Ham sonuç | Temel dalda `docs/cinematic-opening-v1/generated-motion-original.mp4` |
| Web kopyası | Temel dalda `cinematic-film.mp4`; HTML/CSS/JS, poster, üç alternatif, beş storyboard karesi ve mevcut QA kayıtları da korunuyor. |

Bu kayıt bir Seedance Draft işi değildir. Seedance `draft_job_id`/finalize-draft yolu V1'e uygulanamaz. Genjutsu'nun güncel bağlı kataloğunda en yüksek seçenek 1080p; aynı modele yalnızca `4k` yazmak geçerli bir yükseltme değildir.

## 2. Teknik teşhis

| Özellik | Ham Higgsfield çıktısı | Web kopyası |
|---|---:|---:|
| Gerçek görüntü | 854×480 | 854×480 |
| Codec / profil | H.264/AVC High, Level 3.0 | H.264/AVC High, Level 3.0 |
| Piksel biçimi | yuv420p, 8 bit | yuv420p, 8 bit |
| Kare hızı / kare sayısı | 24 FPS / 241 | 24 FPS / 241 |
| Süre | 10.041667 s | 10.041667 s |
| Video bitrate | 9.083 Mbit/s | 4.354 Mbit/s |
| Dosya boyutu | 11.405.522 bayt / 11,41 MB | 5.468.994 bayt / 5,47 MB |
| Ses | Yok | Yok |

Codec'in `coded_width=864` alanı blok hizalamasıdır; görüntü 854 pikseldir. Kaynak 144p değildir; düşük detay, 480p görüntünün tam ekrana büyütülmesinden doğar.

Ham/web eşleşmiş 241 kare üzerinde SSIM **0.984887**, PSNR **42.773591 dB** ölçüldü. Bunlar algısal kalite yüzdesi veya 4K detay ölçüsü değildir. Web sıkıştırması bir miktar kayıp ekliyor fakat çözünürlük düşürmüyor; esas darboğaz zaten ham videodadır.

Doğrulanmış önizlemeden indirilen dosyanın SHA-256'sı kayıtlı web dosyasıyla birebir aynı: `a7cf551a3c6fedb82e23bd254579d5bf0fe8067736e25da1d25de1f7f30be539`. CDN ayrıca yeniden kodlamıyor. HTTP kanıtı `http-delivery-check.json` içinde.

CSS `object-fit:cover` kullanıyor; masaüstünde `object-position:60%`, mobilde son etkin kural `90%`. Örneğin 1920×1080 ekranda kaynak her eksende yaklaşık **2,25×**, 4K ekranda **4,5×** büyütülüyor. 390×844 mobilde, DPR=1 olsa bile cover yüksekliği yaklaşık **1,76×** büyütür ve yatay kaynağın yaklaşık %26'sını gösterir. Retina DPR bu ihtiyacı artırır. Bunlar CSS'den hesaplanan örneklerdir; kullanıcının fiziksel telefonu ölçülmedi. HTML başlıklarının keskin kalıp arka planın yumuşamasının nedeni bu ayrımdır.

## 3. Kamera korunarak 4K upscale — önerilen yol

Girdi **ham üretim job'ı** olmalı; yeniden sıkıştırılmış web dosyası kullanılmamalı. Hazır istekler: `upscale-standard.request.json` ve `upscale-pro.request.json`.

```json
{"model":"bytedance_video_upscale","resolution":"4k","fps":24,"preset":"aigc","model_version":"standard","count":1,"use_unlim":false,"medias":[{"role":"video","value":"8caa7a82-da1b-4be0-a7d4-5be228ab830d"}]}
```

`pro` seçeneğinde yalnızca `model_version` değişir. Yeni sahne promptu, kamera, hız veya tasarım eklenmez. 4K dosya daha büyük olur; bulunmayan ayrıntının hatasız geri geleceği garanti değildir. Özellikle harf, taş birleşimi, kitap sayfası ve su ince detayları karşılaştırılmalı.

Katalog/API 24 FPS kabul ediyor ve fiyatlandırıyor; kamuya açık yardım sayfası 30/60 FPS diyor. Bu fark açık bırakılmıştır: üretim onaylanırsa çıktı gerçekten 24 FPS/241 kare mi, 10.041667 saniye mi ve kamera aynı mı kontrol edilecek. Arayüzün 24 FPS'i koruyamadığı ortaya çıkarsa yeni bir FPS/enterpolasyon kararı otomatik alınmayacak. `4k` hizmet seçeneğidir; gerçek piksel ölçüsü çıktı gelince FFprobe ile doğrulanacak. Kaynağın 854:480 oranı tam 16:9'dan çok az farklıdır; kırpma/germe ile mimari değiştirilmeyecek.

Topaz Starlight Precise/Proteus ve FLUX.3 Precise de araştırıldı. Bağlı genel `video_upscale` modelinde hedef çözünürlük/preset denetimleri açığa çıkmıyor; bunlar için doğrulanmamış kredi fiyatı veya çalıştırılabilir 4K reçetesi uydurulmadı.

## 4. Aynı referanslarla native 4K alternatif

`native-4k-seedance20.request.json`: **Seedance 2.0**, `mode=std`, `resolution=4k`, `duration=10`, `aspect_ratio=16:9`, `bitrate_mode=high`, `generate_audio=false`, `count=1`. İlk görsel ve orijinal kamera kılavuzu aynı kimliklerle bağlandı. Asıl prompt korunup yalnızca onaylı tasarımın değiştirilmemesi yönünde bir koruma cümlesi eklendi. Genre seçilmedi; model varsayılanı `auto`.

Sağlayıcının resmî model tablosu Seedance 2.0 yolunu native 4K olarak listeliyor. Bağlı katalog bu modu doğruluyor; **Plus veya üzeri** plan istiyor. Seedance 2.5'in bağlı kataloğunda 4K seçeneği görünse de resmî API/yardım belgelerinde 1080p sınırı bulunuyor; native 4K için buna dayanarak söz verilmiyor.

Native üretim eski kareleri büyütmez, yeniden çizer. Aynı prompt ve referanslar bile kamera/perspektif/su/kitap hareketlerinin birebir kalacağını garanti etmez. Bu yüzden mevcut beğenilen tasarım için ilk tercih değildir. `fps`/`seed` gibi katalogda olmayan alanlar uydurulmadı.

## 5. Güncel kredi teklifleri — üretim yok

| İşlem | 10 saniye teklifi | 10.041667 saniyelik mevcut film için ihtiyatlı bütçe |
|---|---:|---:|
| ByteDance Standard, 4K / 24 FPS / AIGC | 8 kredi | 11 saniye kotasyonu: **8,8 kredi** |
| ByteDance Pro, 4K / 24 FPS / AIGC | 75 kredi | 11 saniye kotasyonu: **82,5 kredi** |
| Seedance 2.0 std, native 4K / high bitrate / sessiz | **220 kredi** | Yeni 10 saniyelik üretim; 11 saniye seçilmedi |

Tüm ham yanıtlar ve teklif kimlikleri `cost-quotes.json` içinde. Süre verilmezse fiyat aracı 5 saniyeyi varsayıp 4/37,5 kredi gösterebiliyor; bu kısa varsayımlar tam film maliyeti diye kullanılmadı. Araç ondalıklı süre almıyor, bu nedenle 11 saniye ihtiyat payıdır; 241 kare için kesin fatura veya üst sınır garantisi değildir. Üretim onayından sonra gerçek kaynak süresiyle fiyat tekrar kontrol edilmeli; onaylı bütçeyi aşan yeni teklif için yeniden onay gerekir.

Bağlı hesap **10 kredi / free** görünüyor. Kullanılabilir ücretsiz hareket hakkı 0. Hesap erişimi, fiyat teklifinin alınmasıyla kanıtlanmış olmaz; upscale için plan engeli olup olmadığı üretim başlatılmadan/başlatma yanıtında ayrıca netleştirilmeli. Sırf bu çalışma için otomatik abonelik, kredi alımı veya deneme başlatılmayacak. Mevcut 10 kredi harcanmadı.

## 6. Yüksek kaliteli web sunumu

`delivery-strategy.md` ayrı hazırlık planıdır. 4K arşiv master'ı değişmeden saklanacak. Web için aynı kadraj/zaman çizgisinden 1080p, 1440p ve 2160p türevler hazırlanabilir; birini seçmek yeni üretim kredisi gerektirmez. Her boyutta aynı ilk kare, 4.8 saniyelik otomatik açılış ve ileri/geri zaman eşlemesi korunur.

Masaüstünde ekran/DPR ve decoder gücüne göre 1440p/2160p; uzun ve yüksek DPR'lı mobilde yalnızca 'telefon' diye 720p'ye düşmek yerine 1440p veya uygun cihazda 2160p değerlendirilir. Düşük bağlantı/Save-Data için 1080p bir geri dönüş olabilir. Video en-boy oranı ve mevcut mobil kadraj değiştirilmez.

Bugünkü Range isteği 206 yerine 200 ve 5.468.994 baytın tamamını döndürdü; mevcut JS bütün filmi Blob'a alıyor. Bu kalite kaybı değil, yüksek çözünürlükte başlangıç/seek maliyetidir. Gerçek Range sunumu sonraki uygulama aşamasında planlanmalı. Mevcut Workers Static Assets tek dosya sınırı 25 MiB olduğundan 10 saniyelik 4K web kopyası için yaklaşık 16–20 Mbit/s / 20–25 MB bir başlangıç bütçesidir; gerçek çıktı görsel inceleme ile ayarlanmalı, master bu sınıra zorlanmamalı.

## Karar ve durma noktası

**Öneri:** Yeni native üretim veya abonelikle başlamadan, tek mevcut filmin ByteDance Standard 4K upscale denemesi için onay al. Yaklaşık 8–8,8 kredi bütçesiyle en düşük riskli ilk karşılaştırma budur. Pro veya native 4K'ya otomatik geçme. Detay iyileşmesini, mimari ve su tutarlılığını görmeden ana sayfanın sonraki bölümünü üretme.

Bu hazırlıkta görsel/video üretilmedi; yalnızca kaynaklar incelendi, girişler korundu ve fiyat teklifleri alındı. Main, production, V1 sitesi ve başarılı kompozisyon değiştirilmedi.

## Resmî kaynaklar

- https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-upscale
- https://higgsfield.ai/enterprise-help-center/platform/ai-models
- https://open.higgsfield.ai/models/bytedance/seedance-2.5/reference-to-video/api-reference
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://developers.cloudflare.com/workers/platform/limits/
- https://www.w3.org/TR/media-capabilities/

Bağlı hesap kontrolü: 10 kredi, ücretsiz plan, Genjutsu ücretsiz hareket hakkı 0; pending trial harcanabilir hak sayılmadı. Native Seedance 2.0 std için Plus+ gereksinimi katalogda açık. Upscale için üretime erişim, yalnızca fiyat teklifi alınarak kanıtlanamaz; abonelik satın alınmadan ve onaysız iş gönderilmeden bu belirsizlik korunuyor.
