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
  recentlyViewed: [],
  theme: 'dark',
  stores: [],
  selectedStoreId: null,
  searchHistory: [],
};

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
  homeAboutText: document.getElementById('homeAboutText'),
  themeLabel: document.getElementById('themeLabel'),
  themeToggleButton: document.getElementById('themeToggleButton'),
  themeToggleValue: document.getElementById('themeToggleValue'),
  featuredPromo: document.getElementById('featuredPromo'),
  promoCodeInput: document.getElementById('promoCodeInput'),
  promoApplyButton: document.getElementById('promoApplyButton'),
  promoStatus: document.getElementById('promoStatus'),
  homeRecentTrack: document.getElementById('homeRecentTrack'),
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

const PROMO_CODES = {
  WELCOME10: 10,
  DEMO5: 5,
  STYLE15: 15,
};

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
  updateBottomNav(name);
  scrollToTop();
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
function formatMultiline(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const parts = raw.split(/\n{2,}/g);
  return parts
    .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
    .join('');
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
  state.recentlyViewed = safeParse(localStorage.getItem('demo_catalog_recent') || '[]', []).filter(Boolean).slice(0, 12);
  state.theme = localStorage.getItem('demo_catalog_theme') === 'light' ? 'light' : 'dark';
  state.selectedStoreId = localStorage.getItem('demo_catalog_selected_store') || null;
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
  localStorage.setItem('demo_catalog_recent', JSON.stringify(state.recentlyViewed || []));
  localStorage.setItem('demo_catalog_theme', state.theme || 'dark');
  localStorage.setItem('demo_catalog_selected_store', state.selectedStoreId || '');
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
    sum += item.price * item.qty;
  });
  const discountPercent = Number(state.promoPercent || 0);
  const discountAmount = discountPercent > 0 ? Math.round(sum * (discountPercent / 100)) : 0;
  const finalSum = Math.max(0, sum - discountAmount);
  return { sum: finalSum, baseSum: sum, discountAmount, discountPercent, missing, count, requestCount };
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
  ui.categoriesGrid.innerHTML = list.map((c) => {
    const firstProduct = state.products.find((p) => p.categoryId === c.id);
    const image = firstProduct && Array.isArray(firstProduct.images) && firstProduct.images[0] ? firstProduct.images[0] : c.image;
    return `
    <button class="category-card" data-category="${c.id}">
      <img src="${safeSrc(image)}" alt="${c.title}" loading="lazy" decoding="async" />
      <span>${c.title}</span>
    </button>
  `;
  }).join('');
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
  if (ui.featuredPromo && list.length) {
    const lead = list[0];
    ui.featuredPromo.style.background = `linear-gradient(180deg, rgba(7, 9, 15, 0.14), rgba(7, 9, 15, 0.78)), url('${safeSrc(lead.images[0])}') center/cover`;
    ui.featuredPromo.querySelector('.featured-title').textContent = lead.title || 'Новая коллекция';
    ui.featuredPromo.querySelector('.featured-text').textContent = lead.shortDescription || 'Подборка лучших товаров в каталоге';
  }
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

function touchRecentlyViewed(productId) {
  if (!productId) return;
  state.recentlyViewed = [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12);
  saveStorage();
}

function getRecentlyViewedProducts(limit = 8) {
  if (!state.recentlyViewed.length) return [];
  const map = new Map(state.products.map((p) => [p.id, p]));
  return state.recentlyViewed.map((id) => map.get(id)).filter(Boolean).slice(0, limit);
}

function renderHomeRecent() {
  if (!ui.homeRecentTrack) return;
  const recent = getRecentlyViewedProducts(8);
  if (!recent.length) {
    ui.homeRecentTrack.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">Здесь появятся просмотренные товары</div>
      </div>
    `;
    return;
  }
  ui.homeRecentTrack.innerHTML = recent.map((p) => `
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
      <div class="section-title">Описание</div>
      <div class="section-body">${desc || 'Описание будет добавлено позже.'}</div>
    </div>
    <div class="detail-section">
      <div class="section-title">Характеристики</div>
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
      ui.promoStatus.textContent = `Скидка ${state.promoPercent}% активна (${state.promoCode}). Экономия: ${formatPrice(summary.discountAmount || 0)} ₽.`;
    } else if (/активна/.test(ui.promoStatus.textContent || '')) {
      ui.promoStatus.textContent = '';
    }
  }
}

