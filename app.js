const state = {
  config: {},
  categories: [],
  products: [],
  dataLoaded: false,
  pendingCategory: null,
  currentGroup: null,
  currentCategory: null,
  currentCategoryIds: null,
  currentProduct: null,
  favorites: new Set(),
  selectedFavorites: new Set(),
  cart: {},
  selectedCart: new Set(),
  cartSelectionTouched: false,
  favoritesSelectionTouched: false,
  filters: {
    products: { sort: 'default', search: '' },
    promo: { sort: 'default' },
  },
  productionSlide: 0,
  profile: {},
  orders: [],
  promoCode: '',
  promoPercent: 0,
  promoKind: '',
  recentlyViewed: [],
  theme: 'dark',
  stores: [],
  selectedStoreId: null,
  searchHistory: [],
  promoUsage: {},
  productStats: {},
  homeBannerIndex: 0,
  homeBannerTimer: null,
  phoneAutofillAttempted: false,
  phoneAutofillSucceeded: false,
  admin: {
    enabled: false,
    holdMs: 5000,
    draftKey: 'demo_catalog_admin_draft_v1',
    ui: {},
  },
};

// Базовый контент главной страницы.
// Если в config.json нет своих значений — используем эти.
const DEFAULT_HOME_BANNERS = [
  {
    id: 'promo-first',
    style: 'promo',
    kicker: 'Спецпредложение',
    title: 'Промокод ПЕРВЫЙ',
    text: 'Скидка 10% на первый заказ для новых клиентов. Применяется в корзине после активации.',
    cta: 'Активировать в корзине',
  },
  {
    id: 'sales-offer',
    style: 'sales',
    kicker: 'Продающий оффер',
    title: 'Каталог, корзина и оплата в Telegram',
    text: 'Запусти продажи в mini app без сайта: клиент выбирает товар, оформляет заказ и оплачивает в одном окне.',
    cta: 'Запустить под ключ',
  },
];

const DEFAULT_HOME_ARTICLES = [
  { id: 'about', kicker: 'О продукте', title: 'Что такое DEMOKATALOG', text: 'Готовый mini app для запуска продаж в Telegram за короткий срок.', screen: 'about' },
  { id: 'production', kicker: 'Механика', title: 'Как работает воронка', text: 'Каталог, карточка, корзина, оформление, оплата и уведомления в боте.', screen: 'production' },
  { id: 'payment', kicker: 'Оплата', title: 'Кассы и интеграции', text: 'Telegram Payments, провайдеры, промокоды, сбор контактов и Telegram ID.', screen: 'payment' },
  { id: 'contacts', kicker: 'Запуск', title: 'Внедрение под ключ', text: 'Настраиваем структуру, визуал и логику под нишу и бренд.', screen: 'contacts' },
];

const menuCatalogTree = [
  { title: 'Женская одежда' },
  { title: 'Мужская одежда' },
  { title: 'Обувь' },
  { title: 'Сумки' },
  { title: 'Аксессуары' },
  { title: 'Сезонные подборки' },
];
const menuCatalogFallback = new Map([
  ['Женская одежда', 'catalog-1'],
  ['Мужская одежда', 'catalog-2'],
  ['Обувь', 'catalog-3'],
  ['Сумки', 'catalog-4'],
  ['Аксессуары', 'catalog-5'],
  ['Сезонные подборки', 'catalog-6'],
]);

