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
  promoAmount: 0,
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
  pendingPayment: null,
  admin: {
    enabled: false,
    holdMs: 4000,
    draftKey: 'demo_catalog_admin_draft_v1',
    selectionMode: false,
    selectedType: '',
    selectedId: '',
    ui: {},
  },
  saas: {
    enabled: false,
    apiBase: '',
    storeId: '',
    token: '',
    userId: '',
    stores: [],
    settings: {},
    datasetLoaded: false,
    lastPublicSyncAt: 0,
  },
};

const SAAS_TOKEN_KEY = 'demo_saas_token_v1';
const SAAS_STORE_KEY = 'demo_saas_store_id_v1';
const SAAS_API_BASE_KEY = 'demo_saas_api_base_v1';
const SAAS_DEFAULT_REMOTE_API = 'https://api.saaskatalog.ru/api';

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
  botButton: document.getElementById('botButton'),
  statsButton: document.getElementById('statsButton'),
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
  homeBlocks: document.getElementById('homeBlocks'),
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
  adminHeaderActions: document.getElementById('adminHeaderActions'),
  adminSelectToggleButton: document.getElementById('adminSelectToggleButton'),
  adminMoveUpButton: document.getElementById('adminMoveUpButton'),
  adminMoveDownButton: document.getElementById('adminMoveDownButton'),
  adminMoveLeftButton: document.getElementById('adminMoveLeftButton'),
  adminMoveRightButton: document.getElementById('adminMoveRightButton'),
  adminSaveDraftButton: document.getElementById('adminSaveDraftButton'),
  adminPublishButton: document.getElementById('adminPublishButton'),
  storeAddButton: document.getElementById('storeAddButton'),
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
  adminProfilePanel: document.getElementById('adminProfilePanel'),
  adminStoreIdValue: document.getElementById('adminStoreIdValue'),
  adminReloadStoresButton: document.getElementById('adminReloadStoresButton'),
  adminOpenBotSectionButton: document.getElementById('adminOpenBotSectionButton'),
  adminCreateStoreButton: document.getElementById('adminCreateStoreButton'),
  adminConnectBotButton: document.getElementById('adminConnectBotButton'),
  adminLogoutButton: document.getElementById('adminLogoutButton'),
  profileOrdersTitle: document.querySelector('#screen-profile .home-section-title'),
  profileHistorySection: document.getElementById('profileHistorySection'),
  statsOpenRevenueButton: document.getElementById('statsOpenRevenueButton'),
  statsOpenOrdersButton: document.getElementById('statsOpenOrdersButton'),
  statsRevenuePreview: document.getElementById('statsRevenuePreview'),
  statsOrdersPreview: document.getElementById('statsOrdersPreview'),
  statsRevenueList: document.getElementById('statsRevenueList'),
  statsOrdersList: document.getElementById('statsOrdersList'),
  profileSubscriptionSection: document.getElementById('profileSubscriptionSection'),
  subscriptionTariffs: document.getElementById('subscriptionTariffs'),
  subscriptionStatus: document.getElementById('subscriptionStatus'),
  subscriptionPayButton: document.getElementById('subscriptionPayButton'),
  profilePaymentLinkSection: document.getElementById('profilePaymentLinkSection'),
  paymentLinkForm: document.getElementById('paymentLinkForm'),
  paymentProviderInput: document.getElementById('paymentProviderInput'),
  paymentLinkInput: document.getElementById('paymentLinkInput'),
  paymentLinkStatus: document.getElementById('paymentLinkStatus'),
  paymentLinkSaveButton: document.getElementById('paymentLinkSaveButton'),
  profilePromoSection: document.getElementById('profilePromoSection'),
  promoSettingsForm: document.getElementById('promoSettingsForm'),
  promoSettingsCodeInput: document.getElementById('promoSettingsCodeInput'),
  promoSettingsTypeInput: document.getElementById('promoSettingsTypeInput'),
  promoSettingsValueInput: document.getElementById('promoSettingsValueInput'),
  promoSettingsStatus: document.getElementById('promoSettingsStatus'),
  promoSettingsList: document.getElementById('promoSettingsList'),
  payScreenTitle: document.getElementById('payScreenTitle'),
  payScreenText: document.getElementById('payScreenText'),
  payOpenLinkButton: document.getElementById('payOpenLinkButton'),
  botSettingsForm: document.getElementById('botSettingsForm'),
  botCatalogUrlInput: document.getElementById('botCatalogUrlInput'),
  botCatalogUrlCopyButton: document.getElementById('botCatalogUrlCopyButton'),
  botWelcomeImageInput: document.getElementById('botWelcomeImageInput'),
  botWelcomeImageUploadButton: document.getElementById('botWelcomeImageUploadButton'),
  botWelcomeTextInput: document.getElementById('botWelcomeTextInput'),
  botSettingsStatus: document.getElementById('botSettingsStatus'),
  botSettingsSaveButton: document.getElementById('botSettingsSaveButton'),
  homeArticleTrack: document.getElementById('homeArticleTrack'),
  themeLabel: document.getElementById('themeLabel'),
  themeToggleButton: document.getElementById('themeToggleButton'),
  themeToggleValue: document.getElementById('themeToggleValue'),
  promoCodeInput: document.getElementById('promoCodeInput'),
  promoApplyButton: document.getElementById('promoApplyButton'),
  promoStatus: document.getElementById('promoStatus'),
  homePopularTrack: document.getElementById('homePopularTrack'),
};

const SUBSCRIPTION_TARIFFS = {
  '30': { days: 30, amount: 4000, label: '30 дней' },
  '180': { days: 180, amount: 20000, label: '180 дней' },
  '365': { days: 365, amount: 30000, label: '365 дней' },
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
  const adminParam = params.get('admin');
  if (adminParam === '1' || adminParam === 'true') return true;
  if (params.get('mode') === 'admin') return true;

  const hash = String(window.location.hash || '').toLowerCase();
  if (hash.includes('admin')) return true;

  const path = String(window.location.pathname || '').toLowerCase();
  if (path.includes('admin')) return true;

  const tgStartParam = String(window.HORECA_TG?.initDataUnsafe?.start_param || '').toLowerCase();
  if (tgStartParam.includes('admin')) return true;

  const forced = String(localStorage.getItem('demo_catalog_force_admin') || '');
  if (forced === '1') return true;

  return false;
}

const FIRST_ORDER_PROMO = {
  code: 'ПЕРВЫЙ',
  percent: 10,
};

function normalizePromoCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function normalizeStorePromoRules(source) {
  if (!Array.isArray(source)) return [];
  const result = [];
  source.forEach((item) => {
    const code = normalizePromoCode(item?.code || '');
    if (!code) return;
    const type = String(item?.type || '').trim().toLowerCase() === 'fixed' ? 'fixed' : 'percent';
    const value = Math.max(0, Number(item?.value || 0));
    if (!Number.isFinite(value) || value <= 0) return;
    const active = item?.active !== false;
    result.push({
      code,
      type,
      value: type === 'percent' ? Math.min(100, Math.round(value)) : Math.round(value),
      active,
    });
  });
  return result;
}

function getStorePromoRules() {
  const settings = state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {};
  return normalizeStorePromoRules(settings.promoCodes || []);
}

function findStorePromoRule(code) {
  const promoCode = normalizePromoCode(code);
  if (!promoCode) return null;
  return getStorePromoRules().find((rule) => rule.active && rule.code === promoCode) || null;
}

function reconcileActivePromoState() {
  const activeCode = normalizePromoCode(state.promoCode || '');
  if (!activeCode) return;

  if (activeCode === FIRST_ORDER_PROMO.code) {
    if (hasUsedFirstOrderPromo()) {
      state.promoCode = '';
      state.promoPercent = 0;
      state.promoAmount = 0;
      state.promoKind = '';
      saveStorage();
    }
    return;
  }

  const rule = findStorePromoRule(activeCode);
  if (!rule) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
    state.promoKind = '';
    saveStorage();
    return;
  }

  state.promoCode = rule.code;
  state.promoPercent = rule.type === 'percent' ? rule.value : 0;
  state.promoAmount = rule.type === 'fixed' ? rule.value : 0;
  state.promoKind = rule.type === 'fixed' ? 'custom_fixed' : 'custom_percent';
}

const ADMIN_MARGIN_RATE = 0.3;
const PUBLISHED_STATE_KEY = 'demo_catalog_published_state_v1';
const PUBLISHED_STATE_TS_KEY = 'demo_catalog_published_state_ts_v1';
const HOME_BLOCK_DEFAULT_ORDER = ['banners', 'articles', 'promo', 'popular'];

function getAdminDraftKey() {
  const storePart = (state.saas.storeId || '').trim().toUpperCase();
  return storePart ? `demo_catalog_admin_draft_v1_${storePart}` : state.admin.draftKey;
}

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
    if (!state.admin.enabled) renderOrders();
  }
  if (name === 'bot') {
    renderBotSettings();
  }
  if (name === 'stats') {
    void renderAdminStatsOverview();
  }
  if (name === 'stats-revenue') {
    void renderAdminStatsRevenue();
  }
  if (name === 'stats-orders') {
    void renderAdminStatsOrders();
  }
  if (name === 'pay') {
    renderPayScreen();
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
    saasTrackEvent('begin_checkout', { payload: { cartItems: Object.keys(state.cart || {}).length } });
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
    bot: ui.botButton,
    stats: ui.statsButton,
    'stats-revenue': ui.statsButton,
    'stats-orders': ui.statsButton,
    orders: ui.profileButton,
    favorites: ui.favoritesButton,
    menu: ui.menuButton,
  };
  const defaultButton = ui.homeButton;
  const activeButton = map[screen] || defaultButton;
  [ui.homeButton, ui.menuButton, ui.cartButton, ui.favoritesButton, ui.profileButton, ui.botButton, ui.statsButton].forEach((btn) => {
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

function normalizeHomeBlockOrder(list) {
  const source = Array.isArray(list) ? list.map((item) => String(item || '')) : [];
  const unique = [];
  source.forEach((item) => {
    if (HOME_BLOCK_DEFAULT_ORDER.includes(item) && !unique.includes(item)) unique.push(item);
  });
  HOME_BLOCK_DEFAULT_ORDER.forEach((item) => {
    if (!unique.includes(item)) unique.push(item);
  });
  return unique;
}

function applyHomeBlockOrder() {
  if (!ui.homeBlocks) return;
  const order = normalizeHomeBlockOrder(state.config.homeBlockOrder);
  state.config.homeBlockOrder = order;
  order.forEach((blockId) => {
    const block = ui.homeBlocks.querySelector(`[data-home-block="${blockId}"]`);
    if (block) ui.homeBlocks.appendChild(block);
  });
}

function adminMoveHomeBlock(blockId, direction) {
  const order = normalizeHomeBlockOrder(state.config.homeBlockOrder);
  const from = order.indexOf(blockId);
  if (from < 0) return;
  const to = direction === 'up' ? from - 1 : from + 1;
  if (to < 0 || to >= order.length) return;
  const [item] = order.splice(from, 1);
  order.splice(to, 0, item);
  state.config.homeBlockOrder = order;
  applyHomeBlockOrder();
  adminSaveDraft(true);
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
  applyHomeBlockOrder();
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

function getImageUploadEndpoint() {
  if (state.saas.enabled) return '/upload-image';
  const endpoint = String(
    state.config?.imageUploadEndpoint
    || state.config?.uploadEndpoint
    || ''
  ).trim();
  if (!endpoint) return '';
  const lower = endpoint.toLowerCase();
  // Игнорируем явные заглушки, чтобы не ломать загрузку фото в админке.
  if (lower.includes('example.com') || lower.includes('your-domain')) return '';
  return endpoint;
}

function adminPickImageFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    document.body.appendChild(input);
    const clear = () => {
      input.removeEventListener('change', onChange);
      if (input.parentNode) input.parentNode.removeChild(input);
    };
    const onChange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      clear();
      resolve(file);
    };
    input.addEventListener('change', onChange, { once: true });
    input.click();
  });
}

