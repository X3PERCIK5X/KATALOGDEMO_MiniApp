(function attachClientUtils(global) {
  function on(el, event, handler, options) {
    if (!el) return;
    el.addEventListener(event, handler, options);
  }

  function debounce(fn, delay = 220) {
    let timer = null;
    return (...args) => {
      global.clearTimeout(timer);
      timer = global.setTimeout(() => fn(...args), delay);
    };
  }

  function safeSrc(src) {
    try {
      return encodeURI(src);
    } catch {
      return src;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMultiline(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const parts = raw.split(/\n{2,}/g);
    return parts
      .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function safeParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function normalizeSearchQuery(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  global.HORECA_UTILS = {
    ...(global.HORECA_UTILS || {}),
    on,
    debounce,
    safeSrc,
    escapeHtml,
    formatMultiline,
    safeParse,
    normalizeSearchQuery,
  };
}(window));
