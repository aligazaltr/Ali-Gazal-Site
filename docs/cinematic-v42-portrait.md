# Portre kaynağı ve işlem kaydı

## Gerçek kaynak

Kullanıcının sağladığı `ChatGPT Image 27 Eyl 2026 18_26_05.png` (1672 × 941) bu çalışma alanında mevcuttu. Final `machiavelli-prens-7-gun-kapak.jpg` (1280 × 720) ile yan yana incelendi: Ali solda, Machiavelli tasviri sağda; yazılar, yüz yönü ve kompozisyon aynı. Final JPEG değiştirilmedi.

Depoda ayrı portre yoktu. Tarihî kaynak kontrolü için [Wikimedia Commons'taki Santi di Tito portresi](https://commons.wikimedia.org/wiki/File:Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg) incelendi. Dosya sayfası bu tabloyu kamu malı olarak işaretliyor. **Bu tablo kapaktaki görselin aynısı değildir ve projede kullanılmadı.** Bu lisans bilgisi kapaktaki dijital tasvire aktarılmadı. Kapaktaki figürün aynı tarihî tablodan geldiği doğrulanamadı.

## Kullanılan varlık

Kullanıcıya bu ayrım açıklanarak, kendi sağladığı özgün kapaktaki sağ figürden ayrı bir dijital portre hazırlandı. Built-in Imagegen ile arka plan ve yazılar ayrıldı, metnin örttüğü giysi bölümü tamamlandı; final kapak yeniden üretilmedi. Bu işlem üretken bir düzenlemedir, piksel düzeyinde kusursuz kesim veya doğrulanmış tarihî tablo röprodüksiyonu değildir. Yüz yönü, ifade, saç, kırmızı yaka ve koyu giysi kaynakla görsel olarak karşılaştırıldı; bazı doku ve giysi ayrıntıları araç tarafından yeniden üretildi. Bu sınırlama korunmalıdır.

Çıktı gerçek alfa kanallı 1151 × 1367 PNG. Web teslimi için aynı oranla küçültülüp WebP quality 85/method 6 ile kodlandı; yüz geometrisine kodla müdahale edilmedi:

- `machiavelli-portrait-640.webp`: 640 × 760, 78.846 bayt.
- `machiavelli-portrait-960.webp`: 960 × 1140, 159.010 bayt.

Tarayıcı `srcset` ile uygun boyutu seçer; ikisini birden indirmek gerekmez. Alt kenar CSS maskesiyle sahneye karışır. Sayfadaki kaynak notu bunu video kapağındaki dijital tasvirden uyarlama olarak tanımlar. Arşivden rastgele bir tarihî portre aynıymış gibi sunulmaz; modern kullanıcı tasarımına kamu malı lisansı iddia edilmez.

## Imagegen istemi

> Use case: background-extraction. Asset type: separate transparent portrait layer for an editorial website, NOT a new thumbnail. Input image is the user's final cover; leave that original file unchanged. Extract ONLY the Machiavelli depiction on the RIGHT (short dark hair, red collar, black Renaissance garment). Remove the left person, all text, 7 GÜN badge, buildings, objects and backdrop. Keep the right man's exact facial proportions, expression, gaze, head angle, hair silhouette, skin texture, lighting, colors and visible clothing unchanged. Do not beautify, modernize, repaint the face or invent another identity. Deliver head and shoulders/upper torso as a clean isolated cutout on actual transparent alpha, centered in a portrait canvas. Keep full hair, ears, nose and shoulders within frame. Only reconstruct the small garment area obscured by the cover lettering as plain matching dark fabric; no text anywhere. No extra glow, outline or new background. Preserve natural photographic texture and the warm side lighting from the original.

İstem hedefi ile aracın çıktısı ayrıdır; yüzün birebir piksel korunumu iddia edilmez. Asset hash'leri `cinematic-v42-evidence/asset-budget.json` içindedir.