function extractUploadedImageUrl(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload.trim();
  if (typeof payload !== 'object') return '';
  const direct = payload.url || payload.imageUrl || payload.fileUrl || payload.link;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (payload.data && typeof payload.data === 'object') {
    const nested = payload.data.url || payload.data.imageUrl || payload.data.fileUrl || payload.data.link;
    if (typeof nested === 'string' && nested.trim()) return nested.trim();
  }
  return '';
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

async function fileToOptimizedDataUrl(file) {
  const blobUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('img load failed'));
      img.src = blobUrl;
    });
    const maxSide = 1280;
    const width = Number(image.width || 0);
    const height = Number(image.height || 0);
    if (!width || !height) return fileToDataUrl(file);
    const ratio = Math.min(1, maxSide / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * ratio));
    const targetH = Math.max(1, Math.round(height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fileToDataUrl(file);
    ctx.drawImage(image, 0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    if (!dataUrl || !String(dataUrl).startsWith('data:image/')) return fileToDataUrl(file);
    return dataUrl;
  } catch {
    return fileToDataUrl(file);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function adminUploadImageFile(file) {
  if (!file) return null;
  let endpoint = getImageUploadEndpoint();
  if (state.saas.enabled && endpoint === '/upload-image') {
    const sid = String(state.saas.storeId || '').trim().toUpperCase();
    if (sid) endpoint = `${endpoint}?storeId=${encodeURIComponent(sid)}`;
  }
  if (!endpoint) {
    try {
      const asDataUrl = await fileToOptimizedDataUrl(file);
      if (!asDataUrl) {
        reportStatus('Не удалось прочитать фото');
        return null;
      }
      reportStatus('Фото добавлено (локально)');
      return asDataUrl;
    } catch {
      reportStatus('Не удалось прочитать фото');
      return null;
    }
  }
  try {
    reportStatus('Загрузка фото...');
    const form = new FormData();
    form.append('file', file, file.name || `image-${Date.now()}.jpg`);
    let payload = null;
    if (endpoint.startsWith('/')) {
      payload = await saasRequestWithForm(endpoint, form, { auth: true });
    } else {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: form,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }
    }
    const imageUrl = extractUploadedImageUrl(payload);
    if (!imageUrl) {
      throw new Error('empty upload url');
    }
    reportStatus('Фото загружено');
    return imageUrl;
  } catch {
    // Авто-fallback: если сервер недоступен, вставляем локально, чтобы админка не блокировалась.
    try {
      const asDataUrl = await fileToOptimizedDataUrl(file);
      if (!asDataUrl) {
        reportStatus('Ошибка загрузки фото');
        return null;
      }
      reportStatus('Сервер недоступен, фото добавлено локально');
      return asDataUrl;
    } catch {
      reportStatus('Ошибка загрузки фото');
      return null;
    }
  }
}

async function adminPickAndUploadImage() {
  const file = await adminPickImageFile();
  if (!file) return null;
  if (!String(file.type || '').startsWith('image/')) {
    reportStatus('Выбранный файл не является изображением');
    return null;
  }
  return adminUploadImageFile(file);
}

function adminBuildPayload() {
  return {
    config: state.config,
    settings: state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {},
    categories: state.categories,
    products: state.products,
  };
}

function adminEnsureModal() {
  if (state.admin.ui.modal) return state.admin.ui.modal;
  const modal = document.createElement('div');
  modal.className = 'admin-edit-modal hidden';
  modal.innerHTML = `
    <div class="admin-edit-card">
      <div class="admin-edit-title"></div>
      <div class="admin-edit-actions">
        <button type="button" data-admin-modal="hide-kb">Скрыть клавиатуру</button>
        <button type="button" data-admin-modal="cancel">Отмена</button>
        <button type="button" data-admin-modal="delete" class="danger hidden">Удалить</button>
        <button type="button" data-admin-modal="save" class="primary">Сохранить</button>
      </div>
      <input class="admin-edit-input hidden" type="text" />
      <textarea class="admin-edit-textarea hidden" rows="8"></textarea>
    </div>
  `;
  const card = modal.querySelector('.admin-edit-card');
  if (card) {
    const stop = (event) => event.stopPropagation();
    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach((eventName) => {
      card.addEventListener(eventName, stop, { passive: false });
    });
  }
  document.body.appendChild(modal);
  state.admin.ui.modal = modal;
  return modal;
}

function adminEnsureActionSheet() {
  if (state.admin.ui.actionSheet) return state.admin.ui.actionSheet;
  const modal = document.createElement('div');
  modal.className = 'admin-actions-modal hidden';
  modal.innerHTML = `
    <div class="admin-actions-card">
      <div class="admin-actions-title"></div>
      <div class="admin-actions-list"></div>
      <button type="button" class="admin-actions-cancel">Отмена</button>
    </div>
  `;
  document.body.appendChild(modal);
  state.admin.ui.actionSheet = modal;
  return modal;
}

function adminOpenActionSheet(title, actions = []) {
  const modal = adminEnsureActionSheet();
  const titleEl = modal.querySelector('.admin-actions-title');
  const listEl = modal.querySelector('.admin-actions-list');
  const cancelBtn = modal.querySelector('.admin-actions-cancel');
  titleEl.textContent = title || 'Действие';
  listEl.innerHTML = actions.map((action) => `
    <button type="button" class="admin-actions-item ${action.danger ? 'danger' : ''}" data-admin-action-id="${escapeHtml(action.id)}">
      ${escapeHtml(action.label)}
    </button>
  `).join('');
  modal.classList.remove('hidden');

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      modal.classList.add('hidden');
      listEl.removeEventListener('click', onClick);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onOverlay);
      resolve(value);
    };
    const onClick = (event) => {
      const btn = event.target.closest('[data-admin-action-id]');
      if (!btn) return;
      settle(btn.dataset.adminActionId || null);
    };
    const onCancel = () => settle(null);
    const onOverlay = (event) => {
      if (event.target === modal) settle(null);
    };
    listEl.addEventListener('click', onClick);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onOverlay);
  });
}

function adminEditValue(title, currentValue, { numeric = false, multiline = false, allowDelete = false } = {}) {
  const current = currentValue == null ? '' : String(currentValue);
  const modal = adminEnsureModal();
  const titleEl = modal.querySelector('.admin-edit-title');
  const input = modal.querySelector('.admin-edit-input');
  const textarea = modal.querySelector('.admin-edit-textarea');
  const hideKbBtn = modal.querySelector('[data-admin-modal="hide-kb"]');
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
  if (multiline) textarea.value = current;
  else input.value = current;

  modal.classList.remove('hidden');
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    if (multiline) focusEditor(textarea);
    else focusEditor(input);
  }

  return new Promise((resolve) => {
    let settled = false;
    const touchHandlers = [];
    const addTapHandler = (el, handler) => {
      if (!el) return;
      el.addEventListener('click', handler);
      const onTouchEnd = (event) => {
        event.preventDefault();
        event.stopPropagation();
        handler(event);
      };
      el.addEventListener('touchend', onTouchEnd, { passive: false });
      touchHandlers.push(() => {
        el.removeEventListener('click', handler);
        el.removeEventListener('touchend', onTouchEnd);
      });
    };
    const settle = (value) => {
      if (settled) return;
      settled = true;
      modal.classList.add('hidden');
      touchHandlers.forEach((unbind) => unbind());
      hideKbBtn.removeEventListener('touchstart', onHideKeyboard);
      hideKbBtn.removeEventListener('mousedown', onHideKeyboard);
      modal.removeEventListener('click', onOverlay);
      resolve(value);
    };

    const onCancel = () => settle(null);
    const onDelete = () => settle({ __delete: true });
    const onOverlay = (event) => {
      if (event.target === modal) settle(null);
    };
    const onHideKeyboard = () => {
      const active = document.activeElement;
      if (active && typeof active.blur === 'function') active.blur();
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

    addTapHandler(cancelBtn, onCancel);
    addTapHandler(saveBtn, onSave);
    addTapHandler(deleteBtn, onDelete);
    addTapHandler(hideKbBtn, onHideKeyboard);
    hideKbBtn.addEventListener('touchstart', onHideKeyboard, { passive: true });
    hideKbBtn.addEventListener('mousedown', onHideKeyboard);
    modal.addEventListener('click', onOverlay);
  });
}

function adminBindHold(el, handler) {
  if (!state.admin.enabled || !el || el.dataset.adminEditBound === '1') return;
  el.dataset.adminEditBound = '1';
  let lastTouchTs = 0;
  const flashTarget = () => {
    el.classList.remove('admin-doubletap-flash');
    void el.offsetWidth;
    el.classList.add('admin-doubletap-flash');
    window.setTimeout(() => el.classList.remove('admin-doubletap-flash'), 520);
  };

  el.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    flashTarget();
    handler();
  });

  el.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchTs <= 320) {
      event.preventDefault();
      event.stopPropagation();
      lastTouchTs = 0;
      flashTarget();
      handler();
      return;
    }
    lastTouchTs = now;
  }, { passive: false });
}