function renderOrders() {
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
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод очищен.';
    saveStorage();
    renderCart();
    return;
  }
  const percent = Number(PROMO_CODES[code] || 0);
  if (!percent) {
    state.promoCode = '';
    state.promoPercent = 0;
    if (ui.promoStatus) ui.promoStatus.textContent = 'Промокод не найден.';
    saveStorage();
    renderCart();
    return;
  }
  state.promoCode = code;
  state.promoPercent = percent;
  if (ui.promoStatus) ui.promoStatus.textContent = `Промокод ${code} активирован: скидка ${percent}%.`;
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

function setActiveHomeChip(targetButton) {
  document.querySelectorAll('.catalog-chips .chip').forEach((chip) => {
    chip.classList.toggle('chip-active', chip === targetButton);
  });
}

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


  document.querySelectorAll('[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (target) setScreen(target);
    });
  });
  document.querySelectorAll('.menu-item[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setScreen(btn.dataset.screen);
      if (btn.dataset.screen === 'orders') renderOrders();
      if (btn.dataset.screen === 'profile') {
        renderProfile();
        renderOrders();
      }
    });
  });

  on(ui.menuCatalogToggle, 'click', () => {
    if (ui.menuCatalogList) ui.menuCatalogList.classList.toggle('hidden');
  });

  document.querySelectorAll('.hero-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      setActiveHomeChip(tile);
      state.currentGroup = tile.dataset.group;
      ui.categoriesTitle.textContent = tile.dataset.group === 'accessories' ? 'Аксессуары и подборки' : 'Каталог';
      renderCategories();
      setScreen('categories');
    });
  });
  // Ensure categories grid has data on load
  if (!state.currentGroup) {
    state.currentGroup = 'apparel';
    ui.categoriesTitle.textContent = 'Каталог';
    renderCategories();
  }

  document.querySelectorAll('[data-home-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveHomeChip(btn);
      const categoryId = btn.dataset.homeCategory;
      if (!categoryId) return;
      openCategoryById(categoryId);
    });
  });

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

  on(ui.homeRecentTrack, 'click', (e) => {
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
  on(ui.homeButton, 'click', () => { renderHomeRecent(); setScreen('home'); });
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

  on(ui.sharePhoneButton, 'click', async () => {
    if (!window.HORECA_TG?.isTelegram) {
      ui.orderStatus.textContent = 'Поделиться номером можно только внутри Telegram.';
      return;
    }
    ui.orderStatus.textContent = 'Запрашиваем номер телефона...';
    const result = await window.HORECA_TG.requestContact();
    if (result.ok && result.phone) {
      ui.inputPhone.value = result.phone;
      ui.orderStatus.textContent = 'Номер получен из Telegram.';
    } else {
      ui.orderStatus.textContent = 'Не удалось получить номер. Укажите его вручную.';
    }
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

    if (!window.HORECA_TG?.isTelegram) {
      ui.orderStatus.textContent = 'Оплата доступна только внутри Telegram Mini App.';
      return;
    }

    const summary = (() => {
      let sum = 0;
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
        sum += Number(item.price || 0) * (item.qty || 0);
      });
      const discountPercent = Number(state.promoPercent || 0);
      const discountAmount = discountPercent > 0 ? Math.round(sum * (discountPercent / 100)) : 0;
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
  if (ui.homeAboutText) {
    const aboutRaw = String(state.config.aboutText || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    ui.homeAboutText.textContent = aboutRaw
      ? `${aboutRaw.slice(0, 140)}${aboutRaw.length > 140 ? '…' : ''}`
      : 'Современный mini app для интернет-магазинов и офлайн точек продаж.';
  }
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
  ui.inputPhone.value = state.profile.phone || '';
  ui.inputEmail.value = state.profile.email || '';
  if (!ui.inputName.value) ui.inputName.value = getTelegramFirstName();
  if (ui.inputTelegramId) ui.inputTelegramId.value = getTelegramId();
  updateDeliveryAddressVisibility();
  renderProfile();
  if (ui.feedbackName) ui.feedbackName.value = state.profile.name || '';
  if (ui.feedbackPhone) ui.feedbackPhone.value = state.profile.phone || '';
  if (ui.feedbackEmail) ui.feedbackEmail.value = state.profile.email || '';
}

const DATA_VERSION = '20260210-3';
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
  renderHomeRecent();
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

async function init() {
  loadStorage();
  applyTheme(state.theme);
  state.stores = getFallbackStores();
  if (!state.selectedStoreId) state.selectedStoreId = state.stores[0]?.id || null;
  state.screenStack = ['home'];
  state.currentScreen = 'home';
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
  renderHomeRecent();
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
  buildMenuCatalog();
}

init();

window.addEventListener('error', (e) => {
  reportStatus(`Ошибка JS: ${e.message || 'unknown'}`);
});
window.addEventListener('unhandledrejection', (e) => {
  reportStatus(`Ошибка JS: ${e.reason || 'unknown'}`);
});
