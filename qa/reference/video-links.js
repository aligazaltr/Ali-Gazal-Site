/* One URL/publication gate shared by the static publisher and browser. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AG_VIDEO_LINKS = api;
})(typeof window === 'undefined' ? globalThis : window, () => {
  function youtubeUrl(value) {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
      const hosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
      if (!hosts.includes(url.hostname)) return '';
      const id = url.hostname === 'youtu.be'
        ? (/^\/[A-Za-z0-9_-]{11}$/.test(url.pathname) ? url.pathname.slice(1) : '')
        : (url.pathname === '/watch' ? url.searchParams.get('v') : '');
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? url.href : '';
    } catch (_) { return ''; }
  }
  function validVideo(video) {
    return !!(video && typeof video.title === 'string' && video.title.trim() && youtubeUrl(video.url));
  }
  function publishedUrl(video) {
    return video?.published === true && validVideo(video) ? youtubeUrl(video.url) : '';
  }
  return Object.freeze({ youtubeUrl, validVideo, publishedUrl });
});