function adminBindLongPress(el, handler) {
  if (!state.admin.enabled || !el || el.dataset.adminLongBound === '1') return;
  el.dataset.adminLongBound = '1';
  let timer = null;

  const clear = () => {
    if (timer) window.clearTimeout(timer);
    timer = null;
    el.classList.remove('admin-hold-pending');
  };

  const start = (event) => {
    if (event.type === 'mousedown' && event.button !== 0) return;
    if (event.target && event.target.closest) {
      const interactive = event.target.closest('input, textarea, select, a, [data-admin-add], .qty-btn, .icon-btn');
      if (interactive && interactive !== el && el.contains(interactive)) return;
    }
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
  if (!state.currentGroup) state.currentGroup = 'apparel';
  const newCategory = {
    id: `catalog-${Date.now()}`,
    groupId: state.currentGroup || 'apparel',
    title: 'Новая категория',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=70',
  };
  state.categories.unshift(newCategory);
  state.currentCategory = newCategory.id;
  adminSaveDraft(true);
  renderCategories();
  reportStatus('Новая категория добавлена');
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

function adminAddStoreTemplate() {
  if (!Array.isArray(state.stores)) state.stores = [];
  const next = state.stores.length + 1;
  state.stores.push({
    id: `store-${Date.now()}`,
    city: `Город ${next}`,
    address: `Адрес магазина ${next}`,
  });
  state.config.storeLocations = state.stores;
  adminSaveDraft(true);
  renderHeaderStore();
  renderStores();
}

function adminSaveDraft(silent = false) {
  const payload = adminBuildPayload();
  try {
    localStorage.setItem(getAdminDraftKey(), JSON.stringify(payload));
    if (!silent) reportStatus('Черновик админки сохранен');
  } catch {
    reportStatus('Черновик не сохранен: переполнена память браузера');
  }
}

async function adminPublishToCatalog() {
  adminSaveDraft(true);
  const payload = adminBuildPayload();
  if (state.saas.enabled && state.admin.enabled && state.saas.storeId) {
    try {
      await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/data`, {
        method: 'PUT',
        auth: true,
        body: payload,
      });
      reportStatus(`Изменения выгружены в каталог ${state.saas.storeId}`);
      return;
    } catch (error) {
      reportStatus(`Ошибка выгрузки: ${error.message || 'unknown'}`);
      return;
    }
  }
  try {
    localStorage.setItem(PUBLISHED_STATE_KEY, JSON.stringify(payload));
    localStorage.setItem(PUBLISHED_STATE_TS_KEY, String(Date.now()));
    reportStatus('Изменения выгружены в каталог');
  } catch {
    reportStatus('Выгрузка не выполнена: переполнена память браузера');
  }
}

function adminRestoreDraft() {
  const raw = localStorage.getItem(getAdminDraftKey());
  if (!raw) return false;
  const parsed = safeParse(raw, null);
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.config && typeof parsed.config === 'object') state.config = parsed.config;
  if (Array.isArray(parsed.categories)) state.categories = parsed.categories;
  if (Array.isArray(parsed.products)) state.products = parsed.products;
  return true;
}

function restorePublishedState() {
  if (state.saas.datasetLoaded || state.saas.enabled) return false;
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
    adminBindLongPress(card, () => {
      adminOpenActionSheet('Баннер', [
        { id: 'open', label: 'Открыть страницу' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-text', label: 'Редактировать текст' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'open') {
          setScreen('home');
          return;
        }
        const list = Array.isArray(state.config.homeBanners) ? state.config.homeBanners : [];
        const idx = list.findIndex((x, i) => (x?.id || `banner-${i}`) === itemId);
        if (idx < 0) return;
        if (action === 'edit-image') {
          adminPickAndUploadImage().then((imageUrl) => {
            if (!imageUrl) return;
            list[idx].image = imageUrl;
            renderHomeBanners();
            adminSaveDraft(true);
          });
          return;
        }
        if (action === 'edit-title') {
          adminEditValue('Заголовок баннера', list[idx].title || '').then((value) => {
            if (value == null || value.__delete) return;
            list[idx].title = value;
            renderHomeBanners();
          });
          return;
        }
        if (action === 'edit-text') {
          adminEditValue('Текст баннера', list[idx].text || '', { multiline: true }).then((value) => {
            if (value == null || value.__delete) return;
            list[idx].text = value;
            renderHomeBanners();
          });
          return;
        }
        if (action === 'delete') {
          list.splice(idx, 1);
          renderHomeBanners();
        }
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
    adminBindLongPress(card, () => {
      adminOpenActionSheet('Статья', [
        { id: 'open', label: 'Открыть страницу' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-text', label: 'Редактировать текст' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'open') {
          setScreen(item.screen || 'about');
          return;
        }
        const list = Array.isArray(state.config.homeArticles) ? state.config.homeArticles : [];
        const idx = list.findIndex((x, i) => (x?.id || `article-${i}`) === itemId);
        if (idx < 0) return;
        if (action === 'edit-title') {
          adminEditValue('Заголовок статьи', list[idx].title || '').then((value) => {
            if (value == null || value.__delete) return;
            list[idx].title = value;
            renderHomeArticles();
          });
          return;
        }
        if (action === 'edit-text') {
          adminEditValue('Текст статьи', list[idx].text || '', { multiline: true }).then((value) => {
            if (value == null || value.__delete) return;
            list[idx].text = value;
            renderHomeArticles();
          });
          return;
        }
        if (action === 'delete') {
          list.splice(idx, 1);
          renderHomeArticles();
        }
      });
    });
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
    adminBindLongPress(card, () => {
      adminOpenActionSheet(`Категория: ${category.title}`, [
        { id: 'open', label: 'Открыть страницу' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'open') {
          openCategoryById(category.id);
          return;
        }
        if (action === 'edit-title') {
          adminEditValue(`Название категории ${category.title}`, category.title || '').then((value) => {
            if (value == null || value.__delete) return;
            category.title = value;
            renderCategories();
          });
          return;
        }
        if (action === 'edit-image') {
          adminPickAndUploadImage().then((imageUrl) => {
            if (!imageUrl) return;
            category.image = imageUrl;
            renderCategories();
            adminSaveDraft(true);
          });
          return;
        }
        if (action === 'delete') {
          state.categories = state.categories.filter((c) => c.id !== category.id);
          state.products = state.products.filter((p) => p.categoryId !== category.id);
          renderCategories();
        }
      });
    });
    const title = card.querySelector('span');
    adminBindHold(title, () => {
      adminEditValue(`Название категории ${category.title}`, category.title || '').then((value) => {
        if (value == null || value.__delete) return;
        category.title = value;
        renderCategories();
        adminSaveDraft(true);
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
    adminBindLongPress(card, () => {
      adminOpenActionSheet(`Товар: ${p.title || p.id}`, [
        { id: 'open', label: 'Открыть страницу' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'edit-description', label: 'Редактировать описание' },
        { id: 'edit-price', label: 'Изменить цену' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'open') {
          state.currentProduct = p.id;
          renderProductView();
          setScreen('product');
          return;
        }
        if (action === 'edit-title') {
          adminEditValue(`Название товара ${p.id}`, p.title || '').then((value) => {
            if (value == null || value.__delete) return;
            p.title = value;
            renderProducts();
          });
          return;
        }
        if (action === 'edit-image') {
          adminPickAndUploadImage().then((imageUrl) => {
            if (!imageUrl) return;
            if (!Array.isArray(p.images)) p.images = [];
            p.images[0] = imageUrl;
            renderProducts();
            adminSaveDraft(true);
          });
          return;
        }
        if (action === 'edit-description') {
          adminEditValue(`Краткое описание товара ${p.id}`, p.shortDescription || '', { multiline: true }).then((value) => {
            if (value == null || value.__delete) return;
            p.shortDescription = value;
            renderProducts();
          });
          return;
        }
        if (action === 'edit-price') {
          adminEditValue(`Цена товара ${p.id}`, p.price || 0, { numeric: true }).then((value) => {
            if (value == null || value.__delete) return;
            p.price = value;
            renderProducts();
          });
          return;
        }
        if (action === 'delete') {
          state.products = state.products.filter((x) => x.id !== p.id);
          renderProducts();
        }
      });
    });
    const title = card.querySelector('.product-title');
    adminBindHold(title, () => {
      adminEditValue(`Название товара ${p.id}`, p.title || '').then((value) => {
        if (value == null || value.__delete) return;
        p.title = value;
        renderProducts();
        adminSaveDraft(true);
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
    adminOpenActionSheet(`Товар: ${p.title || p.id}`, [
      { id: 'edit', label: 'Редактировать заголовок' },
      { id: 'delete', label: 'Удалить товар', danger: true },
    ]).then((action) => {
      if (!action) return;
      if (action === 'edit') {
        adminEditValue(`Название товара ${p.id}`, p.title || '').then((value) => {
          if (value == null || value.__delete) return;
          p.title = value;
          renderProductView();
        });
        return;
      }
      if (action === 'delete') {
        state.products = state.products.filter((x) => x.id !== p.id);
        state.currentProduct = null;
        renderProducts();
        goBack();
      }
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
      adminOpenActionSheet(`Фото #${index + 1}`, [
        { id: 'edit', label: 'Изменить фото' },
        { id: 'delete', label: 'Удалить фото', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (!Array.isArray(p.images)) p.images = [];
        if (action === 'edit') {
          adminPickAndUploadImage().then((imageUrl) => {
            if (!imageUrl) return;
            p.images[index] = imageUrl;
            renderProductView();
            adminSaveDraft(true);
          });
          return;
        }
        if (action === 'delete') {
          p.images.splice(index, 1);
          if (!p.images.length) p.images.push('assets/placeholder.svg');
          renderProductView();
        }
      });
    });
  });

  const specRows = ui.productView.querySelectorAll('.product-specs > div');
  specRows.forEach((row, index) => {
    adminBindHold(row, () => {
      if (!Array.isArray(p.specs)) p.specs = [];
      const current = typeof p.specs[index] === 'string' ? p.specs[index] : '';
      adminOpenActionSheet(`Характеристика #${index + 1}`, [
        { id: 'edit', label: 'Редактировать' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'edit') {
          adminEditValue(`Характеристика #${index + 1} товара ${p.id}`, current, { multiline: true }).then((value) => {
            if (value == null || value.__delete) return;
            p.specs[index] = value;
            renderProductView();
          });
          return;
        }
        if (action === 'delete') {
          p.specs.splice(index, 1);
          renderProductView();
        }
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
  if (ui.adminHeaderActions) ui.adminHeaderActions.classList.toggle('hidden', !state.admin.enabled);
  const selectButtons = Array.from(document.querySelectorAll('[data-admin-select-toggle]'));
  selectButtons.forEach((btn) => {
    const scope = String(btn.dataset.adminSelectToggle || '');
    const active = state.admin.enabled && state.admin.selectionMode && scope === state.admin.selectedType;
    btn.classList.toggle('active', active);
    btn.textContent = active ? 'Выделение: вкл' : 'Выделить';
  });
  const moveButtons = Array.from(document.querySelectorAll('[data-admin-move]'));
  moveButtons.forEach((btn) => {
    const scope = String(btn.dataset.adminMoveScope || '');
    btn.disabled = !(state.admin.enabled && state.admin.selectionMode && !!state.admin.selectedId && scope === state.admin.selectedType);
  });
  if (ui.botButton) ui.botButton.classList.toggle('nav-hidden', !state.admin.enabled);
  if (ui.statsButton) ui.statsButton.classList.toggle('nav-hidden', !state.admin.enabled);
  if (!state.admin.enabled) {
    if (ui.cartButton) ui.cartButton.classList.remove('admin-hidden-nav');
    if (ui.favoritesButton) ui.favoritesButton.classList.remove('admin-hidden-nav');
    return;
  }
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

function getSaasApiBase() {
  const normalize = (value) => String(value || '').trim().replace(/\/$/, '');
  const remapLegacyApi = (value) => {
    const raw = normalize(value);
    if (!raw) return '';
    // Автомиграция со старого lambriz API на единый SaaS API.
    if (raw.includes('lambrizsel.duckdns.org')) return SAAS_DEFAULT_REMOTE_API;
    return raw;
  };
  try {
    const params = new URLSearchParams(window.location.search || '');
    const queryApi = String(params.get('api') || '').trim();
    if (queryApi) {
      const normalized = remapLegacyApi(queryApi);
      localStorage.setItem(SAAS_API_BASE_KEY, normalized);
      return normalized;
    }
  } catch {}
  const fromStorage = remapLegacyApi(localStorage.getItem(SAAS_API_BASE_KEY) || '');
  if (fromStorage) {
    localStorage.setItem(SAAS_API_BASE_KEY, fromStorage);
    return fromStorage;
  }
  const host = String(window.location.host || '').toLowerCase();
  if (host.includes('github.io')) return remapLegacyApi(SAAS_DEFAULT_REMOTE_API);
  const fallback = `${window.location.origin}/api`;
  return remapLegacyApi(fallback);
}

function clearSaasAuth() {
  state.saas.enabled = false;
  state.saas.token = '';
  state.saas.storeId = '';
  state.saas.userId = '';
  state.saas.stores = [];
  state.saas.settings = {};
  localStorage.removeItem(SAAS_TOKEN_KEY);
  localStorage.removeItem(SAAS_STORE_KEY);
}

async function saasLoadStoresList() {
  if (!state.saas.token) return [];
  try {
    const payload = await saasRequest('/admin/stores', { auth: true });
    const stores = Array.isArray(payload?.stores) ? payload.stores : [];
    state.saas.stores = stores;
    return stores;
  } catch {
    return [];
  }
}

async function saasSwitchStore(nextStoreId) {
  const normalized = String(nextStoreId || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(normalized)) return false;
  state.saas.storeId = normalized;
  localStorage.setItem(SAAS_STORE_KEY, normalized);
  const payload = await saasRequest(`/stores/${encodeURIComponent(normalized)}/admin/data`, { auth: true });
  applyStoreDataset(payload);
  state.saas.datasetLoaded = true;
  saveStorage();
  renderHeaderStore();
  renderStores();
  renderHomeBanners();
  renderHomeArticles();
  renderHomePopular();
  renderPromos();
  renderCategories();
  renderProducts();
  renderProductView();
  renderCart();
  renderFavorites();
  renderProfile();
  renderOrders();
  reportStatus(`Переключено на магазин ${normalized}`);
  return true;
}

async function saasPromptSelectStore() {
  const stores = await saasLoadStoresList();
  if (!stores.length) {
    window.alert('Магазины не найдены для текущего аккаунта.');
    return;
  }
  const options = stores.map((s, i) => `${i + 1}. ${s.storeId} — ${s.storeName || ''}`).join('\n');
  const answer = window.prompt(`Выберите магазин:\n${options}\n\nВведите номер или Store ID:`, String(state.saas.storeId || ''));
  if (!answer) return;
  const trimmed = String(answer).trim().toUpperCase();
  const byIndex = Number(trimmed);
  const picked = Number.isFinite(byIndex) && byIndex >= 1 && byIndex <= stores.length
    ? stores[byIndex - 1]
    : stores.find((s) => String(s.storeId || '').toUpperCase() === trimmed);
  if (!picked?.storeId) {
    window.alert('Магазин не найден.');
    return;
  }
  await saasSwitchStore(picked.storeId);
}

async function saasCreateStoreFlow() {
  const storeName = String(window.prompt('Название нового магазина:', 'Новый магазин') || '').trim();
  if (!storeName) return;
  const requested = String(window.prompt('Store ID (6 символов A-Z/0-9, можно оставить пустым):', '') || '').trim().toUpperCase();
  const body = { storeName };
  if (requested) body.storeId = requested;
  try {
    const payload = await saasRequest('/admin/stores', {
      method: 'POST',
      auth: true,
      body,
    });
    const createdStoreId = String(payload?.storeId || '').trim().toUpperCase();
    if (!createdStoreId) throw new Error('INVALID_STORE_RESPONSE');
    window.alert(`Магазин создан: ${createdStoreId}`);
    await saasLoadStoresList();
    await saasSwitchStore(createdStoreId);
  } catch (error) {
    window.alert(`Ошибка создания магазина: ${String(error?.message || 'unknown')}`);
  }
}

async function saasConnectBotFlow() {
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!storeId) {
    window.alert('Сначала выберите Store ID.');
    return;
  }
  const botToken = String(window.prompt('Bot token (формат 123456:ABC...):', '') || '').trim();
  if (!botToken) return;
  const orderChatId = String(window.prompt('Chat ID для заказов (например: -1001234567890):', '') || '').trim();
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { botToken, orderChatId },
    });
    const username = String(payload?.botUsername || '').trim();
    window.alert(`Бот подключен${username ? `: ${username}` : ''}`);
    await saasLoadStoresList();
  } catch (error) {
    window.alert(`Ошибка подключения бота: ${String(error?.message || 'unknown')}`);
  }
}

function ensureSaasAuthModal() {
  if (state.admin.ui.saasAuthModal) return state.admin.ui.saasAuthModal;
  const modal = document.createElement('div');
  modal.className = 'admin-modal saas-auth-modal hidden';
  modal.innerHTML = `
    <div class="admin-modal-card saas-auth-card">
      <div class="admin-modal-head">
        <h3 class="admin-modal-title">Авторизация админки</h3>
      </div>
      <div class="saas-auth-tabs">
        <button type="button" class="saas-auth-tab active" data-auth-tab="login">Вход</button>
        <button type="button" class="saas-auth-tab" data-auth-tab="register">Регистрация</button>
      </div>
      <form class="saas-auth-form" autocomplete="on" novalidate>
        <label class="saas-auth-label">Bot ID
          <input class="admin-modal-input" name="storeId" placeholder="например: A1B2C3" required maxlength="6" />
        </label>
        <label class="saas-auth-label saas-auth-bot-token hidden">Bot token
          <input class="admin-modal-input" name="botToken" placeholder="123456:ABC..." />
        </label>
        <label class="saas-auth-label saas-auth-reset-code hidden">Код из бота
          <input class="admin-modal-input" name="resetCode" inputmode="numeric" maxlength="6" placeholder="6 цифр" />
        </label>
        <label class="saas-auth-label">Пароль
          <input class="admin-modal-input" name="password" type="password" placeholder="минимум 6 символов" required />
        </label>
        <label class="saas-auth-label saas-auth-repeat hidden">Повторите пароль
          <input class="admin-modal-input" name="passwordRepeat" type="password" placeholder="повторите пароль" />
        </label>
        <div class="saas-auth-error hidden"></div>
        <div class="admin-modal-actions">
          <button type="button" class="secondary-button" data-auth-cancel>Отмена</button>
          <button type="button" class="secondary-button" data-auth-recover>Восстановить</button>
          <button type="button" class="primary-button" data-auth-submit>Войти</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  state.admin.ui.saasAuthModal = modal;
  return modal;
}

function openSaasAuthModal() {
  const modal = ensureSaasAuthModal();
  const form = modal.querySelector('.saas-auth-form');
  const storeInput = modal.querySelector('input[name="storeId"]');
  const storeWrap = storeInput?.parentElement || null;
  const botTokenWrap = modal.querySelector('.saas-auth-bot-token');
  const botTokenInput = modal.querySelector('input[name="botToken"]');
  const resetCodeWrap = modal.querySelector('.saas-auth-reset-code');
  const resetCodeInput = modal.querySelector('input[name="resetCode"]');
  const passwordInput = modal.querySelector('input[name="password"]');
  const repeatWrap = modal.querySelector('.saas-auth-repeat');
  const repeatInput = modal.querySelector('input[name="passwordRepeat"]');
  const errorBox = modal.querySelector('.saas-auth-error');
  const submitBtn = modal.querySelector('[data-auth-submit]');
  const recoverBtn = modal.querySelector('[data-auth-recover]');
  const tabs = Array.from(modal.querySelectorAll('[data-auth-tab]'));
  let resetCode = '';
  let mode = 'login';

  const setMode = (nextMode) => {
    if (nextMode === 'register') mode = 'register';
    else if (nextMode === 'recover_code') mode = 'recover_code';
    else if (nextMode === 'recover_password') mode = 'recover_password';
    else mode = 'login';

    tabs.forEach((btn) => {
      const tabMode = btn.dataset.authTab === 'register' ? 'register' : 'login';
      btn.classList.toggle('active', tabMode === mode);
    });
    if (storeWrap) storeWrap.classList.toggle('hidden', mode === 'register');
    botTokenWrap.classList.toggle('hidden', mode !== 'register');
    resetCodeWrap.classList.toggle('hidden', mode !== 'recover_code');
    repeatWrap.classList.toggle('hidden', !(mode === 'register' || mode === 'recover_password'));
    passwordInput.parentElement.classList.toggle('hidden', mode === 'recover_code');
    const needStore = mode !== 'register';
    const needBotToken = mode === 'register';
    const needPassword = mode !== 'recover_code';
    const needResetCode = mode === 'recover_code';
    const needRepeat = (mode === 'register' || mode === 'recover_password');
    storeInput.required = needStore;
    botTokenInput.required = needBotToken;
    passwordInput.required = needPassword;
    resetCodeInput.required = needResetCode;
    repeatInput.required = needRepeat;
    storeInput.disabled = !needStore;
    botTokenInput.disabled = !needBotToken;
    passwordInput.disabled = !needPassword;
    resetCodeInput.disabled = !needResetCode;
    repeatInput.disabled = !needRepeat;
    recoverBtn.classList.toggle('hidden', mode !== 'login');
    submitBtn.textContent = mode === 'register'
      ? 'Сохранить пароль'
      : mode === 'recover_code'
        ? 'Далее'
        : mode === 'recover_password'
          ? 'Сменить пароль'
          : 'Войти';
    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.textContent = '';
    }
    if (mode !== 'register' && mode !== 'recover_password') repeatInput.value = '';
    if (mode !== 'register') botTokenInput.value = '';
    if (mode !== 'recover_code') resetCodeInput.value = '';
  };

  setMode('login');
  modal.classList.remove('hidden');
  setTimeout(() => storeInput?.focus(), 20);

  return new Promise((resolve) => {
    let submitBusy = false;
    const cleanup = () => {
      modal.classList.add('hidden');
      tabs.forEach((btn) => btn.removeEventListener('click', onTabClick));
      recoverBtn.removeEventListener('click', onRecoverClick);
      cancelBtn.removeEventListener('click', onCancel);
      submitBtn.removeEventListener('click', onSubmitClick);
      submitBtn.removeEventListener('touchend', onSubmitTouchEnd);
      recoverBtn.removeEventListener('touchend', onRecoverTouchEnd);
      form.removeEventListener('keydown', onFormKeyDown);
    };

    const showError = (message) => {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.classList.remove('hidden');
    };

    const onTabClick = (event) => {
      const btn = event.currentTarget;
      setMode(btn.dataset.authTab || 'login');
    };

    const onCancel = () => {
      cleanup();
      resolve(null);
    };

    const onSubmit = async () => {
      const storeId = String(storeInput?.value || '').trim().toUpperCase();
      const botToken = String(botTokenInput?.value || '').trim();
      const password = String(passwordInput?.value || '').trim();
      const passwordRepeat = String(repeatInput?.value || '').trim();
      const codeValue = String(resetCodeInput?.value || '').trim();
      if (mode !== 'register' && !/^[A-Z0-9]{6}$/.test(storeId)) return showError('Bot ID должен быть ровно 6 символов (A-Z, 0-9).');
      if (mode === 'recover_code') {
        if (!/^[0-9]{6}$/.test(codeValue)) return showError('Код должен быть из 6 цифр.');
        resetCode = codeValue;
        passwordInput.value = '';
        repeatInput.value = '';
        setMode('recover_password');
        setTimeout(() => passwordInput?.focus(), 20);
        return;
      }
      if (password.length < 6) return showError('Пароль должен быть не короче 6 символов.');
      if ((mode === 'register' || mode === 'recover_password') && password !== passwordRepeat) return showError('Пароли не совпадают.');
      if (mode === 'register' && !botToken.includes(':')) return showError('Введите корректный bot token.');
      if (mode === 'recover_password') {
        const telegramUserId = getTelegramId();
        try {
          await saasRequest('/auth/password-reset/confirm', {
            method: 'POST',
            body: { storeId, code: resetCode, newPassword: password, telegramUserId },
          });
          resetCode = '';
          setMode('login');
          passwordInput.value = '';
          repeatInput.value = '';
          showError('Пароль обновлён. Теперь войдите с новым паролем.');
          return;
        } catch (error) {
          const code = String(error?.message || '');
          const map = {
            RESET_CODE_NOT_FOUND: 'Код не найден. Запросите новый.',
            RESET_CODE_EXPIRED: 'Код истёк. Запросите новый.',
            RESET_CODE_INVALID: 'Неверный код.',
            RESET_CODE_BLOCKED: 'Код заблокирован после 5 попыток. Запросите новый.',
            FORBIDDEN_OWNER_MISMATCH: 'Восстановление доступно только владельцу магазина.',
          };
          return showError(map[code] || `Ошибка восстановления: ${code || 'unknown'}`);
        }
      }
      cleanup();
      resolve({ mode, storeId, password, botToken });
    };

    const triggerSubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (submitBusy) return;
      submitBusy = true;
      const active = document.activeElement;
      if (active && typeof active.blur === 'function') active.blur();
      window.setTimeout(async () => {
        try {
          await onSubmit();
        } finally {
          submitBusy = false;
        }
      }, 0);
    };

    const onSubmitClick = (event) => {
      triggerSubmit(event);
    };

    const onSubmitTouchEnd = (event) => {
      triggerSubmit(event);
    };

    const triggerRecover = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const active = document.activeElement;
      if (active && typeof active.blur === 'function') active.blur();
      window.setTimeout(() => { onRecover(); }, 0);
    };

    const onRecoverTouchEnd = (event) => {
      triggerRecover(event);
    };

    const onRecoverClick = (event) => {
      triggerRecover(event);
    };

    const onFormKeyDown = (event) => {
      if (event.key !== 'Enter') return;
      triggerSubmit(event);
    };

    const onRecover = async () => {
      const storeId = String(storeInput?.value || '').trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(storeId)) return showError('Введите корректный Bot ID перед восстановлением.');
      const telegramUserId = getTelegramId();
      if (!telegramUserId) return showError('Не удалось определить Telegram ID владельца.');
      try {
        await saasRequest('/auth/password-reset/request', {
          method: 'POST',
          body: { storeId, telegramUserId },
        });
        resetCode = '';
        setMode('recover_code');
        showError('Код отправлен в Telegram бота владельца. Введите его ниже.');
        setTimeout(() => resetCodeInput?.focus(), 20);
      } catch (error) {
        const code = String(error?.message || '');
        const map = {
          STORE_NOT_FOUND: 'Store ID не найден.',
          OWNER_TELEGRAM_ID_NOT_FOUND: 'У магазина не найден Telegram ID владельца.',
          FORBIDDEN_OWNER_MISMATCH: 'Восстановление доступно только владельцу этого магазина.',
          ADMIN_BOT_NOT_CONFIGURED: 'Бот восстановления не настроен на сервере.',
          RESET_CODE_SEND_FAILED: 'Не удалось отправить код в бота.',
        };
        showError(map[code] || `Ошибка восстановления: ${code || 'unknown'}`);
      }
    };

    tabs.forEach((btn) => btn.addEventListener('click', onTabClick));
    const cancelBtn = modal.querySelector('[data-auth-cancel]');
    recoverBtn.addEventListener('click', onRecoverClick);
    recoverBtn.addEventListener('touchend', onRecoverTouchEnd, { passive: false });
    cancelBtn.addEventListener('click', onCancel);
    submitBtn.addEventListener('click', onSubmitClick);
    submitBtn.addEventListener('touchend', onSubmitTouchEnd, { passive: false });
    form.addEventListener('keydown', onFormKeyDown);
  });
}

function buildSaasUrl(path) {
  const base = state.saas.apiBase || getSaasApiBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function saasRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body != null) headers['Content-Type'] = 'application/json';
  if (auth && state.saas.token) headers.Authorization = `Bearer ${state.saas.token}`;
  const response = await fetch(buildSaasUrl(path), {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message = payload?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload || {};
}

async function saasRequestWithForm(path, formData, { auth = false } = {}) {
  const headers = {};
  if (auth && state.saas.token) headers.Authorization = `Bearer ${state.saas.token}`;
  const response = await fetch(buildSaasUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload || {};
}

function applyStoreDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') return;
  if (dataset.config && typeof dataset.config === 'object') state.config = dataset.config;
  if (dataset.settings && typeof dataset.settings === 'object') state.saas.settings = dataset.settings;
  if (Array.isArray(dataset.categories)) state.categories = dataset.categories;
  if (Array.isArray(dataset.products)) state.products = dataset.products;
  reconcileActivePromoState();
}

function getBotSettingsDraft() {
  const settings = state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {};
  return {
    botWelcomeImage: String(settings.botWelcomeImage || '').trim(),
    botWelcomeText: String(settings.botWelcomeText || '').trim(),
  };
}

function getCurrentStoreMeta() {
  const activeStoreId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!activeStoreId || !Array.isArray(state.saas.stores)) return null;
  return state.saas.stores.find((store) => String(store?.storeId || '').trim().toUpperCase() === activeStoreId) || null;
}

function getCurrentStoreCatalogUrl() {
  const fromMeta = String(getCurrentStoreMeta()?.catalogUrl || '').trim();
  if (fromMeta) return fromMeta;
  const fromSettings = String(state.saas.settings?.catalogUrl || state.saas.settings?.storeUrl || '').trim();
  if (fromSettings) return fromSettings;
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!storeId) return '';
  const apiBase = String(state.saas.apiBase || getSaasApiBase() || '').trim();
  if (apiBase) {
    try {
      const apiUrl = new URL(apiBase);
      apiUrl.pathname = '';
      apiUrl.search = '';
      apiUrl.hash = '';
      return `${apiUrl.origin}/store/${encodeURIComponent(storeId)}`;
    } catch {}
  }
  return `${window.location.origin}/store/${encodeURIComponent(storeId)}`;
}

function renderBotSettings() {
  const settings = getBotSettingsDraft();
  if (ui.botWelcomeImageInput) ui.botWelcomeImageInput.value = settings.botWelcomeImage;
  if (ui.botWelcomeTextInput) ui.botWelcomeTextInput.value = settings.botWelcomeText;
  if (ui.botCatalogUrlInput) ui.botCatalogUrlInput.value = getCurrentStoreCatalogUrl();
  if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = '';
}

async function saveBotSettings() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  const image = String(ui.botWelcomeImageInput?.value || '').trim();
  const text = String(ui.botWelcomeTextInput?.value || '').trim();
  const patch = {
    ...(state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {}),
    botWelcomeImage: image,
    botWelcomeText: text,
  };
  if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = 'Сохраняем настройки бота...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { settings: patch },
    });
    state.saas.settings = payload?.settings && typeof payload.settings === 'object' ? payload.settings : patch;
    if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = 'Сохранено. Новое приветствие работает в /start.';
  } catch (error) {
    if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = `Ошибка сохранения: ${String(error?.message || 'unknown')}`;
  }
}

function getRequestedStoreId() {
  const params = new URLSearchParams(window.location.search || '');
  const storeParam = String(params.get('store') || '').trim();
  if (storeParam) return storeParam;
  const path = String(window.location.pathname || '');
  const match = path.match(/\/store\/([A-Za-z0-9]{6})/);
  if (match && match[1]) return String(match[1]).trim();
  const tgStore = String(window.HORECA_TG?.initDataUnsafe?.start_param || '').trim();
  if (tgStore && !tgStore.toLowerCase().includes('admin')) return tgStore;
  return '';
}

function getStorageScopeStoreId() {
  const fromState = String(state.saas.storeId || '').trim().toUpperCase();
  if (fromState) return fromState;
  const fromQuery = String(getRequestedStoreId() || '').trim().toUpperCase();
  if (fromQuery) return fromQuery;
  return 'GLOBAL';
}

function scopedStorageKey(baseKey) {
  return `${baseKey}_${getStorageScopeStoreId()}`;
}

function canUseLegacyStorageFallback() {
  const scope = getStorageScopeStoreId();
  return scope === 'GLOBAL' || scope === '111111';
}

function readScopedStorage(baseKey, defaultRaw) {
  const scoped = localStorage.getItem(scopedStorageKey(baseKey));
  if (scoped != null) return scoped;
  if (canUseLegacyStorageFallback()) {
    const legacy = localStorage.getItem(baseKey);
    if (legacy != null) return legacy;
  }
  return defaultRaw;
}

async function saasEnsureAdminSession() {
  if (!state.admin.enabled) return false;
  state.saas.apiBase = getSaasApiBase();
  const storedToken = String(localStorage.getItem(SAAS_TOKEN_KEY) || '').trim();
  const storedStoreId = String(localStorage.getItem(SAAS_STORE_KEY) || '').trim().toUpperCase();
  if (storedToken && storedStoreId) {
    state.saas.token = storedToken;
    state.saas.storeId = storedStoreId;
    state.saas.enabled = true;
    try {
      const me = await saasRequest('/auth/me', { auth: true });
      state.saas.userId = String(me?.userId || '');
      state.saas.stores = Array.isArray(me?.stores) ? me.stores : [];
    } catch {
      // токен проверим позже на загрузке датасета
    }
    return true;
  }

  while (true) {
    const authData = await openSaasAuthModal();
    if (!authData) return false;
    const { mode, storeId, password, botToken } = authData;
    const telegramUserId = getTelegramId();
    const email = String(state.profile?.email || '').trim().toLowerCase();
    try {
      let loginBotId = storeId;
      if (mode === 'register') {
        const registration = await saasRequest('/auth/register-by-bot', {
          method: 'POST',
          body: { botToken, password, telegramUserId, email },
        });
        const issuedBotId = String(registration?.botId || registration?.storeId || '').trim().toUpperCase();
        const via = String(registration?.botIdSentVia || '').trim();
        const sent = Boolean(registration?.botIdSent);
        if (sent) {
          const channelLabel = via === 'admin_bot' ? 'в admin-бот владельца' : 'в admin-бот';
          window.alert(`Регистрация завершена.\n\nBot ID отправлен ${channelLabel}.\nBot ID: ${issuedBotId}\n\nВойдите по Bot ID и паролю.`);
        } else {
          window.alert(`Регистрация завершена.\n\nBot ID: ${issuedBotId}\n\nСообщение в бот временно не отправлено. Используйте Bot ID для входа.`);
        }
        continue;
      }
      const login = await saasRequest('/auth/login', {
        method: 'POST',
        body: { botId: loginBotId, password, telegramUserId, email },
      });
      state.saas.enabled = true;
      state.saas.storeId = loginBotId;
      state.saas.token = String(login.token || '');
      state.saas.stores = Array.isArray(login.stores) ? login.stores : [];
      localStorage.setItem(SAAS_STORE_KEY, state.saas.storeId);
      localStorage.setItem(SAAS_TOKEN_KEY, state.saas.token);
      try {
        const me = await saasRequest('/auth/me', { auth: true });
        state.saas.userId = String(me?.userId || '');
        if (Array.isArray(me?.stores) && me.stores.length) state.saas.stores = me.stores;
      } catch {}
      return true;
    } catch (error) {
      const code = String(error?.message || '');
      const messageMap = {
        STORE_NOT_FOUND: 'Bot ID не найден.',
        WRONG_PASSWORD: 'Неверный пароль.',
        STORE_ALREADY_ACTIVE: 'Этот Bot ID уже активирован. Используйте вкладку "Вход".',
        STORE_NOT_ACTIVATED: 'Bot ID еще не зарегистрирован. Используйте вкладку "Регистрация".',
        BOT_TOKEN_INVALID: 'Bot token неверный.',
        BOT_TOKEN_VALIDATION_FAILED: 'Не удалось проверить bot token.',
        TELEGRAM_ID_REQUIRED: 'Не удалось определить Telegram ID. Откройте mini app из Telegram.',
        BOT_ID_SEND_FAILED: 'Не удалось отправить Bot ID в бот.',
        ADMIN_BOT_NOT_CONFIGURED: 'Admin-бот не настроен на сервере.',
        'HTTP 405': 'API сервер не подключен.',
        'HTTP 404': 'API сервер не найден.',
      };
      if (code === 'HTTP 404' || code === 'HTTP 405') {
        localStorage.removeItem(SAAS_API_BASE_KEY);
        state.saas.apiBase = getSaasApiBase();
      }
      window.alert(messageMap[code] || `Ошибка авторизации: ${code || 'unknown'}`);
    }
  }
}

async function saasLoadDatasetForCurrentContext() {
  state.saas.apiBase = getSaasApiBase();
  if (state.admin.enabled && state.saas.enabled && state.saas.storeId) {
    try {
      const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/data`, { auth: true });
      applyStoreDataset(payload);
      state.saas.datasetLoaded = true;
      return true;
    } catch (error) {
      const msg = String(error?.message || '');
      const needReauth = ['AUTH_REQUIRED', 'INVALID_TOKEN', 'SESSION_EXPIRED'].includes(msg);
      if (!needReauth) throw error;
      clearSaasAuth();
      const reloginOk = await saasEnsureAdminSession();
      if (!reloginOk) return false;
      const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/data`, { auth: true });
      applyStoreDataset(payload);
      state.saas.datasetLoaded = true;
      return true;
    }
  }
  const requestedPublicStoreId = String(getRequestedStoreId() || '').trim().toUpperCase();
  const storedPublicStoreId = String(localStorage.getItem(SAAS_STORE_KEY) || '').trim().toUpperCase();
  const publicStoreId = requestedPublicStoreId || storedPublicStoreId;
  if (!state.admin.enabled && /^[A-Z0-9]{6}$/.test(publicStoreId)) {
    const payload = await saasRequest(`/store/${encodeURIComponent(publicStoreId)}/public?_t=${Date.now()}`);
    applyStoreDataset(payload);
    state.saas.storeId = publicStoreId;
    localStorage.setItem(SAAS_STORE_KEY, publicStoreId);
    state.saas.datasetLoaded = true;
    state.saas.lastPublicSyncAt = Date.now();
    return true;
  }
  return false;
}

async function refreshPublicDataset(force = false) {
  if (state.admin.enabled) return false;
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(storeId)) return false;
  const now = Date.now();
  if (!force && (now - Number(state.saas.lastPublicSyncAt || 0) < 8000)) return false;
  try {
    const payload = await saasRequest(`/store/${encodeURIComponent(storeId)}/public?_t=${now}`);
    applyStoreDataset(payload);
    state.saas.datasetLoaded = true;
    state.saas.lastPublicSyncAt = now;
    renderHomeBanners();
    renderHomeArticles();
    renderHeaderStore();
    renderStores();
    renderCategories();
    if (state.currentScreen === 'products') renderProducts();
    if (state.currentScreen === 'product') renderProductView();
    renderPromos();
    renderHomePopular();
    buildMenuCatalog();
    return true;
  } catch {
    return false;
  }
}

function loadStorage() {
  state.favorites = new Set(safeParse(readScopedStorage('demo_catalog_favorites', '[]'), []));
  state.cart = safeParse(readScopedStorage('demo_catalog_cart', '{}'), {});
  state.selectedCart = new Set(safeParse(readScopedStorage('demo_catalog_cart_selected', '[]'), []));
  state.selectedFavorites = new Set(safeParse(readScopedStorage('demo_catalog_fav_selected', '[]'), []));
  state.profile = safeParse(readScopedStorage('demo_catalog_profile', '{}'), {});
  state.orders = safeParse(readScopedStorage('demo_catalog_orders', '[]'), []);
  state.promoCode = normalizePromoCode(readScopedStorage('demo_catalog_promo_code', ''));
  state.promoPercent = Number(readScopedStorage('demo_catalog_promo_percent', '0') || 0) || 0;
  state.promoAmount = Number(readScopedStorage('demo_catalog_promo_amount', '0') || 0) || 0;
  state.promoKind = String(readScopedStorage('demo_catalog_promo_kind', '') || '').trim();
  state.recentlyViewed = safeParse(readScopedStorage('demo_catalog_recent', '[]'), []).filter(Boolean).slice(0, 12);
  state.theme = String(readScopedStorage('demo_catalog_theme', 'dark')) === 'light' ? 'light' : 'dark';
  state.selectedStoreId = readScopedStorage('demo_catalog_selected_store', '') || null;
  state.promoUsage = safeParse(readScopedStorage('demo_catalog_promo_usage', '{}'), {});
  const productStats = safeParse(readScopedStorage('demo_catalog_product_stats', '{}'), {});
  state.productStats = productStats && typeof productStats === 'object' ? productStats : {};
  state.searchHistory = safeParse(readScopedStorage('demo_catalog_search_history', '[]'), [])
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, 8);
}

function saveStorage() {
  try {
    localStorage.setItem(scopedStorageKey('demo_catalog_favorites'), JSON.stringify(Array.from(state.favorites)));
    localStorage.setItem(scopedStorageKey('demo_catalog_cart'), JSON.stringify(state.cart));
    localStorage.setItem(scopedStorageKey('demo_catalog_cart_selected'), JSON.stringify(Array.from(state.selectedCart)));
    localStorage.setItem(scopedStorageKey('demo_catalog_fav_selected'), JSON.stringify(Array.from(state.selectedFavorites)));
    localStorage.setItem(scopedStorageKey('demo_catalog_profile'), JSON.stringify(state.profile));
    localStorage.setItem(scopedStorageKey('demo_catalog_orders'), JSON.stringify(state.orders));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_code'), state.promoCode || '');
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_percent'), String(state.promoPercent || 0));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_amount'), String(state.promoAmount || 0));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_kind'), state.promoKind || '');
    localStorage.setItem(scopedStorageKey('demo_catalog_recent'), JSON.stringify(state.recentlyViewed || []));
    localStorage.setItem(scopedStorageKey('demo_catalog_theme'), state.theme || 'dark');
    localStorage.setItem(scopedStorageKey('demo_catalog_selected_store'), state.selectedStoreId || '');
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_usage'), JSON.stringify(state.promoUsage || {}));
    localStorage.setItem(scopedStorageKey('demo_catalog_product_stats'), JSON.stringify(state.productStats || {}));
    localStorage.setItem(scopedStorageKey('demo_catalog_search_history'), JSON.stringify(state.searchHistory || []));
  } catch {
    // Игнорируем, чтобы UI не падал при переполнении хранилища.
  }
}

async function saasTrackEvent(eventType, { productId = '', payload = {} } = {}) {
  if (!state.saas.apiBase || !state.saas.storeId) return;
  try {
    const telegramUserId = getTelegramId();
    await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/events`, {
      method: 'POST',
      body: {
        eventType,
        productId: String(productId || ''),
        telegramUserId,
        payload: payload && typeof payload === 'object' ? payload : {},
      },
    });
  } catch {
    // метрики не должны ломать UX
  }
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
  const discountFixed = Math.max(0, Number(state.promoAmount || 0));
  const discountBase = state.promoKind === 'first_order' ? eligibleSum : sum;
  let discountAmount = 0;
  if (state.promoKind === 'custom_fixed') {
    discountAmount = Math.min(sum, Math.round(discountFixed));
  } else if (discountPercent > 0) {
    discountAmount = Math.round(discountBase * (discountPercent / 100));
  }
  const finalSum = Math.max(0, sum - discountAmount);
  return {
    sum: finalSum,
    baseSum: sum,
    eligibleSum,
    discountAmount,
    discountPercent,
    discountFixed,
    missing,
    count,
    requestCount,
  };
}