const ui = {
  screens: document.querySelectorAll('.screen'),
  menuButton: document.getElementById('menuButton'),
  menuCatalogToggle: document.getElementById('menuCatalogToggle'),
  menuCatalogList: document.getElementById('menuCatalogList'),
  favoritesButton: document.getElementById('favoritesButton'),
  cartButton: document.getElementById('cartButton'),
  ordersButton: document.getElementById('ordersButton'),
  homeButton: document.getElementById('homeButton'),
  profileButton: document.getElementById('profileButton'),
  favoritesCount: document.getElementById('favoritesCount'),
  cartCount: document.getElementById('cartCount'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  categoriesTitle: document.getElementById('categoriesTitle'),
  productsTitle: document.getElementById('productsTitle'),
  productsList: document.getElementById('productsList'),
  productView: document.getElementById('productView'),
  productTitle: document.getElementById('productTitle'),
  productFavoriteTop: document.getElementById('productFavoriteTop'),
  favoritesList: document.getElementById('favoritesList'),
  favoritesToCart: document.getElementById('favoritesToCart'),
  favoritesClear: document.getElementById('favoritesClear'),
  favoritesSelectAll: document.getElementById('favoritesSelectAll'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  cartItemsCount: document.getElementById('cartItemsCount'),
  checkoutTotal: document.getElementById('checkoutTotal'),
  checkoutButton: document.getElementById('checkoutButton'),
  cartSelectAll: document.getElementById('cartSelectAll'),
  cartRemoveSelected: document.getElementById('cartRemoveSelected'),
  orderForm: document.getElementById('orderForm'),
  inputName: document.getElementById('inputName'),
  inputPhone: document.getElementById('inputPhone'),
  inputEmail: document.getElementById('inputEmail'),
  inputTelegramId: document.getElementById('inputTelegramId'),
  inputDeliveryType: document.getElementById('inputDeliveryType'),
  inputDeliveryAddress: document.getElementById('inputDeliveryAddress'),
  deliveryAddressWrap: document.getElementById('deliveryAddressWrap'),
  sharePhoneButton: document.getElementById('sharePhoneButton'),
  inputComment: document.getElementById('inputComment'),
  policyCheck: document.getElementById('policyCheck'),
  policyLink: document.getElementById('policyLink'),
  orderStatus: document.getElementById('orderStatus'),
  orderRetry: document.getElementById('orderRetry'),
  orderSubmit: document.getElementById('orderSubmit'),
  feedbackForm: document.getElementById('feedbackForm'),
  feedbackName: document.getElementById('feedbackName'),
  feedbackPhone: document.getElementById('feedbackPhone'),
  feedbackEmail: document.getElementById('feedbackEmail'),
  feedbackMethod: document.getElementById('feedbackMethod'),
  feedbackComment: document.getElementById('feedbackComment'),
  feedbackStatus: document.getElementById('feedbackStatus'),
  ordersList: document.getElementById('ordersList'),
  aboutText: document.getElementById('aboutText'),
  paymentText: document.getElementById('paymentText'),
  contactsCard: document.getElementById('contactsCard'),
  productionText: document.getElementById('productionText'),
  productionTrack: document.getElementById('productionTrack'),
  homeBannerTrack: document.getElementById('homeBannerTrack'),
  homeBannerDots: document.getElementById('homeBannerDots'),
  promoTrack: document.getElementById('promoTrack'),
  promoList: document.getElementById('promoList'),
  productsSort: document.getElementById('productsSort'),
  productsSearch: document.getElementById('productsSearch'),
  homeProductsSort: document.getElementById('homeProductsSort'),
  homeProductsSearch: document.getElementById('homeProductsSearch'),
  promoSort: document.getElementById('promoSort'),
  homeProductionButton: document.getElementById('homeProductionButton'),
  dataStatus: document.getElementById('dataStatus'),
  headerStoreButton: document.getElementById('headerStoreButton'),
  headerStoreCity: document.getElementById('headerStoreCity'),
  headerSearchButton: document.getElementById('headerSearchButton'),
  storesList: document.getElementById('storesList'),
  searchOverlay: document.getElementById('searchOverlay'),
  globalSearchForm: document.getElementById('globalSearchForm'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  searchCloseButton: document.getElementById('searchCloseButton'),
  searchHistoryList: document.getElementById('searchHistoryList'),
  searchSuggestList: document.getElementById('searchSuggestList'),
  searchHistoryClear: document.getElementById('searchHistoryClear'),
  searchHistoryTitle: document.getElementById('searchHistoryTitle'),
  searchSuggestTitle: document.getElementById('searchSuggestTitle'),
  profileAvatar: document.getElementById('profileAvatar'),
  profileName: document.getElementById('profileName'),
  profileHandle: document.getElementById('profileHandle'),
  profileManagerButton: document.getElementById('profileManagerButton'),
  profileOrdersTitle: document.querySelector('#screen-profile .home-section-title'),
  homeArticleTrack: document.getElementById('homeArticleTrack'),
  themeLabel: document.getElementById('themeLabel'),
  themeToggleButton: document.getElementById('themeToggleButton'),
  themeToggleValue: document.getElementById('themeToggleValue'),
  promoCodeInput: document.getElementById('promoCodeInput'),
  promoApplyButton: document.getElementById('promoApplyButton'),
  promoStatus: document.getElementById('promoStatus'),
  homePopularTrack: document.getElementById('homePopularTrack'),
};

function reportStatus(message) {
  if (!ui.dataStatus) return;
  ui.dataStatus.classList.remove('hidden');
  ui.dataStatus.textContent = message;
}

function on(el, event, handler, options) {
  if (!el) return;
  el.addEventListener(event, handler, options);
}

function debounce(fn, delay = 220) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function isAdminModeRequested() {
  const params = new URLSearchParams(window.location.search || '');
  return params.get('admin') === '1';
}

const FIRST_ORDER_PROMO = {
  code: 'ПЕРВЫЙ',
  percent: 10,
};

const ADMIN_MARGIN_RATE = 0.3;
const PUBLISHED_STATE_KEY = 'demo_catalog_published_state_v1';
const PUBLISHED_STATE_TS_KEY = 'demo_catalog_published_state_ts_v1';

function getTelegramUser() {
  return window.HORECA_TG?.initDataUnsafe?.user || {};
}

function getTelegramId() {
  const id = getTelegramUser().id;
  return id ? String(id) : '';
}

function getTelegramUsername() {
  const username = getTelegramUser().username;
  return username ? String(username) : '';
}

function getTelegramFirstName() {
  const firstName = getTelegramUser().first_name;
  return firstName ? String(firstName) : '';
}

function getPromoOwnerKey() {
  const tgId = getTelegramId();
  if (tgId) return `tg:${tgId}`;
  return 'guest';
}

function hasUsedFirstOrderPromo() {
  const key = getPromoOwnerKey();
  return Boolean(state.promoUsage?.[key]?.firstOrderUsed);
}

function isProductOnSale(product) {
  if (!product) return false;
  if (Number(product.discountPercent || 0) > 0) return true;
  if (Number(product.oldPrice || 0) > Number(product.price || 0)) return true;
  if (typeof product.badge === 'string' && /скид|sale|promo/i.test(product.badge)) return true;
  if (Array.isArray(product.tags) && product.tags.some((tag) => /скид|sale|promo/i.test(String(tag)))) return true;
  return false;
}

function isEligibleFirstOrderPromoItem(product) {
  return hasPrice(product) && !isProductOnSale(product);
}

function updateDeliveryAddressVisibility() {
  if (!ui.inputDeliveryType || !ui.deliveryAddressWrap || !ui.inputDeliveryAddress) return;
  const isDelivery = ui.inputDeliveryType.value === 'delivery';
  ui.deliveryAddressWrap.classList.toggle('hidden', !isDelivery);
  ui.inputDeliveryAddress.required = isDelivery;
}

function openCategoryById(categoryId) {
  if (!categoryId) return;
  state.currentCategoryIds = null;
  if (!state.products.length) {
    state.pendingCategory = categoryId;
    ui.productsTitle.textContent = 'Каталог';
    ui.productsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">Загружаем товары…</div>
        <div class="empty-text">Пожалуйста, подождите.</div>
      </div>
    `;
    setScreen('products');
    return;
  }
  state.currentCategory = categoryId;
  const resolved = state.categories.find((c) => c.id === state.currentCategory);
  ui.productsTitle.textContent = resolved ? resolved.title : 'Каталог';
  renderProducts();
  setScreen('products');
}

function openCategoryBundle(ids, title) {
  const list = (ids || []).filter(Boolean);
  if (!list.length) return;
  state.currentCategory = null;
  state.currentCategoryIds = list;
  ui.productsTitle.textContent = title || 'Каталог';
  renderProducts();
  setScreen('products');
}

function openGlobalSearch(query) {
  const q = String(query || '').trim();
  const allCategoryIds = Array.from(new Set(state.products.map((p) => p.categoryId))).filter(Boolean);
  if (!allCategoryIds.length) return;
  state.filters.products.search = q;
  if (ui.productsSearch) ui.productsSearch.value = q;
  openCategoryBundle(allCategoryIds, q ? `Поиск: ${q}` : 'Каталог');
}

function normalizeSearchQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function addSearchHistory(query) {
  const q = normalizeSearchQuery(query);
  if (!q) return;
  const lowered = q.toLowerCase();
  state.searchHistory = [q, ...state.searchHistory.filter((item) => item.toLowerCase() !== lowered)].slice(0, 8);
  saveStorage();
}

function getSearchSuggestions(query, limit = 8) {
  const q = normalizeSearchQuery(query).toLowerCase();
  if (!q) return [];
  const starts = [];
  const includes = [];
  state.products.forEach((product) => {
    const title = String(product.title || '').trim();
    const low = title.toLowerCase();
    if (!low) return;
    if (low.startsWith(q)) starts.push(product);
    else if (low.includes(q)) includes.push(product);
  });
  return [...starts, ...includes].slice(0, limit);
}

function renderSearchHistory() {
  if (!ui.searchHistoryList) return;
  if (!state.searchHistory.length) {
    ui.searchHistoryList.innerHTML = '<div class="search-empty">История пока пуста</div>';
    return;
  }
  ui.searchHistoryList.innerHTML = state.searchHistory.map((item) => `
    <button class="search-item search-item-history" data-search-history="${item}" type="button">${item}</button>
  `).join('');
}

function renderSearchSuggestions(query) {
  if (!ui.searchSuggestList || !ui.searchSuggestTitle) return;
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    ui.searchSuggestTitle.textContent = 'Подсказки';
    ui.searchSuggestList.innerHTML = '<div class="search-empty">Начните вводить название товара</div>';
    return;
  }
  const suggestions = getSearchSuggestions(normalized);
  ui.searchSuggestTitle.textContent = `Результаты по "${normalized}"`;
  if (!suggestions.length) {
    ui.searchSuggestList.innerHTML = `<button class="search-item search-item-submit" data-search-submit="${normalized}" type="button">Искать "${normalized}"</button>`;
    return;
  }
  ui.searchSuggestList.innerHTML = `
    <button class="search-item search-item-submit" data-search-submit="${normalized}" type="button">Показать все результаты "${normalized}"</button>
    ${suggestions.map((product) => `
      <button class="search-item search-item-product" data-search-product="${product.id}" type="button">
        <span class="search-item-title">${product.title}</span>
        <span class="search-item-meta">${priceLabel(product)}</span>
      </button>
    `).join('')}
  `;
}

function openSearchOverlay() {
  if (!ui.searchOverlay) return;
  ui.searchOverlay.classList.remove('hidden');
  requestAnimationFrame(() => ui.searchOverlay.classList.add('show'));
  const current = normalizeSearchQuery(ui.globalSearchInput?.value || '');
  renderSearchHistory();
  renderSearchSuggestions(current);
  setTimeout(() => ui.globalSearchInput?.focus(), 30);
}

function closeSearchOverlay() {
  if (!ui.searchOverlay) return;
  ui.searchOverlay.classList.remove('show');
  setTimeout(() => ui.searchOverlay.classList.add('hidden'), 220);
}

function submitSearch(query) {
  const q = normalizeSearchQuery(query);
  if (!q) return;
  addSearchHistory(q);
  if (ui.globalSearchInput) ui.globalSearchInput.value = q;
  openGlobalSearch(q);
  closeSearchOverlay();
}

function openManagerChat() {
  const username = 'XPERCHIKX';
  const tgLink = `https://t.me/${username}`;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(tgLink);
    return;
  }
  window.open(tgLink, '_blank', 'noopener');
}

function buildMenuCatalog() {
  if (!ui.menuCatalogList) return;
  if (ui.menuCatalogList.children.length) return;
}

function setScreen(name) {
  if (state.currentScreen === name) return;
  state.currentScreen = name;
  if (state.screenStack[state.screenStack.length - 1] !== name) {
    state.screenStack.push(name);
  }
  ui.screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
  if (name === 'profile') {
    renderProfile();
    renderOrders();
  }
  if (name === 'home') {
    startHomeBannerAutoplay();
  } else if (state.homeBannerTimer) {
    window.clearInterval(state.homeBannerTimer);
    state.homeBannerTimer = null;
  }
  updateBottomNav(name);
  scrollToTop();
  adminRefreshBindings();
  if (name === 'checkout' && !state.phoneAutofillSucceeded) {
    window.setTimeout(() => {
      tryAutofillPhoneFromTelegram().catch((error) => console.error('Phone autofill failed', error));
    }, 60);
  }
}

function goBack() {
  if (state.screenStack.length <= 1) return;
  const current = state.currentScreen;
  const currentEl = document.getElementById(`screen-${current}`);
  if (currentEl) {
    currentEl.classList.add('closing');
    setTimeout(() => currentEl.classList.remove('closing'), 220);
  }
  state.screenStack.pop();
  const prev = state.screenStack[state.screenStack.length - 1];
  state.currentScreen = prev;
  ui.screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${prev}`));
  updateBottomNav(prev);
  scrollToTop();
}

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function openMenu() {
  setScreen('categories');
}

function closeDrawer() {
  if (ui.menuDrawer) ui.menuDrawer.classList.remove('drawer-open');
  if (ui.overlay) ui.overlay.classList.remove('show');
}

function updateBottomNav(screen) {
  const map = {
    home: ui.homeButton,
    categories: ui.menuButton,
    products: ui.menuButton,
    product: ui.menuButton,
    promo: ui.menuButton,
    cart: ui.cartButton,
    profile: ui.profileButton,
    orders: ui.profileButton,
    favorites: ui.favoritesButton,
    menu: ui.menuButton,
  };
  const defaultButton = ui.homeButton;
  const activeButton = map[screen] || defaultButton;
  [ui.homeButton, ui.menuButton, ui.cartButton, ui.favoritesButton, ui.profileButton].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle('active', btn === activeButton);
  });
}

function formatPrice(v) { return Number(v || 0).toLocaleString('ru-RU'); }
function hasPrice(p) { return Number(p && p.price) > 0; }
function priceLabel(p) { return hasPrice(p) ? `${formatPrice(p.price)} ₽` : 'Цена по запросу'; }
function discountedPrice(p, percent) {
  if (!hasPrice(p)) return null;
  const factor = 1 - (percent || 0) / 100;
  return Math.round(Number(p.price) * factor);
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

function normalizeHomeBanners(list) {
  const source = Array.isArray(list) && list.length ? list : DEFAULT_HOME_BANNERS;
  return source
    .map((item, index) => {
      const style = item?.style === 'sales' ? 'sales' : 'promo';
      const fallback = DEFAULT_HOME_BANNERS[index % DEFAULT_HOME_BANNERS.length];
      return {
        id: String(item?.id || `banner-${index + 1}`),
        style,
        image: String(item?.image || ''),
        kicker: String(item?.kicker || fallback.kicker),
        title: String(item?.title || fallback.title),
        text: String(item?.text || fallback.text),
        cta: String(item?.cta || fallback.cta),
      };
    })
    .filter((item) => item.title && item.text);
}

function normalizeHomeArticles(list) {
  const source = Array.isArray(list) && list.length ? list : DEFAULT_HOME_ARTICLES;
  return source
    .map((item, index) => {
      const fallback = DEFAULT_HOME_ARTICLES[index % DEFAULT_HOME_ARTICLES.length];
      return {
        id: String(item?.id || `article-${index + 1}`),
        kicker: String(item?.kicker || fallback.kicker),
        title: String(item?.title || fallback.title),
        text: String(item?.text || fallback.text),
        screen: String(item?.screen || fallback.screen || 'about'),
      };
    })
    .filter((item) => item.title && item.text && item.screen);
}

// Рендерим главный слайдер полностью из config.json.
function renderHomeBanners() {
  if (!ui.homeBannerTrack || !ui.homeBannerDots) return;
  const banners = normalizeHomeBanners(state.config.homeBanners);
  ui.homeBannerTrack.innerHTML = banners.map((banner) => `
    <div class="featured-promo banner-slide banner-slide-clean banner-slide-${banner.style}" data-banner-id="${escapeHtml(banner.id)}" ${banner.image ? `style="background-image:url('${safeSrc(banner.image)}')"` : ''}>
      <div class="featured-chip">${escapeHtml(banner.kicker)}</div>
      <div class="featured-title">${escapeHtml(banner.title)}</div>
      <div class="featured-text">${escapeHtml(banner.text)}</div>
      <div class="featured-cta">${escapeHtml(banner.cta)}</div>
    </div>
  `).join('');
  ui.homeBannerDots.innerHTML = banners.map((_, index) => `
    <button class="dot ${index === 0 ? 'active' : ''}" data-home-banner-dot="${index}" type="button" aria-label="Баннер ${index + 1}"></button>
  `).join('');
  setHomeBanner(0);
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

// Статьи главной также приходят из конфига и готовы к редактированию через админку.
function renderHomeArticles() {
  if (!ui.homeArticleTrack) return;
  const articles = normalizeHomeArticles(state.config.homeArticles);
  ui.homeArticleTrack.innerHTML = articles.map((article) => `
    <button class="home-article-slide" data-screen="${escapeHtml(article.screen)}" type="button" data-article-id="${escapeHtml(article.id)}">
      <span class="home-article-kicker">${escapeHtml(article.kicker)}</span>
      <strong>${escapeHtml(article.title)}</strong>
      <span>${escapeHtml(article.text)}</span>
    </button>
  `).join('');
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

function formatMultiline(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const parts = raw.split(/\n{2,}/g);
  return parts
    .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function adminDownloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function adminEnsureModal() {
  if (state.admin.ui.modal) return state.admin.ui.modal;
  const modal = document.createElement('div');
  modal.className = 'admin-edit-modal hidden';
  modal.innerHTML = `
    <div class="admin-edit-card">
      <div class="admin-edit-title"></div>
      <input class="admin-edit-input hidden" type="text" />
      <textarea class="admin-edit-textarea hidden" rows="8"></textarea>
      <div class="admin-edit-actions">
        <button type="button" data-admin-modal="cancel">Отмена</button>
        <button type="button" data-admin-modal="delete" class="danger hidden">Удалить</button>
        <button type="button" data-admin-modal="save" class="primary">Сохранить</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  state.admin.ui.modal = modal;
  return modal;
}

function adminEditValue(title, currentValue, { numeric = false, multiline = false, allowDelete = false } = {}) {
  const current = currentValue == null ? '' : String(currentValue);
  const modal = adminEnsureModal();
  const titleEl = modal.querySelector('.admin-edit-title');
  const input = modal.querySelector('.admin-edit-input');
  const textarea = modal.querySelector('.admin-edit-textarea');
  const deleteBtn = modal.querySelector('[data-admin-modal="delete"]');
  const cancelBtn = modal.querySelector('[data-admin-modal="cancel"]');
  const saveBtn = modal.querySelector('[data-admin-modal="save"]');

  titleEl.textContent = title;
  input.classList.toggle('hidden', multiline);
  textarea.classList.toggle('hidden', !multiline);
  deleteBtn.classList.toggle('hidden', !allowDelete);

  const focusEditor = (el) => {
    try {
      el.focus({ preventScroll: true });
      if (typeof el.select === 'function') el.select();
    } catch {
      el.focus();
    }
  };
  if (multiline) {
    textarea.value = current;
    focusEditor(textarea);
  } else {
    input.value = current;
    focusEditor(input);
  }

  modal.classList.remove('hidden');

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      modal.classList.add('hidden');
      cancelBtn.removeEventListener('click', onCancel);
      saveBtn.removeEventListener('click', onSave);
      deleteBtn.removeEventListener('click', onDelete);
      modal.removeEventListener('click', onOverlay);
      resolve(value);
    };

    const onCancel = () => settle(null);
    const onDelete = () => settle({ __delete: true });
    const onOverlay = (event) => {
      if (event.target === modal) settle(null);
    };
    const onSave = () => {
      const raw = multiline ? textarea.value : input.value;
      if (numeric) {
        const num = Number(raw);
        if (!Number.isFinite(num) || num < 0) {
          settle(0);
          return;
        }
        settle(Math.round(num));
        return;
      }
      settle(multiline ? String(raw) : String(raw).trim());
    };

    cancelBtn.addEventListener('click', onCancel);
    saveBtn.addEventListener('click', onSave);
    deleteBtn.addEventListener('click', onDelete);
    modal.addEventListener('click', onOverlay);
  });
}

function adminBindHold(el, handler) {
  if (!state.admin.enabled || !el || el.dataset.adminHoldBound === '1') return;
  el.dataset.adminHoldBound = '1';
  let timer = null;

  const clear = () => {
    if (timer) window.clearTimeout(timer);
    timer = null;
    el.classList.remove('admin-hold-pending');
  };

  const start = (event) => {
    if (event.type === 'mousedown' && event.button !== 0) return;
    clear();
    el.classList.add('admin-hold-pending');
    timer = window.setTimeout(() => {
      clear();
      handler();
    }, state.admin.holdMs);
  };

  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: true });
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((eventName) => {
    el.addEventListener(eventName, clear, { passive: true });
  });
}

function adminAddBannerTemplate() {
  if (!Array.isArray(state.config.homeBanners)) state.config.homeBanners = [];
  state.config.homeBanners.unshift({
    id: `banner-${Date.now()}`,
    style: 'promo',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=70',
    kicker: 'Новый баннер',
    title: 'Заголовок баннера',
    text: 'Описание предложения',
    cta: 'Подробнее',
  });
  adminSaveDraft(true);
  renderHomeBanners();
}

function adminAddArticleTemplate() {
  if (!Array.isArray(state.config.homeArticles)) state.config.homeArticles = [];
  state.config.homeArticles.unshift({
    id: `article-${Date.now()}`,
    kicker: 'Новая статья',
    title: 'Заголовок статьи',
    text: 'Текст статьи',
    screen: 'about',
  });
  adminSaveDraft(true);
  renderHomeArticles();
}

function adminAddCategoryTemplate() {
  state.categories.unshift({
    id: `catalog-${Date.now()}`,
    groupId: state.currentGroup || 'apparel',
    title: 'Новая категория',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=70',
  });
  adminSaveDraft(true);
  renderCategories();
}

function adminAddProductTemplate() {
  const categoryId = state.currentCategory || state.categories[0]?.id || '';
  if (!categoryId) return;
  state.products.unshift({
    id: `product-${Date.now()}`,
    title: 'Новый товар',
    price: 0,
    sku: '',
    shortDescription: 'Короткое описание',
    description: 'Полное описание товара',
    specs: ['Характеристика'],
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70'],
    categoryId,
    oldPrice: 0,
    discountPercent: 0,
    badge: '',
    tags: [],
  });
  adminSaveDraft(true);
  renderProducts();
}

function adminAddProductImage() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (!Array.isArray(p.images)) p.images = [];
  p.images.push('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70');
  adminSaveDraft(true);
  renderProductView();
}

