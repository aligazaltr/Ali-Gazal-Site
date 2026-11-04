/* Canonical metadata always describes production. Review links stay in their own environment. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AG_SHARE = api;
})(typeof window === 'undefined' ? globalThis : window, () => {
  function context(canonical, current) {
    const production = new URL(canonical);
    const here = new URL(current);
    if (production.protocol !== 'https:') throw new Error('Invalid production URL');
    const preview = new URL(production.pathname + production.hash, here.origin);
    // Only the exact former production origin is a production alias. Branch
    // previews, foreign hosts and lookalike domains must remain previews.
    const legacyProduction = 'https://ali-gazal-site.aliicerikmedya.workers.dev';
    const isLegacy = production.origin === 'https://aligazal.com' && here.origin === legacyProduction;
    return { production: production.href, preview: preview.href, isPreview: here.origin !== production.origin && !isLegacy };
  }
  function linkFor(canonical, current, mode) {
    const info = context(canonical, current);
    const isPreview = info.isPreview && mode !== 'production';
    return { url: isPreview ? info.preview : info.production, isPreview, label: isPreview ? 'Önizleme' : 'Canlı site' };
  }
  return Object.freeze({ context, linkFor });
});