function formatSummaryTotal(summary) {
  const hasNumericTotal = Number(summary.sum || 0) > 0;
  let promoLabel = '';
  if (summary.discountAmount > 0) {
    promoLabel = state.promoKind === 'custom_fixed'
      ? ` (скидка ${formatPrice(summary.discountAmount)} ₽)`
      : ` (скидка ${summary.discountPercent}%)`;
  }
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

function getVisibleCategories() {
  if (state.admin.enabled) {
    if (state.currentGroup) return state.categories.filter((c) => c.groupId === state.currentGroup);
    return state.categories.slice();
  }
  const available = new Set(state.products.map((p) => p.categoryId));
  const filtered = state.categories.filter((c) => c.groupId === state.currentGroup && (available.size === 0 || available.has(c.id)));
  return filtered.length ? filtered : state.categories.filter((c) => available.has(c.id));
}

function getVisibleProducts() {
  const base = state.currentCategoryIds
    ? state.products.filter((p) => state.currentCategoryIds.includes(p.categoryId))
    : state.products.filter((p) => p.categoryId === state.currentCategory);
  return applyFilters(base, state.filters.products);
}

function adminClearSelection() {
  state.admin.selectedType = '';
  state.admin.selectedId = '';
}

function adminToggleSelectionMode(scope = '') {
  state.admin.selectionMode = !state.admin.selectionMode;
  if (!state.admin.selectionMode) adminClearSelection();
  if (state.admin.selectionMode && scope) {
    state.admin.selectedType = scope;
    state.admin.selectedId = '';
  }
  applyAdminModeUi();
  if (state.currentScreen === 'categories') renderCategories();
  if (state.currentScreen === 'products') renderProducts();
  reportStatus(state.admin.selectionMode ? 'Режим выделения включен' : 'Режим выделения выключен');
}

function adminSelectItem(type, id) {
  if (!state.admin.selectionMode) return;
  state.admin.selectedType = type;
  state.admin.selectedId = id;
  applyAdminModeUi();
  if (type === 'category') renderCategories();
  if (type === 'product') renderProducts();
}

function adminMoveSelected(direction) {
  if (!state.admin.selectionMode || !state.admin.selectedType || !state.admin.selectedId) {
    reportStatus('Сначала включите "Выделить" и выберите элемент');
    return;
  }

  if (state.admin.selectedType === 'category') {
    const visible = getVisibleCategories();
    const ids = visible.map((item) => item.id);
    const fromIdx = ids.indexOf(state.admin.selectedId);
    if (fromIdx < 0) return;
    const step = direction === 'up' ? -2 : direction === 'down' ? 2 : direction === 'left' ? -1 : 1;
    const toIdx = Math.max(0, Math.min(ids.length - 1, fromIdx + step));
    if (toIdx === fromIdx) return;
    const toId = ids[toIdx];
    const absFrom = state.categories.findIndex((item) => item.id === state.admin.selectedId);
    const absTo = state.categories.findIndex((item) => item.id === toId);
    if (absFrom < 0 || absTo < 0) return;
    const tmp = state.categories[absFrom];
    state.categories[absFrom] = state.categories[absTo];
    state.categories[absTo] = tmp;
    adminSaveDraft(true);
    renderCategories();
    reportStatus('Порядок категорий обновлен');
    return;
  }

  if (state.admin.selectedType === 'product') {
    const visible = getVisibleProducts();
    const ids = visible.map((item) => item.id);
    const fromIdx = ids.indexOf(state.admin.selectedId);
    if (fromIdx < 0) return;
    const step = (direction === 'up' || direction === 'left') ? -1 : 1;
    const toIdx = Math.max(0, Math.min(ids.length - 1, fromIdx + step));
    if (toIdx === fromIdx) return;
    const toId = ids[toIdx];
    const absFrom = state.products.findIndex((item) => item.id === state.admin.selectedId);
    const absTo = state.products.findIndex((item) => item.id === toId);
    if (absFrom < 0 || absTo < 0) return;
    const tmp = state.products[absFrom];
    state.products[absFrom] = state.products[absTo];
    state.products[absTo] = tmp;
    adminSaveDraft(true);
    renderProducts();
    reportStatus('Порядок товаров обновлен');
  }
}

function renderCategories() {
  const list = getVisibleCategories();
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
    const fallbackProductImage = firstProduct && Array.isArray(firstProduct.images) && firstProduct.images[0] ? firstProduct.images[0] : '';
    const image = String(c.image || '').trim() || fallbackProductImage;
    const selectedClass = state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'category' && state.admin.selectedId === c.id
      ? ' admin-selected-target'
      : '';
    return `
    <button class="category-card${selectedClass}" data-category="${c.id}">
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
    <article class="product-card${state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'product' && state.admin.selectedId === p.id ? ' admin-selected-target' : ''}" data-open="${p.id}">
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
  const list = getVisibleProducts();
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
  if (state.admin.enabled) return;
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
  saasTrackEvent('view_product', { productId, payload: { screen: state.currentScreen } });
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
      adminBindLongPress(btn, () => {
        adminOpenActionSheet(`Адрес: ${store.city}`, [
          { id: 'open', label: 'Открыть страницу' },
          { id: 'edit-city', label: 'Изменить город' },
          { id: 'edit-address', label: 'Изменить полный адрес' },
          { id: 'delete', label: 'Удалить адрес', danger: true },
        ]).then((action) => {
          if (!action) return;
          if (action === 'open') {
            state.selectedStoreId = store.id;
            saveStorage();
            renderHeaderStore();
            renderStores();
            setScreen('home');
            return;
          }
          if (action === 'edit-city') {
            adminEditValue('Город', store.city || '').then((value) => {
              if (value == null || value.__delete) return;
              store.city = String(value).trim() || store.city;
              state.config.storeLocations = state.stores;
              adminSaveDraft(true);
              renderStores();
              renderHeaderStore();
            });
            return;
          }
          if (action === 'edit-address') {
            adminEditValue('Полный адрес', store.address || '', { multiline: true }).then((value) => {
              if (value == null || value.__delete) return;
              store.address = String(value).trim() || store.address;
              state.config.storeLocations = state.stores;
              adminSaveDraft(true);
              renderStores();
            });
            return;
          }
          if (action === 'delete') {
            state.stores = state.stores.filter((item) => item.id !== store.id);
            if (!state.stores.length) state.stores = getFallbackStores();
            state.config.storeLocations = state.stores;
            if (state.selectedStoreId === store.id) state.selectedStoreId = state.stores[0]?.id || null;
            adminSaveDraft(true);
            renderStores();
            renderHeaderStore();
          }
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
    if (state.promoPercent > 0 || state.promoKind === 'custom_fixed') {
      const kindLabel = state.promoKind === 'first_order'
        ? 'на товары без скидки'
        : state.promoKind === 'custom_fixed'
          ? 'фиксированная сумма'
          : '';
      const discountLabel = state.promoKind === 'custom_fixed'
        ? `${formatPrice(state.promoAmount || 0)} ₽`
        : `${state.promoPercent}%`;
      ui.promoStatus.textContent = `Скидка ${discountLabel} активна (${state.promoCode}) ${kindLabel}. Экономия: ${formatPrice(summary.discountAmount || 0)} ₽.`;
    } else if (/актив/i.test(ui.promoStatus.textContent || '')) {
      ui.promoStatus.textContent = '';
    }
  }
}

function renderOrders() {
  if (state.admin.enabled) {
    if (ui.ordersList) ui.ordersList.innerHTML = '';
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

async function getAdminAnalyticsData() {
  let orders = state.orders.slice();
  let remoteMetrics = null;
  if (state.saas.storeId && state.saas.token) {
    try {
      const storeId = encodeURIComponent(state.saas.storeId);
      const [ordersRes, metricsRes] = await Promise.all([
        saasRequest(`/stores/${storeId}/admin/orders`, { auth: true }),
        saasRequest(`/stores/${storeId}/admin/metrics`, { auth: true }),
      ]);
      if (Array.isArray(ordersRes?.orders)) orders = ordersRes.orders;
      if (metricsRes?.metrics && typeof metricsRes.metrics === 'object') remoteMetrics = metricsRes.metrics;
    } catch {
      // fallback to local analytics
    }
  }
  orders = orders.slice().sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
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
  return { orders, monthMap, remoteMetrics };
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

async function renderAdminSalesAnalytics() {
  let orders = state.orders.slice();
  let remoteMetrics = null;
  if (state.saas.storeId && state.saas.token) {
    try {
      const storeId = encodeURIComponent(state.saas.storeId);
      const [ordersRes, metricsRes] = await Promise.all([
        saasRequest(`/stores/${storeId}/admin/orders`, { auth: true }),
        saasRequest(`/stores/${storeId}/admin/metrics`, { auth: true }),
      ]);
      if (Array.isArray(ordersRes?.orders)) orders = ordersRes.orders;
      if (metricsRes?.metrics && typeof metricsRes.metrics === 'object') remoteMetrics = metricsRes.metrics;
    } catch {
      // fallback to local analytics
    }
  }

  orders = orders.slice().sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
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

  const topProductsHtml = Array.isArray(remoteMetrics?.topProducts) && remoteMetrics.topProducts.length
    ? `
      <div class="admin-analytics-months">
        ${remoteMetrics.topProducts.slice(0, 5).map((item) => `
          <div class="admin-month-card">
            <div class="admin-month-title">${escapeHtml(item.title || 'Товар')}</div>
            <div class="admin-month-meta">Шт: ${formatPrice(Number(item.qty || 0))}</div>
            <div class="admin-month-meta">Выручка: ${formatPrice(Number(item.revenue || 0))} ₽</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  ui.ordersList.innerHTML = `
    <button class="admin-analytics-card" data-admin-report="month-current" type="button">
      <div class="admin-analytics-label">Маржа за текущий месяц</div>
      <div class="admin-analytics-value">${formatPrice(thisMonth.margin)} ₽</div>
      <div class="admin-analytics-meta">${adminMonthLabel(thisMonthKey)} • заказов: ${thisMonth.count}</div>
    </button>
    ${remoteMetrics
      ? `
        <div class="admin-analytics-card">
          <div class="admin-analytics-label">Конверсия</div>
          <div class="admin-analytics-value">${Number(remoteMetrics.conversion || 0).toLocaleString('ru-RU')}%</div>
          <div class="admin-analytics-meta">Checkout: ${formatPrice(Number(remoteMetrics.beginCheckout || 0))} • Заказы: ${formatPrice(Number(remoteMetrics.ordersTotal || 0))}</div>
        </div>
      `
      : ''}
    ${topProductsHtml}

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

async function renderAdminStatsOverview() {
  if (!state.admin.enabled) return;
  const { orders, monthMap } = await getAdminAnalyticsData();
  const thisMonthKey = adminMonthKey(new Date().toISOString());
  const thisMonth = monthMap.get(thisMonthKey) || { total: 0, margin: 0, count: 0 };
  if (ui.statsRevenuePreview) ui.statsRevenuePreview.textContent = `${formatPrice(thisMonth.total)} ₽`;
  if (ui.statsOrdersPreview) ui.statsOrdersPreview.textContent = String(orders.length);
}

async function renderAdminStatsRevenue() {
  if (!state.admin.enabled || !ui.statsRevenueList) return;
  const { monthMap, remoteMetrics } = await getAdminAnalyticsData();
  const monthEntries = Array.from(monthMap.entries()).sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  if (!monthEntries.length) {
    ui.statsRevenueList.innerHTML = '<div class="text-card">Пока нет данных по выручке.</div>';
    return;
  }

  const topProductsHtml = Array.isArray(remoteMetrics?.topProducts) && remoteMetrics.topProducts.length
    ? `
      <div class="admin-analytics-months">
        ${remoteMetrics.topProducts.slice(0, 5).map((item) => `
          <div class="admin-month-card">
            <div class="admin-month-title">${escapeHtml(item.title || 'Товар')}</div>
            <div class="admin-month-meta">Шт: ${formatPrice(Number(item.qty || 0))}</div>
            <div class="admin-month-meta">Выручка: ${formatPrice(Number(item.revenue || 0))} ₽</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  ui.statsRevenueList.innerHTML = `
    ${topProductsHtml}
    <div class="admin-analytics-months">
      ${monthEntries.map(([key, stat]) => `
        <button class="admin-month-card" data-admin-month="${escapeHtml(key)}" type="button">
          <div class="admin-month-title">${escapeHtml(adminMonthLabel(key))}</div>
          <div class="admin-month-meta">Выручка: ${formatPrice(stat.total)} ₽</div>
          <div class="admin-month-meta">Маржа: ${formatPrice(stat.margin)} ₽</div>
          <div class="admin-month-meta">Заказов: ${stat.count}</div>
        </button>
      `).join('')}
    </div>
  `;

  const openMonthReport = (key) => {
    const stat = monthMap.get(key);
    if (!stat) return;
    adminOpenReportModal(
      `Выручка: ${adminMonthLabel(key)}`,
      `
        <div><strong>Заказов:</strong> ${stat.count}</div>
        <div><strong>Выручка:</strong> ${formatPrice(stat.total)} ₽</div>
        <div><strong>Маржа:</strong> ${formatPrice(stat.margin)} ₽</div>
      `
    );
  };
  ui.statsRevenueList.querySelectorAll('[data-admin-month]').forEach((btn) => {
    btn.addEventListener('click', () => openMonthReport(btn.dataset.adminMonth || ''));
  });
}

async function renderAdminStatsOrders() {
  if (!state.admin.enabled || !ui.statsOrdersList) return;
  const { orders } = await getAdminAnalyticsData();
  if (!orders.length) {
    ui.statsOrdersList.innerHTML = '<div class="text-card">Покупок пока нет.</div>';
    return;
  }

  ui.statsOrdersList.innerHTML = `
    <div class="admin-analytics-orders">
      ${orders.map((order) => `
        <button class="admin-order-card" data-admin-order="${order.id}" type="button">
          <div class="admin-order-head">
            <strong>${escapeHtml(order.customer?.name || 'Клиент')}</strong>
            <span>${new Date(order.createdAt).toLocaleString('ru-RU')}</span>
          </div>
          <div class="admin-order-meta">Телефон: ${escapeHtml(order.customer?.phone || '—')}</div>
          <div class="admin-order-meta">Email: ${escapeHtml(order.customer?.email || '—')}</div>
          <div class="admin-order-meta">Сумма: ${escapeHtml(order.totalDisplay || `${formatPrice(adminOrderTotal(order))} ₽`)}</div>
        </button>
      `).join('')}
    </div>
  `;

  ui.statsOrdersList.querySelectorAll('[data-admin-order]').forEach((btn) => {
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
          <div><strong>Telegram ID:</strong> ${escapeHtml(order.customer?.telegramId || order.telegramUserId || '—')}</div>
          <div><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</div>
          <div><strong>Сумма:</strong> ${escapeHtml(order.totalDisplay || `${formatPrice(adminOrderTotal(order))} ₽`)}</div>
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
  if (ui.adminProfilePanel) {
    const showAdminPanel = Boolean(state.admin.enabled && state.saas.storeId);
    ui.adminProfilePanel.classList.toggle('hidden', !showAdminPanel);
    if (showAdminPanel && ui.adminStoreIdValue) {
      ui.adminStoreIdValue.textContent = state.saas.storeId;
    }
  }
  if (ui.profileSubscriptionSection) {
    ui.profileSubscriptionSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (ui.profilePaymentLinkSection) {
    ui.profilePaymentLinkSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (state.admin.enabled) renderPaymentLinkSettings();
  renderAdminPromoSettings();
  if (state.admin.enabled && ui.subscriptionStatus) {
    const t = getSelectedSubscriptionTariff();
    ui.subscriptionStatus.textContent = `Выбран тариф: ${t.label} — ${formatPrice(t.amount)} ₽`;
  }
  if (ui.profileHistorySection) {
    ui.profileHistorySection.classList.toggle('hidden', state.admin.enabled);
  }
}

function getPaymentLinkSettingsDraft() {
  const settings = state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {};
  const provider = String(
    settings.paymentProvider
    || settings.paymentGatewayProvider
    || 'yookassa'
  ).trim().toLowerCase();
  const urlTemplate = String(
    settings.paymentUrlTemplate
    || settings.paymentLinkUrl
    || settings.paymentUrl
    || settings.yookassaUrl
    || ''
  ).trim();
  return {
    provider: provider || 'yookassa',
    urlTemplate,
  };
}

function renderPaymentLinkSettings() {
  const draft = getPaymentLinkSettingsDraft();
  if (ui.paymentProviderInput) ui.paymentProviderInput.value = draft.provider;
  if (ui.paymentLinkInput) ui.paymentLinkInput.value = draft.urlTemplate;
  if (ui.paymentLinkStatus) {
    ui.paymentLinkStatus.textContent = draft.urlTemplate
      ? `Текущая ссылка оплаты подключена (${draft.provider}).`
      : 'Ссылка оплаты пока не задана.';
  }
}

async function savePaymentLinkSettings() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  const provider = String(ui.paymentProviderInput?.value || 'custom').trim().toLowerCase();
  const urlTemplate = String(ui.paymentLinkInput?.value || '').trim();
  if (!urlTemplate) {
    if (ui.paymentLinkStatus) ui.paymentLinkStatus.textContent = 'Введите ссылку оплаты.';
    return;
  }
  const patch = {
    ...(state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {}),
    paymentProvider: provider,
    paymentUrlTemplate: urlTemplate,
  };
  if (ui.paymentLinkStatus) ui.paymentLinkStatus.textContent = 'Сохраняем ссылку оплаты...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { settings: patch },
    });
    state.saas.settings = payload?.settings && typeof payload.settings === 'object' ? payload.settings : patch;
    if (ui.paymentLinkStatus) ui.paymentLinkStatus.textContent = `Сохранено. Провайдер: ${provider}.`;
  } catch (error) {
    if (ui.paymentLinkStatus) ui.paymentLinkStatus.textContent = `Ошибка сохранения: ${String(error?.message || 'unknown')}`;
  }
}

function renderAdminPromoSettings() {
  if (!ui.profilePromoSection) return;
  const show = Boolean(state.admin.enabled);
  ui.profilePromoSection.classList.toggle('hidden', !show);
  if (!show) return;

  const rules = getStorePromoRules();
  if (ui.promoSettingsList) {
    if (!rules.length) {
      ui.promoSettingsList.innerHTML = '<div class="text-card">Промокоды пока не добавлены.</div>';
    } else {
      ui.promoSettingsList.innerHTML = rules.map((rule) => `
        <div class="promo-admin-item">
          <div class="promo-admin-title">${escapeHtml(rule.code)}</div>
          <div class="promo-admin-meta">${rule.type === 'fixed' ? `Скидка ${formatPrice(rule.value)} ₽` : `Скидка ${rule.value}%`}</div>
          <button class="ghost-button promo-admin-delete" data-promo-remove="${escapeHtml(rule.code)}" type="button">Удалить</button>
        </div>
      `).join('');
    }
  }
}

async function saveAdminPromoCode() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  const code = normalizePromoCode(ui.promoSettingsCodeInput?.value || '');
  const type = String(ui.promoSettingsTypeInput?.value || 'percent').trim().toLowerCase() === 'fixed' ? 'fixed' : 'percent';
  const rawValue = Number(ui.promoSettingsValueInput?.value || 0);
  const value = type === 'fixed'
    ? Math.max(1, Math.round(rawValue))
    : Math.max(1, Math.min(100, Math.round(rawValue)));

  if (!code) {
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = 'Введите промокод.';
    return;
  }
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = 'Введите корректное значение скидки.';
    return;
  }

  const nextRules = getStorePromoRules().filter((rule) => rule.code !== code);
  nextRules.push({ code, type, value, active: true });
  const patch = {
    ...(state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {}),
    promoCodes: nextRules,
  };
  if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = 'Сохраняем промокод...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { settings: patch },
    });
    state.saas.settings = payload?.settings && typeof payload.settings === 'object' ? payload.settings : patch;
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
    state.promoKind = '';
    saveStorage();
    renderCart();
    renderAdminPromoSettings();
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = `Промокод ${code} сохранен.`;
  } catch (error) {
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = `Ошибка сохранения: ${String(error?.message || 'unknown')}`;
  }
}