function adminAddProductSpec() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (!Array.isArray(p.specs)) p.specs = [];
  p.specs.push('Новая характеристика');
  adminSaveDraft(true);
  renderProductView();
}

function adminSaveDraft(silent = false) {
  const payload = {
    config: state.config,
    categories: state.categories,
    products: state.products,
  };
  localStorage.setItem(state.admin.draftKey, JSON.stringify(payload));
  localStorage.setItem(PUBLISHED_STATE_KEY, JSON.stringify(payload));
  localStorage.setItem(PUBLISHED_STATE_TS_KEY, String(Date.now()));
  if (!silent) reportStatus('Админ-черновик сохранен локально');
}

function adminRestoreDraft() {
  const raw = localStorage.getItem(state.admin.draftKey);
  if (!raw) return false;
  const parsed = safeParse(raw, null);
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.config && typeof parsed.config === 'object') state.config = parsed.config;
  if (Array.isArray(parsed.categories)) state.categories = parsed.categories;
  if (Array.isArray(parsed.products)) state.products = parsed.products;
  return true;
}

function restorePublishedState() {
  const raw = localStorage.getItem(PUBLISHED_STATE_KEY);
  if (!raw) return false;
  const parsed = safeParse(raw, null);
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.config && typeof parsed.config === 'object') state.config = parsed.config;
  if (Array.isArray(parsed.categories)) state.categories = parsed.categories;
  if (Array.isArray(parsed.products)) state.products = parsed.products;
  return true;
}

function adminBindHome() {
  const bannerCards = ui.homeBannerTrack ? Array.from(ui.homeBannerTrack.querySelectorAll('[data-banner-id]')) : [];
  bannerCards.forEach((card, index) => {
    const source = Array.isArray(state.config.homeBanners) ? state.config.homeBanners : [];
    if (!source[index]) return;
    const item = source[index];
    const itemId = item.id || `banner-${index}`;
    const title = card.querySelector('.featured-title');
    const text = card.querySelector('.featured-text');
    const kicker = card.querySelector('.featured-chip');
    const cta = card.querySelector('.featured-cta');
    adminBindHold(card, () => {
      adminEditValue('URL фонового изображения баннера', item.image || '', { allowDelete: true }).then((value) => {
        if (value == null) return;
        const list = Array.isArray(state.config.homeBanners) ? state.config.homeBanners : [];
        const idx = list.findIndex((x, i) => (x?.id || `banner-${i}`) === itemId);
        if (idx < 0) return;
        if (value.__delete) list.splice(idx, 1);
        else list[idx].image = value;
        renderHomeBanners();
      });
    });
    adminBindHold(title, () => {
      adminEditValue('Заголовок баннера', item.title || '').then((value) => {
        if (value == null || value.__delete) return;
        item.title = value;
        renderHomeBanners();
      });
    });
    adminBindHold(text, () => {
      adminEditValue('Текст баннера', item.text || '', { multiline: true }).then((value) => {
        if (value == null || value.__delete) return;
        item.text = value;
        renderHomeBanners();
      });
    });
    adminBindHold(kicker, () => {
      adminEditValue('Кикер баннера', item.kicker || '').then((value) => {
        if (value == null || value.__delete) return;
        item.kicker = value;
        renderHomeBanners();
      });
    });
    adminBindHold(cta, () => {
      adminEditValue('CTA баннера', item.cta || '').then((value) => {
        if (value == null || value.__delete) return;
        item.cta = value;
        renderHomeBanners();
      });
    });
  });

  const articleCards = ui.homeArticleTrack ? Array.from(ui.homeArticleTrack.querySelectorAll('[data-article-id]')) : [];
  articleCards.forEach((card, index) => {
    const source = Array.isArray(state.config.homeArticles) ? state.config.homeArticles : [];
    if (!source[index]) return;
    const item = source[index];
    const itemId = item.id || `article-${index}`;
    const title = card.querySelector('strong');
    const text = card.querySelector('span:last-child');
    const kicker = card.querySelector('.home-article-kicker');
    adminBindHold(title, () => {
      adminEditValue('Заголовок статьи', item.title || '', { allowDelete: true }).then((value) => {
        if (value == null) return;
        const list = Array.isArray(state.config.homeArticles) ? state.config.homeArticles : [];
        const idx = list.findIndex((x, i) => (x?.id || `article-${i}`) === itemId);
        if (idx < 0) return;
        if (value.__delete) list.splice(idx, 1);
        else list[idx].title = value;
        renderHomeArticles();
      });
    });
    adminBindHold(text, () => {
      adminEditValue('Текст статьи', item.text || '', { multiline: true }).then((value) => {
        if (value == null || value.__delete) return;
        item.text = value;
        renderHomeArticles();
      });
    });
    adminBindHold(kicker, () => {
      adminEditValue('Кикер статьи', item.kicker || '').then((value) => {
        if (value == null || value.__delete) return;
        item.kicker = value;
        renderHomeArticles();
      });
    });
  });

  adminBindHold(ui.aboutText, () => {
    adminEditValue('aboutText', state.config.aboutText || '', { multiline: true }).then((value) => {
      if (value == null || value.__delete) return;
      state.config.aboutText = value;
      ui.aboutText.innerHTML = formatMultiline(value);
      adminSaveDraft(true);
    });
  });
  adminBindHold(ui.paymentText, () => {
    adminEditValue('paymentText', state.config.paymentText || '', { multiline: true }).then((value) => {
      if (value == null || value.__delete) return;
      state.config.paymentText = value;
      ui.paymentText.innerHTML = formatMultiline(value);
      adminSaveDraft(true);
    });
  });
  adminBindHold(ui.productionText, () => {
    adminEditValue('productionText', state.config.productionText || '', { multiline: true }).then((value) => {
      if (value == null || value.__delete) return;
      state.config.productionText = value;
      ui.productionText.innerHTML = formatMultiline(value);
      adminSaveDraft(true);
    });
  });
  adminBindHold(ui.contactsCard, () => {
    adminEditValue('contactsText', state.config.contactsText || '', { multiline: true }).then((value) => {
      if (value == null || value.__delete) return;
      state.config.contactsText = value;
      ui.contactsCard.innerHTML = formatMultiline(value);
      adminSaveDraft(true);
    });
  });
}

function adminBindCategories() {
  if (!ui.categoriesGrid) return;
  ui.categoriesGrid.querySelectorAll('[data-category]').forEach((card) => {
    const categoryId = card.dataset.category;
    const category = state.categories.find((c) => c.id === categoryId);
    if (!category) return;
    const image = card.querySelector('img');
    const title = card.querySelector('span');
    adminBindHold(image, () => {
      adminEditValue(`Фото категории ${category.title}`, category.image || '').then((value) => {
        if (value == null || value.__delete) return;
        category.image = value;
        renderCategories();
      });
    });
    adminBindHold(title, () => {
      adminEditValue(`Название категории ${category.title}`, category.title || '', { allowDelete: true }).then((value) => {
        if (value == null) return;
        if (value.__delete) {
          state.categories = state.categories.filter((c) => c.id !== category.id);
          state.products = state.products.filter((p) => p.categoryId !== category.id);
        } else {
          category.title = value;
        }
        renderCategories();
      });
    });
  });
}

function adminBindProducts() {
  if (!ui.productsList) return;
  ui.productsList.querySelectorAll('[data-open]').forEach((card) => {
    const productId = card.dataset.open;
    const p = getProduct(productId);
    if (!p) return;
    const image = card.querySelector('img');
    const title = card.querySelector('.product-title');
    const meta = card.querySelector('.product-meta');
    const price = card.querySelector('.product-price');
    adminBindHold(image, () => {
      adminEditValue(`Фото товара ${p.title}`, p.images?.[0] || '').then((value) => {
        if (value == null || value.__delete) return;
        if (!Array.isArray(p.images)) p.images = [];
        p.images[0] = value;
        renderProducts();
      });
    });
    adminBindHold(title, () => {
      adminEditValue(`Название товара ${p.id}`, p.title || '', { allowDelete: true }).then((value) => {
        if (value == null) return;
        if (value.__delete) {
          state.products = state.products.filter((x) => x.id !== p.id);
        } else {
          p.title = value;
        }
        renderProducts();
      });
    });
    adminBindHold(meta, () => {
      adminEditValue(`Краткое описание товара ${p.id}`, p.shortDescription || '', { multiline: true }).then((value) => {
        if (value == null || value.__delete) return;
        p.shortDescription = value;
        renderProducts();
      });
    });
    adminBindHold(price, () => {
      adminEditValue(`Цена товара ${p.id}`, p.price || 0, { numeric: true }).then((value) => {
        if (value == null || value.__delete) return;
        p.price = value;
        renderProducts();
      });
    });
  });
}

function adminBindProductView() {
  if (!ui.productView) return;
  const p = getProduct(state.currentProduct);
  if (!p) return;

  const title = ui.productView.querySelector('.product-title');
  const desc = ui.productView.querySelector('.section-body');
  adminBindHold(title, () => {
    adminEditValue(`Название товара ${p.id}`, p.title || '', { allowDelete: true }).then((value) => {
      if (value == null) return;
      if (value.__delete) {
        state.products = state.products.filter((x) => x.id !== p.id);
        state.currentProduct = null;
        renderProducts();
        goBack();
        return;
      }
      p.title = value;
      renderProductView();
    });
  });
  adminBindHold(desc, () => {
    adminEditValue(`Описание товара ${p.id}`, p.description || '', { multiline: true }).then((value) => {
      if (value == null || value.__delete) return;
      p.description = value;
      renderProductView();
    });
  });

  ui.productView.querySelectorAll('.product-gallery img').forEach((img, index) => {
    adminBindHold(img, () => {
      adminEditValue(`Фото #${index + 1} товара ${p.id}`, p.images?.[index] || '', { allowDelete: true }).then((value) => {
        if (value == null) return;
        if (!Array.isArray(p.images)) p.images = [];
        if (value.__delete) {
          p.images.splice(index, 1);
          if (!p.images.length) p.images.push('assets/placeholder.svg');
        } else {
          p.images[index] = value;
        }
        renderProductView();
      });
    });
  });

  const specRows = ui.productView.querySelectorAll('.product-specs > div');
  specRows.forEach((row, index) => {
    adminBindHold(row, () => {
      if (!Array.isArray(p.specs)) p.specs = [];
      const current = typeof p.specs[index] === 'string' ? p.specs[index] : '';
      adminEditValue(`Характеристика #${index + 1} товара ${p.id}`, current, { multiline: true, allowDelete: true }).then((value) => {
        if (value == null) return;
        if (value.__delete) p.specs.splice(index, 1);
        else p.specs[index] = value;
        renderProductView();
      });
    });
  });
}

function adminRefreshBindings() {
  if (!state.admin.enabled) return;
  adminBindHome();
  adminBindCategories();
  adminBindProducts();
  adminBindProductView();
}

function adminBuildPanel() {
  if (!state.admin.enabled || state.admin.ui.panel) return;
  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  panel.innerHTML = `
    <div class="admin-panel-row">
      <button type="button" data-admin-action="add-banner">+ Баннер</button>
      <button type="button" data-admin-action="add-article">+ Статья</button>
      <button type="button" data-admin-action="add-category">+ Категория</button>
      <button type="button" data-admin-action="add-product">+ Товар</button>
      <button type="button" data-admin-action="add-image">+ Фото</button>
      <button type="button" data-admin-action="add-spec">+ Характеристика</button>
      <button type="button" data-admin-action="save-draft">Сохранить</button>
      <button type="button" data-admin-action="download-all">Скачать JSON</button>
    </div>
    <div class="admin-panel-hint">ADMIN MODE: удержание 5 сек на зоне для редактирования</div>
  `;
  document.body.appendChild(panel);
  state.admin.ui.panel = panel;
  panel.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-admin-action]');
    if (!btn) return;
    const action = btn.dataset.adminAction;
    if (action === 'add-banner') adminAddBannerTemplate();
    if (action === 'add-article') adminAddArticleTemplate();
    if (action === 'add-category') adminAddCategoryTemplate();
    if (action === 'add-product') adminAddProductTemplate();
    if (action === 'add-image') adminAddProductImage();
    if (action === 'add-spec') adminAddProductSpec();
    if (action === 'save-draft') adminSaveDraft();
    if (action === 'download-all') {
      adminDownloadJson('config.json', state.config);
      adminDownloadJson('categories.json', state.categories);
      adminDownloadJson('products.json', state.products);
    }
    adminRefreshBindings();
  });
}

function applyAdminModeUi() {
  document.body.classList.toggle('admin-mode', state.admin.enabled);
  if (!state.admin.enabled) return;
  if (ui.cartButton) ui.cartButton.classList.add('admin-hidden-nav');
  if (ui.favoritesButton) ui.favoritesButton.classList.add('admin-hidden-nav');
}

function handleAdminInlineAdd(action) {
  if (!state.admin.enabled) return;
  if (action === 'banner') adminAddBannerTemplate();
  if (action === 'article') adminAddArticleTemplate();
  if (action === 'category') adminAddCategoryTemplate();
  if (action === 'product') adminAddProductTemplate();
  if (action === 'image') adminAddProductImage();
  if (action === 'spec') adminAddProductSpec();
  adminSaveDraft(true);
}

