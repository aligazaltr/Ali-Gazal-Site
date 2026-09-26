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
        summary: 'Üç düşünce gerçek karar anlarında etik biçimde sınanıyor.',
        status: 'active',
        statusLabel: 'Deney devam ediyor',
        phase: 'testing',
        dates: {
          plannedStart: '2026-09-21',
          plannedEnd: '2026-09-27',
          label: '21–27 Eylül 2026'
        },
        topics: ['kitap', 'felsefe', 'kararlar', 'gerçek hayat deneyi'],
        source: {
          author: 'Niccolò Machiavelli',
          title: 'Prens',
          label: 'Machiavelli · Prens'
        },
        duration: {
          value: 7,
          unit: 'gün',
          label: '7 gün (planlanan)'
        },
        publishedAt: null,
        searchable: true,
        video: {
          published: false,
          url: '',
          title: '',
          thumbnail: {
            src: '',
            alt: '',
            width: 1280,
            height: 720
          },
          chapters: []
        },
        result: {
          published: false,
          summary: '',
          limitations: []
        },
        evidence: {
          published: false,
          entries: []
        },
        tryIt: {
          enabled: false,
          durationDays: 7,
          storageVersion: 1,
          rules: [],
          guide: ''
        },
        features: {
          evidenceLedger: false,
          videoTimeline: false,
          tryIt: false
        },
        sharing: {
          title: 'Machiavelli / Prens deneyi | Ali Gazal',
          description: 'Üç düşünceyi gerçek kararlarda sınayan deney sürüyor. Yöntem açık; sonuç henüz bilinmiyor.',
          image: ''
        }
      }
    }
  };

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  return deepFreeze(data);
})();

if (typeof window !== 'undefined') window.AG_SITE_DATA = AG_SITE_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = AG_SITE_DATA;