async function removeAdminPromoCode(codeRaw) {
  if (!state.admin.enabled || !state.saas.storeId) return;
  const code = normalizePromoCode(codeRaw);
  if (!code) return;
  const nextRules = getStorePromoRules().filter((rule) => rule.code !== code);
  const patch = {
    ...(state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {}),
    promoCodes: nextRules,
  };
  if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = `Удаляем ${code}...`;
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { settings: patch },
    });
    state.saas.settings = payload?.settings && typeof payload.settings === 'object' ? payload.settings : patch;
    if (state.promoCode === code) {
      state.promoCode = '';
      state.promoPercent = 0;
      state.promoAmount = 0;
      state.promoKind = '';
      saveStorage();
      renderCart();
    }
    renderAdminPromoSettings();
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = `Промокод ${code} удален.`;
  } catch (error) {
    if (ui.promoSettingsStatus) ui.promoSettingsStatus.textContent = `Ошибка удаления: ${String(error?.message || 'unknown')}`;
  }
}

function resolveOrderPaymentLink(order, amountValue) {
  const draft = getPaymentLinkSettingsDraft();
  const template = String(draft.urlTemplate || '').trim();
  if (!template) return { url: '', provider: draft.provider || 'custom' };
  const data = {
    store_id: String(state.saas.storeId || '').trim().toUpperCase(),
    order_id: String(order?.id || '').trim(),
    amount: String(Math.max(0, Number(amountValue || 0))),
    currency: String(order?.currency || 'RUB'),
    telegram_user_id: String(order?.telegramUserId || getTelegramId() || ''),
  };
  let built = template;
  Object.entries(data).forEach(([key, value]) => {
    built = built.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(String(value || '')));
  });
  return { url: built, provider: draft.provider || 'custom' };
}