function getSku(p) {
  if (p && p.sku) return p.sku;
  if (p && Array.isArray(p.specs)) {
    const skuLine = p.specs.find((s) => typeof s === 'string' && s.toLowerCase().startsWith('артикул'));
    if (skuLine) {
      const parts = skuLine.split(':');
      if (parts.length > 1) return parts.slice(1).join(':').trim();
    }
  }
  return '';
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadStorage() {
  state.favorites = new Set(safeParse(localStorage.getItem('demo_catalog_favorites') || '[]', []));
  state.cart = safeParse(localStorage.getItem('demo_catalog_cart') || '{}', {});
  state.selectedCart = new Set(safeParse(localStorage.getItem('demo_catalog_cart_selected') || '[]', []));
  state.selectedFavorites = new Set(safeParse(localStorage.getItem('demo_catalog_fav_selected') || '[]', []));
  state.profile = safeParse(localStorage.getItem('demo_catalog_profile') || '{}', {});
  state.orders = safeParse(localStorage.getItem('demo_catalog_orders') || '[]', []);
  state.promoCode = String(localStorage.getItem('demo_catalog_promo_code') || '').trim().toUpperCase();
  state.promoPercent = Number(localStorage.getItem('demo_catalog_promo_percent') || 0) || 0;
  state.promoKind = String(localStorage.getItem('demo_catalog_promo_kind') || '').trim();
  state.recentlyViewed = safeParse(localStorage.getItem('demo_catalog_recent') || '[]', []).filter(Boolean).slice(0, 12);
  state.theme = localStorage.getItem('demo_catalog_theme') === 'light' ? 'light' : 'dark';
  state.selectedStoreId = localStorage.getItem('demo_catalog_selected_store') || null;
  state.promoUsage = safeParse(localStorage.getItem('demo_catalog_promo_usage') || '{}', {});
  const productStats = safeParse(localStorage.getItem('demo_catalog_product_stats') || '{}', {});
  state.productStats = productStats && typeof productStats === 'object' ? productStats : {};
  state.searchHistory = safeParse(localStorage.getItem('demo_catalog_search_history') || '[]', [])
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, 8);
}

function saveStorage() {
  localStorage.setItem('demo_catalog_favorites', JSON.stringify(Array.from(state.favorites)));
  localStorage.setItem('demo_catalog_cart', JSON.stringify(state.cart));
  localStorage.setItem('demo_catalog_cart_selected', JSON.stringify(Array.from(state.selectedCart)));
  localStorage.setItem('demo_catalog_fav_selected', JSON.stringify(Array.from(state.selectedFavorites)));
  localStorage.setItem('demo_catalog_profile', JSON.stringify(state.profile));
  localStorage.setItem('demo_catalog_orders', JSON.stringify(state.orders));
  localStorage.setItem('demo_catalog_promo_code', state.promoCode || '');
  localStorage.setItem('demo_catalog_promo_percent', String(state.promoPercent || 0));
  localStorage.setItem('demo_catalog_promo_kind', state.promoKind || '');
  localStorage.setItem('demo_catalog_recent', JSON.stringify(state.recentlyViewed || []));
  localStorage.setItem('demo_catalog_theme', state.theme || 'dark');
  localStorage.setItem('demo_catalog_selected_store', state.selectedStoreId || '');
  localStorage.setItem('demo_catalog_promo_usage', JSON.stringify(state.promoUsage || {}));
  localStorage.setItem('demo_catalog_product_stats', JSON.stringify(state.productStats || {}));
  localStorage.setItem('demo_catalog_search_history', JSON.stringify(state.searchHistory || []));
}

function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  if (ui.themeToggleValue) ui.themeToggleValue.textContent = nextTheme === 'light' ? 'Светлая' : 'Тёмная';
  if (ui.themeLabel) ui.themeLabel.textContent = nextTheme === 'light' ? '☀️ Тема оформления' : '🌙 Тема оформления';
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  saveStorage();
}

function dismissKeyboardIfNeeded(eventTarget) {
  const active = document.activeElement;
  if (!active) return;
  const tag = String(active.tagName || '').toLowerCase();
  const isEditable =
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    active.isContentEditable;
  if (!isEditable) return;
  if (eventTarget && eventTarget.closest && eventTarget.closest('input, textarea, select, [contenteditable="true"]')) {
    return;
  }
  active.blur();
}

function saveProfileDraft() {
  state.profile = {
    ...state.profile,
    name: String(ui.inputName?.value || '').trim(),
    phone: String(ui.inputPhone?.value || '').trim(),
    email: String(ui.inputEmail?.value || '').trim(),
  };
  saveStorage();
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.length === 10) return `+7${digits}`;
  return `+${digits}`;
}

function getTelegramPhoneCandidate() {
  const source = window.HORECA_TG?.initDataUnsafe || {};
  return normalizePhone(String(
    source?.user?.phone_number ||
    source?.user?.contact?.phone_number ||
    source?.phone_number ||
    source?.contact?.phone_number ||
    source?.receiver?.phone_number ||
    ''
  ).trim());
}

async function tryAutofillPhoneFromTelegram({ forceRequest = false } = {}) {
  if (!ui.inputPhone) return false;

  const currentNormalized = normalizePhone(ui.inputPhone.value);
  if (validatePhone(currentNormalized)) {
    if (currentNormalized !== ui.inputPhone.value) ui.inputPhone.value = currentNormalized;
    state.phoneAutofillSucceeded = true;
    saveProfileDraft();
    return true;
  }

  const immediatePhone = getTelegramPhoneCandidate();
  if (immediatePhone) {
    ui.inputPhone.value = immediatePhone;
    state.phoneAutofillSucceeded = true;
    saveProfileDraft();
    if (ui.orderStatus) ui.orderStatus.textContent = 'Номер автоматически подставлен из Telegram.';
    return true;
  }

  if (!window.HORECA_TG?.isTelegram) return false;
  if (!forceRequest && state.phoneAutofillAttempted) return false;
  state.phoneAutofillAttempted = true;
  if (ui.orderStatus) ui.orderStatus.textContent = 'Запрашиваем номер телефона...';

  const result = await window.HORECA_TG.requestContact();
  const resultPhone = normalizePhone(result?.phone || '');
  if (result?.ok && resultPhone) {
    ui.inputPhone.value = resultPhone;
    state.phoneAutofillSucceeded = true;
    saveProfileDraft();
    if (ui.orderStatus) ui.orderStatus.textContent = 'Номер получен из Telegram.';
    return true;
  }

  if (ui.orderStatus) ui.orderStatus.textContent = 'Не удалось получить номер. Укажите его вручную.';
  return false;
}

function getProduct(id) { return state.products.find((p) => p.id === id); }

function cartItems() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ ...getProduct(id), qty }))
    .filter((p) => p.id);
}

function cartSummary() {
  if (!state.selectedCart.size) return { sum: 0, missing: false, count: 0, requestCount: 0 };
  const selected = cartItems().filter((i) => state.selectedCart.has(i.id));
  let sum = 0;
  let eligibleSum = 0;
  let missing = false;
  let count = 0;
  let requestCount = 0;
  selected.forEach((item) => {
    count += item.qty || 0;
    if (!hasPrice(item)) {
      missing = true;
      requestCount += item.qty || 0;
      return;
    }
    const lineSum = item.price * item.qty;
    sum += lineSum;
    if (state.promoKind === 'first_order' && isEligibleFirstOrderPromoItem(item)) {
      eligibleSum += lineSum;
    }
  });
  const discountPercent = Number(state.promoPercent || 0);
  const discountBase = state.promoKind === 'first_order' ? eligibleSum : sum;
  const discountAmount = discountPercent > 0 ? Math.round(discountBase * (discountPercent / 100)) : 0;
  const finalSum = Math.max(0, sum - discountAmount);
  return {
    sum: finalSum,
    baseSum: sum,
    eligibleSum,
    discountAmount,
    discountPercent,
    missing,
    count,
    requestCount,
  };
}

function formatSummaryTotal(summary) {
  const hasNumericTotal = Number(summary.sum || 0) > 0;
  const promoLabel = summary.discountAmount > 0 ? ` (скидка ${summary.discountPercent}%)` : '';
  if (summary.missing && hasNumericTotal) {
    return `${formatPrice(summary.sum)} ₽${promoLabel} + Запрос цены`;
  }
  if (summary.missing) {
    return 'Запрос цены';
  }
  return `${formatPrice(summary.sum)} ₽${promoLabel}`;
}

function updateBadges() {
  const cartCount = Object.values(state.cart).reduce((s, q) => s + q, 0);
  ui.cartCount.textContent = cartCount;
  ui.favoritesCount.textContent = state.favorites.size;
}

function renderCategories() {
  const available = new Set(state.products.map((p) => p.categoryId));
  const filtered = state.categories.filter((c) => c.groupId === state.currentGroup && (available.size === 0 || available.has(c.id)));
  const list = filtered.length ? filtered : state.categories.filter((c) => available.has(c.id));
  if (!list.length) {
    ui.categoriesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">Нет категорий с товарами</div>
        <div class="empty-text">Попробуйте другой раздел.</div>
      </div>
    `;
    return;
  }
  const categoryCards = list.map((c) => {
    const firstProduct = state.products.find((p) => p.categoryId === c.id);
    const image = firstProduct && Array.isArray(firstProduct.images) && firstProduct.images[0] ? firstProduct.images[0] : c.image;
    return `
    <button class="category-card" data-category="${c.id}">
      <img src="${safeSrc(image)}" alt="${c.title}" loading="lazy" decoding="async" />
      <span>${c.title}</span>
    </button>
  `;
  }).join('');
  const promoPreview = getPromoProducts()[0];
  const promoImage = promoPreview?.images?.[0] || state.products[0]?.images?.[0] || 'assets/placeholder.svg';
  ui.categoriesGrid.innerHTML = `
    ${categoryCards}
    <button class="category-card promo-category-card" data-open-screen="promo" type="button">
      <img src="${safeSrc(promoImage)}" alt="Акции" loading="lazy" decoding="async" />
      <span>Акции</span>
    </button>
  `;
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

function buildProductCards(list, options = {}) {
  const promoMode = options.promo === true;
  return list.map((p) => {
    const hasValidPrice = hasPrice(p);
    const promoNew = promoMode ? discountedPrice(p, 10) : null;
    const showPromo = promoMode && hasValidPrice;
    return `
    <article class="product-card" data-open="${p.id}">
      ${showPromo ? `<div class="promo-badge promo-badge-inline">-10%</div>` : ''}
      <button class="card-icon favorite ${state.favorites.has(p.id) ? 'active' : ''}" data-favorite="${p.id}" aria-label="В избранное">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        </svg>
      </button>
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription || ''}</div>
        <div class="product-meta">Артикул: ${getSku(p) || '—'}</div>
        <div class="product-price">
          ${promoMode && hasValidPrice
            ? `<span class="promo-new">${formatPrice(promoNew)} ₽</span><span class="promo-old">${formatPrice(p.price)} ₽</span>`
            : priceLabel(p)}
        </div>
        ${state.cart[p.id]
          ? `
            <div class="card-qty" data-qty="${p.id}">
              <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
              <span class="qty-count">${state.cart[p.id]}</span>
              <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
            </div>
          `
          : hasValidPrice ? `
            <button class="card-icon cart" data-cart="${p.id}" aria-label="В корзину">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 11-1 9" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20" />
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
              </svg>
            </button>
          ` : `<button class="primary-button request-button" data-request="${p.id}" type="button">Запросить</button>`}
      </div>
    </article>
  `;
  }).join('');
}

function applyFilters(list, filter) {
  let out = list.slice();
  if (filter.search) {
    const q = filter.search.toLowerCase();
    out = out.filter((p) => (p.title || '').toLowerCase().includes(q));
  }
  if (filter.sort === 'price-asc') {
    out.sort((a, b) => {
      const ap = hasPrice(a) ? a.price : Infinity;
      const bp = hasPrice(b) ? b.price : Infinity;
      return ap - bp;
    });
  }
  return out;
}

function renderProducts() {
  const base = state.currentCategoryIds
    ? state.products.filter((p) => state.currentCategoryIds.includes(p.categoryId))
    : state.products.filter((p) => p.categoryId === state.currentCategory);
  const list = applyFilters(base, state.filters.products);
  if (!list.length) {
    ui.productsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">${state.filters.products.search ? 'Ничего не найдено' : 'Пока нет товаров в этом разделе'}</div>
        <div class="empty-text">${state.filters.products.search ? 'Измените запрос или фильтр.' : 'Попробуйте открыть другую категорию.'}</div>
      </div>
    `;
    return;
  }
  ui.productsList.innerHTML = buildProductCards(list);
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

function getPromoProducts() {
  return state.products.filter((p) => hasPrice(p)).slice(0, 8);
}

function getRecommendedProducts(product, limit = 8) {
  if (!product || !product.id) return [];
  const sameCategory = state.products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId);
  const pool = sameCategory.length
    ? sameCategory
    : state.products.filter((item) => item.id !== product.id);
  return pool.slice(0, limit);
}

