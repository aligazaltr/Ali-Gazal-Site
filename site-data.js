/*
 * Public project registry.
 *
 * Keep only publication-safe data in this file: it is downloaded by every
 * visitor. New projects should follow the same shape so search and filters can
 * be added later without changing today's interface.
 */
const AG_SITE_DATA = (() => {
  const data = {
    canonicalOrigin: 'https://ali-gazal-site.aliicerikmedya.workers.dev',
    phases: [
      { id: 'preparing', label: 'Hazırlanıyor' },
      { id: 'testing', label: 'Deneniyor' },
      { id: 'reviewing', label: 'İnceleniyor' },
      { id: 'published', label: 'Video yayında' }
    ],
    projects: {
      machiavelli: {
        id: 'machiavelli',
        slug: 'machiavelli',
        title: 'Machiavelli’nin üç düşüncesi davranışımı değiştirecek mi?',
        shortTitle: 'Machiavelli / Prens deneyi',
        summary: 'Üç düşünce yedi takvim günü boyunca gerçek karar anlarında etik biçimde sınandı; sonuç olumlu fakat kısmi.',
        status: 'active',
        statusLabel: 'Deney tamamlandı · video hazırlanıyor',
        phase: 'reviewing',
        dates: {
          plannedStart: '2026-09-21',
          plannedEnd: '2026-09-27',
          label: '21–27 Eylül 2026'
        },
        topics: ['kitap', 'felsefe', 'kararlar', 'gerçek hayat deneyi'],
        source: {
          authorId: 'machiavelli',
          bookId: 'prens',
          author: 'Niccolò Machiavelli',
          title: 'Prens',
          label: 'Machiavelli · Prens'
        },
        duration: {
          value: 7,
          unit: 'gün',
          label: '7 gün · tamamlandı'
        },
        completedAt: '2026-09-27',
        lastUpdated: '2026-09-27',
        publishedAt: null,
        searchable: true,
        seo: {
          title: 'Machiavelli / Prens Deneyi: 7 Günlük Sonuç | Ali Gazal',
          description: 'Yedi günlük deney tamamlandı. En güçlü sonuç fiilî gerçeğe bakma ilkesiydi; diğer iki ilke etkili oldu ancak kurallar her olayda eksiksiz uygulanmadı.'
        },
        display: {
          homeHeading: 'Deney tamamlandı, video hazırlanıyor.',
          homeCardHeading: 'Üç düşüncenin yedi günlük sonucu incelendi.',
          homeCardState: 'Kısa sonuç ve kayıt sınırları yayımlandı; video henüz hazırlanıyor.',
          homeSharingDescription: 'Gerçek hayat deneyleri, yöntem ve kanıt sınırları. Machiavelli / Prens deneyi tamamlandı; video hazırlanıyor.',
          projectLeadState: 'Deney tamamlandı; video hazırlanıyor.',
          coverCaption: 'Final video kapağı · Video henüz yayımlanmadı',
          phaseSummary: 'Güncel aşama: İnceleniyor. Video henüz yayımlanmış sayılmıyor.',
          truthState: 'Yedi takvim günlük deney tamamlandı. Aşağıdaki sonuç ve kayıtlar öz-bildirim sınırlarıyla yayımlandı; ayrıntılı hikâye videoya bırakıldı. Video henüz yayımlanmadı.',
          videoPanelTitle: 'Video henüz yayımlanmadı.',
          videoPanelDescription: 'Deney tamamlandı. Ana çekim ve kurgu sonrasında yalnızca gerçek YouTube bağlantısı eklenecek.'
        },
        principles: [
          {
            id: 'fiili-gercek',
            title: 'Fiilî gerçeğe bak',
            rule: 'Karardan önce istek/varsayım ile doğrulanabilir gerçeği ayır; davranışı gerçeğe göre seç.'
          },
          {
            id: 'onceden-hazirlan',
            title: 'Zorluk gelmeden hazırlan',
            rule: 'Öngörülebilir zorluk görüldüğünde en fazla beş dakikalık somut hazırlık yap.'
          },
          {
            id: 'yontemi-uyarla',
            title: 'Amacı koru, yöntemi koşula uyarla',
            rule: 'Planlanan yöntem tıkanır veya on dakika ilerleme sağlamazsa amacı yaz; on dakika içinde yöntemi değiştir.'
          }
        ],
        video: {
          published: false,
          url: '',
          title: '',
          durationSeconds: null,
          thumbnail: {
            src: 'machiavelli-prens-7-gun-kapak.jpg',
            alt: 'Ali Gazal ve Machiavelli’nin yer aldığı, “İşe yaradı mı?” ve “7 Gün” yazılı Machiavelli deneyi kapağı.',
            width: 1280,
            height: 720
          },
          chapters: []
        },
        result: {
          published: true,
          summary: 'Deney olumlu fakat kısmi bir sonuç verdi. En güçlü kazanım, karar anında fiilî gerçeğe bakma filtresinin yerleşmesiydi. Diğer iki ilke de bazı kararları etkiledi; ancak belirlenen süre ve yazma şartları her olayda doğrulanmadığı için tam uygulama başarısı sayılmadı.',
          limitations: [
            'Olay anı görüntüsü veya bağımsız A sınıfı kanıt bulunmuyor.',
            'Kayıtların çoğu aynı gün, biri geriye dönük öz-bildirime dayanıyor.',
            'İkinci ilkenin beş dakika; üçüncü ilkenin yazılı amaç ve on dakika koşulları her olayda tam doğrulanmadı.',
            'Bu, tek kişinin yedi takvim günlük sınırlı deneyidir; nedensellik veya herkes için geçerli fayda kanıtlamaz.',
            '“7 gün” deney süresidir; kusursuz uygulama serisi değildir.'
          ]
        },
        evidence: {
          published: true,
          entries: [
            {
              id: 'gun-2-plan-degisikligi',
              public: true,
              dayLabel: 'Gün 2 · 22 Eylül',
              title: 'Plan, gerçek koşula göre değişti.',
              summary: 'Günün planlanandan uzun sürmesi üzerine çalışma başlangıcı gerçek koşullara göre yeniden düzenlendi.',
              principle: 'Fiilî gerçeğe bak.',
              evidenceType: 'B — aynı gün öz-bildirim',
              recordedAt: 'Aynı gün kaydedildi.',
              supports: 'İlkenin karar sırasında bilinçli biçimde hatırlandığını ve planın gerçeğe göre değiştirildiğini destekler.',
              doesNotProve: 'Değişikliğin uzun vadeli başarıya yol açtığını veya olayın bağımsız olarak doğrulandığını kanıtlamaz.'
            },
            {
              id: 'gun-4-on-hazirlik',
              public: true,
              dayLabel: 'Gün 4 · 24 Eylül',
              title: 'Ertesi sabahın zorluğuna karşı önceden hazırlık yapıldı.',
              summary: 'Ertesi gün yaşanabilecek gecikme riskine karşı temel ihtiyaçlar önceki akşam hazırlandı; sabah planın sürmesine yardımcı oldu.',
              principle: 'Zorluk gelmeden hazırlan.',
              evidenceType: 'B — aynı gün öz-bildirim',
              recordedAt: 'Aynı gün kaydedildi.',
              supports: 'Önceden hazırlığın pratik fayda gösterdiğini ve ilkenin bilinçli hatırlandığını destekler.',
              doesNotProve: 'Hazırlığın tam beş dakika içinde yapıldığını veya sonucun yalnızca bu ilke nedeniyle oluştuğunu kanıtlamaz.'
            },
            {
              id: 'gun-5-erkene-alma',
              public: true,
              dayLabel: 'Gün 5 · 25 Eylül',
              title: 'Yaklaşan yoğunluk görülünce önemli iş erkene çekildi.',
              summary: 'Yaklaşan yoğun takvim öğrenilince önemli bir izin ve resmî görüşme işi aynı güne alınarak olası zorluktan önce hareket edildi.',
              principle: 'Zorluk gelmeden hazırlan.',
              evidenceType: 'C — geriye dönük öz-bildirim',
              recordedAt: 'Sonradan kayda geçirildi.',
              supports: 'İlkenin karar öncesinde akılda olduğuna ve zamanlama kararını etkilediğine dair öz-bildirimi destekler.',
              doesNotProve: 'Kısa hazırlık adımının süresini, bütün olay ayrıntılarını veya bağımsız nedenselliği kanıtlamaz.'
            },
            {
              id: 'gun-6-7-yontem-degisikligi',
              public: true,
              dayLabel: 'Gün 6–7 · 26–27 Eylül',
              title: 'Kamera yöntemi tıkanınca kayıt yöntemi değiştirildi.',
              summary: 'Sağlık ve ses koşulları ana çekime izin vermeyince proje bırakılmadı; aynı gün yazılı kayıtla kapatıldı ve prodüksiyon iyileşme sonrasına taşındı.',
              principle: 'Amacı koru, yöntemi koşula uyarla. Gün 7’de fiilî gerçeğe bakma filtresi de kararın parçasıydı.',
              evidenceType: 'B — aynı gün yazılı öz-bildirim',
              recordedAt: 'Her iki gün de aynı gün yazılı olarak kaydedildi; olay videosu yok.',
              supports: 'İlkenin yöntem değiştirirken bilinçli olduğunu ve projenin tamamen bırakılmadığını destekler.',
              doesNotProve: 'Önceden yazılmış amaç ve on dakika içinde geçiş şartlarının eksiksiz uygulandığını veya yöntemin nihai video başarısını kanıtlamaz.'
            }
          ]
        },
        tryIt: {
          enabled: false,
          durationDays: 7,
          storageVersion: 1,
          rules: [],
          guide: ''
        },
        features: {
          evidenceLedger: true,
          videoTimeline: false,
          tryIt: false
        },
        sharing: {
          title: 'Machiavelli’nin üç düşüncesini 7 gün denedim | Ali Gazal',
          description: 'Yedi günlük deney tamamlandı. En güçlü sonuç fiilî gerçeğe bakma ilkesiydi; diğer iki ilke etkili oldu ancak kurallar her olayda eksiksiz uygulanmadı. Video hazırlanıyor.',
          image: 'machiavelli-prens-7-gun-kapak.jpg'
        }
      },
      'irade-terbiyesi': {
        id: 'irade-terbiyesi',
        slug: 'irade-terbiyesi',
        title: 'İrade gerçekten eğitilebilir mi?',
        shortTitle: 'Jules Payot — İrade Terbiyesi',
        summary: 'İrade doğuştan gelen değişmez bir özellik mi, yoksa bilinçli çalışmalarla geliştirilebilir mi? Jules Payot’nun İrade Terbiyesi kitabındaki düşünceleri inceliyoruz. Okuma sonrasında yöntemleri modern araştırmalarla karşılaştırıp seçilen ilkeleri gerçek hayatta test etmeyi planlıyoruz.',
        status: 'upcoming',
        statusLabel: '',
        phase: 'preparing',
        topics: ['kitap', 'irade', 'disiplin', 'alışkanlık', 'araştırma', 'gerçek hayat deneyi'],
        searchable: true,
        source: { authorId: 'jules-payot', bookId: 'irade-terbiyesi', author: 'Jules Payot', title: 'İrade Terbiyesi', label: 'Jules Payot · İrade Terbiyesi' },
        duration: { value: 7, unit: 'gün', label: '7 gün · planlanan uygulama' },
        completedAt: null,
        lastUpdated: '2026-10-19',
        publishedAt: null,
        research: {
          question: 'Jules Payot’nun yaklaşık 130 yıllık yöntemleri günümüzde gerçekten işe yarıyor mu?',
          contentType: 'Kitap araştırması + modern bilim incelemesi + gerçek hayat deneyi',
          videoLabel: 'İkinci ana video projesi · araştırma aşamasında',
          publicationLabel: 'Yayın tarihi henüz belirlenmedi.',
          readingLabel: 'Kitap okunuyor.',
          stages: [
            { id: 'okuma', title: 'Kitabı okuma ve inceleme', status: 'in-progress', activeLabel: 'Kitap okunuyor, araştırma devam ediyor.',
              description: 'İrade Terbiyesi’ni yeniden okuyarak irade, alışkanlık, disiplin ve davranış kontrolü hakkındaki fikirleri inceliyoruz. Önemli görüşleri ve uygulanabilir olabilecek yöntemleri not ediyoruz.',
              goal: 'Kitabı anlamak ve araştırmaya değer fikirleri belirlemek. Okuma tamamlanmadan nihai deney ilkeleri seçilmeyecek.' },
            { id: 'ilkeler', title: 'Uygulanabilir ilkeleri belirleme', status: 'not-started', activeLabel: 'İlke seçimi yapılıyor.',
              description: 'Kitap tamamlandıktan sonra bir ilke havuzu oluşturacağız. Yöntemleri uygulanabilirlik, ölçülebilirlik, gerçek hayatla ilişkisi, araştırma değeri ve birbirinden bağımsız olması açısından değerlendireceğiz.',
              goal: 'Mümkünse üç ana ilke seçmek. İlke sayısı ve hangi yöntemlerin deneneceği henüz kesinleşmedi.' },
            { id: 'bilim', title: 'Modern bilimsel araştırma', status: 'not-started', activeLabel: 'Modern bilimsel inceleme yapılıyor.',
              description: 'Seçilen yöntemleri modern psikoloji ve davranış bilimi araştırmalarıyla karşılaştıracağız. Destekleyen bulguları, çelişen sonuçları ve kanıtın yetersiz kaldığı noktaları ayrı ayrı değerlendireceğiz.',
              goal: 'Kitaptaki görüşleri sorgulamadan kabul etmek yerine, mevcut bilimsel bulgular ışığında değerlendirmek.' },
            { id: 'deney', title: '7 günlük gerçek hayat deneyi', status: 'not-started', activeLabel: '7 günlük kişisel uygulama sürüyor.',
              description: 'Araştırma sonunda seçilen ilkeleri yedi gün boyunca günlük hayatta uygulamayı planlıyoruz. Önce yöntemleri, günlük davranış hedeflerini, başlangıç ölçümlerini, başarı ve başarısızlık kriterlerini, kayıt ve değerlendirme kurallarını belirleyeceğiz.',
              goal: 'Yöntemlerin bu kişinin hayatında ne ölçüde uygulanabilir ve faydalı olduğunu araştırmak. Sonuç olumlu, olumsuz veya belirsiz olabilir.' }
          ]
        },
        seo: { title: 'İrade gerçekten eğitilebilir mi? | Jules Payot — Ali Gazal', description: 'Jules Payot’nun İrade Terbiyesi kitabından kişisel uygulamaya: dört araştırma aşaması, güncel okuma durumu ve planlanan 7 günlük deney. Deney henüz başlamadı.' },
        display: { currentStage: '', phaseSummary: '', videoPanelTitle: 'Yayın tarihi henüz belirlenmedi.', videoPanelDescription: 'Araştırma ve deneyden sonra video hazırlanacak. Henüz bir yayın tarihi veya yayımlanmış video bağlantısı yok.' },
        principles: [],
        video: { published: false, productionStatus: 'not-started', url: '', title: '', durationSeconds: null, thumbnail: { src: '', alt: '', width: 1280, height: 720 }, chapters: [] },
        result: { published: false, summary: '', limitations: [] },
        evidence: { published: false, entries: [] },
        tryIt: { enabled: false, durationDays: 7, storageVersion: 1, rules: [], guide: '' },
        features: { evidenceLedger: false, videoTimeline: false, tryIt: false },
        sharing: { title: 'İrade gerçekten eğitilebilir mi? | Ali Gazal', description: '', image: '' }
      }
    }
  };

  // Publication copy follows the release flag, never the calendar. Keep the
  // fallback HTML in sync with: node scripts/sync-site.js
  Object.values(data.projects).forEach(project => {
    if (project.research) {
      const stages = project.research.stages;
      const current = stages.find(stage => stage.status === 'in-progress');
      const complete = stages.every(stage => stage.status === 'completed');
      project.statusLabel = current?.activeLabel || (complete ? 'Deney tamamlandı, sonuçlar inceleniyor.' : 'Araştırma hazırlanıyor.');
      project.display.currentStage = current?.title || (complete ? 'Sonuçların değerlendirilmesi' : 'Araştırma planı');
      project.display.phaseSummary = `Güncel araştırma aşaması: ${project.display.currentStage}.`;
      project.research.readingLabel = stages[0].status === 'completed' ? 'Kitap okuması tamamlandı.' : stages[0].status === 'in-progress' ? 'Kitap okunuyor.' : 'Okuma henüz başlamadı.';
      project.display.experimentState = stages[3].status === 'completed' ? 'Kişisel uygulama tamamlandı.' : stages[3].status === 'in-progress' ? 'Kişisel uygulama sürüyor.' : 'Deney henüz başlamadı.';
      project.phase = complete ? 'reviewing' : current?.id === 'deney' ? 'testing' : 'preparing';
      if (project.video.productionStatus === 'preparing') {
        project.display.videoPanelTitle = 'Video hazırlanıyor.';
        project.display.videoPanelDescription = 'Araştırma ve kişisel uygulama tamamlandı. Video hazırlanıyor; yayın tarihi henüz belirlenmedi.';
      }
      if (project.video.published) {
        project.phase = 'published';
        project.statusLabel = 'Video yayımlandı.';
        project.display.videoPanelTitle = project.video.title;
        project.display.videoPanelDescription = 'Araştırmanın ve kişisel deneyin hikâyesi YouTube’da yayımlandı.';
        project.seo.title = `${project.video.title} | Ali Gazal`;
        project.research.publicationLabel = 'Video yayımlandı.';
        project.research.videoLabel = 'İkinci ana video projesi · yayımlandı';
      }
      project.sharing.title = project.seo.title;
      project.sharing.description = project.seo.description;
      return;
    }
    if (project.video.published) {
      project.phase = 'published';
      project.statusLabel = 'Deney tamamlandı · video yayında';
      project.seo.title = `${project.video.title} | Ali Gazal`;
      project.sharing.title = project.seo.title;
      Object.assign(project.display, {
        homeHeading: 'Deney tamamlandı, video yayında.',
        homeCardState: 'Kısa sonuç ve kayıt sınırları yayımlandı; deneyin hikâyesi YouTube’da.',
        homeSharingDescription: 'Gerçek hayat deneyleri, yöntem ve kanıt sınırları. Machiavelli / Prens deneyinin videosu YouTube’da.',
        projectLeadState: 'Deney tamamlandı; video YouTube’da yayımlandı.',
        coverCaption: 'Final video kapağı · Video YouTube’da yayımlandı',
        phaseSummary: 'Güncel aşama: Video yayında.',
        truthState: 'Yedi takvim günlük deney tamamlandı. Aşağıdaki sonuç ve kayıtlar öz-bildirim sınırlarıyla yayımlandı; ayrıntılı hikâye YouTube videosunda.',
        videoPanelTitle: project.video.title,
        videoPanelDescription: 'Video YouTube’da yayımlandı. Deneyin hikâyesini kanaldaki videoda izleyebilirsin.'
      });
    }
    project.seo.description += project.video.published
      ? ' Video YouTube’da yayımlandı.'
      : ' Video hazırlanıyor.';
    project.sharing.description = project.seo.description;
  });

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  return deepFreeze(data);
})();

if (typeof window !== 'undefined') window.AG_SITE_DATA = AG_SITE_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = AG_SITE_DATA;