function openExternalPaymentLink(url) {
  const safe = String(url || '').trim();
  if (!safe) return;
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(safe, { try_instant_view: false });
    return;
  }
  window.open(safe, '_blank', 'noopener');
}

function renderPayScreen() {
  const provider = String(state.pendingPayment?.provider || '').trim();
  const providerLabelMap = {
    yookassa: 'ЮKassa',
    tbank: 'Т-Банк',
    custom: 'Платёжный провайдер',
  };
  const providerLabel = providerLabelMap[provider] || 'Платёжный провайдер';
  if (ui.payScreenTitle) ui.payScreenTitle.textContent = `Оплата через ${providerLabel}`;
  if (ui.payScreenText) {
    ui.payScreenText.textContent = state.pendingPayment?.url
      ? 'Нажмите кнопку ниже, чтобы открыть страницу оплаты.'
      : 'Ссылка оплаты не настроена.';
  }
  if (ui.payOpenLinkButton) {
    ui.payOpenLinkButton.disabled = !state.pendingPayment?.url;
  }
}

function getSelectedSubscriptionTariff() {
  const checked = document.querySelector('input[name="subscriptionTariff"]:checked');
  const code = String(checked?.value || '30');
  return SUBSCRIPTION_TARIFFS[code] || SUBSCRIPTION_TARIFFS['30'];
}