function renderPromos() {
  const list = getPromoProducts();
  const filtered = applyFilters(list, state.filters.promo);
  if (ui.promoTrack) {
    ui.promoTrack.innerHTML = list.map((p) => {
      const newPrice = Math.round((p.price || 0) * 0.9);
      return `
    <article class="promo-card" data-open="${p.id}">
      <div class="promo-badge">-10%</div>
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div class="promo-title">${p.title}</div>
      <div class="promo-price">
        <span class="promo-new">${formatPrice(newPrice)} ₽</span>
        <span class="promo-old">${formatPrice(p.price)} ₽</span>
      </div>
    </article>
  `;
    }).join('');
  }
  if (ui.promoList) {
    if (!filtered.length) {
      ui.promoList.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">Пока нет товаров в этом разделе</div>
          <div class="empty-text">Попробуйте позже.</div>
        </div>
      `;
    } else {
      ui.promoList.innerHTML = buildProductCards(filtered, { promo: true });
    }
  }
}

function setHomeBanner(index) {
  if (!ui.homeBannerTrack) return;
  const slidesCount = ui.homeBannerTrack.children.length || 1;
  const nextIndex = Math.max(0, Math.min(slidesCount - 1, Number(index || 0)));
  state.homeBannerIndex = nextIndex;
  ui.homeBannerTrack.style.transform = `translateX(-${nextIndex * 100}%)`;
  if (ui.homeBannerDots) {
    ui.homeBannerDots.querySelectorAll('[data-home-banner-dot]').forEach((dot) => {
      dot.classList.toggle('active', Number(dot.dataset.homeBannerDot) === nextIndex);
    });
  }
}

function startHomeBannerAutoplay() {
  if (state.homeBannerTimer) {
    window.clearInterval(state.homeBannerTimer);
    state.homeBannerTimer = null;
  }
  if (!ui.homeBannerTrack) return;
  const slidesCount = ui.homeBannerTrack.children.length || 1;
  if (slidesCount <= 1) return;
  state.homeBannerTimer = window.setInterval(() => {
    const next = (state.homeBannerIndex + 1) % slidesCount;
    setHomeBanner(next);
  }, 5000);
}

function touchRecentlyViewed(productId) {
  if (!productId) return;
  state.recentlyViewed = [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12);
  if (!state.productStats[productId] || typeof state.productStats[productId] !== 'object') {
    state.productStats[productId] = { views: 0, orderedQty: 0, orderCount: 0, updatedAt: '' };
  }
  const stats = state.productStats[productId];
  stats.views = Number(stats.views || 0) + 1;
  stats.updatedAt = new Date().toISOString();
  saveStorage();
}

function getPopularityStats(productId) {
  const stats = state.productStats?.[productId] || {};
  return {
    views: Number(stats.views || 0),
    orderedQty: Number(stats.orderedQty || 0),
    orderCount: Number(stats.orderCount || 0),
  };
}

function getPopularProducts(limit = 8) {
  const source = state.products.filter((p) => hasPrice(p));
  if (!source.length) return [];
  const scored = source.map((product) => {
    const stats = getPopularityStats(product.id);
    const score = (stats.orderedQty * 12) + (stats.orderCount * 20) + stats.views;
    return { product, score, stats };
  });
  const hasSignals = scored.some((item) => item.score > 0);
  if (!hasSignals) return source.slice(0, limit);
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.stats.orderedQty !== a.stats.orderedQty) return b.stats.orderedQty - a.stats.orderedQty;
    if (b.stats.views !== a.stats.views) return b.stats.views - a.stats.views;
    return String(a.product.title || '').localeCompare(String(b.product.title || ''), 'ru');
  });
  return scored.slice(0, limit).map((item) => item.product);
}

function renderHomePopular() {
  if (!ui.homePopularTrack) return;
  const popular = getPopularProducts(8);
  if (!popular.length) {
    ui.homePopularTrack.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">Популярные товары появятся после первых просмотров и заказов</div>
      </div>
    `;
    return;
  }
  ui.homePopularTrack.innerHTML = popular.map((p) => `
    <article class="promo-card" data-open="${p.id}">
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div class="promo-title">${p.title}</div>
      <div class="promo-price">${priceLabel(p)}</div>
    </article>
  `).join('');
}

function getFallbackStores() {
  const address = state.config.companyAddress || 'Москва, Тверская 1';
  return [
    { id: 'store-1', city: 'Москва', address },
    { id: 'store-2', city: 'Санкт-Петербург', address: 'Санкт-Петербург, Невский проспект 28' },
    { id: 'store-3', city: 'Казань', address: 'Казань, ул. Баумана 9' },
  ];
}

function normalizeStores(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const normalized = list
    .map((item, idx) => ({
      id: String(item?.id || `store-${idx + 1}`),
      city: String(item?.city || '').trim(),
      address: String(item?.address || '').trim(),
    }))
    .filter((item) => item.city && item.address);
  return normalized.length ? normalized : getFallbackStores();
}

function getSelectedStore() {
  if (!state.stores.length) return null;
  return state.stores.find((s) => s.id === state.selectedStoreId) || state.stores[0];
}

function renderHeaderStore() {
  const selected = getSelectedStore();
  if (ui.headerStoreCity) ui.headerStoreCity.textContent = selected?.city || 'Магазины';
}

function renderStores() {
  if (!ui.storesList) return;
  const selected = getSelectedStore();
  ui.storesList.innerHTML = state.stores.map((store) => `
    <button class="store-item ${selected?.id === store.id ? 'active' : ''}" data-store-id="${store.id}" type="button">
      <div class="store-city">${store.city}</div>
      <div class="store-address">${store.address}</div>
    </button>
  `).join('');
  if (state.admin.enabled && ui.storesList) {
    ui.storesList.querySelectorAll('[data-store-id]').forEach((btn) => {
      const storeId = btn.dataset.storeId;
      const store = state.stores.find((item) => item.id === storeId);
      if (!store) return;
      adminBindHold(btn, () => {
        adminEditValue(`Магазин ${store.city}: city|address`, `${store.city}|${store.address}`, { allowDelete: true }).then((value) => {
          if (value == null) return;
          if (value.__delete) {
            state.stores = state.stores.filter((item) => item.id !== store.id);
            state.config.storeLocations = state.stores;
            if (!state.stores.length) state.stores = getFallbackStores();
          } else {
            const [cityRaw, addressRaw] = String(value).split('|');
            store.city = String(cityRaw || '').trim() || store.city;
            store.address = String(addressRaw || '').trim() || store.address;
            state.config.storeLocations = state.stores;
          }
          adminSaveDraft(true);
          renderStores();
          renderHeaderStore();
        });
      });
    });
  }
}

function renderProductView() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (ui.productTitle) ui.productTitle.textContent = p.title || '';
  if (ui.productFavoriteTop) {
    ui.productFavoriteTop.dataset.favorite = p.id;
    ui.productFavoriteTop.classList.toggle('active', state.favorites.has(p.id));
  }
  const desc = String(p.description || '').trim();
  const specs = (p.specs || [])
    .filter((s) => {
      if (!s) return false;
      if (typeof s === 'string') {
        const text = s.trim();
        if (!text) return false;
        if (text.toLowerCase().startsWith('описание')) return false;
        if (desc && (text === desc || text.includes(desc.slice(0, 40)))) return false;
        return true;
      }
      const label = String(s.label || '').toLowerCase();
      if (label === 'описание') return false;
      return true;
    })
    .map((s) => {
      if (typeof s === 'string') return `<div>${s}</div>`;
      return `<div><span>${s.label}</span><span>${s.value}</span></div>`;
    })
    .join('');
  const recommended = getRecommendedProducts(p, 10);
  ui.productView.innerHTML = `
    <div class="product-hero">
      ${state.admin.enabled ? '<button class="admin-inline-plus admin-inline-plus-hero" data-admin-add="image" type="button" aria-label="Добавить фото">+</button>' : ''}
      <div class="product-gallery">${p.images.map((src) => `<img src="${safeSrc(src)}" alt="${p.title}" loading="lazy" decoding="async" />`).join('')}</div>
    </div>
    <div class="product-title">${p.title}</div>
    <div class="product-meta">Артикул: ${getSku(p) || '—'}</div>
    <div class="product-price-row">
      <div class="product-price">${priceLabel(p)}</div>
      ${state.cart[p.id]
        ? `
          <div class="product-qty" data-qty="${p.id}">
            <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
            <span class="qty-count">${state.cart[p.id]}</span>
            <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
          </div>
        `
        : hasPrice(p)
          ? `<button class="primary-button" data-cart="${p.id}">В корзину</button>`
          : `<button class="primary-button" data-request="${p.id}">Запросить</button>`}
    </div>
    <div class="detail-section">
      <div class="section-title section-title-admin">
        <span>Описание</span>
      </div>
      <div class="section-body">${desc || 'Описание будет добавлено позже.'}</div>
    </div>
    <div class="detail-section">
      <div class="section-title section-title-admin">
        <span>Характеристики</span>
        <button class="admin-inline-plus" data-admin-add="spec" type="button" aria-label="Добавить характеристику">+</button>
      </div>
      <div class="product-specs">${specs}</div>
    </div>
    ${recommended.length ? `
      <div class="detail-section recommended-section">
        <div class="section-title">Рекомендуем</div>
        <div class="recommended-track">
          ${recommended.map((item) => `
            <button class="recommended-card" data-open="${item.id}" type="button" aria-label="${item.title}">
              <img src="${safeSrc(item.images[0])}" alt="${item.title}" loading="lazy" decoding="async" />
              <div class="recommended-title">${item.title}</div>
              <div class="recommended-price">${priceLabel(item)}</div>
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

function renderFavorites() {
  const list = Array.from(state.favorites).map((id) => getProduct(id) || ({ id, missing: true, title: 'Товар недоступен', shortDescription: '', images: ['assets/placeholder.svg'] }));
  if (!state.selectedFavorites.size && list.length && !state.favoritesSelectionTouched) {
    state.selectedFavorites = new Set(list.map((p) => p.id));
    saveStorage();
  }
  if (ui.favoritesSelectAll) {
    ui.favoritesSelectAll.checked = list.length && list.every((p) => state.selectedFavorites.has(p.id));
  }
  ui.favoritesList.innerHTML = list.map((p) => `
    <article class="product-card">
      <label class="select-dot">
        <input type="checkbox" data-fav-select="${p.id}" ${state.selectedFavorites.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription || ''}</div>
        <div class="product-price">${priceLabel(p)}</div>
        <div class="product-actions icon-actions favorites-controls">
          <button class="icon-btn" data-cart="${p.id}" aria-label="В корзину" ${p.missing ? 'disabled' : ''}>
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m15 11-1 9" />
              <path d="m19 11-4-7" />
              <path d="M2 11h20" />
              <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
            </svg>
          </button>
          <button class="icon-btn" data-favorite="${p.id}" aria-label="Удалить из избранного">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 14h10l1-14" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const items = cartItems();
  if (!state.selectedCart.size && items.length && !state.cartSelectionTouched) {
    state.selectedCart = new Set(items.map((i) => i.id));
    saveStorage();
  }
  const summary = cartSummary();
  ui.cartList.innerHTML = items.map((p) => `
    <div class="cart-item">
      <label class="select-dot">
        <input type="checkbox" data-cart-select="${p.id}" ${state.selectedCart.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img class="cart-image" src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div class="cart-info">
        <button class="cart-title-link" data-open="${p.id}">${p.title}</button>
        <div class="cart-sku">Артикул: ${getSku(p) || '—'}</div>
        <div class="cart-price">${priceLabel(p)}</div>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" data-qty="${p.id}" data-action="dec">−</button>
        <span class="qty-count">${p.qty}</span>
        <button class="qty-btn" data-qty="${p.id}" data-action="inc">+</button>
        <button class="icon-btn ${state.favorites.has(p.id) ? 'active' : ''}" data-favorite="${p.id}" aria-label="В избранное">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        </button>
        <button class="icon-btn" data-remove="${p.id}" aria-label="Удалить">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  `).join('');
  ui.cartTotal.textContent = formatSummaryTotal(summary);
  if (ui.cartItemsCount) {
    ui.cartItemsCount.textContent = items.reduce((s, i) => s + i.qty, 0);
  }
  if (ui.checkoutTotal) {
    ui.checkoutTotal.textContent = formatSummaryTotal(summary);
  }
  if (ui.cartSelectAll) {
    ui.cartSelectAll.checked = items.length && items.every((i) => state.selectedCart.has(i.id));
  }
  if (ui.promoCodeInput) ui.promoCodeInput.value = state.promoCode || '';
  if (ui.promoStatus) {
    if (state.promoPercent > 0) {
      const kindLabel = state.promoKind === 'first_order'
        ? 'на товары без скидки'
        : '';
      ui.promoStatus.textContent = `Скидка ${state.promoPercent}% активна (${state.promoCode}) ${kindLabel}. Экономия: ${formatPrice(summary.discountAmount || 0)} ₽.`;
    } else if (/активна/.test(ui.promoStatus.textContent || '')) {
      ui.promoStatus.textContent = '';
    }
  }
}

function renderOrders() {
  if (state.admin.enabled) {
    renderAdminSalesAnalytics();
    return;
  }
  if (ui.profileOrdersTitle) ui.profileOrdersTitle.textContent = 'История заказов';
  if (!state.orders.length) {
    ui.ordersList.innerHTML = '<div class="text-card">История заказов пуста.</div>';
    return;
  }
  ui.ordersList.innerHTML = state.orders.slice().reverse().map((o) => `
    <div class="order-card" data-order-id="${o.id}">
      <div class="order-head">
        <div class="order-title">Заявка №${o.id}</div>
        <div class="order-date">${new Date(o.createdAt).toLocaleString('ru-RU')}</div>
      </div>
      <div class="order-summary">
        <div class="order-total">Сумма: ${o.totalDisplay || (Number.isFinite(Number(o.total)) ? `${formatPrice(Number(o.total))} ₽` : 'По запросу')}</div>
        <button class="order-repeat" type="button">Повторить</button>
      </div>
      <div class="order-status">Статус: ${o.status || 'Отправлено'}</div>
      <button class="order-toggle" type="button">Состав заказа</button>
      <div class="order-items hidden">
        <ul>
          ${o.items.map((i) => `
            <li>
              <span class="order-item-title">${i.title}</span>
              <span class="order-item-qty">× ${i.qty}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function adminMonthKey(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function adminMonthLabel(key) {
  if (!key || key === 'unknown') return 'Без даты';
  const [y, m] = String(key).split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function adminOrderTotal(order) {
  const sum = Number(order?.total || 0);
  return Number.isFinite(sum) ? Math.max(0, sum) : 0;
}

function adminOrderMargin(order) {
  return Math.round(adminOrderTotal(order) * ADMIN_MARGIN_RATE);
}

function adminEnsureReportModal() {
  if (state.admin.ui.reportModal) return state.admin.ui.reportModal;
  const modal = document.createElement('div');
  modal.className = 'admin-report-modal hidden';
  modal.innerHTML = `
    <div class="admin-report-card">
      <div class="admin-report-head">
        <h3 class="admin-report-title">Детали</h3>
        <button type="button" class="admin-report-close">✕</button>
      </div>
      <div class="admin-report-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.admin-report-close').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.add('hidden');
  });
  state.admin.ui.reportModal = modal;
  return modal;
}

function adminOpenReportModal(title, html) {
  const modal = adminEnsureReportModal();
  modal.querySelector('.admin-report-title').textContent = title;
  modal.querySelector('.admin-report-body').innerHTML = html;
  modal.classList.remove('hidden');
}

function renderAdminSalesAnalytics() {
  const orders = state.orders.slice().sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
  if (ui.profileOrdersTitle) ui.profileOrdersTitle.textContent = 'История покупок клиентов';
  if (!orders.length) {
    ui.ordersList.innerHTML = '<div class="text-card">Покупок пока нет.</div>';
    return;
  }

  const monthMap = new Map();
  orders.forEach((order) => {
    const key = adminMonthKey(order.createdAt);
    const stat = monthMap.get(key) || { total: 0, margin: 0, count: 0, orders: [] };
    const total = adminOrderTotal(order);
    const margin = adminOrderMargin(order);
    stat.total += total;
    stat.margin += margin;
    stat.count += 1;
    stat.orders.push(order);
    monthMap.set(key, stat);
  });

  const thisMonthKey = adminMonthKey(new Date().toISOString());
  const thisMonth = monthMap.get(thisMonthKey) || { total: 0, margin: 0, count: 0, orders: [] };
  const monthEntries = Array.from(monthMap.entries()).sort((a, b) => String(b[0]).localeCompare(String(a[0])));

  ui.ordersList.innerHTML = `
    <button class="admin-analytics-card" data-admin-report="month-current" type="button">
      <div class="admin-analytics-label">Маржа за текущий месяц</div>
      <div class="admin-analytics-value">${formatPrice(thisMonth.margin)} ₽</div>
      <div class="admin-analytics-meta">${adminMonthLabel(thisMonthKey)} • заказов: ${thisMonth.count}</div>
    </button>

    <div class="admin-analytics-months">
      ${monthEntries.map(([key, stat]) => `
        <button class="admin-month-card" data-admin-month="${escapeHtml(key)}" type="button">
          <div class="admin-month-title">${escapeHtml(adminMonthLabel(key))}</div>
          <div class="admin-month-meta">Выручка: ${formatPrice(stat.total)} ₽</div>
          <div class="admin-month-meta">Маржа: ${formatPrice(stat.margin)} ₽</div>
        </button>
      `).join('')}
    </div>

    <div class="admin-analytics-orders">
      ${orders.map((order) => `
        <button class="admin-order-card" data-admin-order="${order.id}" type="button">
          <div class="admin-order-head">
            <strong>${escapeHtml(order.customer?.name || 'Клиент')}</strong>
            <span>${new Date(order.createdAt).toLocaleString('ru-RU')}</span>
          </div>
          <div class="admin-order-meta">Сумма: ${escapeHtml(order.totalDisplay || `${formatPrice(adminOrderTotal(order))} ₽`)}</div>
          <div class="admin-order-meta">Маржа: ${formatPrice(adminOrderMargin(order))} ₽</div>
        </button>
      `).join('')}
    </div>
  `;

  const openMonthReport = (key) => {
    const stat = monthMap.get(key);
    if (!stat) return;
    adminOpenReportModal(
      `Месяц: ${adminMonthLabel(key)}`,
      `
        <div><strong>Заказов:</strong> ${stat.count}</div>
        <div><strong>Выручка:</strong> ${formatPrice(stat.total)} ₽</div>
        <div><strong>Маржа:</strong> ${formatPrice(stat.margin)} ₽</div>
        <hr />
        ${stat.orders.map((order) => `
          <div class="admin-modal-order">
            <div><strong>${escapeHtml(order.customer?.name || 'Клиент')}</strong> • ${new Date(order.createdAt).toLocaleString('ru-RU')}</div>
            <div>Сумма: ${escapeHtml(order.totalDisplay || `${formatPrice(adminOrderTotal(order))} ₽`)}</div>
          </div>
        `).join('')}
      `
    );
  };

  ui.ordersList.querySelector('[data-admin-report="month-current"]')?.addEventListener('click', () => openMonthReport(thisMonthKey));
  ui.ordersList.querySelectorAll('[data-admin-month]').forEach((btn) => {
    btn.addEventListener('click', () => openMonthReport(btn.dataset.adminMonth || ''));
  });
  ui.ordersList.querySelectorAll('[data-admin-order]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.adminOrder);
      const order = orders.find((x) => Number(x.id) === id);
      if (!order) return;
      adminOpenReportModal(
        `Заказ №${order.id}`,
        `
          <div><strong>Клиент:</strong> ${escapeHtml(order.customer?.name || '—')}</div>
          <div><strong>Телефон:</strong> ${escapeHtml(order.customer?.phone || '—')}</div>
          <div><strong>Email:</strong> ${escapeHtml(order.customer?.email || '—')}</div>
          <div><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</div>
          <div><strong>Сумма:</strong> ${escapeHtml(order.totalDisplay || `${formatPrice(adminOrderTotal(order))} ₽`)}</div>
          <div><strong>Маржа:</strong> ${formatPrice(adminOrderMargin(order))} ₽</div>
          <hr />
          <strong>Состав:</strong>
          <ul>
            ${(order.items || []).map((i) => `<li>${escapeHtml(i.title || 'Товар')} × ${Number(i.qty || 1)}</li>`).join('')}
          </ul>
        `
      );
    });
  });
}

function renderProfile() {
  const user = getTelegramUser();
  const firstName = String(user.first_name || state.profile.name || 'Пользователь').trim();
  const username = String(user.username || '').trim();
  const photoUrl = String(user.photo_url || '').trim();
  if (ui.profileName) ui.profileName.textContent = firstName || 'Пользователь';
  if (ui.profileHandle) ui.profileHandle.textContent = username ? `@${username}` : `ID: ${getTelegramId() || '—'}`;
  if (ui.profileAvatar) {
    if (photoUrl) {
      ui.profileAvatar.classList.add('has-photo');
      ui.profileAvatar.innerHTML = `<img src="${safeSrc(photoUrl)}" alt="Аватар" loading="lazy" decoding="async" />`;
    } else {
      ui.profileAvatar.classList.remove('has-photo');
      ui.profileAvatar.textContent = (firstName[0] || 'P').toUpperCase();
    }
  }
}

function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function applyPromoCode() {
  const code = String(ui.promoCodeInput?.value || '').trim().toUpperCase();
  if (!code) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoKind = '';
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод очищен.';
    saveStorage();
    renderCart();
    return;
  }
  if (code !== FIRST_ORDER_PROMO.code) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoKind = '';
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод не найден.';
    saveStorage();
    renderCart();
    return;
  }
  if (hasUsedFirstOrderPromo()) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoKind = '';
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод "ПЕРВЫЙ" уже использован для этого Telegram аккаунта.';
    saveStorage();
    renderCart();
    return;
  }
  const selected = cartItems().filter((i) => state.selectedCart.has(i.id));
  const eligibleCount = selected.filter((item) => isEligibleFirstOrderPromoItem(item)).length;
  if (!eligibleCount) {
    if (ui.promoStatus) {
      ui.promoStatus.textContent = 'Промокод "ПЕРВЫЙ" действует только на товары без скидки.';
    }
    return;
  }
  state.promoCode = FIRST_ORDER_PROMO.code;
  state.promoPercent = FIRST_ORDER_PROMO.percent;
  state.promoKind = 'first_order';
  if (ui.promoStatus) {
    ui.promoStatus.textContent = 'Промокод "ПЕРВЫЙ" активирован: -10% на товары без скидки.';
  }
  saveStorage();
  renderCart();
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
  saveStorage();
  updateBadges();
  refreshFavoriteViews();
}

function refreshFavoriteViews() {
  if (state.currentScreen === 'products' || state.currentScreen === 'categories' || state.currentScreen === 'home') {
    renderProducts();
  }
  if (state.currentScreen === 'favorites') {
    renderFavorites();
  } else {
    renderFavorites();
  }
  if (state.currentScreen === 'product') {
    renderProductView();
  }
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveStorage();
  updateBadges();
}

// Центральная регистрация всех обработчиков интерфейса.
function bindEvents() {
  on(document, 'touchstart', (e) => {
    dismissKeyboardIfNeeded(e.target);
  }, { passive: true });
  on(document, 'click', (e) => {
    dismissKeyboardIfNeeded(e.target);
  });

  on(ui.menuButton, 'click', openMenu);
  on(ui.headerSearchButton, 'click', openSearchOverlay);
  on(ui.headerStoreButton, 'click', () => {
    renderStores();
    setScreen('stores');
  });
  on(ui.globalSearchForm, 'submit', (e) => {
    e.preventDefault();
    submitSearch(ui.globalSearchInput?.value || '');
  });
  on(ui.globalSearchInput, 'input', () => {
    renderSearchSuggestions(ui.globalSearchInput?.value || '');
  });
  on(ui.searchCloseButton, 'click', closeSearchOverlay);
  on(ui.searchOverlay, 'click', (e) => {
    if (e.target === ui.searchOverlay) closeSearchOverlay();
  });
  on(ui.globalSearchInput, 'keydown', (e) => {
    if (e.key === 'Escape') closeSearchOverlay();
  });
  on(ui.searchHistoryClear, 'click', () => {
    state.searchHistory = [];
    saveStorage();
    renderSearchHistory();
  });
  on(ui.searchHistoryList, 'click', (e) => {
    const btn = e.target.closest('[data-search-history]');
    if (!btn) return;
    const query = btn.dataset.searchHistory || '';
    if (ui.globalSearchInput) ui.globalSearchInput.value = query;
    submitSearch(query);
  });
  on(ui.searchSuggestList, 'click', (e) => {
    const submitBtn = e.target.closest('[data-search-submit]');
    if (submitBtn) {
      submitSearch(submitBtn.dataset.searchSubmit || '');
      return;
    }
    const productBtn = e.target.closest('[data-search-product]');
    if (!productBtn) return;
    const productId = productBtn.dataset.searchProduct || '';
    const product = getProduct(productId);
    if (!product) return;
    const title = normalizeSearchQuery(product.title || '');
    addSearchHistory(title);
    state.currentProduct = productId;
    touchRecentlyViewed(productId);
    renderProductView();
    setScreen('product');
    closeSearchOverlay();
  });
  on(ui.homeBannerDots, 'click', (e) => {
    const dot = e.target.closest('[data-home-banner-dot]');
    if (!dot) return;
    const idx = Number(dot.dataset.homeBannerDot || 0);
    setHomeBanner(idx);
    startHomeBannerAutoplay();
  });
  on(ui.profileManagerButton, 'click', openManagerChat);
  on(document, 'click', (e) => {
    const addBtn = e.target.closest('[data-admin-add]');
    if (!addBtn) return;
    e.preventDefault();
    e.stopPropagation();
    handleAdminInlineAdd(addBtn.dataset.adminAdd || '');
  });

  on(document, 'click', (e) => {
    const btn = e.target.closest('[data-screen]');
    if (!btn) return;
    const target = btn.dataset.screen;
    if (!target) return;
    setScreen(target);
    if (target === 'orders') renderOrders();
    if (target === 'profile') {
      renderProfile();
      renderOrders();
    }
  });

  on(ui.menuCatalogToggle, 'click', () => {
    if (ui.menuCatalogList) ui.menuCatalogList.classList.toggle('hidden');
  });

  // На старте фиксируем основную витрину каталога.
  if (!state.currentGroup) {
    state.currentGroup = 'apparel';
    ui.categoriesTitle.textContent = 'Каталог';
    renderCategories();
  }

  if (ui.menuCatalogList) {
    ui.menuCatalogList.addEventListener('click', (e) => {
      const subItem = e.target.closest('[data-menu-subitem]');
      if (subItem) {
        let id = subItem.dataset.category;
        if (!id) {
          const parent = subItem.closest('[data-menu-children]');
          if (parent) {
            const idx = parent.dataset.menuChildren;
            const row = ui.menuCatalogList.querySelector(`[data-menu-index="${idx}"]`);
            if (row) id = row.dataset.category;
          }
        }
        if (!id) {
          const label = subItem.textContent.trim();
          id = menuCatalogFallback.get(label);
        }
        openCategoryById(id);
        return;
      }
      const row = e.target.closest('[data-menu-index]');
      if (!row) return;
      const hasChildren = row.dataset.hasChildren === '1';
      if (hasChildren) {
        const idx = row.dataset.menuIndex;
        const block = ui.menuCatalogList.querySelector(`[data-menu-children="${idx}"]`);
        if (block) {
          block.classList.toggle('hidden');
          row.classList.toggle('open');
        }
        return;
      }
      openCategoryById(row.dataset.category);
    });
  }

  document.querySelectorAll('[data-prod-dot]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.prodDot || 0);
      setProductionSlide(index);
    });
  });

  const productionSlider = document.querySelector('.production-slider');
  if (productionSlider) {
    let prodStartX = 0;
    productionSlider.addEventListener('touchstart', (e) => {
      prodStartX = e.touches[0].clientX;
    }, { passive: true });
    productionSlider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - prodStartX;
      if (Math.abs(dx) < 40) return;
      const totalSlides = document.querySelectorAll('.production-track .production-slide').length || 1;
      const dir = dx < 0 ? 1 : -1;
      const next = Math.max(0, Math.min(totalSlides - 1, state.productionSlide + dir));
      if (next !== state.productionSlide) setProductionSlide(next);
    });
  }

  on(ui.categoriesGrid, 'click', (e) => {
    const screenBtn = e.target.closest('[data-open-screen]');
    if (screenBtn) {
      const target = screenBtn.dataset.openScreen;
      if (target) setScreen(target);
      return;
    }
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    openCategoryById(btn.dataset.category);
  });

  on(ui.storesList, 'click', (e) => {
    const btn = e.target.closest('[data-store-id]');
    if (!btn) return;
    state.selectedStoreId = btn.dataset.storeId;
    saveStorage();
    renderHeaderStore();
    renderStores();
    setScreen('home');
  });

  on(ui.productsList, 'click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.cart) {
      addToCart(btn.dataset.cart);
      renderProducts();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.request) {
      const id = btn.dataset.request;
      addToCart(id);
      renderCart();
      setScreen('checkout');
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyInc) {
      addToCart(btn.dataset.qtyInc);
      renderProducts();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyDec) {
      const id = btn.dataset.qtyDec;
      state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
      if (!state.cart[id]) delete state.cart[id];
      saveStorage();
      updateBadges();
      renderProducts();
      e.stopPropagation();
      return;
    }
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    touchRecentlyViewed(state.currentProduct);
    renderProductView();
    setScreen('product');
  });

  on(ui.productsSort, 'change', () => {
    state.filters.products.sort = ui.productsSort.value;
    renderProducts();
  });

  const applyProductsSearch = debounce((value, source) => {
    state.filters.products.search = String(value || '').trim();
    if (source !== 'products' && ui.productsSearch) ui.productsSearch.value = state.filters.products.search;
    if (source !== 'home' && ui.homeProductsSearch) ui.homeProductsSearch.value = state.filters.products.search;
    renderProducts();
  }, 180);

  on(ui.productsSearch, 'input', () => {
    applyProductsSearch(ui.productsSearch.value, 'products');
  });

  on(ui.homeProductsSort, 'change', () => {
    state.filters.products.sort = ui.homeProductsSort.value;
    if (ui.productsSort) ui.productsSort.value = ui.homeProductsSort.value;
    renderProducts();
  });

  on(ui.homeProductsSearch, 'input', () => {
    applyProductsSearch(ui.homeProductsSearch.value, 'home');
  });

  on(ui.promoList, 'click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.cart) {
      addToCart(btn.dataset.cart);
      renderPromos();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyInc) {
      addToCart(btn.dataset.qtyInc);
      renderPromos();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyDec) {
      const id = btn.dataset.qtyDec;
      state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
      if (!state.cart[id]) delete state.cart[id];
      saveStorage();
      updateBadges();
      renderPromos();
      e.stopPropagation();
      return;
    }
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    touchRecentlyViewed(state.currentProduct);
    renderProductView();
    setScreen('product');
  });

  on(ui.promoSort, 'change', () => {
    state.filters.promo.sort = ui.promoSort.value;
    renderPromos();
  });

  on(ui.promoTrack, 'click', (e) => {
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    touchRecentlyViewed(state.currentProduct);
    renderProductView();
    setScreen('product');
  });

  on(ui.homePopularTrack, 'click', (e) => {
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    touchRecentlyViewed(state.currentProduct);
    renderProductView();
    setScreen('product');
  });

  on(ui.themeToggleButton, 'click', () => {
    toggleTheme();
    renderProfile();
  });


  on(ui.homeProductionButton, 'click', () => {
    setScreen('production');
  });

  on(ui.productView, 'click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.open) {
      state.currentProduct = btn.dataset.open;
      touchRecentlyViewed(state.currentProduct);
      renderProductView();
      return;
    }
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); renderProductView(); }
    if (btn.dataset.request) {
      const id = btn.dataset.request;
      addToCart(id);
      renderCart();
      setScreen('checkout');
      return;
    }
    if (btn.dataset.qtyInc) { addToCart(btn.dataset.qtyInc); renderProductView(); }
    if (btn.dataset.qtyDec) {
      const id = btn.dataset.qtyDec;
      state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
      if (!state.cart[id]) delete state.cart[id];
      saveStorage();
      updateBadges();
      renderProductView();
    }
  });

  if (ui.productFavoriteTop && !ui.productFavoriteTop.dataset.bound) {
    ui.productFavoriteTop.dataset.bound = '1';
    on(ui.productFavoriteTop, 'click', (e) => {
      const id = ui.productFavoriteTop.dataset.favorite;
      if (!id) return;
      toggleFavorite(id);
      e.stopPropagation();
    });
  }


  on(ui.favoritesList, 'click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      if (btn.dataset.favorite) {
        const id = btn.dataset.favorite;
        toggleFavorite(id);
        saveStorage();
        renderFavorites();
        return;
      }
      if (btn.dataset.cart) {
        addToCart(btn.dataset.cart);
        renderFavorites();
        return;
      }
      return;
    }
  });

  on(ui.favoritesList, 'change', (e) => {
    const select = e.target.closest('input[data-fav-select]');
    if (!select) return;
    state.favoritesSelectionTouched = true;
    const id = select.dataset.favSelect;
    if (select.checked) state.selectedFavorites.add(id); else state.selectedFavorites.delete(id);
    saveStorage();
    renderFavorites();
  });

  on(ui.favoritesButton, 'click', () => { renderFavorites(); setScreen('favorites'); });
  on(ui.cartButton, 'click', () => { renderCart(); setScreen('cart'); });
  on(ui.ordersButton, 'click', () => { renderProfile(); renderOrders(); setScreen('profile'); });
  on(ui.profileButton, 'click', () => { renderProfile(); renderOrders(); setScreen('profile'); });
  on(ui.homeButton, 'click', () => { renderHomePopular(); setScreen('home'); });
  on(ui.checkoutButton, 'click', () => { renderCart(); setScreen('checkout'); });

  document.querySelectorAll('.back-button').forEach((btn) => {
    btn.addEventListener('click', () => goBack());
  });

  on(ui.favoritesToCart, 'click', () => {
    const ids = state.selectedFavorites.size ? Array.from(state.selectedFavorites) : Array.from(state.favorites);
    ids.forEach((id) => addToCart(id));
    renderFavorites();
  });
  on(ui.favoritesClear, 'click', () => {
    const ids = state.selectedFavorites.size ? Array.from(state.selectedFavorites) : Array.from(state.favorites);
    ids.forEach((id) => state.favorites.delete(id));
    state.selectedFavorites.clear();
    saveStorage();
    renderFavorites();
    updateBadges();
  });

  on(ui.cartList, 'click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.open) {
      state.currentProduct = btn.dataset.open;
      touchRecentlyViewed(state.currentProduct);
      renderProductView();
      setScreen('product');
      return;
    }
    const id = btn.dataset.qty || btn.dataset.remove;
    if (!id && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
      renderCart();
      return;
    }
    if (!id) return;
    if (btn.dataset.action === 'inc') { addToCart(id); }
    else if (btn.dataset.action === 'dec') { state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1); if (!state.cart[id]) delete state.cart[id]; saveStorage(); updateBadges(); }
    else if (btn.dataset.remove) { delete state.cart[id]; saveStorage(); updateBadges(); }
    renderCart();
  });

  on(ui.cartList, 'change', (e) => {
    const select = e.target.closest('input[data-cart-select]');
    if (!select) return;
    state.cartSelectionTouched = true;
    const id = select.dataset.cartSelect;
    if (select.checked) state.selectedCart.add(id); else state.selectedCart.delete(id);
    saveStorage();
    renderCart();
  });

  if (ui.favoritesSelectAll) ui.favoritesSelectAll.addEventListener('change', () => {
    state.favoritesSelectionTouched = true;
    const list = state.products.filter((p) => state.favorites.has(p.id));
    state.selectedFavorites = new Set(ui.favoritesSelectAll.checked ? list.map((p) => p.id) : []);
    saveStorage();
    renderFavorites();
  });

  if (ui.cartSelectAll) ui.cartSelectAll.addEventListener('change', () => {
    state.cartSelectionTouched = true;
    const items = cartItems();
    state.selectedCart = new Set(ui.cartSelectAll.checked ? items.map((i) => i.id) : []);
    saveStorage();
    renderCart();
  });

  if (ui.cartRemoveSelected) ui.cartRemoveSelected.addEventListener('click', () => {
    state.selectedCart.forEach((id) => delete state.cart[id]);
    state.selectedCart.clear();
    saveStorage();
    updateBadges();
    renderCart();
  });

  on(ui.promoApplyButton, 'click', applyPromoCode);
  on(ui.promoCodeInput, 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPromoCode();
    }
  });

  on(ui.inputDeliveryType, 'change', updateDeliveryAddressVisibility);

  on(ui.inputName, 'input', saveProfileDraft);
  on(ui.inputPhone, 'input', saveProfileDraft);
  on(ui.inputEmail, 'input', saveProfileDraft);

  on(ui.sharePhoneButton, 'click', async () => {
    if (!window.HORECA_TG?.isTelegram) {
      ui.orderStatus.textContent = 'Поделиться номером можно только внутри Telegram.';
      return;
    }
    await tryAutofillPhoneFromTelegram({ forceRequest: true });
  });

  on(ui.orderForm, 'submit', async (e) => {
    e.preventDefault();
    if (!ui.policyCheck.checked) { ui.orderStatus.textContent = 'Подтвердите согласие с политикой.'; return; }
    const items = cartItems();
    if (!items.length) { ui.orderStatus.textContent = 'Корзина пуста.'; return; }
    const profile = {
      name: ui.inputName.value.trim(),
      phone: ui.inputPhone.value.trim(),
      email: ui.inputEmail.value.trim(),
    };
    if (!profile.name || !profile.phone || !profile.email) { ui.orderStatus.textContent = 'Заполните поля.'; return; }
    if (!validatePhone(profile.phone)) { ui.orderStatus.textContent = 'Проверьте номер телефона.'; return; }
    if (!validateEmail(profile.email)) { ui.orderStatus.textContent = 'Проверьте email.'; return; }
    const deliveryType = ui.inputDeliveryType ? ui.inputDeliveryType.value : 'pickup';
    const deliveryAddress = ui.inputDeliveryAddress ? ui.inputDeliveryAddress.value.trim() : '';
    if (deliveryType === 'delivery' && !deliveryAddress) {
      ui.orderStatus.textContent = 'Укажите адрес доставки.';
      return;
    }

    state.profile = profile;
    saveStorage();
    ui.orderStatus.textContent = '';
    setScreen('pay');
    return;

    const summary = (() => {
      let sum = 0;
      let eligibleSum = 0;
      let missing = false;
      let count = 0;
      let requestCount = 0;
      items.forEach((item) => {
        count += item.qty || 0;
        if (!hasPrice(item)) {
          missing = true;
          requestCount += item.qty || 0;
          return;
        }
        const lineSum = Number(item.price || 0) * (item.qty || 0);
        sum += lineSum;
        if (state.promoKind === 'first_order' && isEligibleFirstOrderPromoItem(item)) {
          eligibleSum += lineSum;
        }
      });
      const discountPercent = Number(state.promoPercent || 0);
      const discountBase = state.promoKind === 'first_order' ? eligibleSum : sum;
      const discountAmount = discountPercent > 0 ? Math.round(discountBase * (discountPercent / 100)) : 0;
      const finalSum = Math.max(0, sum - discountAmount);
      return { sum: finalSum, baseSum: sum, discountAmount, discountPercent, missing, count, requestCount };
    })();
    const mappedItems = items.map((i) => ({
      id: i.id,
      title: i.title,
      sku: i.sku,
      price: i.price,
      qty: i.qty,
      isRequestPrice: !hasPrice(i),
    }));
    const pricedItems = mappedItems.filter((i) => !i.isRequestPrice);
    const requestPriceItems = mappedItems.filter((i) => i.isRequestPrice);

    if (summary.sum <= 0) {
      ui.orderStatus.textContent = 'В корзине нет товаров с ценой для оплаты.';
      return;
    }

    const telegramId = getTelegramId();
    const telegramUsername = getTelegramUsername();

    const order = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      customer: {
        ...profile,
        comment: ui.inputComment ? ui.inputComment.value.trim() : '',
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : '',
        telegramId,
        telegramUsername,
      },
      items: mappedItems,
      pricedItems,
      requestPriceItems,
      total: summary.sum,
      hasRequestPrice: summary.missing,
      requestPriceItemsCount: summary.requestCount,
      totalDisplay: formatSummaryTotal(summary),
      emailSummary: {
        pricedTotal: summary.sum,
        pricedTotalDisplay: `${formatPrice(summary.sum)} ₽`,
        baseTotalDisplay: `${formatPrice(summary.baseSum || summary.sum)} ₽`,
        discountAmountDisplay: summary.discountAmount ? `${formatPrice(summary.discountAmount)} ₽` : '',
        discountPercent: summary.discountPercent || 0,
        promoCode: state.promoCode || '',
        requestPriceLabel: summary.missing ? 'Запрос цены' : '',
        totalDisplay: formatSummaryTotal(summary),
      },
      telegramUserId: telegramId || null,
      status: 'Счёт отправлен',
      promo: state.promoCode ? {
        code: state.promoCode,
        percent: state.promoPercent || 0,
        discountAmount: summary.discountAmount || 0,
      } : null,
    };

    ui.orderStatus.textContent = 'Отправка данных в бот...';
    if (ui.orderSubmit) ui.orderSubmit.disabled = true;
    if (ui.orderRetry) ui.orderRetry.classList.add('hidden');

    try {
      const result = await window.HORECA_TG.sendCheckoutOrder(order);
      if (!result.ok) throw new Error(result.error || 'SEND_FAILED');

      state.orders.push(order);
      mappedItems.forEach((item) => {
        if (!item?.id) return;
        if (!state.productStats[item.id] || typeof state.productStats[item.id] !== 'object') {
          state.productStats[item.id] = { views: 0, orderedQty: 0, orderCount: 0, updatedAt: '' };
        }
        const stats = state.productStats[item.id];
        stats.orderedQty = Number(stats.orderedQty || 0) + Math.max(1, Number(item.qty || 1));
        stats.orderCount = Number(stats.orderCount || 0) + 1;
        stats.updatedAt = new Date().toISOString();
      });
      if (state.promoKind === 'first_order' && state.promoCode === FIRST_ORDER_PROMO.code) {
        const key = getPromoOwnerKey();
        state.promoUsage[key] = {
          ...(state.promoUsage[key] || {}),
          firstOrderUsed: true,
          usedAt: new Date().toISOString(),
        };
      }
      state.promoCode = '';
      state.promoPercent = 0;
      state.promoKind = '';
      state.profile = profile;
      saveStorage();
      ui.orderStatus.textContent = 'Счёт отправлен в чат бота.';
      setScreen('confirmation');
    } catch (err) {
      ui.orderStatus.textContent = 'Ошибка отправки в бот. Попробуйте ещё раз.';
      if (ui.orderRetry) ui.orderRetry.classList.remove('hidden');
    } finally {
      if (ui.orderSubmit) ui.orderSubmit.disabled = false;
    }
  });

  if (ui.orderRetry) {
    ui.orderRetry.addEventListener('click', () => {
      if (ui.orderForm) ui.orderForm.requestSubmit();
    });
  }

  on(ui.feedbackForm, 'submit', async (e) => {
    e.preventDefault();
    const name = ui.feedbackName ? ui.feedbackName.value.trim() : '';
    const phone = ui.feedbackPhone ? ui.feedbackPhone.value.trim() : '';
    const email = ui.feedbackEmail ? ui.feedbackEmail.value.trim() : '';
    const contactMethod = ui.feedbackMethod ? ui.feedbackMethod.value : 'phone';
    const comment = ui.feedbackComment ? ui.feedbackComment.value.trim() : '';

    if (!name || !phone) {
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Заполните имя и телефон.';
      return;
    }
    if (!validatePhone(phone)) {
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Проверьте номер телефона.';
      return;
    }
    if (email && !validateEmail(email)) {
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Проверьте email.';
      return;
    }
    if (!state.config.orderEndpoint) {
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Не задан адрес отправки (orderEndpoint в config.json).';
      return;
    }

    const feedback = {
      type: 'feedback',
      requestType: 'feedback',
      subject: 'Обратная связь',
      title: 'Обратная связь',
      createdAt: new Date().toISOString(),
      customer: {
        name,
        phone,
        email,
        contactMethod,
      },
      message: comment,
      source: 'miniapp',
    };

    if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Отправка...';
    try {
      const res = await fetch(state.config.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      state.profile = { ...state.profile, name, phone, email };
      saveStorage();
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Заявка отправлена. Мы скоро свяжемся с вами.';
      if (ui.feedbackComment) ui.feedbackComment.value = '';
    } catch (err) {
      if (ui.feedbackStatus) ui.feedbackStatus.textContent = 'Ошибка отправки. Попробуйте ещё раз.';
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  on(ui.menuDrawer, 'touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  on(ui.menuDrawer, 'touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > 40 && dy < 30) closeDrawer();
  });
  on(ui.overlay, 'touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  on(ui.overlay, 'touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > 40 && dy < 30) closeDrawer();
  });

  if (ui.ordersList) {
    ui.ordersList.addEventListener('click', (e) => {
      const card = e.target.closest('.order-card');
      if (!card) return;
      const orderId = Number(card.dataset.orderId);
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;

      if (e.target.closest('.order-toggle')) {
        const items = card.querySelector('.order-items');
        if (items) items.classList.toggle('hidden');
        return;
      }

      if (e.target.closest('.order-repeat')) {
        order.items.forEach((i) => {
          if (!i.id) return;
          state.cart[i.id] = (state.cart[i.id] || 0) + (i.qty || 1);
        });
        saveStorage();
        updateBadges();
        renderCart();
        setScreen('cart');
      }
    });
  }

}

function setProductionSlide(index) {
  if (!ui.productionTrack) return;
  ui.productionTrack.style.transform = `translateX(-${index * 100}%)`;
  state.productionSlide = index;
  document.querySelectorAll('[data-prod-dot]').forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.prodDot) === index);
  });
}

// Загружает конфигурацию витрины (тексты, баннеры, статьи, контакты).
async function loadConfig() {
  const res = await fetch('config.json', { cache: 'no-store' });
  state.config = await res.json();
  state.stores = normalizeStores(state.config.storeLocations);
  if (!state.selectedStoreId || !state.stores.some((s) => s.id === state.selectedStoreId)) {
    state.selectedStoreId = state.stores[0]?.id || null;
  }
  renderHeaderStore();
  renderStores();
  ui.policyLink.href = state.config.privacyPolicyUrl || '#';
  if (ui.aboutText) {
    const aboutRaw = state.config.aboutText || 'Текст будет добавлен позже.';
    if (!ui.aboutText.innerHTML.trim()) {
      if (String(aboutRaw).includes('<')) {
        ui.aboutText.innerHTML = aboutRaw;
      } else {
        ui.aboutText.innerHTML = formatMultiline(aboutRaw);
      }
    }
  }
  renderHomeBanners();
  renderHomeArticles();
  startHomeBannerAutoplay();
  ui.paymentText.innerHTML = formatMultiline(state.config.paymentText || 'Информация будет добавлена позже.');
  if (ui.productionText) {
    const prodRaw = state.config.productionText || 'Информация будет добавлена позже.';
    const prodLines = String(prodRaw).split('\n');
    const prodTitle = prodLines.shift()?.trim();
    const prodBody = prodLines.join('\n').trim();
    if (prodTitle && prodBody) {
      ui.productionText.innerHTML = `<div class="section-title">${prodTitle}</div>` + formatMultiline(prodBody);
    } else {
      ui.productionText.innerHTML = formatMultiline(prodRaw);
    }
  }
  if (state.config.contactsText) {
    ui.contactsCard.innerHTML = formatMultiline(state.config.contactsText);
  } else {
    ui.contactsCard.innerHTML = `
      <strong>${state.config.companyName || 'Demo Company'}</strong><br/>
      Телефон: ${state.config.companyPhone || '-'}<br/>
      Email: ${state.config.companyEmail || '-'}<br/>
      Адрес: ${state.config.companyAddress || '-'}
    `;
  }
  const phoneText = state.config.companyPhone || '+7 (900) 000-00-00';
  const phoneDigits = phoneText.replace(/\D/g, '');
  const menuPhone = document.getElementById('menuPhone');
  const menuCallButton = document.getElementById('menuCallButton');
  if (menuPhone) menuPhone.textContent = phoneText;
  if (menuCallButton && phoneDigits) menuCallButton.href = `tel:+${phoneDigits}`;

  ui.inputName.value = state.profile.name || '';
  ui.inputPhone.value = normalizePhone(state.profile.phone || '');
  ui.inputEmail.value = state.profile.email || '';
  if (!ui.inputName.value) ui.inputName.value = getTelegramFirstName();
  if (!ui.inputPhone.value) ui.inputPhone.value = getTelegramPhoneCandidate();
  if (ui.inputTelegramId) ui.inputTelegramId.value = getTelegramId();
  saveProfileDraft();
  updateDeliveryAddressVisibility();
  renderProfile();
  if (ui.feedbackName) ui.feedbackName.value = state.profile.name || '';
  if (ui.feedbackPhone) ui.feedbackPhone.value = state.profile.phone || '';
  if (ui.feedbackEmail) ui.feedbackEmail.value = state.profile.email || '';
}

const DATA_VERSION = '20260210-3';
// Загружает товарные данные каталога.
async function loadData() {
  reportStatus('Загружаем каталог…');
  const catRes = await fetch(`data/categories.json?v=${DATA_VERSION}`, { cache: 'no-store' });
  if (catRes.ok) {
    try {
      const catText = await catRes.text();
      state.categories = JSON.parse(catText.replace(/^\uFEFF/, ''));
    } catch (err) {
      console.error('Failed to parse categories.json', err);
    }
  } else {
    console.error('Failed to load categories.json', catRes.status);
  }

  try {
    const prodRes = await fetch(`data/products.json?v=${DATA_VERSION}`, { cache: 'no-store' });
    if (prodRes.ok) {
      const prodText = await prodRes.text();
      try {
        state.products = JSON.parse(prodText.replace(/^\uFEFF/, ''));
      } catch (err) {
        console.error('Failed to parse products.json', err);
        reportStatus(`Ошибка чтения products.json (${prodText.slice(0, 120)}…)`);
      }
    } else {
      console.error('Failed to load products.json', prodRes.status);
    }
  } catch (err) {
    console.error('Failed to load products.json', err);
  }

  state.dataLoaded = true;
  if (!state.currentGroup) {
    state.currentGroup = 'apparel';
  }
  if (ui.categoriesTitle) {
    ui.categoriesTitle.textContent = state.currentGroup === 'apparel' ? 'Каталог' : 'Аксессуары и подборки';
  }
  renderCategories();
  renderPromos();
  renderHomePopular();
  buildMenuCatalog();
  if (state.pendingCategory) {
    const pending = state.pendingCategory;
    state.pendingCategory = null;
    openCategoryById(pending);
  } else if (state.currentScreen === 'products') {
    renderProducts();
  }
  if (ui.dataStatus && state.categories.length && state.products.length) {
    ui.dataStatus.classList.add('hidden');
    ui.dataStatus.textContent = '';
  }
}

// Главная точка входа приложения.
async function init() {
  loadStorage();
  state.admin.enabled = isAdminModeRequested();
  applyAdminModeUi();
  if (state.promoCode && state.promoCode !== FIRST_ORDER_PROMO.code) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoKind = '';
  }
  if (state.promoCode === FIRST_ORDER_PROMO.code && hasUsedFirstOrderPromo()) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoKind = '';
  }
  applyTheme(state.theme);
  state.stores = getFallbackStores();
  if (!state.selectedStoreId) state.selectedStoreId = state.stores[0]?.id || null;
  state.screenStack = ['home'];
  state.currentScreen = 'home';
  // Рисуем стартовый контент главной, даже если конфиг ещё не загрузился.
  renderHomeBanners();
  renderHomeArticles();
  bindEvents();
  if (ui.productsSort) ui.productsSort.value = state.filters.products.sort;
  if (ui.homeProductsSort) ui.homeProductsSort.value = state.filters.products.sort;
  if (ui.productsSearch) ui.productsSearch.value = state.filters.products.search;
  if (ui.homeProductsSearch) ui.homeProductsSearch.value = state.filters.products.search;
  updateBottomNav('home');
  renderProfile();
  updateBadges();
  renderFavorites();
  renderCart();
  renderHomePopular();
  startHomeBannerAutoplay();
  renderHeaderStore();
  closeDrawer();
  buildMenuCatalog();

  try {
    await loadConfig();
  } catch (err) {
    console.error('loadConfig failed', err);
    if (ui.aboutText && !ui.aboutText.innerHTML.trim()) {
      ui.aboutText.textContent = 'Не удалось загрузить данные. Обновите страницу.';
    }
  }

  try {
    await loadData();
  } catch (err) {
    console.error('loadData failed', err);
    reportStatus('Ошибка загрузки каталога. Обновите страницу.');
  }
  if (!state.admin.enabled && restorePublishedState()) {
    renderHomeBanners();
    renderHomeArticles();
    renderHeaderStore();
    renderStores();
    renderCategories();
    if (state.currentScreen === 'products') renderProducts();
    if (state.currentScreen === 'product') renderProductView();
    renderPromos();
    renderHomePopular();
  }
  if (state.admin.enabled && adminRestoreDraft()) {
    renderHomeBanners();
    renderHomeArticles();
    renderHeaderStore();
    renderStores();
    renderCategories();
    if (state.currentScreen === 'products') renderProducts();
    if (state.currentScreen === 'product') renderProductView();
    renderPromos();
    renderHomePopular();
    reportStatus('Админ-черновик восстановлен');
  }
  adminRefreshBindings();
  buildMenuCatalog();
}

init();

window.addEventListener('error', (e) => {
  reportStatus(`Ошибка JS: ${e.message || 'unknown'}`);
});
window.addEventListener('unhandledrejection', (e) => {
  reportStatus(`Ошибка JS: ${e.reason || 'unknown'}`);
});

window.addEventListener('storage', (event) => {
  if (state.admin.enabled) return;
  if (event.key !== PUBLISHED_STATE_KEY && event.key !== PUBLISHED_STATE_TS_KEY) return;
  if (!restorePublishedState()) return;
  renderHomeBanners();
  renderHomeArticles();
  renderHeaderStore();
  renderStores();
  renderCategories();
  if (state.currentScreen === 'products') renderProducts();
  if (state.currentScreen === 'product') renderProductView();
  renderPromos();
  renderHomePopular();
});
