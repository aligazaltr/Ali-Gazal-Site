const mode = new URL(document.currentScript.src).searchParams.get('mode');
if (mode === 'reduced') {
  const original = window.matchMedia;
  window.matchMedia = query => {
    const source = original.call(window,query);
    if (!query.includes('prefers-reduced-motion')) return source;
    return {media:query,matches:query.includes(': reduce'),addEventListener(){},removeEventListener(){}};
  };
}
if (mode === 'media') {
  const src = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');
  Object.defineProperty(HTMLMediaElement.prototype,'src',{
    ...src,
    set(value) {src.set.call(this,value.includes('neighborhood-') ? '/qa-missing-media.mp4' : value);}
  });
}