function resolveSubscriptionPaymentLink(tariff) {
  const daysKey = String(tariff?.days || '');
  const fromSettingsMap = state.saas.settings?.subscriptionLinks && typeof state.saas.settings.subscriptionLinks === 'object'
    ? String(state.saas.settings.subscriptionLinks[daysKey] || '').trim()
    : '';
  if (fromSettingsMap) return fromSettingsMap;

  const fromConfigMap = state.config?.subscriptionLinks && typeof state.config.subscriptionLinks === 'object'
    ? String(state.config.subscriptionLinks[daysKey] || '').trim()
    : '';
  if (fromConfigMap) return fromConfigMap;

  const direct = String(
    state.saas.settings?.subscriptionPaymentUrl
    || state.saas.settings?.yookassaUrl
    || state.config?.subscriptionPaymentUrl
    || state.config?.yookassaUrl
    || ''
  ).trim();
  if (!direct) return '';

  try {
    const u = new URL(direct);
    u.searchParams.set('store_id', String(state.saas.storeId || '').trim().toUpperCase());
    u.searchParams.set('tariff_days', String(tariff.days));
    u.searchParams.set('amount', String(tariff.amount));
    const tgId = getTelegramId();
    if (tgId) u.searchParams.set('telegram_user_id', tgId);
    return u.toString();
  } catch {
    return direct;
  }
}

function openSubscriptionPayment() {
  if (!state.admin.enabled) return;
  const tariff = getSelectedSubscriptionTariff();
  const link = resolveSubscriptionPaymentLink(tariff);
  if (!link) {
    if (ui.subscriptionStatus) {
      ui.subscriptionStatus.textContent = 'Ссылка оплаты не настроена. Добавьте subscriptionPaymentUrl или subscriptionLinks в настройках магазина.';
    }
    return;
  }
  if (ui.subscriptionStatus) {
    ui.subscriptionStatus.textContent = `Переход к оплате: ${tariff.label} — ${formatPrice(tariff.amount)} ₽`;
  }
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(link, { try_instant_view: false });
    return;
  }
  window.open(link, '_blank', 'noopener');
}

