(function attachClientPresentation(global) {
  function formatPrice(value) {
    return Number(value || 0).toLocaleString('ru-RU');
  }

  function hasPrice(product) {
    return Number(product && product.price) > 0;
  }

  function normalizeProductDiscountPercent(value) {
    const raw = Number(value || 0);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    return Math.max(1, Math.min(95, Math.round(raw)));
  }

  function getProductPromoPercent(product) {
    return normalizeProductDiscountPercent(product?.discountPercent);
  }

  function getProductPromoPrice(product, percent = getProductPromoPercent(product)) {
    if (!hasPrice(product)) return null;
    const normalized = normalizeProductDiscountPercent(percent);
    if (normalized <= 0) return Number(product.price || 0);
    return Math.max(0, Math.round(Number(product.price || 0) * (1 - normalized / 100)));
  }

  function getProductPriceView(product, { withOldPrice = true } = {}) {
    if (!hasPrice(product)) {
      return {
        hasPrice: false,
        hasPromo: false,
        promoPercent: 0,
        finalPrice: null,
        oldPrice: null,
        html: 'Цена по запросу',
        badgeHtml: '',
      };
    }
    const oldPrice = Number(product.price || 0);
    const promoPercent = getProductPromoPercent(product);
    const hasPromo = promoPercent > 0;
    const finalPrice = hasPromo ? getProductPromoPrice(product, promoPercent) : oldPrice;
    const html = hasPromo && withOldPrice
      ? `<span class="promo-new">${formatPrice(finalPrice)} ₽</span><span class="promo-old">${formatPrice(oldPrice)} ₽</span>`
      : `${formatPrice(finalPrice)} ₽`;
    return {
      hasPrice: true,
      hasPromo,
      promoPercent,
      finalPrice,
      oldPrice,
      html,
      badgeHtml: hasPromo ? `<div class="promo-badge promo-badge-inline">-${promoPercent}%</div>` : '',
    };
  }

  function discountedPrice(product, percent) {
    if (!hasPrice(product)) return null;
    const factor = 1 - (percent || 0) / 100;
    return Math.round(Number(product.price) * factor);
  }

  function priceLabel(product) {
    const view = getProductPriceView(product, { withOldPrice: false });
    return view.hasPrice ? `${formatPrice(view.finalPrice)} ₽` : 'Цена по запросу';
  }

  function normalizeThemeCode(rawTheme, themeOptions = {}) {
    const value = String(rawTheme || '').trim().toLowerCase();
    if (value === 'light') return 'white';
    if (themeOptions[value]) return value;
    return 'dark';
  }

  function normalizeAccentCode(rawAccent, accentOptions = {}) {
    const value = String(rawAccent || '').trim().toLowerCase();
    if (value === 'pink') return 'rose';
    if (accentOptions[value]) return value;
    return 'rose';
  }

  function normalizeAppearanceConfig(rawAppearance, {
    themeOptions = {},
    accentOptions = {},
    defaultAppearance = { theme: 'dark', accent: 'rose' },
  } = {}) {
    const fallbackTheme = normalizeThemeCode(defaultAppearance?.theme || 'dark', themeOptions);
    const fallbackAccent = normalizeAccentCode(defaultAppearance?.accent || 'rose', accentOptions);
    const source = rawAppearance && typeof rawAppearance === 'object' ? rawAppearance : {};
    return {
      theme: normalizeThemeCode(source.theme || fallbackTheme, themeOptions),
      accent: normalizeAccentCode(source.accent || fallbackAccent, accentOptions),
    };
  }

  global.HORECA_PRESENTATION = {
    ...(global.HORECA_PRESENTATION || {}),
    formatPrice,
    hasPrice,
    normalizeProductDiscountPercent,
    getProductPromoPercent,
    getProductPromoPrice,
    getProductPriceView,
    discountedPrice,
    priceLabel,
    normalizeThemeCode,
    normalizeAccentCode,
    normalizeAppearanceConfig,
  };
}(window));