function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function applyPromoCode() {
  const code = normalizePromoCode(ui.promoCodeInput?.value || '');
  if (!code) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
    state.promoKind = '';
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод очищен.';
    saveStorage();
    renderCart();
    return;
  }
  const customRule = findStorePromoRule(code);
  if (customRule) {
    state.promoCode = customRule.code;
    state.promoPercent = customRule.type === 'percent' ? customRule.value : 0;
    state.promoAmount = customRule.type === 'fixed' ? customRule.value : 0;
    state.promoKind = customRule.type === 'fixed' ? 'custom_fixed' : 'custom_percent';
    if (ui.promoStatus) {
      const label = customRule.type === 'fixed'
        ? `${formatPrice(customRule.value)} ₽`
        : `${customRule.value}%`;
      ui.promoStatus.textContent = `Промокод "${customRule.code}" активирован: скидка ${label}.`;
    }
    saveStorage();
    renderCart();
    return;
  }

  if (code !== FIRST_ORDER_PROMO.code) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
    state.promoKind = '';
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод не найден.';
    saveStorage();
    renderCart();
    return;
  }
  if (hasUsedFirstOrderPromo()) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
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
  state.promoAmount = 0;
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
  saasTrackEvent('add_to_cart', { productId: id, payload: { qty: state.cart[id] } });
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
  on(ui.adminSaveDraftButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminSaveDraft();
  });
  on(ui.adminSelectToggleButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminToggleSelectionMode();
  });
  on(ui.adminMoveUpButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminMoveSelected('up');
  });
  on(ui.adminMoveDownButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminMoveSelected('down');
  });
  on(ui.adminMoveLeftButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminMoveSelected('left');
  });
  on(ui.adminMoveRightButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminMoveSelected('right');
  });
  on(ui.adminPublishButton, 'click', async () => {
    if (!state.admin.enabled) return;
    await adminPublishToCatalog();
  });
  on(ui.headerStoreButton, 'click', () => {
    if (state.admin.enabled) return;
    renderStores();
    setScreen('stores');
  });
  if (state.admin.enabled && ui.headerStoreButton) {
    adminBindLongPress(ui.headerStoreButton, () => {
      const selected = getSelectedStore();
      if (!selected) return;
      adminOpenActionSheet(`Текущий адрес: ${selected.city}`, [
        { id: 'open', label: 'Открыть страницу' },
        { id: 'edit-city', label: 'Изменить город' },
        { id: 'edit-address', label: 'Изменить полный адрес' },
      ]).then((action) => {
        if (!action) return;
        if (action === 'open') {
          renderStores();
          setScreen('stores');
          return;
        }
        if (action === 'edit-city') {
          adminEditValue('Город', selected.city || '').then((value) => {
            if (value == null || value.__delete) return;
            selected.city = String(value).trim() || selected.city;
            state.config.storeLocations = state.stores;
            adminSaveDraft(true);
            renderHeaderStore();
            renderStores();
          });
        }
        if (action === 'edit-address') {
          adminEditValue('Полный адрес', selected.address || '', { multiline: true }).then((value) => {
            if (value == null || value.__delete) return;
            selected.address = String(value).trim() || selected.address;
            state.config.storeLocations = state.stores;
            adminSaveDraft(true);
            renderStores();
          });
        }
      });
    });
  }
  on(ui.storeAddButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminAddStoreTemplate();
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
  on(ui.adminReloadStoresButton, 'click', () => {
    if (!state.admin.enabled) return;
    void saasPromptSelectStore();
  });
  on(ui.adminOpenBotSectionButton, 'click', () => {
    if (!state.admin.enabled) return;
    renderBotSettings();
    setScreen('bot');
  });
  on(ui.adminCreateStoreButton, 'click', () => {
    if (!state.admin.enabled) return;
    void saasCreateStoreFlow();
  });
  on(ui.adminConnectBotButton, 'click', () => {
    if (!state.admin.enabled) return;
    void saasConnectBotFlow();
  });
  on(ui.adminLogoutButton, 'click', () => {
    clearSaasAuth();
    reportStatus('Сессия админки завершена');
    window.location.reload();
  });
  on(ui.subscriptionTariffs, 'change', () => {
    if (!state.admin.enabled || !ui.subscriptionStatus) return;
    const t = getSelectedSubscriptionTariff();
    ui.subscriptionStatus.textContent = `Выбран тариф: ${t.label} — ${formatPrice(t.amount)} ₽`;
  });
  on(ui.subscriptionPayButton, 'click', () => {
    openSubscriptionPayment();
  });
  on(ui.paymentLinkForm, 'submit', async (e) => {
    e.preventDefault();
    await savePaymentLinkSettings();
  });
  on(ui.promoSettingsForm, 'submit', async (e) => {
    e.preventDefault();
    await saveAdminPromoCode();
  });
  on(ui.promoSettingsList, 'click', async (e) => {
    const btn = e.target.closest('[data-promo-remove]');
    if (!btn) return;
    const code = String(btn.dataset.promoRemove || '').trim();
    if (!code) return;
    await removeAdminPromoCode(code);
  });
  on(ui.payOpenLinkButton, 'click', () => {
    if (!state.pendingPayment?.url) return;
    openExternalPaymentLink(state.pendingPayment.url);
  });
  on(ui.botWelcomeImageUploadButton, 'click', async () => {
    if (!state.admin.enabled) return;
    const imageUrl = await adminPickAndUploadImage();
    if (!imageUrl) return;
    if (ui.botWelcomeImageInput) ui.botWelcomeImageInput.value = imageUrl;
    if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = 'Картинка загружена. Нажмите "Сохранить в боте".';
  });
  on(ui.botCatalogUrlCopyButton, 'click', async () => {
    const value = String(ui.botCatalogUrlInput?.value || '').trim();
    if (!value) {
      reportStatus('Ссылка каталога не найдена');
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const temp = document.createElement('textarea');
        temp.value = value;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = 'Ссылка скопирована';
    } catch {
      if (ui.botSettingsStatus) ui.botSettingsStatus.textContent = 'Не удалось скопировать ссылку';
    }
  });
  on(ui.botSettingsForm, 'submit', async (e) => {
    e.preventDefault();
    if (!state.admin.enabled) return;
    await saveBotSettings();
  });
  on(document, 'click', (e) => {
    const addBtn = e.target.closest('[data-admin-add]');
    if (!addBtn) return;
    e.preventDefault();
    e.stopPropagation();
    handleAdminInlineAdd(addBtn.dataset.adminAdd || '');
  });

  on(document, 'click', (e) => {
    const selectBtn = e.target.closest('[data-admin-select-toggle]');
    if (!selectBtn || !state.admin.enabled) return;
    e.preventDefault();
    e.stopPropagation();
    const scope = String(selectBtn.dataset.adminSelectToggle || '');
    if (!scope) return;
    const shouldDisable = state.admin.selectionMode && state.admin.selectedType === scope;
    if (shouldDisable) {
      state.admin.selectionMode = false;
      adminClearSelection();
      applyAdminModeUi();
      if (state.currentScreen === 'categories') renderCategories();
      if (state.currentScreen === 'products') renderProducts();
      reportStatus('Режим выделения выключен');
      return;
    }
    if (!state.admin.selectionMode) adminToggleSelectionMode(scope);
    else {
      state.admin.selectedType = scope;
      state.admin.selectedId = '';
      applyAdminModeUi();
      if (state.currentScreen === 'categories') renderCategories();
      if (state.currentScreen === 'products') renderProducts();
      reportStatus('Выберите элемент для перемещения');
    }
  });

  on(document, 'click', (e) => {
    const moveBtn = e.target.closest('[data-admin-move]');
    if (!moveBtn || !state.admin.enabled) return;
    e.preventDefault();
    e.stopPropagation();
    const direction = String(moveBtn.dataset.adminMove || '');
    if (!direction) return;
    adminMoveSelected(direction);
  });

  on(document, 'click', (e) => {
    const moveBtn = e.target.closest('[data-home-move]');
    if (!moveBtn || !state.admin.enabled) return;
    e.preventDefault();
    e.stopPropagation();
    const blockId = moveBtn.dataset.homeBlockId || '';
    const direction = moveBtn.dataset.homeMove || '';
    if (!blockId || !direction) return;
    adminMoveHomeBlock(blockId, direction);
  });

  on(document, 'click', (e) => {
    const btn = e.target.closest('[data-screen]');
    if (!btn) return;
    if (state.admin.enabled) return;
    const target = btn.dataset.screen;
    if (!target) return;
    setScreen(target);
    if (target === 'orders') renderOrders();
    if (target === 'profile') {
      renderProfile();
      if (!state.admin.enabled) renderOrders();
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
      if (state.admin.enabled) return;
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
    if (state.admin.enabled && state.admin.selectionMode) {
      const btn = e.target.closest('[data-category]');
      if (btn) {
        adminSelectItem('category', btn.dataset.category || '');
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    if (state.admin.enabled) return;
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
    if (state.admin.enabled) return;
    const btn = e.target.closest('[data-store-id]');
    if (!btn) return;
    state.selectedStoreId = btn.dataset.storeId;
    saveStorage();
    renderHeaderStore();
    renderStores();
    setScreen('home');
  });

  on(ui.productsList, 'click', (e) => {
    if (state.admin.enabled && state.admin.selectionMode) {
      const card = e.target.closest('[data-open]');
      if (card) {
        adminSelectItem('product', card.dataset.open || '');
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    if (state.admin.enabled) return;
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
    if (state.admin.enabled) return;
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
    if (state.admin.enabled) return;
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    touchRecentlyViewed(state.currentProduct);
    renderProductView();
    setScreen('product');
  });

  on(ui.homePopularTrack, 'click', (e) => {
    if (state.admin.enabled) return;
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
    if (state.admin.enabled) return;
    setScreen('production');
  });

  on(ui.productView, 'click', (e) => {
    if (state.admin.enabled) return;
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
  on(ui.ordersButton, 'click', () => { renderProfile(); if (!state.admin.enabled) renderOrders(); setScreen('profile'); });
  on(ui.profileButton, 'click', () => { renderProfile(); if (!state.admin.enabled) renderOrders(); setScreen('profile'); });
  on(ui.botButton, 'click', () => {
    if (!state.admin.enabled) return;
    renderBotSettings();
    setScreen('bot');
  });
  on(ui.statsButton, 'click', () => {
    if (!state.admin.enabled) return;
    void renderAdminStatsOverview();
    setScreen('stats');
  });
  on(ui.statsOpenRevenueButton, 'click', () => {
    if (!state.admin.enabled) return;
    void renderAdminStatsRevenue();
    setScreen('stats-revenue');
  });
  on(ui.statsOpenOrdersButton, 'click', () => {
    if (!state.admin.enabled) return;
    void renderAdminStatsOrders();
    setScreen('stats-orders');
  });
  on(ui.homeButton, 'click', () => { renderHomePopular(); setScreen('home'); });
  on(ui.checkoutButton, 'click', () => {
    saasTrackEvent('begin_checkout', { payload: { cartItems: Object.keys(state.cart || {}).length } });
    renderCart();
    setScreen('checkout');
  });

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
    if (state.admin.enabled) return;
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
      const discountFixed = Math.max(0, Number(state.promoAmount || 0));
      const discountBase = state.promoKind === 'first_order' ? eligibleSum : sum;
      let discountAmount = 0;
      if (state.promoKind === 'custom_fixed') {
        discountAmount = Math.min(sum, Math.round(discountFixed));
      } else if (discountPercent > 0) {
        discountAmount = Math.round(discountBase * (discountPercent / 100));
      }
      const finalSum = Math.max(0, sum - discountAmount);
      return { sum: finalSum, baseSum: sum, discountAmount, discountPercent, discountFixed, missing, count, requestCount };
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
        type: state.promoKind === 'custom_fixed' ? 'fixed' : 'percent',
        value: state.promoKind === 'custom_fixed' ? (state.promoAmount || 0) : (state.promoPercent || 0),
        percent: state.promoPercent || 0,
        discountAmount: summary.discountAmount || 0,
      } : null,
    };

    ui.orderStatus.textContent = 'Отправка заказа...';
    if (ui.orderSubmit) ui.orderSubmit.disabled = true;
    if (ui.orderRetry) ui.orderRetry.classList.add('hidden');

    try {
      let sendOk = false;
      if (state.saas.storeId) {
        const result = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/orders`, {
          method: 'POST',
          body: {
            order,
            telegramUserId: telegramId || '',
          },
        });
        sendOk = Boolean(result?.ok);
      } else {
        const result = await window.HORECA_TG.sendCheckoutOrder(order);
        sendOk = Boolean(result?.ok);
      }
      if (!sendOk) throw new Error('SEND_FAILED');

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
      state.promoAmount = 0;
      state.promoKind = '';
      state.profile = profile;
      saveStorage();
      saasTrackEvent('create_order', { payload: { orderId: order.id, total: summary.sum } });
      const payment = resolveOrderPaymentLink(order, summary.sum);
      if (payment.url) {
        state.pendingPayment = payment;
        ui.orderStatus.textContent = 'Заказ отправлен. Переходим к оплате...';
        openExternalPaymentLink(payment.url);
        setScreen('pay');
      } else {
        saasTrackEvent('payment_success', { payload: { orderId: order.id, total: summary.sum } });
        ui.orderStatus.textContent = 'Заказ отправлен.';
        setScreen('confirmation');
      }
    } catch (err) {
      saasTrackEvent('payment_fail', { payload: { reason: String(err?.message || 'unknown') } });
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

function setupBottomDockKeyboardLock() {
  if (!window.visualViewport) return;

  let baseline = window.visualViewport.height || window.innerHeight || 0;
  let rafId = 0;

  const isEditorFocused = () => {
    const active = document.activeElement;
    if (!active) return false;
    if (active.isContentEditable) return true;
    const tag = String(active.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  };

  const update = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (!vh) return;
      if (vh > baseline * 0.9) baseline = Math.max(baseline, vh);
      const keyboardDelta = Math.max(0, baseline - vh);
      const keyboardOpen = isEditorFocused() && keyboardDelta > 120;
      document.body.classList.toggle('keyboard-open', keyboardOpen);
      document.documentElement.style.setProperty('--kb-shift', keyboardOpen ? `${Math.round(keyboardDelta)}px` : '0px');
    });
  };

  window.visualViewport.addEventListener('resize', update, { passive: true });
  window.visualViewport.addEventListener('scroll', update, { passive: true });
  window.addEventListener('focusin', update, { passive: true });
  window.addEventListener('focusout', () => setTimeout(update, 60), { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      baseline = window.visualViewport ? window.visualViewport.height : (window.innerHeight || baseline);
      update();
    }, 220);
  }, { passive: true });
  update();
}

// Загружает конфигурацию витрины (тексты, баннеры, статьи, контакты).
async function loadConfig() {
  if (!state.saas.datasetLoaded) {
    const res = await fetch('config.json', { cache: 'no-store' });
    state.config = await res.json();
  }
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
  if (state.saas.datasetLoaded) {
    state.dataLoaded = true;
    if (!state.currentGroup) state.currentGroup = 'apparel';
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
    return;
  }
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
  if (state.admin.enabled) {
    reportStatus('Админ-режим активен');
  }
  if (state.promoCode === FIRST_ORDER_PROMO.code && hasUsedFirstOrderPromo()) {
    state.promoCode = '';
    state.promoPercent = 0;
    state.promoAmount = 0;
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
  setupBottomDockKeyboardLock();
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
    if (state.admin.enabled) {
      const ready = await saasEnsureAdminSession();
      if (ready) {
        await saasLoadStoresList();
        if (state.saas.storeId && state.saas.stores.length) {
          const currentExists = state.saas.stores.some((s) => String(s.storeId || '').toUpperCase() === state.saas.storeId);
          if (!currentExists && state.saas.stores[0]?.storeId) {
            state.saas.storeId = String(state.saas.stores[0].storeId).toUpperCase();
            localStorage.setItem(SAAS_STORE_KEY, state.saas.storeId);
          }
        }
        await saasLoadDatasetForCurrentContext();
        reportStatus(`SaaS магазин подключен: ${state.saas.storeId}`);
      }
    } else {
      await saasLoadDatasetForCurrentContext();
    }
  } catch (err) {
    console.error('saas bootstrap failed', err);
    reportStatus(`SaaS: ${err.message || 'ошибка подключения'}`);
  }

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
  if (!state.admin.enabled && !state.saas.datasetLoaded && restorePublishedState()) {
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
  if (state.saas.datasetLoaded || state.saas.enabled) return;
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

window.addEventListener('pageshow', () => {
  void refreshPublicDataset(true);
});

window.addEventListener('focus', () => {
  void refreshPublicDataset(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    void refreshPublicDataset(false);
  }
});

window.setInterval(() => {
  void refreshPublicDataset(false);
}, 20000);
