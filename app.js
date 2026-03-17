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
  accent: 'rose',
  stores: [],
  selectedStoreId: null,
  searchHistory: [],
  promoUsage: {},
  productStats: {},
  homeBannerIndex: 0,
  homeBannerTimer: null,
  homeCarouselOffset: {
    promo: 0,
    popular: 0,
    articles: 0,
  },
  pendingPayment: null,
  catalogBotConnections: [],
  catalogBotConnectionsStoreId: '',
  catalogBotConnectionsLoading: false,
  platformBindings: [],
  platformBindingsStoreId: '',
  platformBindingsLoading: false,
  paymentIntegration: {
    provider: 'yookassa',
    accountId: '',
    secretConfigured: false,
    apiUrl: '',
    returnUrl: '',
    webhookUrl: '',
    extra: {},
    configured: false,
  },
  imports: {
    catalog: {
      file: null,
      fileName: '',
      fileLabel: '',
      previewToken: '',
      previewRows: [],
      summary: null,
      status: '',
      loading: false,
      importing: false,
      previewRequestId: 0,
    },
    category: {
      file: null,
      fileName: '',
      fileLabel: '',
      previewToken: '',
      previewRows: [],
      summary: null,
      status: '',
      loading: false,
      importing: false,
      previewRequestId: 0,
    },
  },
  admin: {
    enabled: false,
    tapDelay: 260,
    draftKey: 'demo_catalog_admin_draft_v1',
    selectionMode: false,
    selectedType: '',
    selectedId: '',
    selectedIds: [],
    ui: {},
  },
  saas: {
    enabled: false,
    apiBase: '',
    storeId: '',
    token: '',
    userId: '',
    userProfile: null,
    stores: [],
    settings: {},
    datasetLoaded: false,
    lastPublicSyncAt: 0,
    lastLinkedPlatformIdentity: '',
    publicResolveError: null,
    platformBootstrapError: null,
    needsAdminStoreSelection: false,
    pendingOnboarding: null,
    activeOnboarding: null,
    lastPlatformConnectPromptKey: '',
  },
  subscription: {
    code: 'unknown',
    featureAccess: true,
    isTrial: false,
    isGrace: false,
    daysLeft: 0,
    graceDaysLeft: 0,
  },
};

const SAAS_TOKEN_KEY = 'demo_saas_token_v1';
const SAAS_STORE_KEY = 'demo_saas_store_id_v1';
const SAAS_API_BASE_KEY = 'demo_saas_api_base_v1';
const SAAS_DEFAULT_REMOTE_API = 'https://api.saaskatalog.ru/api';

// Базовые баннеры главной страницы.
const DEFAULT_HOME_BANNERS = [
  {
    id: 'home-ad-1',
    image: '/assets/banners/home-ad-v2.svg',
    kicker: 'Реклама',
    title: 'Запусти продажи в Telegram Mini App',
    text: 'Каталог, корзина и оплата в одном окне. Готовое решение для магазина.',
    cta: 'Запустить под ключ',
  },
  {
    id: 'home-promo-1',
    image: '/assets/banners/home-promo-v2.svg',
    kicker: 'Промокод',
    title: 'ПЕРВЫЙ -10% на первый заказ',
    text: 'Скидка для новых клиентов. Промокод применяется в корзине автоматически.',
    cta: 'Активировать',
  },
];
const DEFAULT_HOME_ARTICLES = [];
const DEFAULT_PROMO_CATALOG = {
  title: 'Акции',
  image: '',
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
  menuPromoButton: document.getElementById('menuPromoButton'),
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
  catalogImportPanel: document.getElementById('catalogImportPanel'),
  catalogImportFile: document.getElementById('catalogImportFile'),
  catalogImportPreviewButton: document.getElementById('catalogImportPreviewButton'),
  catalogImportSubmitButton: document.getElementById('catalogImportSubmitButton'),
  catalogImportStatus: document.getElementById('catalogImportStatus'),
  catalogImportPreview: document.getElementById('catalogImportPreview'),
  productsTitle: document.getElementById('productsTitle'),
  productsImportPanel: document.getElementById('productsImportPanel'),
  productsImportFile: document.getElementById('productsImportFile'),
  productsImportPreviewButton: document.getElementById('productsImportPreviewButton'),
  productsImportSubmitButton: document.getElementById('productsImportSubmitButton'),
  productsImportStatus: document.getElementById('productsImportStatus'),
  productsImportPreview: document.getElementById('productsImportPreview'),
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
  homePromoTitleButton: document.getElementById('homePromoTitleButton'),
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
  adminDeleteSelectedCategoriesButton: document.getElementById('adminDeleteSelectedCategoriesButton'),
  adminDeleteSelectedButton: document.getElementById('adminDeleteSelectedButton'),
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
  profileStatsSection: document.getElementById('profileStatsSection'),
  profileOpenStatsButton: document.getElementById('profileOpenStatsButton'),
  adminProfilePanel: document.getElementById('adminProfilePanel'),
  adminStoreIdValue: document.getElementById('adminStoreIdValue'),
  adminReloadStoresButton: document.getElementById('adminReloadStoresButton'),
  adminOpenBotSectionButton: document.getElementById('adminOpenBotSectionButton'),
  adminCreateStoreButton: document.getElementById('adminCreateStoreButton'),
  adminConnectBotButton: document.getElementById('adminConnectBotButton'),
  adminLogoutButton: document.getElementById('adminLogoutButton'),
  profileBotConnectSection: document.getElementById('profileBotConnectSection'),
  profileBotStoreIdValue: document.getElementById('profileBotStoreIdValue'),
  profileBotCatalogUrlValue: document.getElementById('profileBotCatalogUrlValue'),
  profileBotCatalogUrlCopyButton: document.getElementById('profileBotCatalogUrlCopyButton'),
  profileBotConnectForm: document.getElementById('profileBotConnectForm'),
  profileBotPlatformInput: document.getElementById('profileBotPlatformInput'),
  profileBotLabelInput: document.getElementById('profileBotLabelInput'),
  profileBotIdentifierLabel: document.getElementById('profileBotIdentifierLabel'),
  profileBotIdentifierLabelText: document.getElementById('profileBotIdentifierLabelText'),
  profileBotIdentifierInput: document.getElementById('profileBotIdentifierInput'),
  profileBotTokenLabel: document.getElementById('profileBotTokenLabel'),
  profileBotTokenLabelText: document.getElementById('profileBotTokenLabelText'),
  profileBotTokenInput: document.getElementById('profileBotTokenInput'),
  profileBotConnectStatus: document.getElementById('profileBotConnectStatus'),
  profileBotConnectSaveButton: document.getElementById('profileBotConnectSaveButton'),
  profileBotConnectionsList: document.getElementById('profileBotConnectionsList'),
  profilePlatformBindingsSection: document.getElementById('profilePlatformBindingsSection'),
  platformBindingForm: document.getElementById('platformBindingForm'),
  platformBindingPlatformInput: document.getElementById('platformBindingPlatformInput'),
  platformBindingTypeInput: document.getElementById('platformBindingTypeInput'),
  platformBindingTitleInput: document.getElementById('platformBindingTitleInput'),
  platformBindingExternalIdInput: document.getElementById('platformBindingExternalIdInput'),
  platformBindingStatus: document.getElementById('platformBindingStatus'),
  platformBindingSaveButton: document.getElementById('platformBindingSaveButton'),
  platformBindingSetupInfo: document.getElementById('platformBindingSetupInfo'),
  platformBindingsList: document.getElementById('platformBindingsList'),
  profileOrdersTitle: document.querySelector('#screen-profile .home-section-title'),
  profileHistorySection: document.getElementById('profileHistorySection'),
  ordersOpenNewButton: document.getElementById('ordersOpenNewButton'),
  ordersOpenActiveButton: document.getElementById('ordersOpenActiveButton'),
  ordersOpenCompletedButton: document.getElementById('ordersOpenCompletedButton'),
  ordersOpenCanceledButton: document.getElementById('ordersOpenCanceledButton'),
  ordersNewPreview: document.getElementById('ordersNewPreview'),
  ordersActivePreview: document.getElementById('ordersActivePreview'),
  ordersCompletedPreview: document.getElementById('ordersCompletedPreview'),
  ordersCanceledPreview: document.getElementById('ordersCanceledPreview'),
  ordersNewList: document.getElementById('ordersNewList'),
  ordersActiveList: document.getElementById('ordersActiveList'),
  ordersCompletedList: document.getElementById('ordersCompletedList'),
  ordersCanceledList: document.getElementById('ordersCanceledList'),
  statsOpenRevenueButton: document.getElementById('statsOpenRevenueButton'),
  statsOpenOrdersButton: document.getElementById('statsOpenOrdersButton'),
  statsOpenPopularButton: document.getElementById('statsOpenPopularButton'),
  statsRevenuePreview: document.getElementById('statsRevenuePreview'),
  statsOrdersPreview: document.getElementById('statsOrdersPreview'),
  statsPopularPreview: document.getElementById('statsPopularPreview'),
  statsRevenueList: document.getElementById('statsRevenueList'),
  statsOrdersList: document.getElementById('statsOrdersList'),
  statsPopularList: document.getElementById('statsPopularList'),
  profileSubscriptionSection: document.getElementById('profileSubscriptionSection'),
  subscriptionTariffs: document.getElementById('subscriptionTariffs'),
  subscriptionStatus: document.getElementById('subscriptionStatus'),
  subscriptionPayButton: document.getElementById('subscriptionPayButton'),
  profileOrderChatSection: document.getElementById('profileOrderChatSection'),
  orderChatSettingsForm: document.getElementById('orderChatSettingsForm'),
  orderChatModeInput: document.getElementById('orderChatModeInput'),
  orderRequestChannelInput: document.getElementById('orderRequestChannelInput'),
  orderRequestTargetLabel: document.getElementById('orderRequestTargetLabel'),
  orderRequestTargetInput: document.getElementById('orderRequestTargetInput'),
  orderRequestVkTokenLabel: document.getElementById('orderRequestVkTokenLabel'),
  orderRequestVkTokenInput: document.getElementById('orderRequestVkTokenInput'),
  orderRequestHint: document.getElementById('orderRequestHint'),
  orderChatStatus: document.getElementById('orderChatStatus'),
  orderChatSaveButton: document.getElementById('orderChatSaveButton'),
  profilePaymentIntegrationSection: document.getElementById('profilePaymentIntegrationSection'),
  paymentIntegrationForm: document.getElementById('paymentIntegrationForm'),
  paymentIntegrationProviderInput: document.getElementById('paymentIntegrationProviderInput'),
  paymentIntegrationAccountLabel: document.getElementById('paymentIntegrationAccountLabel'),
  paymentIntegrationAccountInput: document.getElementById('paymentIntegrationAccountInput'),
  paymentIntegrationSecretLabel: document.getElementById('paymentIntegrationSecretLabel'),
  paymentIntegrationSecretKeyInput: document.getElementById('paymentIntegrationSecretKeyInput'),
  paymentIntegrationHint: document.getElementById('paymentIntegrationHint'),
  paymentIntegrationWebhookUrl: document.getElementById('paymentIntegrationWebhookUrl'),
  paymentIntegrationStatus: document.getElementById('paymentIntegrationStatus'),
  paymentIntegrationSaveButton: document.getElementById('paymentIntegrationSaveButton'),
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
  profileAppearancePanel: document.getElementById('profileAppearancePanel'),
  themeSelect: document.getElementById('themeSelect'),
  accentSelect: document.getElementById('accentSelect'),
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

const THEME_OPTIONS = {
  white: { value: 'white', domTheme: 'light', mode: 'light' },
  dark: { value: 'dark', domTheme: 'dark', mode: 'dark' },
  blue: { value: 'blue', domTheme: 'blue', mode: 'dark' },
  lime: { value: 'lime', domTheme: 'lime', mode: 'dark' },
  terracotta: { value: 'terracotta', domTheme: 'terracotta', mode: 'dark' },
};

const ACCENT_OPTIONS = {
  rose: true,
  blue: true,
  lime: true,
  amber: true,
  terracotta: true,
};

const DEFAULT_APPEARANCE = {
  theme: 'dark',
  accent: 'rose',
};

const PAYMENT_PROVIDER_META = {
  yookassa: {
    label: 'ЮKassa',
    accountLabel: 'Shop ID',
    accountPlaceholder: 'Например: 123456',
    secretLabel: 'Secret Key',
    secretPlaceholder: 'live_xxxxx или test_xxxxx',
    hint: 'ЮKassa: используется API платежей и webhook. Return URL подставляется автоматически по Bot ID.',
    defaultApiUrl: 'https://api.yookassa.ru/v3/payments',
    needsSecret: true,
    needsAccount: true,
  },
  tbank: {
    label: 'Т-Банк',
    accountLabel: 'TerminalKey',
    accountPlaceholder: 'Например: 1700000000000',
    secretLabel: 'Password',
    secretPlaceholder: 'Пароль терминала Т-Банк',
    hint: 'Т-Банк: создаёт платёж через метод Init. Сумма передаётся динамически, Return URL — автоматически.',
    defaultApiUrl: 'https://securepay.tinkoff.ru/v2/Init',
    needsSecret: true,
    needsAccount: true,
  },
  robokassa: {
    label: 'Robokassa',
    accountLabel: 'MerchantLogin',
    accountPlaceholder: 'Логин магазина Robokassa',
    secretLabel: 'Пароль #1',
    secretPlaceholder: 'Пароль #1 Robokassa',
    hint: 'Robokassa: формирует ссылку оплаты по настройкам кассы. Return URL — автоматически.',
    defaultApiUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx',
    needsSecret: true,
    needsAccount: true,
  },
  alfabank: {
    label: 'Альфа-Банк',
    accountLabel: 'userName',
    accountPlaceholder: 'Логин API интернет-эквайринга',
    secretLabel: 'password',
    secretPlaceholder: 'Пароль API',
    hint: 'Альфа-Банк: регистрация заказа через register.do, сумма передаётся динамически, Return URL — автоматически.',
    defaultApiUrl: 'https://pay.alfabank.ru/payment/rest/register.do',
    needsSecret: true,
    needsAccount: true,
  },
};

const CATALOG_BOT_PLATFORM_META = {
  telegram: {
    label: 'Telegram',
    identifierLabel: 'Username / ссылка (необязательно)',
    identifierPlaceholder: '@shop_bot или https://t.me/shop_bot',
    tokenLabel: 'Bot Token Telegram',
    tokenPlaceholder: '123456:ABC...',
    tokenRequired: true,
    hint: 'Для Telegram бот подключается автоматически: настраиваются меню и webhook каталога.',
  },
  vk: {
    label: 'VK',
    identifierLabel: 'ID / ссылка бота VK',
    identifierPlaceholder: 'vk.com/club..., bot id или ссылка на сообщество',
    tokenLabel: '',
    tokenPlaceholder: '',
    tokenRequired: false,
    hint: 'Для VK сохраняется точка входа и общий URL каталога этого магазина.',
  },
  max: {
    label: 'MAX',
    identifierLabel: 'ID / ссылка бота MAX',
    identifierPlaceholder: 'Ссылка, username или внутренний ID бота',
    tokenLabel: '',
    tokenPlaceholder: '',
    tokenRequired: false,
    hint: 'Для MAX сохраняется привязка к тому же каталогу магазина.',
  },
  custom: {
    label: 'Другая площадка',
    identifierLabel: 'ID / ссылка бота',
    identifierPlaceholder: 'Ссылка, username или внутренний ID бота',
    tokenLabel: '',
    tokenPlaceholder: '',
    tokenRequired: false,
    hint: 'Подходит для любых внешних площадок, где нужно хранить привязку к каталогу.',
  },
};

function reportStatus(message) {
  if (!ui.dataStatus) return;
  ui.dataStatus.classList.remove('hidden');
  ui.dataStatus.textContent = message;
}

function buildEmptyStateMarkup(title, text) {
  return `
    <div class="empty-state">
      <div class="empty-title">${escapeHtml(title || 'Нет данных')}</div>
      <div class="empty-text">${escapeHtml(text || 'Попробуйте позже.')}</div>
    </div>
  `;
}

function getPublicPlatformResolveErrorInfo(errorCode, platform = '') {
  const normalizedPlatform = String(platform || '').trim().toLowerCase();
  const code = String(errorCode || '').trim().toUpperCase();

  if (normalizedPlatform === 'vk') {
    if (code === 'PLATFORM_STORE_NOT_FOUND') {
      return {
        title: 'Каталог не подключен',
        message: 'Это сообщество VK пока не привязано к магазину. Подключите сообщество в админке магазина.',
      };
    }
    if (code === 'VK_GROUP_ID_REQUIRED') {
      return {
        title: 'Сообщество VK не определено',
        message: 'Откройте каталог из нужного сообщества VK, чтобы система смогла выбрать магазин.',
      };
    }
    if (code === 'PLATFORM_CONTEXT_UNAVAILABLE') {
      return {
        title: 'Данные запуска VK не получены',
        message: 'VK не передал данные запуска приложения. Перезапустите мини-приложение из сообщества.',
      };
    }
    return {
      title: 'Каталог VK недоступен',
      message: 'Не удалось определить магазин по данным запуска VK. Проверьте привязку сообщества и настройки приложения.',
    };
  }

  return {
    title: 'Каталог недоступен',
    message: 'Не удалось определить магазин для этой платформы.',
  };
}

function renderPublicPlatformUnavailableState() {
  const info = state.saas.publicResolveError;
  if (!info?.blocking || state.admin.enabled) return;

  if (state.homeBannerTimer) {
    window.clearInterval(state.homeBannerTimer);
    state.homeBannerTimer = null;
  }

  state.categories = [];
  state.products = [];
  state.stores = [];
  state.currentCategory = null;
  state.currentCategoryIds = null;
  state.currentProduct = null;
  state.dataLoaded = true;

  const title = String(info.title || 'Каталог недоступен').trim();
  const message = String(info.message || 'Не удалось определить магазин для этой платформы.').trim();
  const markup = buildEmptyStateMarkup(title, message);

  if (ui.homeBannerTrack) {
    ui.homeBannerTrack.innerHTML = markup;
    ui.homeBannerTrack.style.transform = '';
    ui.homeBannerTrack.scrollLeft = 0;
  }
  if (ui.homeBannerDots) {
    ui.homeBannerDots.innerHTML = '';
    ui.homeBannerDots.classList.add('is-hidden');
  }
  if (ui.promoTrack) ui.promoTrack.innerHTML = markup;
  if (ui.homePopularTrack) ui.homePopularTrack.innerHTML = markup;
  if (ui.categoriesGrid) ui.categoriesGrid.innerHTML = markup;
  if (ui.productsList) ui.productsList.innerHTML = markup;
  if (ui.storesList) ui.storesList.innerHTML = markup;
  if (ui.aboutText) ui.aboutText.innerHTML = formatMultiline(message);
  if (ui.categoriesTitle) ui.categoriesTitle.textContent = 'Каталог';
  if (ui.headerStoreCity) ui.headerStoreCity.textContent = 'Каталог';
  reportStatus(message);
}

function requireAdminFeatureAccess(message = 'Функция недоступна: требуется активная подписка.') {
  if (!state.admin.enabled) return true;
  if (subscriptionAllowsAdminFeatures()) return true;
  reportStatus(message);
  if (ui.subscriptionStatus) ui.subscriptionStatus.textContent = message;
  return false;
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
  const path = String(window.location.pathname || '').toLowerCase();
  const isStoreRoute = /^\/store\/[a-z0-9]{6}$/i.test(path);
  const params = new URLSearchParams(window.location.search || '');
  const adminParam = params.get('admin');

  // На витрине магазина admin-mode включаем только явным параметром (?admin=1|true).
  if (isStoreRoute) {
    const explicitAdmin = adminParam === '1' || adminParam === 'true' || params.get('mode') === 'admin';
    if (!explicitAdmin) {
      localStorage.removeItem('demo_catalog_force_admin');
      return false;
    }
  }

  if (adminParam === '1' || adminParam === 'true') return true;
  if (params.get('mode') === 'admin') return true;

  const hash = String(window.location.hash || '').toLowerCase();
  if (hash.includes('admin')) return true;

  if (path.includes('admin')) return true;

  const tgStartParam = String(window.HORECA_TG?.initDataUnsafe?.start_param || '').toLowerCase();
  if (tgStartParam.includes('admin')) return true;

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
const HOME_BLOCK_DEFAULT_ORDER = ['banners', 'promo', 'popular'];
const HOME_REBUILD_STAMP = 'home-v2-20260310';

function getAdminDraftKey() {
  const storePart = (state.saas.storeId || '').trim().toUpperCase();
  return storePart ? `demo_catalog_admin_draft_v1_${storePart}` : state.admin.draftKey;
}

function hasExplicitNonTelegramPlatformContext() {
  const bridgePlatform = normalizeClientPlatform(window.HORECA_PLATFORM?.platform || '');
  if (bridgePlatform && bridgePlatform !== 'web' && bridgePlatform !== 'telegram') return true;

  const explicitPlatform = normalizeClientPlatform(
    getClientQueryValue('platform', 'customerPlatform'),
  );
  if (explicitPlatform && explicitPlatform !== 'web' && explicitPlatform !== 'telegram') return true;

  return Boolean(
    getClientQueryValue(
      'vk_app_id',
      'vk_user_id',
      'viewer_id',
      'vkGroupId',
      'vk_group_id',
      'max_user_id',
      'maxUserId',
      'wa_user_id',
      'whatsapp_user_id',
      'ig_user_id',
      'instagram_user_id',
    ),
  );
}

function getTelegramUser() {
  if (hasExplicitNonTelegramPlatformContext()) return {};
  const cachedUser = window.HORECA_TG?.initDataUnsafe?.user;
  if (cachedUser && typeof cachedUser === 'object') return cachedUser;

  const liveUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (liveUser && typeof liveUser === 'object') return liveUser;

  const rawInitData = getTelegramInitData();
  if (rawInitData) {
    try {
      const params = new URLSearchParams(rawInitData);
      const rawUser = params.get('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
  }

  return {};
}

function getTelegramId() {
  const id = getTelegramUser()?.id;
  return id ? String(id) : '';
}

function normalizeClientPlatform(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram' || value === 'tg') return 'telegram';
  if (value === 'vk' || value === 'vkontakte') return 'vk';
  if (value === 'max') return 'max';
  if (value === 'whatsapp' || value === 'wa') return 'whatsapp';
  if (value === 'instagram' || value === 'insta' || value === 'ig') return 'instagram';
  if (value === 'web' || value === 'site' || value === 'browser') return 'web';
  return value || 'web';
}

function getClientQueryValue(...keys) {
  const platformParams = window.HORECA_PLATFORM?.launchParams && typeof window.HORECA_PLATFORM.launchParams === 'object'
    ? window.HORECA_PLATFORM.launchParams
    : null;
  if (platformParams) {
    for (const key of keys) {
      const value = String(platformParams[key] || '').trim();
      if (value) return value;
    }
  }
  try {
    const params = new URLSearchParams(window.location.search || '');
    for (const key of keys) {
      const value = String(params.get(key) || '').trim();
      if (value) return value;
    }
  } catch {}
  try {
    const hash = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));
    for (const key of keys) {
      const value = String(hash.get(key) || '').trim();
      if (value) return value;
    }
  } catch {}
  return '';
}

function getGuestPlatformUserId() {
  const key = 'demo_catalog_guest_user_id_v1';
  try {
    const existing = String(localStorage.getItem(key) || '').trim();
    if (existing) return existing;
    const next = `guest_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    localStorage.setItem(key, next);
    return next;
  } catch {
    return `guest_${Date.now().toString(36)}`;
  }
}

function getClientPlatformContext({ allowGuest = true } = {}) {
  const platformBridge = window.HORECA_PLATFORM && typeof window.HORECA_PLATFORM === 'object'
    ? window.HORECA_PLATFORM
    : null;
  const bridgePlatform = normalizeClientPlatform(platformBridge?.platform || '');
  if (bridgePlatform && bridgePlatform !== 'web' && bridgePlatform !== 'telegram') {
    const bridgeUserId = String(
      platformBridge?.getContext?.()?.platformUserId
      || platformBridge?.vkUserInfo?.id
      || getClientQueryValue('vk_user_id', 'viewer_id', 'vkUserId', 'max_user_id', 'maxUserId')
      || '',
    ).trim();
    return {
      platform: bridgePlatform,
      platformUserId: bridgeUserId,
      customerIdentity: bridgeUserId ? `${bridgePlatform}:${bridgeUserId}` : '',
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const telegramUserId = String(getTelegramId() || '').trim();
  const telegramInitData = getTelegramInitData();
  if (telegramUserId || telegramInitData) {
    const userId = telegramUserId || '';
    return {
      platform: 'telegram',
      platformUserId: userId,
      customerIdentity: userId ? `telegram:${userId}` : '',
      telegramUserId,
      telegramInitData,
    };
  }
  const vkBridgeUserId = String(platformBridge?.vkUserInfo?.id || '').trim();
  if (vkBridgeUserId) {
    return {
      platform: 'vk',
      platformUserId: vkBridgeUserId,
      customerIdentity: `vk:${vkBridgeUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const explicitPlatform = normalizeClientPlatform(getClientQueryValue('platform', 'customerPlatform'));
  const explicitUserId = String(getClientQueryValue('platformUserId', 'platform_user_id', 'customerPlatformUserId', 'customer_user_id') || '').trim();
  if (explicitUserId) {
    return {
      platform: explicitPlatform,
      platformUserId: explicitUserId,
      customerIdentity: `${explicitPlatform}:${explicitUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const vkUserId = String(getClientQueryValue('vk_user_id', 'viewer_id', 'vkUserId') || '').trim();
  if (vkUserId) {
    return {
      platform: 'vk',
      platformUserId: vkUserId,
      customerIdentity: `vk:${vkUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const maxUserId = String(getClientQueryValue('max_user_id', 'maxUserId') || '').trim();
  if (maxUserId) {
    return {
      platform: 'max',
      platformUserId: maxUserId,
      customerIdentity: `max:${maxUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const whatsappUserId = String(getClientQueryValue('wa_user_id', 'whatsapp_user_id', 'whatsappUserId') || '').trim();
  if (whatsappUserId) {
    return {
      platform: 'whatsapp',
      platformUserId: whatsappUserId,
      customerIdentity: `whatsapp:${whatsappUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const instagramUserId = String(getClientQueryValue('ig_user_id', 'instagram_user_id', 'instagramUserId') || '').trim();
  if (instagramUserId) {
    return {
      platform: 'instagram',
      platformUserId: instagramUserId,
      customerIdentity: `instagram:${instagramUserId}`,
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  if (!allowGuest) {
    return {
      platform: 'web',
      platformUserId: '',
      customerIdentity: '',
      telegramUserId: '',
      telegramInitData: '',
    };
  }
  const guestId = getGuestPlatformUserId();
  return {
    platform: 'web',
    platformUserId: guestId,
    customerIdentity: `web:${guestId}`,
    telegramUserId: '',
    telegramInitData: '',
  };
}

async function waitForPlatformBridgeReady(timeoutMs = 1800) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const platformBridge = window.HORECA_PLATFORM && typeof window.HORECA_PLATFORM === 'object'
      ? window.HORECA_PLATFORM
      : null;
    if (!platformBridge || platformBridge.ready) return;
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
}

function getTelegramInitData() {
  if (hasExplicitNonTelegramPlatformContext()) return '';
  const live = String(window.Telegram?.WebApp?.initData || '').trim();
  if (live) return live;
  const cached = String(window.HORECA_TG?.initData || '').trim();
  if (cached) return cached;
  try {
    const query = new URLSearchParams(window.location.search || '');
    const fromQuery = String(query.get('tgWebAppData') || '').trim();
    if (fromQuery) return decodeURIComponent(fromQuery);
  } catch {}
  try {
    const hashRaw = String(window.location.hash || '').replace(/^#/, '');
    if (hashRaw) {
      const hashParams = new URLSearchParams(hashRaw);
      const fromHash = String(hashParams.get('tgWebAppData') || '').trim();
      if (fromHash) return decodeURIComponent(fromHash);
    }
  } catch {}
  return '';
}

async function resolveTelegramIdentity({ retries = 8, delayMs = 140 } = {}) {
  for (let i = 0; i < retries; i += 1) {
    const telegramUserId = getTelegramId();
    const telegramInitData = getTelegramInitData();
    if (telegramUserId || telegramInitData) {
      return { telegramUserId, telegramInitData };
    }
    const sessionUserId = String(state.saas?.userId || '').trim();
    if (sessionUserId.startsWith('tg:')) {
      const fallbackId = sessionUserId.slice(3).trim();
      if (/^[0-9]{5,20}$/.test(fallbackId)) {
        return { telegramUserId: fallbackId, telegramInitData: '' };
      }
    }
    if (window.Telegram?.WebApp?.ready) {
      try { window.Telegram.WebApp.ready(); } catch {}
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }
  return { telegramUserId: '', telegramInitData: '' };
}

async function buildCurrentPlatformAuthPayload({ allowTelegram = false } = {}) {
  const platformBridge = window.HORECA_PLATFORM && typeof window.HORECA_PLATFORM === 'object'
    ? window.HORECA_PLATFORM
    : null;
  const context = getClientPlatformContext({ allowGuest: false });
  if (!context?.platform || context.platform === 'web') return null;
  if (context.platform === 'telegram' && !allowTelegram) return null;

  if (platformBridge?.buildBootstrapPayload) {
    const payload = platformBridge.buildBootstrapPayload();
    if (payload && typeof payload === 'object') return payload;
  }

  if (context.platform === 'telegram') {
    const { telegramUserId, telegramInitData } = await resolveTelegramIdentity();
    if (!telegramUserId && !telegramInitData) return null;
    return {
      platform: 'telegram',
      telegramUserId,
      telegramInitData,
      profile: buildPlatformProfilePayload('telegram'),
    };
  }

  if (!context.platformUserId) return null;
  return {
    platform: context.platform,
    platformUserId: context.platformUserId,
    profile: buildPlatformProfilePayload(context.platform),
  };
}

function buildPlatformProfilePayload(platform) {
  const platformBridge = window.HORECA_PLATFORM && typeof window.HORECA_PLATFORM === 'object'
    ? window.HORECA_PLATFORM
    : null;
  const bridgeContext = typeof platformBridge?.getContext === 'function' ? platformBridge.getContext() : null;
  const bridgeProfile = bridgeContext?.profile && typeof bridgeContext.profile === 'object' ? bridgeContext.profile : null;
  if (bridgeProfile && Object.keys(bridgeProfile).length) return bridgeProfile;
  const normalized = normalizeClientPlatform(platform);
  if (normalized === 'vk') {
    const vkUser = window.HORECA_PLATFORM?.vkUserInfo;
    if (vkUser && typeof vkUser === 'object') {
      return {
        id: String(vkUser.id || '').trim(),
        firstName: String(vkUser.first_name || '').trim(),
        lastName: String(vkUser.last_name || '').trim(),
        username: String(vkUser.screen_name || '').trim(),
        photoUrl: String(vkUser.photo_200 || vkUser.photo_100 || '').trim(),
      };
    }
  }
  if (normalized === 'telegram') {
    const user = getTelegramUser();
    if (user && typeof user === 'object') {
      return {
        id: String(user.id || '').trim(),
        firstName: String(user.first_name || '').trim(),
        lastName: String(user.last_name || '').trim(),
        username: String(user.username || '').trim(),
        photoUrl: buildTelegramUsernameAvatarUrl(String(user.username || '').trim()),
      };
    }
  }
  return {};
}

async function saasTryPlatformBootstrap() {
  return false;
}

async function resolvePublicStoreIdFromPlatformContext() {
  if (state.admin.enabled) return '';
  state.saas.publicResolveError = null;
  await waitForPlatformBridgeReady();
  const platformBridge = window.HORECA_PLATFORM && typeof window.HORECA_PLATFORM === 'object'
    ? window.HORECA_PLATFORM
    : null;
  const context = getClientPlatformContext({ allowGuest: false });
  if (!context?.platform || context.platform === 'web' || context.platform === 'telegram') return '';

  const payload = platformBridge?.buildBootstrapPayload
    ? platformBridge.buildBootstrapPayload()
    : null;

  if (!payload || typeof payload !== 'object') {
    state.saas.publicResolveError = {
      platform: context.platform,
      code: 'PLATFORM_CONTEXT_UNAVAILABLE',
      blocking: true,
      ...getPublicPlatformResolveErrorInfo('PLATFORM_CONTEXT_UNAVAILABLE', context.platform),
    };
    return '';
  }
  try {
    const resolved = await saasRequest('/platform/store-resolve', {
      method: 'POST',
      body: payload,
    });
    const storeId = String(resolved?.storeId || '').trim().toUpperCase();
    state.saas.publicResolveError = null;
    return /^[A-Z0-9]{6}$/.test(storeId) ? storeId : '';
  } catch (error) {
    console.error('public platform store resolve failed', error);
    const code = String(error?.message || 'PLATFORM_STORE_RESOLVE_FAILED').trim();
    state.saas.publicResolveError = {
      platform: context.platform,
      code,
      blocking: true,
      ...getPublicPlatformResolveErrorInfo(code, context.platform),
    };
    return '';
  }
}

async function saasEnsurePlatformLinked() {
  return false;
}

function getTelegramUsername() {
  const username = getTelegramUser().username;
  return username ? String(username) : '';
}

function getTelegramFirstName() {
  const firstName = getTelegramUser().first_name;
  return firstName ? String(firstName) : '';
}

function buildTelegramUsernameAvatarUrl(usernameRaw) {
  const username = String(usernameRaw || '').trim().replace(/^@+/, '');
  if (!username) return '';
  return `https://t.me/i/userpic/320/${encodeURIComponent(username)}.jpg`;
}

function getPromoOwnerKey() {
  return getClientPlatformContext().customerIdentity || 'guest';
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
  if (state.currentCategory !== categoryId) {
    resetProductImportState('category');
    getImportScopeState('category').status = '';
  }
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
  resetProductImportState('category');
  getImportScopeState('category').status = '';
  state.currentCategory = null;
  state.currentCategoryIds = list;
  ui.productsTitle.textContent = title || 'Каталог';
  renderProducts();
  setScreen('products');
}

function getChildCategoryIds(parentId) {
  const pid = String(parentId || '').trim();
  if (!pid) return [];
  return state.categories
    .filter((category) => String(category?.parentId || '').trim() === pid)
    .map((category) => String(category.id || '').trim())
    .filter(Boolean);
}

function collectCategoryBranchIds(categoryId) {
  const rootId = String(categoryId || '').trim();
  if (!rootId) return [];
  const visited = new Set();
  const result = [];
  const walk = (id) => {
    const normalizedId = String(id || '').trim();
    if (!normalizedId || visited.has(normalizedId)) return;
    visited.add(normalizedId);
    result.push(normalizedId);
    getChildCategoryIds(normalizedId).forEach(walk);
  };
  walk(rootId);
  return result;
}

function openCategoryEntry(categoryId) {
  const branchIds = collectCategoryBranchIds(categoryId);
  if (!branchIds.length) return;
  const category = state.categories.find((item) => String(item?.id || '') === String(categoryId || '')) || null;
  if (branchIds.length > 1) {
    openCategoryBundle(branchIds, category?.title || 'Каталог');
    return;
  }
  openCategoryById(categoryId);
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
    if (!state.admin.enabled) {
      renderOrders();
      void syncCustomerOrdersFromServer().then(() => renderOrders());
    }
  }
  if (name === 'bot') {
    renderBotSettings();
  }
  if (name === 'settings-bots') {
    renderBotSettings();
    renderProfileBotConnectSection();
    void maybeOpenCurrentPlatformConnectionPrompt();
  }
  if (name === 'settings-checkout') {
    renderOrderChatSettings();
    renderPaymentIntegrationSettings();
  }
  if (name === 'settings-store') {
    renderStoreSettingsSection();
  }
  if (name === 'orders') {
    void renderAdminOrdersOverview();
  }
  if (name === 'orders-new') {
    void renderAdminOrdersByBucket('new');
  }
  if (name === 'orders-active') {
    void renderAdminOrdersByBucket('active');
  }
  if (name === 'orders-completed') {
    void renderAdminOrdersByBucket('completed');
  }
  if (name === 'orders-canceled') {
    void renderAdminOrdersByBucket('canceled');
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
  if (name === 'stats-popular') {
    void renderAdminStatsPopular();
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
  if (name === 'checkout') {
    saasTrackEvent('begin_checkout', { payload: { cartItems: Object.keys(state.cart || {}).length } });
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

function ensureProfileAdminSections() {
  const profileScreen = document.getElementById('screen-profile');
  if (!profileScreen) return;

  if (!ui.profileBotConnectSection) {
    const section = document.createElement('div');
    section.id = 'profileBotConnectSection';
    section.className = 'profile-subscription-card hidden';
    section.innerHTML = `
      <div class="section-title">Подключение ботов каталога</div>
      <p class="feedback-note">Один и тот же магазин можно подключить сразу к нескольким ботам и площадкам. Telegram-боты подключаются по токену автоматически, а VK/MAX и другие платформы сохраняются как внешние точки входа в каталог.</p>
      <div class="profile-admin-store">Bot ID магазина: <strong id="profileBotStoreIdValue">—</strong></div>
      <div class="profile-admin-store">Ссылка каталога: <strong id="profileBotCatalogUrlValue">—</strong></div>
      <button id="profileBotCatalogUrlCopyButton" class="secondary-button profile-bot-copy-button" type="button">Копировать ссылку каталога</button>
      <form id="profileBotConnectForm" class="order-form flat">
        <label>Платформа
          <select id="profileBotPlatformInput">
            <option value="telegram">Telegram</option>
            <option value="vk">VK</option>
            <option value="max">MAX</option>
            <option value="custom">Другая площадка</option>
          </select>
        </label>
        <label>Название подключения
          <input id="profileBotLabelInput" type="text" autocomplete="off" placeholder="Например: Telegram bot #1" />
        </label>
        <label id="profileBotIdentifierLabel"><span id="profileBotIdentifierLabelText">ID / ссылка бота</span>
          <input id="profileBotIdentifierInput" type="text" autocomplete="off" placeholder="@shop_bot или https://vk.com/..." />
        </label>
        <label id="profileBotTokenLabel"><span id="profileBotTokenLabelText">Bot Token Telegram</span>
          <input id="profileBotTokenInput" type="text" autocomplete="off" placeholder="123456:ABC..." />
        </label>
        <div id="profileBotConnectStatus" class="status"></div>
        <button id="profileBotConnectSaveButton" class="primary-button" type="submit">Добавить подключение</button>
      </form>
      <div id="profileBotConnectionsList" class="catalog-bot-list"></div>
    `;
    const anchor = ui.profilePromoSection || ui.profilePaymentIntegrationSection || ui.profileSubscriptionSection || ui.profileHistorySection;
    if (anchor && anchor.parentNode === profileScreen) {
      profileScreen.insertBefore(section, anchor);
    } else {
      profileScreen.appendChild(section);
    }
  }

  if (!ui.profileOrderChatSection) {
    const section = document.createElement('div');
    section.id = 'profileOrderChatSection';
    section.className = 'profile-subscription-card hidden';
    section.innerHTML = `
      <div class="section-title">Уведомления о заказах в чат</div>
      <p class="feedback-note">Выберите канал уведомлений: Telegram, VK, webhook или внешняя ссылка мессенджера.</p>
      <form id="orderChatSettingsForm" class="order-form flat">
        <input id="orderChatModeInput" type="hidden" value="chat" />
        <label>Канал уведомлений
          <select id="orderRequestChannelInput">
            <option value="telegram_chat">Telegram чат</option>
            <option value="vk_messages">VK сообщения</option>
            <option value="webhook">Webhook</option>
            <option value="messenger_link">Ссылка мессенджера</option>
          </select>
        </label>
        <label id="orderRequestTargetLabel">Chat ID Telegram
          <input id="orderRequestTargetInput" type="text" inputmode="numeric" autocomplete="off" placeholder="Например: -1001234567890" />
        </label>
        <label id="orderRequestVkTokenLabel" class="hidden">Токен сообщества VK
          <input id="orderRequestVkTokenInput" type="text" autocomplete="off" placeholder="vk1.a.... или сервисный токен сообщества" />
        </label>
        <p id="orderRequestHint" class="feedback-note">После сохранения новые заявки будут отправляться в выбранный канал.</p>
        <div id="orderChatStatus" class="status"></div>
        <button id="orderChatSaveButton" class="primary-button" type="submit">Сохранить канал уведомлений</button>
      </form>
    `;
    const anchor = ui.profilePaymentIntegrationSection || ui.profileSubscriptionSection || ui.profileHistorySection;
    if (anchor && anchor.parentNode === profileScreen) {
      profileScreen.insertBefore(section, anchor);
    } else {
      profileScreen.appendChild(section);
    }
  }

  // Refresh UI references in case sections were injected dynamically.
  ui.profileBotConnectSection = document.getElementById('profileBotConnectSection');
  ui.profileBotStoreIdValue = document.getElementById('profileBotStoreIdValue');
  ui.profileBotCatalogUrlValue = document.getElementById('profileBotCatalogUrlValue');
  ui.profileBotCatalogUrlCopyButton = document.getElementById('profileBotCatalogUrlCopyButton');
  ui.profileBotConnectForm = document.getElementById('profileBotConnectForm');
  ui.profileBotPlatformInput = document.getElementById('profileBotPlatformInput');
  ui.profileBotLabelInput = document.getElementById('profileBotLabelInput');
  ui.profileBotIdentifierLabel = document.getElementById('profileBotIdentifierLabel');
  ui.profileBotIdentifierLabelText = document.getElementById('profileBotIdentifierLabelText');
  ui.profileBotIdentifierInput = document.getElementById('profileBotIdentifierInput');
  ui.profileBotTokenLabel = document.getElementById('profileBotTokenLabel');
  ui.profileBotTokenLabelText = document.getElementById('profileBotTokenLabelText');
  ui.profileBotTokenInput = document.getElementById('profileBotTokenInput');
  ui.profileBotConnectStatus = document.getElementById('profileBotConnectStatus');
  ui.profileBotConnectSaveButton = document.getElementById('profileBotConnectSaveButton');
  ui.profileBotConnectionsList = document.getElementById('profileBotConnectionsList');
  ui.profilePlatformBindingsSection = document.getElementById('profilePlatformBindingsSection');
  ui.platformBindingForm = document.getElementById('platformBindingForm');
  ui.platformBindingPlatformInput = document.getElementById('platformBindingPlatformInput');
  ui.platformBindingTypeInput = document.getElementById('platformBindingTypeInput');
  ui.platformBindingTitleInput = document.getElementById('platformBindingTitleInput');
  ui.platformBindingExternalIdInput = document.getElementById('platformBindingExternalIdInput');
  ui.platformBindingStatus = document.getElementById('platformBindingStatus');
  ui.platformBindingSaveButton = document.getElementById('platformBindingSaveButton');
  ui.platformBindingsList = document.getElementById('platformBindingsList');

  ui.profileOrderChatSection = document.getElementById('profileOrderChatSection');
  ui.orderChatSettingsForm = document.getElementById('orderChatSettingsForm');
  ui.orderChatModeInput = document.getElementById('orderChatModeInput');
  ui.orderRequestChannelInput = document.getElementById('orderRequestChannelInput');
  ui.orderRequestTargetLabel = document.getElementById('orderRequestTargetLabel');
  ui.orderRequestTargetInput = document.getElementById('orderRequestTargetInput');
  ui.orderRequestVkTokenLabel = document.getElementById('orderRequestVkTokenLabel');
  ui.orderRequestVkTokenInput = document.getElementById('orderRequestVkTokenInput');
  ui.orderRequestHint = document.getElementById('orderRequestHint');
  ui.orderChatStatus = document.getElementById('orderChatStatus');
  ui.orderChatSaveButton = document.getElementById('orderChatSaveButton');
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
    'settings-bots': ui.botButton,
    'settings-checkout': ui.botButton,
    'settings-store': ui.botButton,
    orders: ui.statsButton,
    'orders-new': ui.statsButton,
    'orders-active': ui.statsButton,
    'orders-completed': ui.statsButton,
    'orders-canceled': ui.statsButton,
    stats: ui.profileButton,
    'stats-revenue': ui.profileButton,
    'stats-orders': ui.profileButton,
    'stats-popular': ui.profileButton,
    favorites: ui.favoritesButton,
    menu: ui.menuButton,
  };
  const defaultButton = ui.homeButton;
  const activeButton = map[screen] || defaultButton;
  [ui.homeButton, ui.menuButton, ui.cartButton, ui.favoritesButton, ui.profileButton, ui.botButton, ui.statsButton, ui.ordersButton].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle('active', btn === activeButton);
  });
}

function formatPrice(v) { return Number(v || 0).toLocaleString('ru-RU'); }
function hasPrice(p) { return Number(p && p.price) > 0; }
function priceLabel(p) {
  const view = getProductPriceView(p, { withOldPrice: false });
  return view.hasPrice ? `${formatPrice(view.finalPrice)} ₽` : 'Цена по запросу';
}
function discountedPrice(p, percent) {
  if (!hasPrice(p)) return null;
  const factor = 1 - (percent || 0) / 100;
  return Math.round(Number(p.price) * factor);
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

function normalizePromoCatalogConfig(raw) {
  const title = String(raw?.title || '').trim() || DEFAULT_PROMO_CATALOG.title;
  const image = String(raw?.image || '').trim();
  return { title, image };
}

function ensurePromoCatalogConfig() {
  if (!state.config || typeof state.config !== 'object') state.config = {};
  state.config.promoCatalog = normalizePromoCatalogConfig(state.config.promoCatalog || {});
  return state.config.promoCatalog;
}

function renderPromoCatalogLabels() {
  const promoCatalog = ensurePromoCatalogConfig();
  if (ui.menuPromoButton) ui.menuPromoButton.textContent = promoCatalog.title;
  if (ui.homePromoTitleButton) ui.homePromoTitleButton.textContent = promoCatalog.title;
}

function setProductPromoPercent(product, percent) {
  if (!product || typeof product !== 'object') return;
  const normalized = normalizeProductDiscountPercent(percent);
  if (normalized > 0) {
    product.discountPercent = normalized;
  } else {
    product.discountPercent = 0;
  }
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
      const fallback = DEFAULT_HOME_BANNERS[index % DEFAULT_HOME_BANNERS.length] || DEFAULT_HOME_BANNERS[0];
      return {
        id: String(item?.id || `banner-${index + 1}`),
        image: String(item?.image || fallback?.image || ''),
        kicker: String(item?.kicker || fallback?.kicker || ''),
        title: String(item?.title || fallback?.title || ''),
        text: String(item?.text || fallback?.text || ''),
        cta: String(item?.cta || fallback?.cta || ''),
      };
    })
    .filter((item) => item.title && item.text);
}

function normalizeHomeArticles(list) {
  if (!Array.isArray(list)) return [];
  return [];
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

function enforceHomeBlueprint() {
  if (!state.config || typeof state.config !== 'object') state.config = {};
  if (!Array.isArray(state.config.homeBanners) || !state.config.homeBanners.length) {
    state.config.homeBanners = DEFAULT_HOME_BANNERS.map((item) => ({ ...item }));
  }
  if (!Array.isArray(state.config.homeArticles)) {
    state.config.homeArticles = [];
  }
  ensurePromoCatalogConfig();
  state.config.homeBlockOrder = normalizeHomeBlockOrder(state.config.homeBlockOrder);
  state.config.homeRebuildStamp = HOME_REBUILD_STAMP;
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

function adminMoveBannerByOffset(bannerId, offset) {
  const list = Array.isArray(state.config.homeBanners) ? state.config.homeBanners : [];
  const from = list.findIndex((item, idx) => String(item?.id || `banner-${idx + 1}`) === String(bannerId || ''));
  if (from < 0) return false;
  const to = from + Number(offset || 0);
  if (to < 0 || to >= list.length) return false;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
  state.config.homeBanners = list;
  renderHomeBanners();
  adminSaveDraft(true);
  return true;
}

// Рендерим главный слайдер полностью из config.json.
function renderHomeBanners() {
  enforceHomeBlueprint();
  renderPromoCatalogLabels();
  if (!ui.homeBannerTrack || !ui.homeBannerDots) return;
  const banners = normalizeHomeBanners(state.config.homeBanners);
  ui.homeBannerTrack.innerHTML = banners.map((banner) => `
    <article class="home-v2-banner-card${state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'banner' && state.admin.selectedId === banner.id ? ' admin-selected-target' : ''}" data-banner-id="${escapeHtml(banner.id)}" style="background-image:url('${safeSrc(banner.image)}')">
      <div class="featured-chip">${escapeHtml(banner.kicker)}</div>
      <div class="featured-title">${escapeHtml(banner.title)}</div>
      <div class="featured-text">${escapeHtml(banner.text)}</div>
    </article>
  `).join('');
  ui.homeBannerDots.innerHTML = banners.map((_, index) => `
    <button class="dot ${index === 0 ? 'active' : ''}" data-home-banner-dot="${index}" type="button" aria-label="Баннер ${index + 1}"></button>
  `).join('');

  ui.homeBannerTrack.classList.toggle('is-admin-scroll', Boolean(state.admin.enabled));
  ui.homeBannerDots.classList.toggle('is-hidden', banners.length <= 1 || state.admin.enabled);
  state.homeBannerIndex = 0;
  if (state.admin.enabled) {
    if (state.homeBannerTimer) {
      window.clearInterval(state.homeBannerTimer);
      state.homeBannerTimer = null;
    }
    ui.homeBannerTrack.style.transform = '';
    ui.homeBannerTrack.scrollLeft = 0;
  } else {
    setHomeBanner(0);
    startHomeBannerAutoplay();
  }
  applyHomeBlockOrder();
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

// Статьи главной также приходят из конфига и готовы к редактированию через админку.
function renderHomeArticles() {
  if (ui.homeArticleTrack) ui.homeArticleTrack.innerHTML = '';
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

function adminPickImageFile({ source = 'gallery' } = {}) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') input.setAttribute('capture', 'environment');
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

async function adminPickAndUploadImage({ allowCameraChoice = false, source = '' } = {}) {
  let sourceMode = source === 'camera' ? 'camera' : source === 'gallery' ? 'gallery' : '';
  if (!sourceMode && allowCameraChoice) {
    const action = await adminOpenActionSheet('Добавить фото', [
      { id: 'gallery', label: 'Выбрать из галереи' },
      { id: 'camera', label: 'Сфоткать камерой' },
    ]);
    if (!action) return null;
    sourceMode = action === 'camera' ? 'camera' : 'gallery';
  }
  if (!sourceMode) sourceMode = 'gallery';
  const file = await adminPickImageFile({ source: sourceMode });
  if (!file) return null;
  if (!String(file.type || '').startsWith('image/')) {
    reportStatus('Выбранный файл не является изображением');
    return null;
  }
  return adminUploadImageFile(file);
}

function isPlaceholderImage(src) {
  return /assets\/placeholder\.svg$/i.test(String(src || '').trim());
}

function buildProductImageSelectionId(productId, index) {
  return `${String(productId || '')}::${Math.max(0, Number(index || 0))}`;
}

function parseProductImageSelectionId(selectionId, productId) {
  const text = String(selectionId || '');
  const marker = '::';
  const markerIndex = text.lastIndexOf(marker);
  if (markerIndex <= 0) return -1;
  const selectedProductId = text.slice(0, markerIndex);
  const indexPart = text.slice(markerIndex + marker.length);
  if (selectedProductId !== String(productId || '')) return -1;
  const idx = Number(indexPart);
  if (!Number.isInteger(idx) || idx < 0) return -1;
  return idx;
}

function moveProductImageByOffset(product, fromIndex, offset) {
  if (!product || !Array.isArray(product.images)) return -1;
  const from = Number(fromIndex);
  const step = Number(offset);
  if (!Number.isInteger(from) || from < 0 || from >= product.images.length) return -1;
  if (!Number.isInteger(step) || step === 0) return from;
  const to = Math.max(0, Math.min(product.images.length - 1, from + step));
  if (to === from) return from;
  const [item] = product.images.splice(from, 1);
  product.images.splice(to, 0, item);
  return to;
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

function adminOpenActionSheet(title, actions = [], { skipFeatureGate = false } = {}) {
  if (!skipFeatureGate && !requireAdminFeatureAccess()) return Promise.resolve(null);
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
  if (!requireAdminFeatureAccess()) return Promise.resolve(null);
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

const adminTapIntentState = {
  key: '',
  ts: 0,
  timer: null,
};

function adminBindTapIntent(el, {
  onSingleTap = null,
  onDoubleTap = null,
  selectType = '',
  selectId = null,
  tapGroup = '',
} = {}) {
  if (!state.admin.enabled || !el || el.dataset.adminTapIntentBound === '1') return;
  el.dataset.adminTapIntentBound = '1';

  const clear = () => {
    if (adminTapIntentState.timer) window.clearTimeout(adminTapIntentState.timer);
    adminTapIntentState.timer = null;
    adminTapIntentState.key = '';
    adminTapIntentState.ts = 0;
  };

  const flashTarget = () => {
    el.classList.remove('admin-doubletap-flash');
    void el.offsetWidth;
    el.classList.add('admin-doubletap-flash');
    window.setTimeout(() => el.classList.remove('admin-doubletap-flash'), 520);
  };

  const resolveSelectId = () => (typeof selectId === 'function' ? selectId() : selectId);
  const resolveTapGroup = () => {
    const raw = typeof tapGroup === 'function' ? tapGroup() : tapGroup;
    if (raw) return String(raw);
    const selectedId = resolveSelectId();
    if (selectType && selectedId) return `${selectType}:${selectedId}`;
    return el.id || el.dataset.adminTapIntentBound || '';
  };

  const shouldIgnore = (event) => {
    if (!event.target || !event.target.closest) return false;
    const interactive = event.target.closest('input, textarea, select, a, [data-admin-add], .qty-btn, .icon-btn');
    return !!(interactive && interactive !== el && el.contains(interactive));
  };

  el.addEventListener('click', (event) => {
    if (!state.admin.enabled || shouldIgnore(event)) return;

    const selectedId = resolveSelectId();
    if (state.admin.selectionMode && selectType && selectedId) {
      event.preventDefault();
      event.stopPropagation();
      clear();
      adminSelectItem(selectType, selectedId);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    const groupKey = resolveTapGroup();
    if (adminTapIntentState.timer && adminTapIntentState.key === groupKey && now - adminTapIntentState.ts <= state.admin.tapDelay) {
      clear();
      flashTarget();
      if (typeof onDoubleTap === 'function') onDoubleTap();
      return;
    }

    clear();
    adminTapIntentState.key = groupKey;
    adminTapIntentState.ts = now;
    adminTapIntentState.timer = window.setTimeout(() => {
      clear();
      if (typeof onSingleTap === 'function') onSingleTap();
    }, state.admin.tapDelay);
  });
}

function adminAddBannerTemplate() {
  if (!Array.isArray(state.config.homeBanners)) state.config.homeBanners = [];
  state.config.homeBanners.unshift({
    id: `banner-${Date.now()}`,
    image: '/assets/banners/home-ad-v2.svg',
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
  adminPickAndUploadImage({ allowCameraChoice: true }).then((imageUrl) => {
    if (!imageUrl) return;
    if (!Array.isArray(p.images)) p.images = [];
    const hasOnlyPlaceholder = p.images.length === 1 && isPlaceholderImage(p.images[0]);
    if (!p.images.length || hasOnlyPlaceholder) p.images = [imageUrl];
    else p.images.push(imageUrl);
    adminSaveDraft(true);
    renderProductView();
    reportStatus('Фото добавлено');
  });
}

function adminAddProductSpec() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (!Array.isArray(p.specs)) p.specs = [];
  p.specs.push('Новая характеристика');
  adminSaveDraft(true);
  renderProductView();
}

function adminDeleteSelectedImage() {
  if (!state.admin.enabled || !state.admin.selectionMode || state.admin.selectedType !== 'image' || !state.admin.selectedId) {
    reportStatus('Сначала включите "Выделить" и выберите фото');
    return;
  }
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (!Array.isArray(p.images) || !p.images.length) return;
  const selectedIndex = parseProductImageSelectionId(state.admin.selectedId, p.id);
  if (selectedIndex < 0 || selectedIndex >= p.images.length) {
    reportStatus('Выберите фото для удаления');
    return;
  }
  p.images.splice(selectedIndex, 1);
  if (!p.images.length) p.images = ['assets/placeholder.svg'];
  const nextIndex = Math.min(selectedIndex, p.images.length - 1);
  state.admin.selectedId = buildProductImageSelectionId(p.id, Math.max(0, nextIndex));
  adminSaveDraft(true);
  renderProductView();
  reportStatus('Фото удалено');
}

function adminConfigureProductPromo(product) {
  if (!product) return;
  const currentPercent = getProductPromoPercent(product);
  adminOpenActionSheet(`Акции: ${product.title || product.id}`, [
    { id: 'set', label: currentPercent > 0 ? `Изменить скидку (${currentPercent}%)` : 'Добавить в акции' },
    ...(currentPercent > 0 ? [{ id: 'remove', label: 'Убрать из акций', danger: true }] : []),
  ]).then((action) => {
    if (!action) return;
    if (action === 'remove') {
      setProductPromoPercent(product, 0);
      adminSaveDraft(true);
      renderPromos();
      if (state.currentScreen === 'products') renderProducts();
      if (state.currentScreen === 'product') renderProductView();
      if (state.currentScreen === 'categories') renderCategories();
      reportStatus('Товар убран из акций');
      return;
    }
    if (action !== 'set') return;
    const suggestion = currentPercent > 0 ? currentPercent : 10;
    adminEditValue('Скидка на товар, %', suggestion, { numeric: true }).then((value) => {
      if (value == null || value.__delete) return;
      const normalized = normalizeProductDiscountPercent(value);
      if (normalized <= 0) {
        reportStatus('Введите скидку больше 0%');
        return;
      }
      setProductPromoPercent(product, normalized);
      adminSaveDraft(true);
      renderPromos();
      if (state.currentScreen === 'products') renderProducts();
      if (state.currentScreen === 'product') renderProductView();
      if (state.currentScreen === 'categories') renderCategories();
      reportStatus(`Товар добавлен в акции: -${normalized}%`);
    });
  });
}

function getAdminMoveTargetCategories(product) {
  const currentCategoryId = String(product?.categoryId || '');
  return state.categories
    .filter((category) => String(category?.id || '').trim())
    .filter((category) => String(category.id) !== currentCategoryId);
}

function adminMoveProductToCategory(product) {
  if (!product) return;
  const targetCategories = getAdminMoveTargetCategories(product);
  if (!targetCategories.length) {
    reportStatus('Нет другой категории для переноса товара');
    return;
  }
  const currentCategory = state.categories.find((category) => String(category.id) === String(product.categoryId || ''));
  adminOpenActionSheet(`Перенести: ${product.title || product.id}`, targetCategories.map((category) => ({
    id: String(category.id),
    label: category.title || category.id,
  }))).then((targetCategoryId) => {
    if (!targetCategoryId) return;
    const targetCategory = state.categories.find((category) => String(category.id) === String(targetCategoryId));
    if (!targetCategory) {
      reportStatus('Категория для переноса не найдена');
      return;
    }
    const confirmed = window.confirm(
      `Перенести товар "${product.title || product.id}" из "${currentCategory?.title || 'текущей категории'}" в "${targetCategory.title || targetCategory.id}"?`,
    );
    if (!confirmed) return;
    product.categoryId = targetCategory.id;
    if (targetCategory.groupId) state.currentGroup = targetCategory.groupId;
    state.currentCategoryIds = null;
    state.currentCategory = targetCategory.id;
    if (ui.productsTitle) ui.productsTitle.textContent = targetCategory.title || 'Каталог';
    adminSaveDraft(true);
    renderProducts();
    if (state.currentScreen === 'product') renderProductView();
    if (state.currentScreen === 'categories') renderCategories();
    reportStatus(`Товар перенесен в категорию "${targetCategory.title || targetCategory.id}"`);
  });
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
  if (!requireAdminFeatureAccess()) return;
  const payload = adminBuildPayload();
  try {
    localStorage.setItem(getAdminDraftKey(), JSON.stringify(payload));
    if (!silent) reportStatus('Черновик админки сохранен');
  } catch {
    reportStatus('Черновик не сохранен: переполнена память браузера');
  }
}

async function adminPublishToCatalog() {
  if (!requireAdminFeatureAccess()) return;
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
      const code = String(error?.message || '');
      if (code === 'SUBSCRIPTION_REQUIRED') {
        reportStatus('Выгрузка недоступна: активируйте подписку в профиле.');
      } else {
        reportStatus(`Ошибка выгрузки: ${code || 'unknown'}`);
      }
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

function getImportScopeState(scope) {
  return state.imports?.[scope] || state.imports.catalog;
}

function getImportScopeUi(scope) {
  if (scope === 'catalog') {
    return {
      panel: ui.catalogImportPanel,
      file: ui.catalogImportFile,
      fileName: document.getElementById('catalogImportFileName'),
      previewButton: ui.catalogImportPreviewButton,
      submitButton: ui.catalogImportSubmitButton,
      status: ui.catalogImportStatus,
      preview: ui.catalogImportPreview,
    };
  }
  return {
    panel: ui.productsImportPanel,
    file: ui.productsImportFile,
    fileName: document.getElementById('productsImportFileName'),
    previewButton: ui.productsImportPreviewButton,
    submitButton: ui.productsImportSubmitButton,
    status: ui.productsImportStatus,
    preview: ui.productsImportPreview,
  };
}

function getImportScopeOptions(scope) {
  if (scope === 'category') {
    const currentCategory = state.categories.find((item) => item.id === state.currentCategory) || null;
    return {
      scope,
      categoryId: String(currentCategory?.id || ''),
      categoryTitle: String(currentCategory?.title || ''),
      previewHint: currentCategory
        ? `Поддерживаются CSV/XLS/XLSX до 5 МБ. Все товары будут добавлены в категорию «${currentCategory.title}».`
        : 'Сначала откройте категорию, затем импортируйте файл в нее.',
      idleStatus: currentCategory
        ? `Загрузите файл для категории «${currentCategory.title}».`
        : 'Сначала откройте нужную категорию.',
    };
  }
  return {
    scope: 'catalog',
    categoryId: '',
    categoryTitle: '',
    groupId: String(state.currentGroup || 'apparel').trim() || 'apparel',
    previewHint: 'Поддерживаются CSV/XLS/XLSX до 5 МБ. Поля category и subcategory создают структуру каталога.',
    idleStatus: 'Загрузите CSV/XLS/XLSX. Разделы и подразделы создадутся автоматически из файла.',
  };
}

function resetProductImportState(scope, { keepFile = false } = {}) {
  const importState = getImportScopeState(scope);
  const importUi = getImportScopeUi(scope);
  importState.previewRequestId += 1;
  if (!keepFile) {
    importState.file = null;
    importState.fileName = '';
    importState.fileLabel = '';
    if (importUi.file) importUi.file.value = '';
    if (importUi.fileName) importUi.fileName.textContent = 'Не выбран';
  }
  importState.previewRows = [];
  importState.previewToken = '';
  importState.summary = null;
  importState.loading = false;
  importState.importing = false;
}

function formatImportFileLabel(file) {
  if (!file) return '';
  const name = String(file.name || '').trim() || 'Без имени';
  const size = Number(file.size || 0);
  if (!(size > 0)) return name;
  if (size >= 1024 * 1024) return `${name} (${(size / (1024 * 1024)).toFixed(1)} МБ)`;
  if (size >= 1024) return `${name} (${Math.max(1, Math.round(size / 1024))} КБ)`;
  return `${name} (${size} Б)`;
}

function formatImportByteSize(value) {
  const size = Number(value || 0);
  if (!(size > 0)) return '0 Б';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
  if (size >= 1024) return `${Math.max(1, Math.round(size / 1024))} КБ`;
  return `${size} Б`;
}

function getProductImportReadyRows(scope) {
  const importState = getImportScopeState(scope);
  return Array.isArray(importState.previewRows)
    ? importState.previewRows.filter((row) => row && row.canImport)
    : [];
}

function buildProductImportSummaryHtml(summary) {
  if (!summary) return '';
  const recognizedFields = Array.isArray(summary.recognizedFields) ? summary.recognizedFields : [];
  const sourceFields = Array.isArray(summary.sourceFields) ? summary.sourceFields : [];
  const sourceInfo = [
    summary.sourceFileName ? `Сервер получил файл: ${escapeHtml(summary.sourceFileName)}` : '',
    Number(summary.sourceFileSize || 0) >= 0 ? `Размер: ${escapeHtml(formatImportByteSize(summary.sourceFileSize || 0))}` : '',
    Number(summary.sourceRowsCount || 0) ? `Строк после чтения: ${escapeHtml(String(summary.sourceRowsCount || 0))}` : '',
  ].filter(Boolean).join(' · ');
  return `
    <div class="products-import-summary">
      <div class="products-import-summary-item"><strong>${summary.totalRows || 0}</strong><span>строк</span></div>
      <div class="products-import-summary-item"><strong>${summary.readyToImport || 0}</strong><span>готово</span></div>
      <div class="products-import-summary-item"><strong>${summary.invalidRows || 0}</strong><span>с ошибками</span></div>
      <div class="products-import-summary-item"><strong>${summary.createCount || 0}</strong><span>создать</span></div>
      <div class="products-import-summary-item"><strong>${summary.updateCount || 0}</strong><span>обновить</span></div>
      <div class="products-import-summary-item"><strong>${summary.rootCategoriesToCreate || 0}</strong><span>разделов</span></div>
      <div class="products-import-summary-item"><strong>${summary.subcategoriesToCreate || 0}</strong><span>подразделов</span></div>
      <div class="products-import-summary-item"><strong>${summary.imageRows || 0}</strong><span>фото по ссылке</span></div>
    </div>
    ${sourceInfo ? `<div class="products-import-recognized">${sourceInfo}</div>` : ''}
    ${sourceFields.length ? `<div class="products-import-recognized">Колонки файла: ${sourceFields.map((item) => escapeHtml(item)).join(', ')}</div>` : ''}
    ${recognizedFields.length ? `<div class="products-import-recognized">Распознаны поля: ${recognizedFields.map((item) => escapeHtml(item)).join(', ')}</div>` : ''}
  `;
}

function renderProductImportPanel(scope = 'category') {
  const importState = getImportScopeState(scope);
  const importUi = getImportScopeUi(scope);
  const scopeOptions = getImportScopeOptions(scope);
  if (!importUi.panel) return;
  const show = Boolean(state.admin.enabled);
  importUi.panel.classList.toggle('hidden', !show);
  if (!show) return;

  const canUseImport = !!(
    state.saas.enabled
    && state.saas.storeId
    && state.saas.token
    && subscriptionAllowsAdminFeatures()
    && (scope !== 'category' || scopeOptions.categoryId)
  );

  if (importUi.file) importUi.file.disabled = !canUseImport || importState.loading || importState.importing;
  if (importUi.fileName) {
    importUi.fileName.textContent = importState.fileLabel || importState.fileName || 'Не выбран';
    importUi.fileName.classList.toggle('is-empty', !importState.fileName && !importState.fileLabel);
  }
  if (importUi.previewButton) {
    importUi.previewButton.disabled = !canUseImport || !importState.file || importState.loading || importState.importing;
    importUi.previewButton.textContent = importState.loading ? 'Проверяем...' : 'Обновить';
  }
  if (importUi.submitButton) {
    importUi.submitButton.disabled = !canUseImport || !getProductImportReadyRows(scope).length || importState.loading || importState.importing;
    importUi.submitButton.textContent = importState.importing ? 'Импортируем...' : 'Импортировать';
  }

  const defaultStatus = canUseImport ? '' : 'Импорт недоступен';
  const statusText = importState.status || defaultStatus;
  if (importUi.status) {
    importUi.status.textContent = statusText;
    importUi.status.classList.toggle('hidden', !statusText);
  }

  if (!importUi.preview) return;
  const rows = Array.isArray(importState.previewRows) ? importState.previewRows : [];
  if (!rows.length) {
    importUi.preview.innerHTML = '';
    importUi.preview.classList.add('hidden');
    return;
  }

  const summaryHtml = buildProductImportSummaryHtml(importState.summary);
  const previewLimit = 20;
  const visibleRows = rows.slice(0, previewLimit);
  const moreCount = Math.max(0, rows.length - previewLimit);
  importUi.preview.innerHTML = `
    ${summaryHtml}
    <div class="products-import-preview-list">
      ${visibleRows.map((row) => `
        <article class="products-import-row ${row.canImport ? 'is-valid' : 'is-invalid'}">
          <div class="products-import-row-head">
            <strong>Строка ${row.rowNumber}</strong>
            <span>${row.canImport ? (row.operation === 'update' ? 'Обновление' : 'Создание') : 'Ошибка'}</span>
          </div>
          <div class="products-import-row-grid">
            <div><span>Товар</span><strong>${escapeHtml(row.normalized?.title || '—')}</strong></div>
            <div><span>Категория</span><strong>${escapeHtml((row.targetCategoryPath || [row.normalized?.category || '', row.normalized?.subcategory || ''].filter(Boolean)).join(' / ') || '—')}</strong></div>
            <div><span>Цена</span><strong>${Number.isFinite(Number(row.normalized?.price)) ? `${formatPrice(Number(row.normalized.price))} ₽` : '—'}</strong></div>
            <div><span>Артикул</span><strong>${escapeHtml(row.normalized?.sku || '—')}</strong></div>
            <div><span>Характеристики</span><strong>${Array.isArray(row.normalized?.characteristics) && row.normalized.characteristics.length ? escapeHtml(String(row.normalized.characteristics.length)) : '—'}</strong></div>
            <div><span>Фото</span><strong>${Array.isArray(row.normalized?.imageUrls) ? row.normalized.imageUrls.length : 0}</strong></div>
          </div>
          ${row.errors?.length ? `<div class="products-import-row-note is-error">${row.errors.map((item) => escapeHtml(item)).join('<br />')}</div>` : ''}
          ${row.warnings?.length ? `<div class="products-import-row-note is-warning">${row.warnings.map((item) => escapeHtml(item)).join('<br />')}</div>` : ''}
        </article>
      `).join('')}
    </div>
    ${moreCount ? `<div class="products-import-more">Показаны первые ${previewLimit} строк из ${rows.length}. Остальные будут импортированы по тем же правилам.</div>` : ''}
  `;
  importUi.preview.classList.remove('hidden');
}

async function previewProductImportFile(scope = 'category') {
  const importState = getImportScopeState(scope);
  const scopeOptions = getImportScopeOptions(scope);
  if (!state.admin.enabled || !state.saas.storeId || !importState.file) return;
  if (!requireAdminFeatureAccess()) return;
  const requestId = importState.previewRequestId + 1;
  importState.previewRequestId = requestId;
  const requestFile = importState.file;
  const requestFileName = importState.fileName;
  const requestFileLabel = importState.fileLabel;
  importState.loading = true;
  importState.previewRows = [];
  importState.summary = null;
  importState.status = `Проверяем файл ${requestFileLabel || requestFileName || ''}`.trim();
  renderProductImportPanel(scope);
  try {
    const form = new FormData();
    form.append('file', requestFile);
    form.append('scope', scopeOptions.scope);
    if (scopeOptions.categoryId) form.append('categoryId', scopeOptions.categoryId);
    if (scopeOptions.groupId) form.append('groupId', scopeOptions.groupId);
    const payload = await saasRequestWithForm(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/import-products/preview`, form, { auth: true });
    if (requestId !== importState.previewRequestId || requestFile !== importState.file) return;
    importState.previewRows = Array.isArray(payload.rows) ? payload.rows : [];
    importState.previewToken = String(payload.previewToken || '').trim();
    importState.summary = payload.summary && typeof payload.summary === 'object' ? payload.summary : null;
    const summary = importState.summary || {};
    const serverFileName = String(payload.fileName || '').trim();
    const fileLabel = requestFileLabel || requestFileName || serverFileName;
    importState.status = `Файл проверен: ${fileLabel}. Создать ${summary.createCount || 0}, обновить ${summary.updateCount || 0}, ошибок ${summary.invalidRows || 0}. Нажмите «Импортировать».`;
  } catch (error) {
    if (requestId !== importState.previewRequestId || requestFile !== importState.file) return;
    importState.previewRows = [];
    importState.previewToken = '';
    importState.summary = null;
    importState.loading = false;
    importState.status = `Ошибка проверки: ${error.message || 'unknown'}`;
    renderProductImportPanel(scope);
    return;
  } finally {
    if (requestId !== importState.previewRequestId || requestFile !== importState.file) return;
    importState.loading = false;
    renderProductImportPanel(scope);
  }
}

async function importProductsFromPreview(scope = 'category') {
  const importState = getImportScopeState(scope);
  const scopeOptions = getImportScopeOptions(scope);
  if (!state.admin.enabled || !state.saas.storeId) return;
  if (!requireAdminFeatureAccess()) return;
  const readyRows = getProductImportReadyRows(scope);
  if (!readyRows.length) {
    importState.status = 'Нет строк, готовых к импорту.';
    renderProductImportPanel(scope);
    return;
  }
  const confirmText = scope === 'catalog'
    ? `Импортировать ${readyRows.length} товаров в каталог магазина ${state.saas.storeId}?`
    : `Импортировать ${readyRows.length} товаров в категорию «${scopeOptions.categoryTitle || 'текущая категория'}»?`;
  const confirmed = window.confirm(confirmText);
  if (!confirmed) return;
  importState.importing = true;
  importState.status = `Импортируем ${readyRows.length} товаров...`;
  renderProductImportPanel(scope);
  try {
    const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/import-products`, {
      method: 'POST',
      auth: true,
      body: {
        previewToken: importState.previewToken || '',
        rows: importState.previewToken ? [] : importState.previewRows,
        scope: scopeOptions.scope,
        categoryId: scopeOptions.categoryId,
        groupId: scopeOptions.groupId,
      },
    });
    if (payload.dataset) applyStoreDataset(payload.dataset);
    renderHeaderStore();
    renderStores();
    renderHomeBanners();
    renderHomeArticles();
    renderHomePopular();
    renderPromos();
    renderCategories();
    renderProducts();
    if (state.currentProduct) renderProductView();
    const result = payload.result || {};
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    importState.status = `Импорт завершен: создано ${result.createdCount || 0}, обновлено ${result.updatedCount || 0}, пропущено ${result.skippedCount || 0}, предупреждений ${warningCount}.`;
    reportStatus(`Импорт товаров: создано ${result.createdCount || 0}, обновлено ${result.updatedCount || 0}`);
    resetProductImportState(scope);
  } catch (error) {
    const code = String(error?.message || 'unknown');
    importState.status = code === 'IMPORT_PREVIEW_EXPIRED'
      ? 'Предпросмотр устарел. Нажмите «Обновить» и повторите импорт.'
      : `Ошибка импорта: ${code}`;
  } finally {
    importState.importing = false;
    renderProductImportPanel(scope);
  }
}

function adminRestoreDraft() {
  const raw = localStorage.getItem(getAdminDraftKey());
  if (!raw) return false;
  const parsed = safeParse(raw, null);
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.config && typeof parsed.config === 'object') state.config = parsed.config;
  applyAppearanceFromConfig({ fallbackToState: true });
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
  applyAppearanceFromConfig();
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
    const openBanner = () => setScreen('home');
    const openBannerMenu = () => {
      adminOpenActionSheet('Баннер', [
        { id: 'move-prev', label: 'Сдвинуть влево' },
        { id: 'move-next', label: 'Сдвинуть вправо' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-text', label: 'Редактировать текст' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'move-prev') {
          adminMoveBannerByOffset(itemId, -1);
          return;
        }
        if (action === 'move-next') {
          adminMoveBannerByOffset(itemId, 1);
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
    };
    adminBindTapIntent(card, {
      onSingleTap: openBanner,
      onDoubleTap: openBannerMenu,
      selectType: 'banner',
      selectId: () => itemId,
      tapGroup: () => `banner:${itemId}`,
    });
    [title, text, kicker].forEach((el) => adminBindTapIntent(el, {
      onSingleTap: openBanner,
      onDoubleTap: openBannerMenu,
      selectType: 'banner',
      selectId: () => itemId,
      tapGroup: () => `banner:${itemId}`,
    }));
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
    const openArticle = () => setScreen(item.screen || 'about');
    const openArticleMenu = () => {
      adminOpenActionSheet('Статья', [
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-text', label: 'Редактировать текст' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
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
    };
    adminBindTapIntent(card, {
      onSingleTap: openArticle,
      onDoubleTap: openArticleMenu,
      tapGroup: () => `article:${itemId}`,
    });
    [title, text, kicker].forEach((el) => adminBindTapIntent(el, {
      onSingleTap: openArticle,
      onDoubleTap: openArticleMenu,
      tapGroup: () => `article:${itemId}`,
    }));
  });

  adminBindTapIntent(ui.aboutText, {
    tapGroup: 'about-text',
    onDoubleTap: () => {
      adminOpenActionSheet('О продукте', [
        { id: 'edit', label: 'Редактировать текст' },
      ]).then((action) => {
        if (action !== 'edit') return;
        adminEditValue('aboutText', state.config.aboutText || '', { multiline: true }).then((value) => {
          if (value == null || value.__delete) return;
          state.config.aboutText = value;
          ui.aboutText.innerHTML = formatMultiline(value);
          adminSaveDraft(true);
        });
      });
    },
  });
  adminBindTapIntent(ui.paymentText, {
    tapGroup: 'payment-text',
    onDoubleTap: () => {
      adminOpenActionSheet('Оплата', [
        { id: 'edit', label: 'Редактировать текст' },
      ]).then((action) => {
        if (action !== 'edit') return;
        adminEditValue('paymentText', state.config.paymentText || '', { multiline: true }).then((value) => {
          if (value == null || value.__delete) return;
          state.config.paymentText = value;
          ui.paymentText.innerHTML = formatMultiline(value);
          adminSaveDraft(true);
        });
      });
    },
  });
  adminBindTapIntent(ui.productionText, {
    tapGroup: 'production-text',
    onDoubleTap: () => {
      adminOpenActionSheet('Производство', [
        { id: 'edit', label: 'Редактировать текст' },
      ]).then((action) => {
        if (action !== 'edit') return;
        adminEditValue('productionText', state.config.productionText || '', { multiline: true }).then((value) => {
          if (value == null || value.__delete) return;
          state.config.productionText = value;
          ui.productionText.innerHTML = formatMultiline(value);
          adminSaveDraft(true);
        });
      });
    },
  });
  adminBindTapIntent(ui.contactsCard, {
    tapGroup: 'contacts-text',
    onDoubleTap: () => {
      adminOpenActionSheet('Контакты', [
        { id: 'edit', label: 'Редактировать текст' },
      ]).then((action) => {
        if (action !== 'edit') return;
        adminEditValue('contactsText', state.config.contactsText || '', { multiline: true }).then((value) => {
          if (value == null || value.__delete) return;
          state.config.contactsText = value;
          ui.contactsCard.innerHTML = formatMultiline(value);
          adminSaveDraft(true);
        });
      });
    },
  });

}

function adminBindCategories() {
  if (!ui.categoriesGrid) return;
  ui.categoriesGrid.querySelectorAll('[data-category]').forEach((card) => {
    const categoryId = card.dataset.category;
    const category = state.categories.find((c) => c.id === categoryId);
    if (!category) return;
    const openCategory = () => openCategoryEntry(category.id);
    const openCategoryMenu = () => {
      adminOpenActionSheet(`Категория: ${category.title}`, [
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
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
          const confirmed = window.confirm(`Удалить категорию "${category.title}" вместе с товарами без возможности восстановления?`);
          if (!confirmed) return;
          deleteCategoriesAndProducts(collectCategoryBranchIds(category.id));
          adminSaveDraft(true);
          renderCategories();
        }
      });
    };
    adminBindTapIntent(card, {
      onSingleTap: openCategory,
      onDoubleTap: openCategoryMenu,
      selectType: 'category',
      selectId: () => category.id,
      tapGroup: () => `category:${category.id}`,
    });
    const title = card.querySelector('span');
    adminBindTapIntent(title, {
      onSingleTap: openCategory,
      onDoubleTap: openCategoryMenu,
      selectType: 'category',
      selectId: () => category.id,
      tapGroup: () => `category:${category.id}`,
    });
  });

  const promoCard = ui.categoriesGrid.querySelector('[data-open-screen="promo"]');
  if (promoCard) {
    const openPromo = () => setScreen('promo');
    const openPromoMenu = () => {
      const promoCatalog = ensurePromoCatalogConfig();
      adminOpenActionSheet(`Раздел: ${promoCatalog.title}`, [
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-image', label: 'Изменить фото' },
      ]).then((action) => {
        if (!action) return;
        if (action === 'edit-title') {
          adminEditValue('Название раздела Акции', promoCatalog.title || 'Акции').then((value) => {
            if (value == null || value.__delete) return;
            const cfg = ensurePromoCatalogConfig();
            cfg.title = String(value || '').trim() || DEFAULT_PROMO_CATALOG.title;
            renderCategories();
            adminSaveDraft(true);
          });
          return;
        }
        if (action === 'edit-image') {
          adminPickAndUploadImage().then((imageUrl) => {
            if (!imageUrl) return;
            const cfg = ensurePromoCatalogConfig();
            cfg.image = imageUrl;
            renderCategories();
            adminSaveDraft(true);
          });
        }
      });
    };
    adminBindTapIntent(promoCard, {
      onSingleTap: openPromo,
      onDoubleTap: openPromoMenu,
      tapGroup: 'promo-card',
    });
    const promoTitle = promoCard.querySelector('span');
    adminBindTapIntent(promoTitle, {
      onSingleTap: openPromo,
      onDoubleTap: openPromoMenu,
      tapGroup: 'promo-card',
    });
  }

}

function adminBindMenuPromo() {
  if (!state.admin.enabled || !ui.menuPromoButton) return;
  adminBindTapIntent(ui.menuPromoButton, {
    onSingleTap: () => setScreen('promo'),
    tapGroup: 'promo-menu-button',
    onDoubleTap: () => {
    const promoCatalog = ensurePromoCatalogConfig();
    adminOpenActionSheet(`Раздел: ${promoCatalog.title}`, [
      { id: 'edit-title', label: 'Редактировать заголовок' },
      { id: 'edit-image', label: 'Изменить обложку в каталоге' },
    ]).then((action) => {
      if (!action) return;
      if (action === 'edit-title') {
        adminEditValue('Название раздела Акции', promoCatalog.title || 'Акции').then((value) => {
          if (value == null || value.__delete) return;
          const cfg = ensurePromoCatalogConfig();
          cfg.title = String(value || '').trim() || DEFAULT_PROMO_CATALOG.title;
          renderPromoCatalogLabels();
          renderCategories();
          adminSaveDraft(true);
        });
        return;
      }
      if (action === 'edit-image') {
        adminPickAndUploadImage().then((imageUrl) => {
          if (!imageUrl) return;
          const cfg = ensurePromoCatalogConfig();
          cfg.image = imageUrl;
          renderCategories();
          adminSaveDraft(true);
        });
      }
    });
    },
  });
}

function adminBindProducts() {
  if (!ui.productsList) return;
  ui.productsList.querySelectorAll('[data-open]').forEach((card) => {
    const productId = card.dataset.open;
    const p = getProduct(productId);
    if (!p) return;
    const openProduct = () => {
      state.currentProduct = p.id;
      renderProductView();
      setScreen('product');
    };
    const openProductMenu = () => {
      adminOpenActionSheet(`Товар: ${p.title || p.id}`, [
        { id: 'set-promo', label: getProductPromoPercent(p) > 0 ? `Скидка: ${getProductPromoPercent(p)}%` : 'Добавить в акции' },
        { id: 'move-category', label: 'Перенести в другую категорию' },
        { id: 'edit-title', label: 'Редактировать заголовок' },
        { id: 'edit-image', label: 'Изменить фото' },
        { id: 'edit-description', label: 'Редактировать описание' },
        { id: 'edit-price', label: 'Изменить цену' },
        { id: 'delete', label: 'Удалить', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (action === 'set-promo') {
          adminConfigureProductPromo(p);
          return;
        }
        if (action === 'move-category') {
          adminMoveProductToCategory(p);
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
          const confirmed = window.confirm(`Удалить товар "${p.title || p.id}" без возможности восстановления?`);
          if (!confirmed) return;
          state.products = state.products.filter((x) => x.id !== p.id);
          adminSaveDraft(true);
          renderPromos();
          renderHomePopular();
          renderCategories();
          renderProducts();
        }
      });
    };
    adminBindTapIntent(card, {
      onSingleTap: openProduct,
      onDoubleTap: openProductMenu,
      selectType: 'product',
      selectId: () => p.id,
      tapGroup: () => `product:${p.id}`,
    });
    const title = card.querySelector('.product-title');
    adminBindTapIntent(title, {
      onSingleTap: openProduct,
      onDoubleTap: openProductMenu,
      selectType: 'product',
      selectId: () => p.id,
      tapGroup: () => `product:${p.id}`,
    });
  });

}

function adminBindProductView() {
  if (!ui.productView) return;
  const p = getProduct(state.currentProduct);
  if (!p) return;

  const title = ui.productView.querySelector('.product-title');
  const desc = ui.productView.querySelector('.section-body');
  adminBindTapIntent(title, {
    tapGroup: () => `product-view:${p.id}:title`,
    onDoubleTap: () => {
    adminOpenActionSheet(`Товар: ${p.title || p.id}`, [
      { id: 'set-promo', label: getProductPromoPercent(p) > 0 ? `Скидка: ${getProductPromoPercent(p)}%` : 'Добавить в акции' },
      { id: 'move-category', label: 'Перенести в другую категорию' },
      { id: 'edit', label: 'Редактировать заголовок' },
      { id: 'delete', label: 'Удалить товар', danger: true },
    ]).then((action) => {
      if (!action) return;
      if (action === 'set-promo') {
        adminConfigureProductPromo(p);
        return;
      }
      if (action === 'move-category') {
        adminMoveProductToCategory(p);
        return;
      }
      if (action === 'edit') {
        adminEditValue(`Название товара ${p.id}`, p.title || '').then((value) => {
          if (value == null || value.__delete) return;
          p.title = value;
          renderProductView();
        });
        return;
      }
      if (action === 'delete') {
        const confirmed = window.confirm(`Удалить товар "${p.title || p.id}" без возможности восстановления?`);
        if (!confirmed) return;
        state.products = state.products.filter((x) => x.id !== p.id);
        state.currentProduct = null;
        adminSaveDraft(true);
        renderPromos();
        renderHomePopular();
        renderCategories();
        renderProducts();
        goBack();
      }
    });
    },
  });
  adminBindTapIntent(desc, {
    tapGroup: () => `product-view:${p.id}:desc`,
    onDoubleTap: () => {
      adminOpenActionSheet(`Описание товара ${p.id}`, [
        { id: 'edit', label: 'Редактировать описание' },
      ]).then((action) => {
        if (action !== 'edit') return;
        adminEditValue(`Описание товара ${p.id}`, p.description || '', { multiline: true }).then((value) => {
          if (value == null || value.__delete) return;
          p.description = value;
          renderProductView();
        });
      });
    },
  });

  ui.productView.querySelectorAll('.product-gallery img').forEach((img, index) => {
    adminBindTapIntent(img, {
      selectType: 'image',
      selectId: () => String(index),
      tapGroup: () => `product-image:${p.id}:${index}`,
      onDoubleTap: () => {
      adminOpenActionSheet(`Фото #${index + 1}`, [
        { id: 'move-left', label: 'Сдвинуть влево' },
        { id: 'move-right', label: 'Сдвинуть вправо' },
        { id: 'edit', label: 'Изменить фото' },
        { id: 'delete', label: 'Удалить фото', danger: true },
      ]).then((action) => {
        if (!action) return;
        if (!Array.isArray(p.images)) p.images = [];
        if (action === 'move-left') {
          moveProductImageByOffset(p, index, -1);
          renderProductView();
          adminSaveDraft(true);
          return;
        }
        if (action === 'move-right') {
          moveProductImageByOffset(p, index, 1);
          renderProductView();
          adminSaveDraft(true);
          return;
        }
        if (action === 'edit') {
          adminPickAndUploadImage({ allowCameraChoice: true }).then((imageUrl) => {
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
          adminSaveDraft(true);
        }
      });
      },
    });
  });

  const specRows = ui.productView.querySelectorAll('.product-specs > div');
  specRows.forEach((row, index) => {
    adminBindTapIntent(row, {
      tapGroup: () => `product-spec:${p.id}:${index}`,
      onDoubleTap: () => {
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
      },
    });
  });
}

function adminRefreshBindings() {
  if (!state.admin.enabled) return;
  adminBindHome();
  adminBindMenuPromo();
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
    <div class="admin-panel-hint">ADMIN MODE: один тап открывает раздел, двойной тап открывает меню редактирования</div>
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
  document.body.classList.toggle('subscription-locked', state.admin.enabled && !subscriptionAllowsAdminFeatures());
  renderProductImportPanel('catalog');
  renderProductImportPanel('category');
  if (ui.adminHeaderActions) ui.adminHeaderActions.classList.toggle('hidden', !state.admin.enabled);
  if (ui.adminHeaderActions) {
    const locked = state.admin.enabled && !subscriptionAllowsAdminFeatures();
    ui.adminHeaderActions.querySelectorAll('button').forEach((btn) => { btn.disabled = locked; });
  }
  const selectButtons = Array.from(document.querySelectorAll('[data-admin-select-toggle]'));
  selectButtons.forEach((btn) => {
    const scope = String(btn.dataset.adminSelectToggle || '');
    const active = state.admin.enabled && state.admin.selectionMode && scope === state.admin.selectedType;
    btn.classList.toggle('active', active);
    if (active && scope === 'product' && hasSelectedProducts()) btn.textContent = `Выбрано: ${getSelectedProductIds().length}`;
    else if (active && scope === 'category' && hasSelectedCategories()) btn.textContent = `Выбрано: ${getSelectedCategoryIds().length}`;
    else btn.textContent = active ? 'Выделение: вкл' : 'Выделить';
    btn.disabled = state.admin.enabled && !subscriptionAllowsAdminFeatures();
  });
  const moveButtons = Array.from(document.querySelectorAll('[data-admin-move]'));
  moveButtons.forEach((btn) => {
    if (state.admin.enabled && !subscriptionAllowsAdminFeatures()) {
      btn.disabled = true;
      return;
    }
    const scope = String(btn.dataset.adminMoveScope || '');
    const hasSelection = scope === 'product'
      ? hasSelectedProducts()
      : scope === 'category'
        ? hasSelectedCategories()
        : !!state.admin.selectedId;
    if (!(state.admin.enabled && state.admin.selectionMode && hasSelection && scope === state.admin.selectedType)) {
      btn.disabled = true;
      return;
    }
    if (scope === 'image') {
      const product = getProduct(state.currentProduct);
      const selectedIndex = product ? parseProductImageSelectionId(state.admin.selectedId, product.id) : -1;
      btn.disabled = selectedIndex < 0;
      return;
    }
    btn.disabled = false;
  });
  if (ui.adminDeleteSelectedButton) {
    ui.adminDeleteSelectedButton.disabled = !(
      state.admin.enabled
      && subscriptionAllowsAdminFeatures()
      && state.admin.selectionMode
      && state.admin.selectedType === 'product'
      && hasSelectedProducts()
    );
  }
  if (ui.adminDeleteSelectedCategoriesButton) {
    ui.adminDeleteSelectedCategoriesButton.disabled = !(
      state.admin.enabled
      && subscriptionAllowsAdminFeatures()
      && state.admin.selectionMode
      && state.admin.selectedType === 'category'
      && hasSelectedCategories()
    );
  }
  const addButtons = Array.from(document.querySelectorAll('[data-admin-add]'));
  addButtons.forEach((btn) => {
    btn.disabled = state.admin.enabled && !subscriptionAllowsAdminFeatures();
  });
  const imageActionButtons = Array.from(document.querySelectorAll('[data-admin-image-action]'));
  imageActionButtons.forEach((btn) => {
    if (state.admin.enabled && !subscriptionAllowsAdminFeatures()) {
      btn.disabled = true;
      return;
    }
    const action = String(btn.dataset.adminImageAction || '');
    if (action === 'delete') {
      const product = getProduct(state.currentProduct);
      const selectedIndex = product ? parseProductImageSelectionId(state.admin.selectedId, product.id) : -1;
      btn.disabled = !(state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'image' && selectedIndex >= 0);
      return;
    }
    btn.disabled = false;
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
  if (!requireAdminFeatureAccess()) return;
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
  const fallback = `${window.location.origin}/api`;
  return remapLegacyApi(fallback);
}

function clearSaasAuth() {
  state.saas.enabled = false;
  state.saas.token = '';
  state.saas.storeId = '';
  state.saas.userId = '';
  state.saas.userProfile = null;
  state.saas.stores = [];
  state.saas.settings = {};
  state.saas.lastLinkedPlatformIdentity = '';
  state.saas.publicResolveError = null;
  state.saas.platformBootstrapError = null;
  state.saas.needsAdminStoreSelection = false;
  state.saas.pendingOnboarding = null;
  state.saas.activeOnboarding = null;
  state.saas.lastPlatformConnectPromptKey = '';
  state.catalogBotConnections = [];
  state.catalogBotConnectionsStoreId = '';
  state.catalogBotConnectionsLoading = false;
  state.platformBindings = [];
  state.platformBindingsStoreId = '';
  state.platformBindingsLoading = false;
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

function formatAdminStoreChoiceLabel(store) {
  const storeId = String(store?.storeId || '').trim().toUpperCase();
  const storeName = String(store?.storeName || '').trim();
  return storeName ? `${storeId} — ${storeName}` : storeId;
}

async function saasChooseStoreFromList(stores, {
  title = 'Выберите магазин',
  allowPromptFallback = true,
} = {}) {
  const normalizedStores = Array.isArray(stores) ? stores.filter((item) => String(item?.storeId || '').trim()) : [];
  if (!normalizedStores.length) return null;
  if (normalizedStores.length === 1) return normalizedStores[0];

  if (normalizedStores.length <= 12) {
    const action = await adminOpenActionSheet(title, normalizedStores.map((store) => ({
      id: String(store.storeId || '').trim().toUpperCase(),
      label: formatAdminStoreChoiceLabel(store),
    })), { skipFeatureGate: true });
    if (!action) return null;
    return normalizedStores.find((store) => String(store?.storeId || '').trim().toUpperCase() === String(action || '').trim().toUpperCase()) || null;
  }

  if (!allowPromptFallback) return null;
  const options = normalizedStores.map((store, index) => `${index + 1}. ${formatAdminStoreChoiceLabel(store)}`).join('\n');
  const answer = window.prompt(`${title}\n${options}\n\nВведите номер или Store ID:`, String(state.saas.storeId || ''));
  if (!answer) return null;
  const trimmed = String(answer).trim().toUpperCase();
  const byIndex = Number(trimmed);
  return Number.isFinite(byIndex) && byIndex >= 1 && byIndex <= normalizedStores.length
    ? normalizedStores[byIndex - 1]
    : normalizedStores.find((store) => String(store?.storeId || '').trim().toUpperCase() === trimmed) || null;
}

async function saasEnsureCurrentAdminStoreSelection({
  interactive = false,
  title = 'Выберите магазин',
} = {}) {
  const stores = Array.isArray(state.saas.stores) && state.saas.stores.length
    ? state.saas.stores
    : await saasLoadStoresList();
  if (!stores.length) return false;

  const currentStoreId = String(state.saas.storeId || '').trim().toUpperCase();
  const currentExists = currentStoreId && stores.some((store) => String(store?.storeId || '').trim().toUpperCase() === currentStoreId);
  const mustChoose = Boolean(state.saas.needsAdminStoreSelection);

  if (currentExists && !mustChoose) return true;

  if (stores.length === 1) {
    state.saas.storeId = String(stores[0].storeId || '').trim().toUpperCase();
    state.saas.needsAdminStoreSelection = false;
    localStorage.setItem(SAAS_STORE_KEY, state.saas.storeId);
    return true;
  }

  if (!interactive) return false;

  const picked = await saasChooseStoreFromList(stores, { title });
  if (!picked?.storeId) return false;
  state.saas.storeId = String(picked.storeId || '').trim().toUpperCase();
  state.saas.needsAdminStoreSelection = false;
  localStorage.setItem(SAAS_STORE_KEY, state.saas.storeId);
  return true;
}

async function saasSwitchStore(nextStoreId) {
  const normalized = String(nextStoreId || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(normalized)) return false;
  resetProductImportState('catalog');
  resetProductImportState('category');
  getImportScopeState('catalog').status = '';
  getImportScopeState('category').status = '';
  state.saas.storeId = normalized;
  state.catalogBotConnections = [];
  state.catalogBotConnectionsStoreId = '';
  state.catalogBotConnectionsLoading = false;
  state.saas.needsAdminStoreSelection = false;
  localStorage.setItem(SAAS_STORE_KEY, normalized);
  const payload = await saasRequest(`/stores/${encodeURIComponent(normalized)}/admin/data`, { auth: true });
  applyStoreDataset(payload);
  await refreshSubscriptionStatus();
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
  applyAdminModeUi();
  await loadCatalogBotConnections({ force: true });
  renderProfileBotConnectSection();
  await loadPaymentIntegrationSettings();
  reportStatus(`Переключено на магазин ${normalized}`);
  return true;
}

async function saasPromptSelectStore() {
  const stores = await saasLoadStoresList();
  if (!stores.length) {
    window.alert('Магазины не найдены для текущего аккаунта.');
    return;
  }
  const picked = await saasChooseStoreFromList(stores, { title: 'Выберите магазин' });
  if (!picked?.storeId) {
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
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/catalog-bots`, {
      method: 'POST',
      auth: true,
      body: { platform: 'telegram', botToken },
    });
    const username = String(payload?.botUsername || '').trim();
    if (orderChatId) {
      await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/bot`, {
        method: 'POST',
        auth: true,
        body: { orderChatId },
      });
    }
    window.alert(`Подключение добавлено${username ? `: ${username}` : ''}`);
    await saasLoadStoresList();
    state.catalogBotConnectionsStoreId = '';
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
      <div class="saas-auth-platform-hint hidden"></div>
      <form class="saas-auth-form" autocomplete="on" novalidate>
        <label class="saas-auth-label saas-auth-store-id">Bot ID
          <input class="admin-modal-input" name="storeId" placeholder="например: A1B2C3" required maxlength="6" />
        </label>
        <label class="saas-auth-label saas-auth-store-name hidden">Название магазина
          <input class="admin-modal-input" name="storeName" placeholder="например: Магазин VK" maxlength="120" />
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
  const context = getClientPlatformContext({ allowGuest: false });
  const normalizedPlatform = normalizeClientPlatform(context?.platform || 'web');
  const directStoreRegistration = normalizedPlatform !== 'telegram';
  const form = modal.querySelector('.saas-auth-form');
  const storeInput = modal.querySelector('input[name="storeId"]');
  const storeWrap = modal.querySelector('.saas-auth-store-id');
  const storeNameWrap = modal.querySelector('.saas-auth-store-name');
  const storeNameInput = modal.querySelector('input[name="storeName"]');
  const botTokenWrap = modal.querySelector('.saas-auth-bot-token');
  const botTokenInput = modal.querySelector('input[name="botToken"]');
  const resetCodeWrap = modal.querySelector('.saas-auth-reset-code');
  const resetCodeInput = modal.querySelector('input[name="resetCode"]');
  const passwordInput = modal.querySelector('input[name="password"]');
  const repeatWrap = modal.querySelector('.saas-auth-repeat');
  const repeatInput = modal.querySelector('input[name="passwordRepeat"]');
  const platformHint = modal.querySelector('.saas-auth-platform-hint');
  const errorBox = modal.querySelector('.saas-auth-error');
  const submitBtn = modal.querySelector('[data-auth-submit]');
  const recoverBtn = modal.querySelector('[data-auth-recover]');
  const tabs = Array.from(modal.querySelectorAll('[data-auth-tab]'));
  let resetCode = '';
  let mode = 'login';

  const renderPlatformHint = () => {
    if (!platformHint) return;
    const errorCode = String(state.saas.platformBootstrapError?.code || '').trim();
    if (directStoreRegistration) {
      const label = normalizedPlatform === 'vk'
        ? 'VK'
        : normalizedPlatform === 'max'
          ? 'MAX'
          : 'веб-админка';
      platformHint.textContent = `${label}: регистрация создает новый магазин и выдает Store ID. Дальше вход для владельца и модераторов выполняется по Store ID и паролю.`;
      platformHint.classList.remove('hidden');
      return;
    }
    if (!errorCode) {
      platformHint.classList.add('hidden');
      platformHint.textContent = '';
      return;
    }
    const messages = {
      VK_SIGN_REQUIRED: 'VK не передал подпись запуска. Автовход с платформы недоступен.',
      VK_SIGN_INVALID: 'VK передал некорректную подпись запуска. Сервер отклонил автовход.',
      VK_USER_ID_REQUIRED: 'VK не передал идентификатор пользователя. Автовход невозможен.',
      VK_APP_ID_MISMATCH: 'VK запущен не с тем App ID, который настроен на сервере.',
      VK_LAUNCH_PARAMS_REQUIRED: 'VK не передал launch params приложению.',
      VK_LAUNCH_PARAMS_INVALID: 'VK передал launch params в некорректном формате.',
      PLATFORM_USER_ID_REQUIRED: 'Платформа не передала идентификатор пользователя для автовхода.',
    };
    const label = context.platform === 'vk'
      ? 'Подключение VK'
      : context.platform === 'max'
        ? 'Подключение MAX'
        : 'Подключение платформы';
    platformHint.textContent = `${label}: ${messages[errorCode] || `автовход не выполнен (${errorCode})`}`;
    platformHint.classList.remove('hidden');
  };

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
    if (storeNameWrap) storeNameWrap.classList.toggle('hidden', !(mode === 'register' && directStoreRegistration));
    botTokenWrap.classList.toggle('hidden', mode !== 'register' || directStoreRegistration);
    resetCodeWrap.classList.toggle('hidden', mode !== 'recover_code');
    repeatWrap.classList.toggle('hidden', !(mode === 'register' || mode === 'recover_password'));
    passwordInput.parentElement.classList.toggle('hidden', mode === 'recover_code');
    const needStore = mode !== 'register';
    const needBotToken = mode === 'register' && !directStoreRegistration;
    const needStoreName = mode === 'register' && directStoreRegistration;
    const needPassword = mode !== 'recover_code';
    const needResetCode = mode === 'recover_code';
    const needRepeat = (mode === 'register' || mode === 'recover_password');
    storeInput.required = needStore;
    botTokenInput.required = needBotToken;
    if (storeNameInput) storeNameInput.required = needStoreName;
    passwordInput.required = needPassword;
    resetCodeInput.required = needResetCode;
    repeatInput.required = needRepeat;
    storeInput.disabled = !needStore;
    botTokenInput.disabled = !needBotToken;
    if (storeNameInput) storeNameInput.disabled = !needStoreName;
    passwordInput.disabled = !needPassword;
    resetCodeInput.disabled = !needResetCode;
    repeatInput.disabled = !needRepeat;
    recoverBtn.classList.toggle('hidden', mode !== 'login' || directStoreRegistration);
    submitBtn.textContent = mode === 'register'
      ? directStoreRegistration ? 'Создать магазин' : 'Сохранить пароль'
      : mode === 'recover_code'
        ? 'Далее'
        : mode === 'recover_password'
          ? 'Сменить пароль'
          : 'Войти';
    if (storeWrap) {
      const label = storeWrap.querySelector('.admin-modal-input') ? storeWrap.firstChild : null;
      storeWrap.childNodes[0].textContent = directStoreRegistration ? 'Store ID' : 'Bot ID';
      if (storeInput) {
        storeInput.placeholder = directStoreRegistration ? 'например: A1B2C3' : 'например: A1B2C3';
      }
    }
    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.textContent = '';
    }
    if (mode !== 'register' && mode !== 'recover_password') repeatInput.value = '';
    if (mode !== 'register') botTokenInput.value = '';
    if (mode !== 'register' && storeNameInput) storeNameInput.value = '';
    if (mode !== 'recover_code') resetCodeInput.value = '';
  };

  setMode('login');
  renderPlatformHint();
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
      const storeName = String(storeNameInput?.value || '').trim();
      const botToken = String(botTokenInput?.value || '').trim();
      const password = String(passwordInput?.value || '').trim();
      const passwordRepeat = String(repeatInput?.value || '').trim();
      const codeValue = String(resetCodeInput?.value || '').trim();
      if (mode !== 'register' && !/^[A-Z0-9]{6}$/.test(storeId)) return showError(`${directStoreRegistration ? 'Store ID' : 'Bot ID'} должен быть ровно 6 символов (A-Z, 0-9).`);
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
      if (mode === 'register' && directStoreRegistration && storeName.length < 2) return showError('Введите название магазина.');
      if (mode === 'register' && !directStoreRegistration && !botToken.includes(':')) return showError('Введите корректный bot token.');
      if (mode === 'recover_password') {
        const { telegramUserId, telegramInitData } = await resolveTelegramIdentity();
        try {
          await saasRequest('/auth/password-reset/confirm', {
            method: 'POST',
            body: { storeId, code: resetCode, newPassword: password, telegramUserId, telegramInitData },
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
      resolve({ mode, storeId, storeName, password, botToken, directStoreRegistration });
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
      const { telegramUserId, telegramInitData } = await resolveTelegramIdentity();
      try {
        await saasRequest('/auth/password-reset/request', {
          method: 'POST',
          body: { storeId, telegramUserId, telegramInitData },
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
    const error = new Error(message);
    error.payload = payload || {};
    error.status = response.status;
    throw error;
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
    const error = new Error(payload?.error || `HTTP ${response.status}`);
    error.payload = payload || {};
    error.status = response.status;
    throw error;
  }
  return payload || {};
}

function applyStoreDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') return;
  if (dataset.config && typeof dataset.config === 'object') state.config = dataset.config;
  applyAppearanceFromConfig();
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

async function saveCurrentStoreMeta({ storeName } = {}) {
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  const normalizedStoreName = String(storeName || '').trim();
  if (!state.admin.enabled || !storeId || !normalizedStoreName) return false;
  const payload = await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/meta`, {
    method: 'PATCH',
    auth: true,
    body: { storeName: normalizedStoreName },
  });
  if (Array.isArray(state.saas.stores)) {
    state.saas.stores = state.saas.stores.map((store) => (
      String(store?.storeId || '').trim().toUpperCase() === storeId
        ? { ...store, storeName: normalizedStoreName, catalogUrl: String(payload?.catalogUrl || store.catalogUrl || '').trim() }
        : store
    ));
  }
  return true;
}

async function runPendingPlatformOnboarding() {
  if (!state.admin.enabled || !state.saas.pendingOnboarding || !state.saas.storeId) return false;
  const onboarding = state.saas.pendingOnboarding;
  state.saas.pendingOnboarding = null;

  if (!onboarding?.created) return false;

  const currentStore = getCurrentStoreMeta();
  const currentName = String(currentStore?.storeName || '').trim();
  const suggestedName = currentName && !/^store\b/i.test(currentName) && !/^new store$/i.test(currentName)
    ? currentName
    : '';
  const nextName = await adminEditValue('Название магазина', suggestedName, { multiline: false });
  if (typeof nextName === 'string') {
    const trimmed = String(nextName || '').trim();
    if (trimmed && trimmed !== currentName) {
      try {
        await saveCurrentStoreMeta({ storeName: trimmed });
      } catch (error) {
        reportStatus(`Не удалось сохранить название магазина: ${String(error?.message || 'unknown')}`);
      }
    }
  }

  renderProfile();
  setScreen('settings-bots');
  state.saas.activeOnboarding = {
    platform: String(onboarding.platform || '').trim().toLowerCase(),
    step: 'bind-community',
    storeId: String(state.saas.storeId || '').trim().toUpperCase(),
  };
  if (ui.profilePlatformBindingsSection) {
    ui.profilePlatformBindingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (ui.platformBindingStatus) {
    ui.platformBindingStatus.textContent = 'Шаг 2: привяжите первое сообщество VK к этому магазину, чтобы запустить каталог для покупателей.';
  }
  reportStatus('Магазин создан. Следующий шаг: привязать сообщество VK к каталогу.');
  return true;
}

function finishActivePlatformOnboardingAfterVkBinding(binding = null) {
  const active = state.saas.activeOnboarding;
  const currentStoreId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!active || active.platform !== 'vk' || active.step !== 'bind-community' || active.storeId !== currentStoreId) {
    return false;
  }

  state.saas.activeOnboarding = null;
  const launchUrl = getVkCatalogAppUrl();
  const bindingLabel = String(binding?.externalId || binding?.title || 'сообщество VK').trim();

  if (ui.profilePlatformBindingsSection) {
    ui.profilePlatformBindingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (ui.platformBindingStatus) {
    ui.platformBindingStatus.textContent = launchUrl
      ? `Готово: ${bindingLabel} привязано. URL VK Catalog App: ${launchUrl}`
      : `Готово: ${bindingLabel} привязано к магазину.`;
  }
  reportStatus('VK-каталог подключен. Сообщество привязано к текущему магазину.');

  const alertLines = [
    'VK onboarding завершен.',
    '',
    `Сообщество: ${bindingLabel}`,
    `Магазин: ${currentStoreId}`,
    launchUrl ? `URL VK Catalog App: ${launchUrl}` : '',
    '',
    'Следующий шаг: вставьте этот URL в настройки VK Mini App и откройте приложение из привязанного сообщества.',
  ].filter(Boolean);
  window.alert(alertLines.join('\n'));
  return true;
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

function getSaasPublicOrigin() {
  const apiBase = String(state.saas.apiBase || getSaasApiBase() || '').trim();
  if (apiBase) {
    try {
      const apiUrl = new URL(apiBase);
      apiUrl.pathname = '';
      apiUrl.search = '';
      apiUrl.hash = '';
      return apiUrl.origin;
    } catch {}
  }
  return String(window.location.origin || '').trim();
}

function getVkCatalogAppUrl() {
  const origin = getSaasPublicOrigin();
  return origin ? `${origin}/?platform=vk` : '';
}

function getVkAdminAppUrl() {
  const origin = getSaasPublicOrigin();
  return origin ? `${origin}/?admin=1&platform=vk` : '';
}

function normalizeCatalogBotPlatform(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram' || value === 'tg') return 'telegram';
  if (value === 'vk' || value === 'vkontakte') return 'vk';
  if (value === 'max') return 'max';
  return 'custom';
}

function getCatalogBotPlatformMeta(platform) {
  return CATALOG_BOT_PLATFORM_META[normalizeCatalogBotPlatform(platform)] || CATALOG_BOT_PLATFORM_META.custom;
}

function getCurrentAdminPlatform() {
  if (!state.admin.enabled) return 'web';
  return normalizeClientPlatform(getClientPlatformContext({ allowGuest: false })?.platform || 'web');
}

function hasCurrentPlatformPrimaryConnection(platform) {
  const normalized = normalizeClientPlatform(platform);
  if (!state.admin.enabled || !state.saas.storeId) return true;
  if (normalized === 'web' || !normalized) return true;
  if (normalized === 'vk') {
    return state.platformBindings.some((binding) => normalizePlatformBindingPlatform(binding?.platform) === 'vk');
  }
  if (normalized === 'telegram' || normalized === 'max') {
    return state.catalogBotConnections.some((connection) => normalizeCatalogBotPlatform(connection?.platform) === normalized);
  }
  return state.catalogBotConnections.some((connection) => normalizeCatalogBotPlatform(connection?.platform) === normalized);
}

function focusPlatformConnectionTarget(platform) {
  const normalized = normalizeClientPlatform(platform);
  setScreen('settings-bots');
  if (normalized === 'vk') {
    if (ui.profilePlatformBindingsSection) {
      ui.profilePlatformBindingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (ui.platformBindingExternalIdInput) ui.platformBindingExternalIdInput.focus();
    if (ui.platformBindingStatus) {
      ui.platformBindingStatus.textContent = 'Подключите VK: укажите ID или ссылку на сообщество, которое будет открывать каталог.';
    }
    return;
  }

  if (ui.profileBotPlatformInput) {
    ui.profileBotPlatformInput.value = normalized === 'web' ? 'custom' : normalized;
  }
  renderProfileBotConnectSection();
  if (ui.profileBotConnectSection) {
    ui.profileBotConnectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (normalized === 'telegram') {
    if (ui.profileBotTokenInput) ui.profileBotTokenInput.focus();
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = 'Подключите Telegram: введите Bot Token, чтобы настроить меню и webhook каталога.';
    }
  } else {
    if (ui.profileBotIdentifierInput) ui.profileBotIdentifierInput.focus();
    const label = getCatalogBotPlatformMeta(normalized).label;
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = `Подключите ${label}: добавьте ID или ссылку точки входа в каталог.`;
    }
  }
}

async function maybeOpenCurrentPlatformConnectionPrompt({ force = false } = {}) {
  if (!state.admin.enabled || !state.saas.storeId) return false;
  const platform = getCurrentAdminPlatform();
  if (!platform || platform === 'web') return false;
  if (!force && hasCurrentPlatformPrimaryConnection(platform)) return false;

  const promptKey = `${String(state.saas.storeId || '').trim().toUpperCase()}:${platform}`;
  if (!force && state.saas.lastPlatformConnectPromptKey === promptKey) return false;
  state.saas.lastPlatformConnectPromptKey = promptKey;

  if (platform === 'vk') {
    const action = await adminOpenActionSheet('Подключение VK', [
      { id: 'bind-vk-community', label: 'Привязать сообщество VK' },
      { id: 'open-vk-bot', label: 'Открыть блок подключений VK' },
    ], { skipFeatureGate: true });
    if (!action) return false;
    if (action === 'bind-vk-community') {
      focusPlatformConnectionTarget('vk');
      return true;
    }
    if (action === 'open-vk-bot') {
      focusPlatformConnectionTarget('vk');
      return true;
    }
    return false;
  }

  if (platform === 'max') {
    const action = await adminOpenActionSheet('Подключение MAX', [
      { id: 'connect-max', label: 'Подключить MAX' },
    ], { skipFeatureGate: true });
    if (!action) return false;
    focusPlatformConnectionTarget('max');
    return true;
  }

  if (platform === 'telegram') {
    const action = await adminOpenActionSheet('Подключение Telegram', [
      { id: 'connect-telegram', label: 'Подключить Telegram бота' },
    ], { skipFeatureGate: true });
    if (!action) return false;
    focusPlatformConnectionTarget('telegram');
    return true;
  }

  const action = await adminOpenActionSheet(`Подключение ${platform.toUpperCase()}`, [
    { id: 'connect-generic', label: 'Открыть блок подключения' },
  ], { skipFeatureGate: true });
  if (!action) return false;
  focusPlatformConnectionTarget(platform);
  return true;
}

function getCatalogBotSummaryText(connections) {
  const items = Array.isArray(connections) ? connections : [];
  if (!items.length) return '';
  const telegram = items.find((item) => normalizeCatalogBotPlatform(item?.platform) === 'telegram');
  if (telegram) {
    const label = String(telegram.botUsername || telegram.identifier || telegram.title || 'Telegram').trim();
    return items.length > 1 ? `${label} +${items.length - 1}` : label;
  }
  const first = items[0];
  const label = String(first?.platformLabel || getCatalogBotPlatformMeta(first?.platform).label || 'Подключение').trim();
  return items.length > 1 ? `${label} +${items.length - 1}` : label;
}

function normalizePlatformBindingPlatform(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'vk' || value === 'vkontakte') return 'vk';
  if (value === 'telegram' || value === 'tg') return 'telegram';
  if (value === 'max') return 'max';
  return 'custom';
}

function normalizePlatformBindingType(raw, platform = 'custom') {
  const normalizedPlatform = normalizePlatformBindingPlatform(platform);
  const value = String(raw || '').trim().toLowerCase();
  if (normalizedPlatform === 'vk') return 'community';
  if (value === 'community' || value === 'group') return 'community';
  if (value === 'bot') return 'bot';
  if (value === 'channel') return 'channel';
  return 'external';
}

async function loadPlatformBindings({ force = false } = {}) {
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!state.admin.enabled || !storeId || !state.saas.token) {
    state.platformBindings = [];
    state.platformBindingsStoreId = '';
    state.platformBindingsLoading = false;
    return [];
  }
  if (!force && !state.platformBindingsLoading && state.platformBindingsStoreId === storeId) {
    return state.platformBindings;
  }
  state.platformBindingsLoading = true;
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/platform-bindings`, {
      auth: true,
    });
    state.platformBindings = Array.isArray(payload?.bindings) ? payload.bindings : [];
    state.platformBindingsStoreId = storeId;
    return state.platformBindings;
  } catch (error) {
    state.platformBindings = [];
    state.platformBindingsStoreId = '';
    if (ui.platformBindingStatus) {
      ui.platformBindingStatus.textContent = `Ошибка загрузки привязок: ${String(error?.message || 'unknown')}`;
    }
    return [];
  } finally {
    state.platformBindingsLoading = false;
  }
}

function renderPlatformBindingsSection() {
  if (!ui.profilePlatformBindingsSection) return;
  const show = Boolean(state.admin.enabled);
  ui.profilePlatformBindingsSection.classList.toggle('hidden', !show);
  if (!show) return;

  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  const vkAdminUrl = getVkAdminAppUrl();
  const vkCatalogUrl = getVkCatalogAppUrl();
  const vkBindings = state.platformBindings.filter((binding) => normalizePlatformBindingPlatform(binding?.platform) === 'vk');
  if (ui.platformBindingSetupInfo) {
    ui.platformBindingSetupInfo.innerHTML = `
      <div class="catalog-bot-card">
        <div class="catalog-bot-card-head">
          <span class="catalog-bot-badge">VK</span>
          <strong>Настройка VK Mini Apps</strong>
        </div>
        <div class="catalog-bot-card-line"><span>Admin App:</span><span><a class="catalog-bot-card-url" href="${escapeHtml(vkAdminUrl || '—')}" target="_blank" rel="noopener">${escapeHtml(vkAdminUrl || '—')}</a></span></div>
        <div class="catalog-bot-card-line"><span>Catalog App:</span><span><a class="catalog-bot-card-url" href="${escapeHtml(vkCatalogUrl || '—')}" target="_blank" rel="noopener">${escapeHtml(vkCatalogUrl || '—')}</a></span></div>
        <div class="catalog-bot-card-line"><span>VK Dev:</span><span>Вставьте эти URL в поля «Мобильное приложение URL» и «Десктопная версия сайта URL» для двух отдельных VK Mini Apps: админки и каталога.</span></div>
        <div class="catalog-bot-card-actions">
          <button class="secondary-button" type="button" data-platform-binding-copy-url="${escapeHtml(vkAdminUrl || '')}">Скопировать Admin URL</button>
          <button class="secondary-button" type="button" data-platform-binding-open-url="${escapeHtml(vkAdminUrl || '')}">Открыть Admin</button>
          <button class="secondary-button" type="button" data-platform-binding-copy-url="${escapeHtml(vkCatalogUrl || '')}">Скопировать Catalog URL</button>
          <button class="secondary-button" type="button" data-platform-binding-open-url="${escapeHtml(vkCatalogUrl || '')}">Открыть Catalog</button>
        </div>
      </div>
    `;
  }
  if (ui.platformBindingsList) {
    if (!storeId) {
      ui.platformBindingsList.innerHTML = '<div class="catalog-bot-empty">Сначала выберите магазин.</div>';
    } else if (state.platformBindingsLoading) {
      ui.platformBindingsList.innerHTML = '<div class="catalog-bot-empty">Загружаем привязки платформ...</div>';
    } else if (!state.platformBindings.length) {
      ui.platformBindingsList.innerHTML = '<div class="catalog-bot-empty">Привязки платформ пока не добавлены.</div>';
    } else {
      ui.platformBindingsList.innerHTML = state.platformBindings.map((binding) => {
        const safeId = Number(binding?.id || 0);
        const title = escapeHtml(String(binding?.title || 'Привязка'));
        const externalId = escapeHtml(String(binding?.externalId || '—'));
        const platform = escapeHtml(String(binding?.platform || 'custom').toUpperCase());
        const bindingType = escapeHtml(String(binding?.bindingType || 'external'));
        const launchUrl = normalizePlatformBindingPlatform(binding?.platform) === 'vk' ? vkCatalogUrl : '';
        const safeLaunchUrl = escapeHtml(launchUrl || '—');
        return `
          <div class="catalog-bot-card">
            <div class="catalog-bot-card-head">
              <span class="catalog-bot-badge">${platform}</span>
              <span class="catalog-bot-badge">Привязано</span>
              <strong>${title}</strong>
            </div>
            <div class="catalog-bot-card-line"><span>Статус:</span><span>Сообщество будет открывать каталог этого магазина</span></div>
            <div class="catalog-bot-card-line"><span>Тип:</span><span>${bindingType}</span></div>
            <div class="catalog-bot-card-line"><span>ID/ссылка:</span><span>${externalId}</span></div>
            <div class="catalog-bot-card-line"><span>Магазин:</span><span>${escapeHtml(storeId || '—')}</span></div>
            ${launchUrl ? `
            <div class="catalog-bot-card-line"><span>VK Catalog App:</span><span><a class="catalog-bot-card-url" href="${safeLaunchUrl}" target="_blank" rel="noopener">${safeLaunchUrl}</a></span></div>
            ` : ''}
            <div class="catalog-bot-card-actions">
              ${launchUrl ? `<button class="secondary-button" type="button" data-platform-binding-copy-url="${safeLaunchUrl}">Скопировать URL</button>` : ''}
              ${launchUrl ? `<button class="secondary-button" type="button" data-platform-binding-open-url="${safeLaunchUrl}">Открыть</button>` : ''}
              <button class="secondary-button" type="button" data-platform-binding-remove="${safeId}">Удалить</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
  if (ui.platformBindingStatus && !String(ui.platformBindingStatus.textContent || '').trim()) {
    ui.platformBindingStatus.textContent = storeId
      ? (vkBindings.length
          ? `VK-каталог привязан к этому магазину. Сообществ: ${vkBindings.length}. URL Mini App: ${vkCatalogUrl || 'недоступен'}.`
          : `Укажите сообщество VK, которое должно открывать каталог этого магазина. URL Mini App: ${vkCatalogUrl || 'недоступен'}.`)
      : 'Сначала выберите магазин.';
  }
  if (storeId && state.platformBindingsStoreId !== storeId && !state.platformBindingsLoading) {
    void loadPlatformBindings({ force: true }).then(() => {
      renderPlatformBindingsSection();
    });
  }
}

async function savePlatformBinding() {
  if (!state.admin.enabled || !state.saas.storeId) {
    if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Сначала выберите магазин.';
    return;
  }
  if (!requireAdminFeatureAccess()) return;
  const platform = normalizePlatformBindingPlatform(ui.platformBindingPlatformInput?.value || 'vk');
  const bindingType = normalizePlatformBindingType(ui.platformBindingTypeInput?.value || 'community', platform);
  const title = String(ui.platformBindingTitleInput?.value || '').trim();
  const externalId = String(ui.platformBindingExternalIdInput?.value || '').trim();
  if (!externalId) {
    if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Укажите ID сообщества VK или ссылку.';
    return;
  }
  if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Сохраняем привязку...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/platform-bindings`, {
      method: 'POST',
      auth: true,
      body: { platform, bindingType, title, externalId },
    });
    state.platformBindings = Array.isArray(payload?.bindings) ? payload.bindings : state.platformBindings;
    state.platformBindingsStoreId = String(state.saas.storeId || '').trim().toUpperCase();
    if (ui.platformBindingTitleInput) ui.platformBindingTitleInput.value = '';
    if (ui.platformBindingExternalIdInput) ui.platformBindingExternalIdInput.value = '';
    renderPlatformBindingsSection();
    if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Привязка платформы сохранена.';
    const createdBinding = payload?.binding && typeof payload.binding === 'object' ? payload.binding : null;
    finishActivePlatformOnboardingAfterVkBinding(createdBinding);
  } catch (error) {
    if (ui.platformBindingStatus) {
      const code = String(error?.message || 'unknown');
      if (code === 'PLATFORM_BINDING_ALREADY_EXISTS') {
        ui.platformBindingStatus.textContent = 'Такая привязка уже сохранена для этого магазина.';
      } else if (code === 'PLATFORM_BINDING_CONFLICT') {
        const conflictStoreId = String(error?.payload?.existingStoreId || '').trim().toUpperCase();
        ui.platformBindingStatus.textContent = conflictStoreId
          ? `Это сообщество VK уже привязано к магазину ${conflictStoreId}. Сначала отвяжите его там.`
          : 'Это сообщество VK уже привязано к другому магазину.';
      } else {
        ui.platformBindingStatus.textContent = `Ошибка сохранения: ${code}`;
      }
    }
  }
}

async function removePlatformBinding(bindingId) {
  if (!state.admin.enabled || !state.saas.storeId || !bindingId) return;
  const numericId = Number(bindingId || 0);
  if (!Number.isInteger(numericId) || numericId <= 0) return;
  const confirmed = window.confirm('Удалить привязку платформы?');
  if (!confirmed) return;
  if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Удаляем привязку...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/platform-bindings/${numericId}`, {
      method: 'DELETE',
      auth: true,
    });
    state.platformBindings = Array.isArray(payload?.bindings) ? payload.bindings : [];
    state.platformBindingsStoreId = String(state.saas.storeId || '').trim().toUpperCase();
    renderPlatformBindingsSection();
    if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Привязка удалена.';
  } catch (error) {
    if (ui.platformBindingStatus) {
      ui.platformBindingStatus.textContent = `Ошибка удаления: ${String(error?.message || 'unknown')}`;
    }
  }
}

async function loadCatalogBotConnections({ force = false } = {}) {
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if (!state.admin.enabled || !storeId || !state.saas.token) {
    state.catalogBotConnections = [];
    state.catalogBotConnectionsStoreId = '';
    state.catalogBotConnectionsLoading = false;
    return [];
  }
  if (!force && !state.catalogBotConnectionsLoading && state.catalogBotConnectionsStoreId === storeId) {
    return state.catalogBotConnections;
  }
  state.catalogBotConnectionsLoading = true;
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(storeId)}/catalog-bots`, {
      auth: true,
    });
    state.catalogBotConnections = Array.isArray(payload?.connections) ? payload.connections : [];
    state.catalogBotConnectionsStoreId = storeId;
    const summary = getCatalogBotSummaryText(state.catalogBotConnections);
    if (Array.isArray(state.saas.stores)) {
      state.saas.stores = state.saas.stores.map((store) => {
        if (String(store?.storeId || '').trim().toUpperCase() !== storeId) return store;
        return {
          ...store,
          botUsername: summary || store.botUsername || '',
          catalogUrl: String(payload?.catalogUrl || store.catalogUrl || '').trim(),
        };
      });
    }
    return state.catalogBotConnections;
  } catch (error) {
    state.catalogBotConnections = [];
    state.catalogBotConnectionsStoreId = '';
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = `Ошибка загрузки подключений: ${String(error?.message || 'unknown')}`;
    }
    return [];
  } finally {
    state.catalogBotConnectionsLoading = false;
  }
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
  if (!requireAdminFeatureAccess()) return;
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

function renderProfileBotConnectSection() {
  if (!ui.profileBotConnectSection) return;
  const show = Boolean(state.admin.enabled);
  ui.profileBotConnectSection.classList.toggle('hidden', !show);
  if (!show) return;

  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  const catalogUrl = getCurrentStoreCatalogUrl();
  const platform = normalizeCatalogBotPlatform(ui.profileBotPlatformInput?.value || 'telegram');
  const platformMeta = getCatalogBotPlatformMeta(platform);

  if (ui.profileBotStoreIdValue) {
    ui.profileBotStoreIdValue.textContent = storeId || '—';
  }
  if (ui.profileBotCatalogUrlValue) {
    ui.profileBotCatalogUrlValue.textContent = catalogUrl || '—';
  }
  if (ui.profileBotPlatformInput) {
    ui.profileBotPlatformInput.value = platform;
  }
  if (ui.profileBotIdentifierLabelText) {
    ui.profileBotIdentifierLabelText.textContent = platformMeta.identifierLabel;
  }
  if (ui.profileBotIdentifierInput) {
    ui.profileBotIdentifierInput.placeholder = platformMeta.identifierPlaceholder;
  }
  if (ui.profileBotTokenLabelText) {
    ui.profileBotTokenLabelText.textContent = platformMeta.tokenLabel || 'Bot Token Telegram';
  }
  if (ui.profileBotTokenInput) {
    ui.profileBotTokenInput.placeholder = platformMeta.tokenPlaceholder || '123456:ABC...';
  }
  if (ui.profileBotTokenLabel) {
    ui.profileBotTokenLabel.classList.toggle('hidden', !platformMeta.tokenRequired);
  }
  if (ui.profileBotConnectionsList) {
    if (state.catalogBotConnectionsLoading) {
      ui.profileBotConnectionsList.innerHTML = '<div class="catalog-bot-empty">Загружаем подключения...</div>';
    } else if (!state.catalogBotConnections.length) {
      ui.profileBotConnectionsList.innerHTML = '<div class="catalog-bot-empty">Подключения каталога пока не добавлены.</div>';
    } else {
      ui.profileBotConnectionsList.innerHTML = state.catalogBotConnections.map((connection) => {
        const platformLabel = escapeHtml(String(connection?.platformLabel || getCatalogBotPlatformMeta(connection?.platform).label || 'Платформа'));
        const title = escapeHtml(String(connection?.title || 'Подключение'));
        const identifier = escapeHtml(String(connection?.botUsername || connection?.identifier || '—'));
        const modeLabel = connection?.managed ? 'Автоподключение' : 'Внешняя точка входа';
        const safeId = Number(connection?.id || 0);
        return `
          <div class="catalog-bot-card">
            <div class="catalog-bot-card-head">
              <span class="catalog-bot-badge">${platformLabel}</span>
              <strong>${title}</strong>
            </div>
            <div class="catalog-bot-card-line"><span>Бот:</span><span>${identifier}</span></div>
            <div class="catalog-bot-card-line"><span>Режим:</span><span>${escapeHtml(modeLabel)}</span></div>
            <div class="catalog-bot-card-line"><span>Каталог:</span><span class="catalog-bot-card-url">${escapeHtml(String(connection?.catalogUrl || catalogUrl || '—'))}</span></div>
            <div class="catalog-bot-card-actions">
              <button class="secondary-button" type="button" data-catalog-bot-remove="${safeId}">Удалить</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
  if (ui.profileBotConnectStatus && !String(ui.profileBotConnectStatus.textContent || '').trim()) {
    if (!storeId) {
      ui.profileBotConnectStatus.textContent = 'Сначала выберите магазин (Bot ID), затем добавьте подключение.';
    } else {
      ui.profileBotConnectStatus.textContent = platformMeta.hint;
    }
  }
  if (storeId && state.catalogBotConnectionsStoreId !== storeId && !state.catalogBotConnectionsLoading) {
    void loadCatalogBotConnections({ force: true }).then(() => {
      renderProfileBotConnectSection();
    });
  }
  renderPlatformBindingsSection();
}

async function saveProfileBotConnection() {
  if (!state.admin.enabled) return;
  if (!state.saas.storeId) {
    if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Сначала выберите магазин (Bot ID).';
    return;
  }
  if (!requireAdminFeatureAccess()) return;
  const platform = normalizeCatalogBotPlatform(ui.profileBotPlatformInput?.value || 'telegram');
  const title = String(ui.profileBotLabelInput?.value || '').trim();
  const identifier = String(ui.profileBotIdentifierInput?.value || '').trim();
  const botToken = String(ui.profileBotTokenInput?.value || '').trim();
  if (platform === 'telegram' && (!botToken || !botToken.includes(':'))) {
    if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Введите корректный Bot Token Telegram (формат 123456:ABC...).';
    return;
  }
  if (platform !== 'telegram' && !identifier) {
    if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Укажите ID или ссылку бота для выбранной площадки.';
    return;
  }
  if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Сохраняем подключение...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/catalog-bots`, {
      method: 'POST',
      auth: true,
      body: { platform, title, identifier, botToken },
    });
    state.catalogBotConnections = Array.isArray(payload?.connections) ? payload.connections : state.catalogBotConnections;
    state.catalogBotConnectionsStoreId = String(state.saas.storeId || '').trim().toUpperCase();
    const botUsername = String(payload?.botUsername || '').trim();
    const summary = getCatalogBotSummaryText(state.catalogBotConnections);
    if (ui.profileBotTokenInput) ui.profileBotTokenInput.value = '';
    if (ui.profileBotLabelInput) ui.profileBotLabelInput.value = '';
    if (ui.profileBotIdentifierInput) ui.profileBotIdentifierInput.value = '';
    if (Array.isArray(state.saas.stores)) {
      state.saas.stores = state.saas.stores.map((store) => {
        if (String(store?.storeId || '').trim().toUpperCase() !== String(state.saas.storeId || '').trim().toUpperCase()) return store;
        return {
          ...store,
          botUsername: summary || botUsername || store.botUsername || '',
        };
      });
    }
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = botUsername
        ? `Подключение добавлено: ${botUsername}`
        : 'Подключение добавлено.';
    }
    await saasLoadStoresList();
    renderProfileBotConnectSection();
  } catch (error) {
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = `Ошибка подключения: ${String(error?.message || 'unknown')}`;
    }
  }
}

async function removeProfileBotConnection(connectionId) {
  const numericId = Number(connectionId || 0);
  if (!state.admin.enabled || !state.saas.storeId || !numericId) return;
  if (!requireAdminFeatureAccess()) return;
  const targetConnection = Array.isArray(state.catalogBotConnections)
    ? state.catalogBotConnections.find((item) => Number(item?.id || 0) === numericId)
    : null;
  const targetTitle = String(
    targetConnection?.title
    || targetConnection?.botUsername
    || targetConnection?.identifier
    || 'это подключение'
  ).trim();
  const confirmed = window.confirm(`Удалить подключение "${targetTitle}"?`);
  if (!confirmed) return;
  if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Удаляем подключение...';
  try {
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/catalog-bots/${numericId}`, {
      method: 'DELETE',
      auth: true,
    });
    state.catalogBotConnections = Array.isArray(payload?.connections) ? payload.connections : [];
    state.catalogBotConnectionsStoreId = String(state.saas.storeId || '').trim().toUpperCase();
    await saasLoadStoresList();
    if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Подключение удалено.';
    renderProfileBotConnectSection();
  } catch (error) {
    if (ui.profileBotConnectStatus) {
      ui.profileBotConnectStatus.textContent = `Ошибка удаления: ${String(error?.message || 'unknown')}`;
    }
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

function getOrderHistoryStorageKey() {
  const storeScope = getStorageScopeStoreId();
  const context = getClientPlatformContext();
  const telegramId = String(state.saas.userId || '').startsWith('tg:') ? String(state.saas.userId).slice(3).trim() : '';
  const userScope = context.customerIdentity || (telegramId ? `telegram:${telegramId}` : 'guest');
  return `demo_catalog_orders_${storeScope}_${userScope}`;
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
      state.saas.userProfile = me?.telegramProfile && typeof me.telegramProfile === 'object' ? me.telegramProfile : null;
      state.saas.stores = Array.isArray(me?.stores) ? me.stores : [];
      const currentExists = state.saas.stores.some((store) => String(store?.storeId || '').trim().toUpperCase() === storedStoreId);
      state.saas.needsAdminStoreSelection = state.saas.stores.length > 1 && !currentExists;
    } catch {
      // токен проверим позже на загрузке датасета
    }
    await refreshSubscriptionStatus();
    void saasEnsurePlatformLinked();
    return true;
  }

  const platformBootstrapOk = await saasTryPlatformBootstrap();
  if (platformBootstrapOk) {
    void saasEnsurePlatformLinked();
    return true;
  }

  while (true) {
    const authData = await openSaasAuthModal();
    if (!authData) return false;
    const { mode, storeId, storeName, password, botToken, directStoreRegistration } = authData;
    const { telegramUserId, telegramInitData } = await resolveTelegramIdentity();
    const email = String(state.profile?.email || '').trim().toLowerCase();
    try {
      let loginBotId = storeId;
      if (mode === 'register') {
        if (directStoreRegistration) {
          const registration = await saasRequest('/auth/register', {
            method: 'POST',
            body: { storeName, password, email },
          });
          const issuedStoreId = String(registration?.storeId || '').trim().toUpperCase();
          if (!issuedStoreId) throw new Error('STORE_ID_NOT_ISSUED');
          loginBotId = issuedStoreId;
          window.alert(`Магазин создан.\n\nStore ID: ${issuedStoreId}\n\nСохраните Store ID. Вход владельца и модераторов выполняется по Store ID и паролю.`);
        } else {
          const registration = await saasRequest('/auth/register-by-bot', {
            method: 'POST',
            body: { botToken, password, telegramUserId, telegramInitData, email },
          });
          const issuedBotId = String(registration?.botId || registration?.storeId || '').trim().toUpperCase();
          const via = String(registration?.botIdSentVia || '').trim();
          const sent = Boolean(registration?.botIdSent);
          const queued = String(registration?.botIdSendError || '').trim() === 'BOT_ID_SEND_FAILED';
          if (sent) {
            const channelLabel = via === 'admin_bot' ? 'в admin-бот владельца' : 'в admin-бот';
            window.alert(`Регистрация завершена.\n\nBot ID отправлен ${channelLabel}.\nBot ID: ${issuedBotId}\n\nВойдите по Bot ID и паролю.`);
          } else if (queued) {
            window.alert(`Регистрация завершена.\n\nBot ID: ${issuedBotId}\n\nОтправка в admin-бот поставлена в очередь и будет доставлена автоматически.`);
          } else {
            window.alert(`Регистрация завершена.\n\nBot ID: ${issuedBotId}\n\nСообщение в бот временно не отправлено. Используйте Bot ID для входа.`);
          }
          continue;
        }
      }
      const login = await saasRequest('/auth/login', {
        method: 'POST',
        body: { botId: loginBotId, password, telegramUserId, telegramInitData, email },
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
        state.saas.userProfile = me?.telegramProfile && typeof me.telegramProfile === 'object' ? me.telegramProfile : null;
        if (Array.isArray(me?.stores) && me.stores.length) state.saas.stores = me.stores;
      } catch {}
      await refreshSubscriptionStatus();
      return true;
    } catch (error) {
      const code = String(error?.message || '');
      const messageMap = {
        STORE_NOT_FOUND: `${directStoreRegistration ? 'Store ID' : 'Bot ID'} не найден.`,
        WRONG_PASSWORD: 'Неверный пароль.',
        STORE_ALREADY_ACTIVE: 'Этот Bot ID уже активирован. Используйте вкладку "Вход".',
        STORE_NOT_ACTIVATED: 'Bot ID еще не зарегистрирован. Используйте вкладку "Регистрация".',
        BOT_TOKEN_INVALID: 'Bot token неверный.',
        BOT_TOKEN_VALIDATION_FAILED: 'Не удалось проверить bot token.',
        TELEGRAM_ID_REQUIRED: 'Не удалось определить Telegram ID. Откройте mini app из Telegram.',
        BOT_ID_SEND_FAILED: 'Не удалось отправить Bot ID в бот.',
        INVALID_REGISTER_PAYLOAD: 'Введите название магазина и пароль.',
        STORE_ID_NOT_ISSUED: 'Сервер не выдал Store ID для нового магазина.',
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
      await refreshSubscriptionStatus();
      applyAdminModeUi();
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
      await refreshSubscriptionStatus();
      applyAdminModeUi();
      state.saas.datasetLoaded = true;
      return true;
    }
  }
  const requestedPublicStoreId = String(getRequestedStoreId() || '').trim().toUpperCase();
  const publicPlatformContext = getClientPlatformContext({ allowGuest: false });
  const isPlatformBoundPublicContext = !state.admin.enabled
    && !requestedPublicStoreId
    && publicPlatformContext?.platform
    && publicPlatformContext.platform !== 'web'
    && publicPlatformContext.platform !== 'telegram';
  const resolvedPlatformStoreId = requestedPublicStoreId ? '' : String(await resolvePublicStoreIdFromPlatformContext() || '').trim().toUpperCase();
  const storedPublicStoreId = String(localStorage.getItem(SAAS_STORE_KEY) || '').trim().toUpperCase();
  if (isPlatformBoundPublicContext && !/^[A-Z0-9]{6}$/.test(resolvedPlatformStoreId)) {
    if (!state.saas.publicResolveError) {
      state.saas.publicResolveError = {
        platform: publicPlatformContext.platform,
        code: 'PLATFORM_STORE_NOT_FOUND',
        blocking: true,
        ...getPublicPlatformResolveErrorInfo('PLATFORM_STORE_NOT_FOUND', publicPlatformContext.platform),
      };
    }
    renderPublicPlatformUnavailableState();
    return false;
  }
  const publicStoreId = requestedPublicStoreId || resolvedPlatformStoreId || storedPublicStoreId;
  if (!state.admin.enabled && /^[A-Z0-9]{6}$/.test(publicStoreId)) {
    const payload = await saasRequest(`/store/${encodeURIComponent(publicStoreId)}/public?_t=${Date.now()}`);
    applyStoreDataset(payload);
    state.saas.publicResolveError = null;
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
  state.orders = safeParse(localStorage.getItem(getOrderHistoryStorageKey()) || readScopedStorage('demo_catalog_orders', '[]'), []);
  state.promoCode = normalizePromoCode(readScopedStorage('demo_catalog_promo_code', ''));
  state.promoPercent = Number(readScopedStorage('demo_catalog_promo_percent', '0') || 0) || 0;
  state.promoAmount = Number(readScopedStorage('demo_catalog_promo_amount', '0') || 0) || 0;
  state.promoKind = String(readScopedStorage('demo_catalog_promo_kind', '') || '').trim();
  state.recentlyViewed = safeParse(readScopedStorage('demo_catalog_recent', '[]'), []).filter(Boolean).slice(0, 12);
  state.theme = normalizeThemeCode(readScopedStorage('demo_catalog_theme', 'dark'));
  state.accent = normalizeAccentCode(readScopedStorage('demo_catalog_accent', 'rose'));
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
    localStorage.setItem(getOrderHistoryStorageKey(), JSON.stringify(state.orders));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_code'), state.promoCode || '');
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_percent'), String(state.promoPercent || 0));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_amount'), String(state.promoAmount || 0));
    localStorage.setItem(scopedStorageKey('demo_catalog_promo_kind'), state.promoKind || '');
    localStorage.setItem(scopedStorageKey('demo_catalog_recent'), JSON.stringify(state.recentlyViewed || []));
    localStorage.setItem(scopedStorageKey('demo_catalog_theme'), state.theme || 'dark');
    localStorage.setItem(scopedStorageKey('demo_catalog_accent'), state.accent || 'rose');
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
    const context = getClientPlatformContext();
    await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/events`, {
      method: 'POST',
      body: {
        eventType,
        productId: String(productId || ''),
        telegramUserId: context.telegramUserId,
        customerPlatform: context.platform,
        customerPlatformUserId: context.platformUserId,
        customerIdentity: context.customerIdentity,
        payload: payload && typeof payload === 'object' ? payload : {},
      },
    });
  } catch {
    // метрики не должны ломать UX
  }
}

function normalizeThemeCode(rawTheme) {
  const value = String(rawTheme || '').trim().toLowerCase();
  if (value === 'light') return 'white';
  if (THEME_OPTIONS[value]) return value;
  return 'dark';
}

function normalizeAccentCode(rawAccent) {
  const value = String(rawAccent || '').trim().toLowerCase();
  if (value === 'pink') return 'rose';
  if (ACCENT_OPTIONS[value]) return value;
  return 'rose';
}

function normalizeAppearanceConfig(rawAppearance, fallbackAppearance = DEFAULT_APPEARANCE) {
  const fallbackTheme = normalizeThemeCode(fallbackAppearance?.theme || DEFAULT_APPEARANCE.theme);
  const fallbackAccent = normalizeAccentCode(fallbackAppearance?.accent || DEFAULT_APPEARANCE.accent);
  const source = rawAppearance && typeof rawAppearance === 'object' ? rawAppearance : {};
  return {
    theme: normalizeThemeCode(source.theme || fallbackTheme),
    accent: normalizeAccentCode(source.accent || fallbackAccent),
  };
}

function ensureConfigAppearance({ fallbackToState = false } = {}) {
  if (!state.config || typeof state.config !== 'object') state.config = {};
  const source = state.config.appearance && typeof state.config.appearance === 'object'
    ? state.config.appearance
    : { theme: state.config.theme, accent: state.config.accent };
  const fallback = fallbackToState
    ? { theme: state.theme, accent: state.accent }
    : DEFAULT_APPEARANCE;
  const normalized = normalizeAppearanceConfig(source, fallback);
  state.config.appearance = normalized;
  // Оставляем дублирующие ключи для обратной совместимости со старыми датасетами.
  state.config.theme = normalized.theme;
  state.config.accent = normalized.accent;
  return normalized;
}

function applyAppearanceFromConfig(options = {}) {
  const appearance = ensureConfigAppearance(options);
  applyAppearance(appearance.theme, appearance.accent);
  return appearance;
}

function updateAdminAppearanceDraft(patch = {}) {
  if (!state.admin.enabled) return;
  const current = ensureConfigAppearance({ fallbackToState: true });
  const next = normalizeAppearanceConfig(
    {
      theme: Object.prototype.hasOwnProperty.call(patch, 'theme') ? patch.theme : current.theme,
      accent: Object.prototype.hasOwnProperty.call(patch, 'accent') ? patch.accent : current.accent,
    },
    current,
  );
  state.config.appearance = next;
  state.config.theme = next.theme;
  state.config.accent = next.accent;
  applyAppearance(next.theme, next.accent);
  saveStorage();
  adminSaveDraft(true);
}

function applyTheme(theme) {
  const nextTheme = normalizeThemeCode(theme);
  const config = THEME_OPTIONS[nextTheme] || THEME_OPTIONS.dark;
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', config.domTheme);
  document.documentElement.setAttribute('data-theme-mode', config.mode);
  if (ui.themeSelect) ui.themeSelect.value = nextTheme;
}

function applyAccent(accent) {
  const nextAccent = normalizeAccentCode(accent);
  state.accent = nextAccent;
  document.documentElement.setAttribute('data-accent', nextAccent);
  if (ui.accentSelect) ui.accentSelect.value = nextAccent;
}

function applyAppearance(theme = state.theme, accent = state.accent) {
  applyTheme(theme);
  applyAccent(accent);
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
    const priceView = getProductPriceView(item, { withOldPrice: false });
    count += item.qty || 0;
    if (!priceView.hasPrice) {
      missing = true;
      requestCount += item.qty || 0;
      return;
    }
    const lineSum = Number(priceView.finalPrice || 0) * (item.qty || 0);
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

function categoryHasVisibleProducts(categoryId) {
  const branchIds = collectCategoryBranchIds(categoryId);
  if (!branchIds.length) return false;
  const branchSet = new Set(branchIds);
  return state.products.some((product) => branchSet.has(String(product.categoryId || '')));
}

function getVisibleCategories() {
  if (state.admin.enabled) {
    if (state.currentGroup) return state.categories.filter((c) => c.groupId === state.currentGroup);
    return state.categories.slice();
  }
  const available = new Set(state.products.map((p) => p.categoryId));
  const filtered = state.categories.filter((c) => c.groupId === state.currentGroup && (available.size === 0 || categoryHasVisibleProducts(c.id)));
  return filtered.length ? filtered : state.categories.filter((c) => categoryHasVisibleProducts(c.id));
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
  state.admin.selectedIds = [];
}

function getSelectedProductIds() {
  if (state.admin.selectedType !== 'product') return [];
  if (Array.isArray(state.admin.selectedIds) && state.admin.selectedIds.length) {
    return state.admin.selectedIds.filter(Boolean);
  }
  return state.admin.selectedId ? [state.admin.selectedId] : [];
}

function getSelectedCategoryIds() {
  if (state.admin.selectedType !== 'category') return [];
  if (Array.isArray(state.admin.selectedIds) && state.admin.selectedIds.length) {
    return state.admin.selectedIds.filter(Boolean);
  }
  return state.admin.selectedId ? [state.admin.selectedId] : [];
}

function hasSelectedProducts() {
  return getSelectedProductIds().length > 0;
}

function hasSelectedCategories() {
  return getSelectedCategoryIds().length > 0;
}

function adminToggleSelectionMode(scope = '') {
  state.admin.selectionMode = !state.admin.selectionMode;
  if (!state.admin.selectionMode) adminClearSelection();
  if (state.admin.selectionMode && scope) {
    state.admin.selectedType = scope;
    state.admin.selectedId = '';
    state.admin.selectedIds = [];
  }
  applyAdminModeUi();
  if (state.currentScreen === 'categories') renderCategories();
  if (state.currentScreen === 'products') renderProducts();
  if (state.currentScreen === 'home') renderHomeBanners();
  if (state.currentScreen === 'product') renderProductView();
  reportStatus(state.admin.selectionMode ? 'Режим выделения включен' : 'Режим выделения выключен');
}

function adminSelectItem(type, id) {
  if (!state.admin.selectionMode) return;
  if (type === 'product' || type === 'category') {
    state.admin.selectedType = type;
    const current = new Set(Array.isArray(state.admin.selectedIds) ? state.admin.selectedIds : []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    state.admin.selectedIds = Array.from(current);
    state.admin.selectedId = current.has(id)
      ? id
      : (state.admin.selectedIds[state.admin.selectedIds.length - 1] || '');
    applyAdminModeUi();
    if (type === 'product') renderProducts();
    if (type === 'category') renderCategories();
    return;
  }
  state.admin.selectedType = type;
  state.admin.selectedId = id;
  state.admin.selectedIds = [];
  applyAdminModeUi();
  if (type === 'category') renderCategories();
  if (type === 'product') renderProducts();
  if (type === 'banner') renderHomeBanners();
  if (type === 'image') renderProductView();
}

function deleteCategoriesAndProducts(categoryIds = []) {
  const ids = new Set((categoryIds || []).map((id) => String(id || '').trim()).filter(Boolean));
  if (!ids.size) return;
  state.categories = state.categories.filter((category) => !ids.has(String(category.id || '').trim()));
  state.products = state.products.filter((product) => !ids.has(String(product.categoryId || '').trim()));
}

function adminDeleteSelectedProducts() {
  const selectedIds = getSelectedProductIds();
  if (!selectedIds.length) {
    reportStatus('Сначала выберите товары для удаления');
    return;
  }
  const confirmed = window.confirm(
    selectedIds.length === 1
      ? 'Удалить выбранный товар без возможности восстановления?'
      : `Удалить выбранные товары (${selectedIds.length}) без возможности восстановления?`,
  );
  if (!confirmed) return;
  const selectedSet = new Set(selectedIds);
  const removedCurrentProduct = selectedSet.has(String(state.currentProduct || ''));
  state.products = state.products.filter((product) => !selectedSet.has(String(product.id || '')));
  if (removedCurrentProduct) state.currentProduct = null;
  adminClearSelection();
  adminSaveDraft(true);
  renderPromos();
  renderCategories();
  renderProducts();
  renderHomePopular();
  if (removedCurrentProduct && state.currentScreen === 'product') goBack();
  reportStatus(selectedIds.length === 1 ? 'Товар удален' : `Удалено товаров: ${selectedIds.length}`);
}

function adminDeleteSelectedCategories() {
  const selectedIds = getSelectedCategoryIds();
  if (!selectedIds.length) {
    reportStatus('Сначала выберите категории для удаления');
    return;
  }
  const branchIds = Array.from(new Set(selectedIds.flatMap((id) => collectCategoryBranchIds(id))));
  const confirmed = window.confirm(
    selectedIds.length === 1
      ? 'Удалить выбранную категорию вместе с вложенными подразделами и товарами без возможности восстановления?'
      : `Удалить выбранные категории (${selectedIds.length}) вместе с вложенными подразделами и товарами без возможности восстановления?`,
  );
  if (!confirmed) return;
  deleteCategoriesAndProducts(branchIds);
  if (branchIds.includes(String(state.currentCategory || ''))) {
    state.currentCategory = null;
    state.currentCategoryIds = null;
  }
  adminClearSelection();
  adminSaveDraft(true);
  renderPromos();
  renderCategories();
  renderProducts();
  renderHomePopular();
  reportStatus(selectedIds.length === 1 ? 'Категория удалена' : `Удалено категорий: ${selectedIds.length}`);
}

function adminMoveSelected(direction) {
  if (!state.admin.selectionMode || !state.admin.selectedType || (!state.admin.selectedId && !hasSelectedProducts())) {
    reportStatus('Сначала включите "Выделить" и выберите элемент');
    return;
  }

  if (state.admin.selectedType === 'category') {
    const visible = getVisibleCategories();
    const ids = visible.map((item) => item.id);
    const selectedIds = getSelectedCategoryIds().filter((id) => ids.includes(id));
    if (!selectedIds.length) return;
    const selectedSet = new Set(selectedIds);
    const orderedSelected = ids.filter((id) => selectedSet.has(id));
    const step = direction === 'up' ? -2 : direction === 'down' ? 2 : direction === 'left' ? -1 : 1;
    const remaining = ids.filter((id) => !selectedSet.has(id));
    let nextVisibleOrder = ids.slice();
    if (step < 0) {
      const firstIndex = ids.indexOf(orderedSelected[0]);
      if (firstIndex <= 0) return;
      const neighborIndex = Math.max(0, firstIndex + step);
      const neighborId = ids[neighborIndex];
      if (!neighborId || selectedSet.has(neighborId)) return;
      const insertAt = remaining.indexOf(neighborId);
      if (insertAt < 0) return;
      nextVisibleOrder = [
        ...remaining.slice(0, insertAt),
        ...orderedSelected,
        ...remaining.slice(insertAt),
      ];
    } else {
      const lastIndex = ids.indexOf(orderedSelected[orderedSelected.length - 1]);
      if (lastIndex < 0 || lastIndex >= ids.length - 1) return;
      const neighborIndex = Math.min(ids.length - 1, lastIndex + step);
      const neighborId = ids[neighborIndex];
      if (!neighborId || selectedSet.has(neighborId)) return;
      const insertAt = remaining.indexOf(neighborId);
      if (insertAt < 0) return;
      nextVisibleOrder = [
        ...remaining.slice(0, insertAt + 1),
        ...orderedSelected,
        ...remaining.slice(insertAt + 1),
      ];
    }
    const categoryById = new Map(state.categories.map((category) => [String(category.id || ''), category]));
    const visiblePositions = [];
    state.categories.forEach((category, index) => {
      if (ids.includes(String(category.id || ''))) visiblePositions.push(index);
    });
    const nextCategories = state.categories.slice();
    visiblePositions.forEach((position, index) => {
      nextCategories[position] = categoryById.get(String(nextVisibleOrder[index] || '')) || nextCategories[position];
    });
    state.categories = nextCategories;
    adminSaveDraft(true);
    renderCategories();
    reportStatus(selectedIds.length > 1 ? 'Порядок выбранных категорий обновлен' : 'Порядок категории обновлен');
    return;
  }

  if (state.admin.selectedType === 'product') {
    const visible = getVisibleProducts();
    const ids = visible.map((item) => item.id);
    const selectedIds = getSelectedProductIds().filter((id) => ids.includes(id));
    if (!selectedIds.length) return;
    const selectedSet = new Set(selectedIds);
    const orderedSelected = ids.filter((id) => selectedSet.has(id));
    const step = (direction === 'up' || direction === 'left') ? -1 : 1;
    const remaining = ids.filter((id) => !selectedSet.has(id));
    let nextVisibleOrder = ids.slice();
    if (step < 0) {
      const firstIndex = ids.indexOf(orderedSelected[0]);
      if (firstIndex <= 0) return;
      const neighborId = ids[firstIndex - 1];
      if (selectedSet.has(neighborId)) return;
      const insertAt = remaining.indexOf(neighborId);
      if (insertAt < 0) return;
      nextVisibleOrder = [
        ...remaining.slice(0, insertAt),
        ...orderedSelected,
        ...remaining.slice(insertAt),
      ];
    } else {
      const lastIndex = ids.indexOf(orderedSelected[orderedSelected.length - 1]);
      if (lastIndex < 0 || lastIndex >= ids.length - 1) return;
      const neighborId = ids[lastIndex + 1];
      if (selectedSet.has(neighborId)) return;
      const insertAt = remaining.indexOf(neighborId);
      if (insertAt < 0) return;
      nextVisibleOrder = [
        ...remaining.slice(0, insertAt + 1),
        ...orderedSelected,
        ...remaining.slice(insertAt + 1),
      ];
    }
    const productById = new Map(state.products.map((product) => [String(product.id || ''), product]));
    const visiblePositions = [];
    state.products.forEach((product, index) => {
      if (ids.includes(String(product.id || ''))) visiblePositions.push(index);
    });
    const nextProducts = state.products.slice();
    visiblePositions.forEach((position, index) => {
      nextProducts[position] = productById.get(String(nextVisibleOrder[index] || '')) || nextProducts[position];
    });
    state.products = nextProducts;
    adminSaveDraft(true);
    renderProducts();
    reportStatus(selectedIds.length > 1 ? 'Порядок выбранных товаров обновлен' : 'Порядок товара обновлен');
    return;
  }

  if (state.admin.selectedType === 'banner') {
    if (!['left', 'right', 'up', 'down'].includes(direction)) return;
    const list = Array.isArray(state.config.homeBanners) ? state.config.homeBanners : [];
    const fromIdx = list.findIndex((item, idx) => String(item?.id || `banner-${idx + 1}`) === state.admin.selectedId);
    if (fromIdx < 0) return;
    const step = (direction === 'left' || direction === 'up') ? -1 : 1;
    const toIdx = Math.max(0, Math.min(list.length - 1, fromIdx + step));
    if (toIdx === fromIdx) return;
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    state.config.homeBanners = list;
    adminSaveDraft(true);
    renderHomeBanners();
    reportStatus('Порядок баннеров обновлен');
    return;
  }

  if (state.admin.selectedType === 'image') {
    const p = getProduct(state.currentProduct);
    if (!p || !Array.isArray(p.images) || !p.images.length) return;
    const fromIdx = parseProductImageSelectionId(state.admin.selectedId, p.id);
    if (fromIdx < 0 || fromIdx >= p.images.length) {
      reportStatus('Выберите фото для перемещения');
      return;
    }
    const step = (direction === 'left' || direction === 'up') ? -1 : 1;
    const toIdx = moveProductImageByOffset(p, fromIdx, step);
    if (toIdx < 0 || toIdx === fromIdx) return;
    state.admin.selectedId = buildProductImageSelectionId(p.id, toIdx);
    adminSaveDraft(true);
    renderProductView();
    reportStatus('Порядок фото обновлен');
  }
}

function renderCategories() {
  renderProductImportPanel('catalog');
  const promoCatalog = ensurePromoCatalogConfig();
  renderPromoCatalogLabels();
  const list = getVisibleCategories();
  const selectedCategories = new Set(getSelectedCategoryIds());
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
    const branchIds = collectCategoryBranchIds(c.id);
    const branchSet = new Set(branchIds);
    const firstProduct = state.products.find((p) => branchSet.has(String(p.categoryId || '')));
    const fallbackProductImage = firstProduct && Array.isArray(firstProduct.images) && firstProduct.images[0] ? firstProduct.images[0] : '';
    const image = String(c.image || '').trim() || fallbackProductImage;
    const selectedClass = state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'category' && selectedCategories.has(c.id)
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
  const promoImage = promoCatalog.image || promoPreview?.images?.[0] || state.products[0]?.images?.[0] || 'assets/placeholder.svg';
  ui.categoriesGrid.innerHTML = `
    ${categoryCards}
    <button class="category-card promo-category-card" data-open-screen="promo" type="button">
      <img src="${safeSrc(promoImage)}" alt="Акции" loading="lazy" decoding="async" />
      <span>${escapeHtml(promoCatalog.title)}</span>
    </button>
  `;
  if (state.admin.enabled) adminSaveDraft(true);
  adminRefreshBindings();
}

function buildProductCards(list, options = {}) {
  const selectedProducts = new Set(getSelectedProductIds());
  return list.map((p) => {
    const priceView = getProductPriceView(p);
    return `
    <article class="product-card${state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'product' && selectedProducts.has(p.id) ? ' admin-selected-target' : ''}" data-open="${p.id}">
      ${priceView.badgeHtml}
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
          ${priceView.html}
        </div>
        ${state.cart[p.id]
          ? `
            <div class="card-qty" data-qty="${p.id}">
              <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
              <span class="qty-count">${state.cart[p.id]}</span>
              <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
            </div>
          `
          : priceView.hasPrice ? `
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
  renderProductImportPanel('category');
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
  return state.products.filter((p) => hasPrice(p) && getProductPromoPercent(p) > 0);
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
  const homePromoList = list.slice(0, 10);
  if (ui.promoTrack) {
    ui.promoTrack.innerHTML = `
      <div class="home-v2-rail-inner" data-carousel-inner="promo">
      ${homePromoList.map((p) => {
      const promoPercent = getProductPromoPercent(p);
      const newPrice = getProductPromoPrice(p, promoPercent);
      return `
    <article class="home-v2-product-card" data-open="${p.id}">
      <div class="home-v2-discount-badge">-${promoPercent}%</div>
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div class="home-v2-product-title">${p.title}</div>
      <div class="home-v2-product-price">
        <span class="home-v2-price-new">${formatPrice(newPrice)} ₽</span>
        <span class="home-v2-price-old">${formatPrice(p.price)} ₽</span>
      </div>
    </article>
      `;
    }).join('')}
      </div>
    `;
    applyHomeTrackSizing();
    ensureHomeTrackScroll(ui.promoTrack, { promo: true });
    bindHorizontalTrackSwipe(ui.promoTrack);
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
  if (!ui.homeBannerTrack || state.admin.enabled || ui.homeBannerTrack.classList.contains('is-admin-scroll')) {
    state.homeBannerIndex = 0;
    return;
  }
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
  if (!ui.homeBannerTrack || ui.homeBannerTrack.classList.contains('is-admin-scroll')) return;
  if (state.currentScreen !== 'home') return;
  const slidesCount = ui.homeBannerTrack.children.length || 1;
  if (slidesCount <= 1) return;
  state.homeBannerTimer = window.setInterval(() => {
    if (state.currentScreen !== 'home') return;
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

function getPopularProducts(limit = 10) {
  const source = state.products.filter((p) => hasPrice(p));
  if (!source.length) return [];
  const scored = source.map((product) => {
    const stats = getPopularityStats(product.id);
    const score = (stats.views * 1000) + (stats.orderCount * 25) + (stats.orderedQty * 10);
    return { product, score, stats };
  });
  const hasSignals = scored.some((item) => item.score > 0);
  if (!hasSignals) return source.slice(0, Math.min(limit, source.length));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.stats.orderedQty !== a.stats.orderedQty) return b.stats.orderedQty - a.stats.orderedQty;
    if (b.stats.views !== a.stats.views) return b.stats.views - a.stats.views;
    return String(a.product.title || '').localeCompare(String(b.product.title || ''), 'ru');
  });
  const sorted = scored.map((item) => item.product);
  return sorted.slice(0, Math.min(limit, sorted.length));
}

function renderHomePopular() {
  if (!ui.homePopularTrack) return;
  const popular = getPopularProducts(10);
  if (!popular.length) {
    ui.homePopularTrack.innerHTML = `
      <div class="home-v2-empty">Популярные товары появятся после просмотров карточек</div>
    `;
    return;
  }
  ui.homePopularTrack.innerHTML = `
    <div class="home-v2-rail-inner" data-carousel-inner="popular">
      ${popular.map((p) => {
      const priceView = getProductPriceView(p);
      return `
      <article class="home-v2-product-card" data-open="${p.id}">
        ${priceView.hasPromo ? `<div class="home-v2-discount-badge">-${priceView.promoPercent}%</div>` : ''}
        <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
        <div class="home-v2-product-title">${p.title}</div>
        <div class="home-v2-product-price">
          ${priceView.hasPromo
            ? `<span class="home-v2-price-new">${formatPrice(priceView.finalPrice)} ₽</span><span class="home-v2-price-old">${formatPrice(priceView.oldPrice)} ₽</span>`
            : `<span class="home-v2-price-new">${priceLabel(p)}</span>`}
        </div>
      </article>
      `;
    }).join('')}
    </div>
  `;
  applyHomeTrackSizing();
  ensureHomeTrackScroll(ui.homePopularTrack, { promo: true });
  bindHorizontalTrackSwipe(ui.homePopularTrack);
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
      adminBindTapIntent(btn, {
        onSingleTap: () => {
          state.selectedStoreId = store.id;
          saveStorage();
          renderHeaderStore();
          renderStores();
          setScreen('home');
        },
        tapGroup: () => `store:${store.id}`,
        onDoubleTap: () => {
          adminOpenActionSheet(`Адрес: ${store.city}`, [
            { id: 'edit-city', label: 'Изменить город' },
            { id: 'edit-address', label: 'Изменить полный адрес' },
            { id: 'delete', label: 'Удалить адрес', danger: true },
          ]).then((action) => {
            if (!action) return;
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
        },
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
  const productPromoPercent = getProductPromoPercent(p);
  const productPromoPrice = getProductPromoPrice(p, productPromoPercent);
  const hasProductPromo = hasPrice(p) && productPromoPercent > 0;
  const selectedImageIndex = (state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'image')
    ? parseProductImageSelectionId(state.admin.selectedId, p.id)
    : -1;
  ui.productView.innerHTML = `
    <div class="product-hero">
      ${state.admin.enabled ? `
      <div class="product-image-controls">
        <button class="admin-catalog-select" data-admin-select-toggle="image" type="button">Выделить фото</button>
        <button class="admin-inline-move" data-admin-move="left" data-admin-move-scope="image" type="button" aria-label="Сдвинуть фото влево">←</button>
        <button class="admin-inline-move" data-admin-move="right" data-admin-move-scope="image" type="button" aria-label="Сдвинуть фото вправо">→</button>
        <button class="admin-inline-plus admin-inline-delete" data-admin-image-action="delete" type="button" aria-label="Удалить выделенное фото">×</button>
        <button class="admin-inline-plus" data-admin-add="image" type="button" aria-label="Добавить фото">+</button>
      </div>
      ` : ''}
      <div class="product-gallery">${p.images.map((src, index) => `
        <img
          class="${selectedImageIndex === index ? 'admin-selected-target' : ''}"
          src="${safeSrc(src)}"
          alt="${p.title}"
          loading="lazy"
          decoding="async"
          data-product-image-id="${escapeHtml(buildProductImageSelectionId(p.id, index))}"
          data-product-image-index="${index}"
        />
      `).join('')}</div>
    </div>
    <div class="product-title">${p.title}</div>
    <div class="product-meta">Артикул: ${getSku(p) || '—'}</div>
    <div class="product-price-row">
      <div class="product-price">
        ${hasProductPromo
          ? `<span class="promo-new">${formatPrice(productPromoPrice)} ₽</span><span class="promo-old">${formatPrice(p.price)} ₽</span><span class="promo-badge promo-badge-inline">-${productPromoPercent}%</span>`
          : priceLabel(p)}
      </div>
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
      ${state.admin.enabled ? `<button class="secondary-button admin-promo-button" data-admin-promo="${p.id}" type="button">${productPromoPercent > 0 ? `Скидка: ${productPromoPercent}%` : 'Добавить в акции'}</button>` : ''}
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
  ui.favoritesList.innerHTML = list.map((p) => {
    const priceView = getProductPriceView(p);
    return `
    <article class="product-card">
      ${priceView.badgeHtml}
      <label class="select-dot">
        <input type="checkbox" data-fav-select="${p.id}" ${state.selectedFavorites.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription || ''}</div>
        <div class="product-price">${priceView.html}</div>
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
  `;
  }).join('');
}

function renderCart() {
  const items = cartItems();
  if (!state.selectedCart.size && items.length && !state.cartSelectionTouched) {
    state.selectedCart = new Set(items.map((i) => i.id));
    saveStorage();
  }
  const summary = cartSummary();
  ui.cartList.innerHTML = items.map((p) => {
    const priceView = getProductPriceView(p);
    return `
    <div class="cart-item">
      <label class="select-dot">
        <input type="checkbox" data-cart-select="${p.id}" ${state.selectedCart.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img class="cart-image" src="${safeSrc(p.images[0])}" alt="${p.title}" loading="lazy" decoding="async" />
      <div class="cart-info">
        <button class="cart-title-link" data-open="${p.id}">${p.title}</button>
        <div class="cart-sku">Артикул: ${getSku(p) || '—'}</div>
        <div class="cart-price">${priceView.html}</div>
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
  `;
  }).join('');
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

function normalizeWorkflowStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'canceled' || raw === 'cancelled' || raw === 'canceled_by_store' || raw === 'cancelled_by_store') return 'canceled';
  if (raw === 'completed' || raw === 'done' || raw === 'finished') return 'completed';
  if (raw === 'shipped' || raw === 'sent' || raw === 'delivery' || raw === 'in_delivery') return 'shipped';
  if (raw === 'accepted' || raw === 'processing' || raw === 'in_progress' || raw === 'accepted_by_store') return 'accepted';
  if (raw === 'new' || raw === 'created' || raw === 'pending') return 'new';
  return 'new';
}

function normalizePaymentStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw === 'paid' || raw === 'payment_success' || raw === 'success' || raw === 'succeeded' || raw === 'confirmed') return 'paid';
  if (raw === 'pending' || raw === 'payment_pending' || raw === 'created' || raw === 'authorized') return 'pending';
  if (raw === 'failed' || raw === 'payment_failed' || raw === 'fail' || raw === 'canceled' || raw === 'cancelled' || raw === 'expired') return 'failed';
  return raw;
}

function workflowStatusLabel(value) {
  const status = normalizeWorkflowStatus(value);
  if (status === 'canceled') return 'Отменен';
  if (status === 'accepted' || status === 'shipped') return 'Принят';
  if (status === 'completed') return 'Завершен';
  return 'Новый';
}

function paymentStatusLabel(value) {
  const status = normalizePaymentStatus(value);
  if (status === 'paid') return 'Оплачен';
  if (status === 'pending') return 'Ожидает оплату';
  if (status === 'failed') return 'Оплата не прошла';
  return '';
}

function orderDisplayNumber(order, fallbackIndex = 0) {
  const direct = Number(order?.orderNumber || order?.number || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const rawId = String(order?.id || '');
  if (/^\d+$/.test(rawId)) return Number(rawId);
  return fallbackIndex + 1;
}

function orderTotalLabel(order) {
  return order?.totalDisplay || (Number.isFinite(Number(order?.total)) ? `${formatPrice(Number(order.total))} ₽` : 'По запросу');
}

function sortOrdersDesc(list = []) {
  return list.slice().sort((a, b) => Number(new Date(b?.createdAt || 0)) - Number(new Date(a?.createdAt || 0)));
}

async function syncCustomerOrdersFromServer() {
  const context = getClientPlatformContext({ allowGuest: false });
  const storeId = String(state.saas.storeId || '').trim().toUpperCase();
  if ((!context.customerIdentity && !context.telegramUserId) || !storeId) return state.orders;
  try {
    const params = new URLSearchParams();
    if (context.telegramUserId) params.set('telegramUserId', context.telegramUserId);
    if (context.platform) params.set('customerPlatform', context.platform);
    if (context.platformUserId) params.set('customerPlatformUserId', context.platformUserId);
    if (context.customerIdentity) params.set('customerIdentity', context.customerIdentity);
    const payload = await saasRequest(`/stores/${encodeURIComponent(storeId)}/orders/history?${params.toString()}`);
    if (Array.isArray(payload?.orders)) {
      state.orders = payload.orders.map((order) => ({
        ...order,
        status: normalizeWorkflowStatus(order?.status),
        paymentStatus: normalizePaymentStatus(order?.paymentStatus),
      }));
      saveStorage();
    }
  } catch {
    // fallback to local storage if server is temporarily unavailable
  }
  return state.orders;
}

function renderOrders() {
  if (state.admin.enabled) {
    if (ui.ordersList) ui.ordersList.innerHTML = '';
    return;
  }
  if (ui.profileOrdersTitle) ui.profileOrdersTitle.textContent = 'История заказов';
  const orders = sortOrdersDesc(state.orders || []);
  if (!orders.length) {
    ui.ordersList.innerHTML = '<div class="text-card">История заказов пуста.</div>';
    return;
  }
  ui.ordersList.innerHTML = orders.map((o, index) => {
    const workflow = workflowStatusLabel(o.status);
    const payment = paymentStatusLabel(o.paymentStatus);
    return `
      <div class="order-card" data-order-id="${escapeHtml(String(o.id || ''))}">
        <div class="order-head">
          <div class="order-title">Заказ №${orderDisplayNumber(o, index)}</div>
          <div class="order-date">${new Date(o.createdAt).toLocaleString('ru-RU')}</div>
        </div>
        <div class="order-summary">
          <div class="order-total">Сумма: ${orderTotalLabel(o)}</div>
          <button class="order-repeat" type="button">Повторить</button>
        </div>
        <div class="order-status">Статус: ${workflow}${payment ? ` • ${payment}` : ''}</div>
        <button class="order-toggle" type="button">Состав заказа</button>
        <div class="order-items hidden">
          <ul>
            ${(Array.isArray(o.items) ? o.items : []).map((i) => `
              <li>
                <span class="order-item-title">${escapeHtml(String(i?.title || 'Товар'))}</span>
                <span class="order-item-qty">× ${Number(i?.qty || 1)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');
}

function splitAdminOrdersByBucket(orders = []) {
  const sorted = sortOrdersDesc(orders);
  return {
    new: sorted.filter((order) => normalizeWorkflowStatus(order?.status) === 'new'),
    active: sorted.filter((order) => {
      const status = normalizeWorkflowStatus(order?.status);
      return status === 'accepted' || status === 'shipped';
    }),
    completed: sorted.filter((order) => normalizeWorkflowStatus(order?.status) === 'completed'),
    canceled: sorted.filter((order) => normalizeWorkflowStatus(order?.status) === 'canceled'),
  };
}

async function fetchAdminOrders() {
  if (!state.admin.enabled || !state.saas.storeId || !state.saas.token) return [];
  try {
    const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/orders`, { auth: true });
    return Array.isArray(payload?.orders) ? payload.orders.map((order) => ({
      ...order,
      status: normalizeWorkflowStatus(order?.status),
      paymentStatus: normalizePaymentStatus(order?.paymentStatus),
    })) : [];
  } catch (error) {
    reportStatus(`Не удалось загрузить заказы: ${error.message}`);
    return [];
  }
}

function getAdminOrderActionButtons(order, bucket) {
  const orderId = escapeHtml(String(order?.id || ''));
  if (bucket === 'new') {
    return `
      <button class="primary-button compact-button" type="button" data-order-status="accepted" data-order-id="${orderId}">Принять</button>
      <button class="secondary-button compact-button" type="button" data-order-status="canceled" data-order-id="${orderId}" data-order-cancel-order="1">Отменить заказ</button>
    `;
  }
  if (bucket === 'active') {
    return `
      <button class="primary-button compact-button" type="button" data-order-status="completed" data-order-id="${orderId}">Завершить</button>
      <button class="secondary-button compact-button" type="button" data-order-status="new" data-order-id="${orderId}" data-order-cancel="1">Отменить</button>
      <button class="secondary-button compact-button" type="button" data-order-status="canceled" data-order-id="${orderId}" data-order-cancel-order="1">Отменить заказ</button>
    `;
  }
  if (bucket === 'completed') {
    return `
      <button class="secondary-button compact-button" type="button" data-order-status="accepted" data-order-id="${orderId}" data-order-cancel="1">Отменить</button>
    `;
  }
  if (bucket === 'canceled') {
    return `
      <button class="secondary-button compact-button" type="button" data-order-status="new" data-order-id="${orderId}" data-order-cancel="1">Вернуть в новые</button>
    `;
  }
  return '';
}

function renderAdminOrderList(target, orders = [], bucket = 'new') {
  if (!target) return;
  if (!orders.length) {
    target.innerHTML = '<div class="text-card">Заказов в этом разделе пока нет.</div>';
    return;
  }
  target.innerHTML = orders.map((order, index) => `
    <article class="admin-fulfillment-card" data-admin-fulfillment-order="${escapeHtml(String(order.id || ''))}">
      <div class="admin-fulfillment-head">
        <button class="admin-fulfillment-toggle" type="button" data-order-toggle="${escapeHtml(String(order.id || ''))}">
          Заказ №${orderDisplayNumber(order, index)}
        </button>
        <div class="admin-fulfillment-actions">
          ${getAdminOrderActionButtons(order, bucket)}
        </div>
      </div>
      <div class="admin-fulfillment-body hidden">
        <div class="admin-order-meta">Статус: ${workflowStatusLabel(order.status)}${paymentStatusLabel(order.paymentStatus) ? ` • ${paymentStatusLabel(order.paymentStatus)}` : ''}</div>
        <div class="admin-order-meta">Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}</div>
        <div class="admin-order-meta">Сумма: ${orderTotalLabel(order)}</div>
        <div class="admin-order-meta">Клиент: ${escapeHtml(String(order.customer?.name || '—'))}</div>
        <div class="admin-order-meta">Телефон: ${escapeHtml(String(order.customer?.phone || '—'))}</div>
        <div class="admin-order-meta">Email: ${escapeHtml(String(order.customer?.email || '—'))}</div>
        <div class="admin-order-meta">Клиент ID: ${escapeHtml(String(order.customerIdentity || order.customer?.customerIdentity || order.customer?.platformUserId || order.customerPlatformUserId || order.customer?.telegramId || order.telegramUserId || '—'))}</div>
        ${order.customer?.deliveryAddress ? `<div class="admin-order-meta">Адрес: ${escapeHtml(String(order.customer.deliveryAddress))}</div>` : ''}
        ${order.customer?.comment ? `<div class="admin-order-meta">Комментарий: ${escapeHtml(String(order.customer.comment))}</div>` : ''}
        <div class="admin-order-items-list">
          ${(Array.isArray(order.items) ? order.items : []).map((item) => `
            <div class="admin-order-item-row">
              <span>${escapeHtml(String(item?.title || 'Товар'))}</span>
              <strong>× ${Number(item?.qty || 1)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

async function updateAdminOrderStatus(orderId, nextStatus) {
  if (!state.admin.enabled || !state.saas.storeId || !state.saas.token || !orderId) return false;
  try {
    await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status: nextStatus },
    });
    return true;
  } catch (error) {
    reportStatus(`Не удалось обновить статус заказа: ${error.message}`);
    return false;
  }
}

function bindAdminOrderListInteractions(target, bucket) {
  if (!target || target.dataset.boundAdminOrders === '1') return;
  target.dataset.boundAdminOrders = '1';
  target.addEventListener('click', async (event) => {
    const statusBtn = event.target.closest('[data-order-status]');
    if (statusBtn) {
      event.preventDefault();
      event.stopPropagation();
      const orderId = String(statusBtn.dataset.orderId || '').trim();
      const nextStatus = String(statusBtn.dataset.orderStatus || '').trim();
      if (!orderId || !nextStatus) return;
      if (statusBtn.dataset.orderCancelOrder === '1') {
        const confirmedCancelOrder = window.confirm('Подтвердите отмену заказа. Заказ перейдет в раздел отмененных.');
        if (!confirmedCancelOrder) return;
      } else if (statusBtn.dataset.orderCancel === '1') {
        const confirmed = window.confirm('Подтвердите отмену изменения статуса заказа.');
        if (!confirmed) return;
      }
      statusBtn.disabled = true;
      const ok = await updateAdminOrderStatus(orderId, nextStatus);
      if (ok) await renderAdminOrdersByBucket(bucket);
      else statusBtn.disabled = false;
      return;
    }
    const toggleBtn = event.target.closest('[data-order-toggle]');
    if (!toggleBtn) return;
    const card = event.target.closest('[data-admin-fulfillment-order]');
    const body = card?.querySelector('.admin-fulfillment-body');
    if (body) body.classList.toggle('hidden');
  });
}

async function renderAdminOrdersOverview() {
  if (!state.admin.enabled) return;
  const orders = await fetchAdminOrders();
  const buckets = splitAdminOrdersByBucket(orders);
  if (ui.ordersNewPreview) ui.ordersNewPreview.textContent = String(buckets.new.length);
  if (ui.ordersActivePreview) ui.ordersActivePreview.textContent = String(buckets.active.length);
  if (ui.ordersCompletedPreview) ui.ordersCompletedPreview.textContent = String(buckets.completed.length);
  if (ui.ordersCanceledPreview) ui.ordersCanceledPreview.textContent = String(buckets.canceled.length);
}

async function renderAdminOrdersByBucket(bucket) {
  if (!state.admin.enabled) return;
  const orders = await fetchAdminOrders();
  const buckets = splitAdminOrdersByBucket(orders);
  if (bucket === 'new') {
    renderAdminOrderList(ui.ordersNewList, buckets.new, 'new');
    bindAdminOrderListInteractions(ui.ordersNewList, 'new');
  }
  if (bucket === 'active') {
    renderAdminOrderList(ui.ordersActiveList, buckets.active, 'active');
    bindAdminOrderListInteractions(ui.ordersActiveList, 'active');
  }
  if (bucket === 'completed') {
    renderAdminOrderList(ui.ordersCompletedList, buckets.completed, 'completed');
    bindAdminOrderListInteractions(ui.ordersCompletedList, 'completed');
  }
  if (bucket === 'canceled') {
    renderAdminOrderList(ui.ordersCanceledList, buckets.canceled, 'canceled');
    bindAdminOrderListInteractions(ui.ordersCanceledList, 'canceled');
  }
  await renderAdminOrdersOverview();
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

function buildPopularProductsFromOrders(orders = []) {
  const map = new Map();
  orders.forEach((order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    items.forEach((item) => {
      const key = String(item?.id || item?.productId || item?.title || '').trim();
      if (!key) return;
      const current = map.get(key) || {
        productId: String(item?.id || item?.productId || '').trim(),
        title: String(item?.title || 'Товар').trim() || 'Товар',
        qty: 0,
        revenue: 0,
      };
      const qty = Math.max(1, Number(item?.qty || 1));
      const price = Math.max(0, Number(item?.price || 0));
      current.qty += qty;
      current.revenue += price * qty;
      map.set(key, current);
    });
  });
  return Array.from(map.values())
    .sort((a, b) => {
      if (b.qty !== a.qty) return b.qty - a.qty;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return a.title.localeCompare(b.title, 'ru');
    })
    .slice(0, 10);
}

async function getAdminPopularProductsData() {
  const { orders, remoteMetrics } = await getAdminAnalyticsData();
  const remoteTop = Array.isArray(remoteMetrics?.topProducts) ? remoteMetrics.topProducts : [];
  if (remoteTop.length) {
    return remoteTop.slice(0, 10).map((item) => ({
      productId: String(item?.productId || '').trim(),
      title: String(item?.title || 'Товар').trim() || 'Товар',
      qty: Number(item?.qty || 0),
      revenue: Number(item?.revenue || 0),
    }));
  }
  return buildPopularProductsFromOrders(orders);
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
      const id = String(btn.dataset.adminOrder || '').trim();
      const order = orders.find((x) => String(x.id || '').trim() === id);
      if (!order) return;
      adminOpenReportModal(
        `Заказ №${orderDisplayNumber(order)}`,
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
  const popular = await getAdminPopularProductsData();
  const thisMonthKey = adminMonthKey(new Date().toISOString());
  const thisMonth = monthMap.get(thisMonthKey) || { total: 0, margin: 0, count: 0 };
  if (ui.statsRevenuePreview) ui.statsRevenuePreview.textContent = `${formatPrice(thisMonth.total)} ₽`;
  if (ui.statsOrdersPreview) ui.statsOrdersPreview.textContent = String(orders.length);
  if (ui.statsPopularPreview) ui.statsPopularPreview.textContent = popular.length ? String(popular[0].qty || 0) : '0';
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
      const id = String(btn.dataset.adminOrder || '').trim();
      const order = orders.find((x) => String(x.id || '').trim() === id);
      if (!order) return;
      adminOpenReportModal(
        `Заказ №${orderDisplayNumber(order)}`,
        `
          <div><strong>Клиент:</strong> ${escapeHtml(order.customer?.name || '—')}</div>
          <div><strong>Телефон:</strong> ${escapeHtml(order.customer?.phone || '—')}</div>
          <div><strong>Email:</strong> ${escapeHtml(order.customer?.email || '—')}</div>
          <div><strong>Клиент ID:</strong> ${escapeHtml(order.customerIdentity || order.customer?.customerIdentity || order.customer?.platformUserId || order.customerPlatformUserId || order.customer?.telegramId || order.telegramUserId || '—')}</div>
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

async function renderAdminStatsPopular() {
  if (!state.admin.enabled || !ui.statsPopularList) return;
  const items = await getAdminPopularProductsData();
  if (!items.length) {
    ui.statsPopularList.innerHTML = '<div class="text-card">Покупок по товарам пока нет.</div>';
    return;
  }
  ui.statsPopularList.innerHTML = `
    <div class="admin-analytics-orders">
      ${items.map((item, index) => `
        <div class="admin-order-card">
          <div class="admin-order-head">
            <strong>${index + 1}. ${escapeHtml(item.title || 'Товар')}</strong>
            <span>Топ ${index + 1}</span>
          </div>
          <div class="admin-order-meta">Купили: ${formatPrice(Number(item.qty || 0))} шт.</div>
          <div class="admin-order-meta">Выручка: ${formatPrice(Number(item.revenue || 0))} ₽</div>
        </div>
      `).join('')}
    </div>
  `;
}

function normalizeOrderProcessingMode(raw) {
  return String(raw || '').trim().toLowerCase() === 'chat' ? 'chat' : 'payment';
}

function isValidTelegramChatId(value) {
  return /^-?[0-9]{5,20}$/.test(String(value || '').trim());
}

function isValidVkPeerId(value) {
  return /^-?[0-9]{4,20}$/.test(String(value || '').trim());
}

function isValidHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizeOrderRequestChannel(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram_chat' || value === 'telegram' || value === 'admin_bot') return 'telegram_chat';
  if (value === 'vk_messages' || value === 'vk' || value === 'vk_group') return 'vk_messages';
  if (value === 'webhook' || value === 'http_webhook') return 'webhook';
  if (value === 'external') return 'messenger_link';
  if (value === 'messenger_link' || value === 'messenger' || value === 'link') return 'messenger_link';
  return 'telegram_chat';
}

function getOrderRequestChannelMeta(channel) {
  const code = normalizeOrderRequestChannel(channel);
  if (code === 'telegram_chat') {
    return {
      label: 'Chat ID Telegram',
      placeholder: 'Например: -1001234567890',
      hint: 'Добавьте admin-бота в Telegram-чат: он отправит Chat ID автоматически.',
    };
  }
  if (code === 'webhook') {
    return {
      label: 'Webhook URL',
      placeholder: 'https://example.com/order-webhook',
      hint: 'Система отправит JSON заказа по HTTP POST. Подходит для любых мессенджеров через интеграторы.',
      secretLabel: '',
      secretPlaceholder: '',
    };
  }
  if (code === 'vk_messages') {
    return {
      label: 'Peer ID / User ID VK',
      placeholder: 'Например: 2000000001 или 123456789',
      hint: 'Укажите peer_id чата или user_id пользователя VK. Для отправки нужен токен сообщества с правом messages.',
      secretLabel: 'Токен сообщества VK',
      secretPlaceholder: 'vk1.a....',
    };
  }
  return {
    label: 'Ссылка/шаблон мессенджера',
    placeholder: 'https://wa.me/7900...?text={message}',
    hint: 'Можно указать ссылку VK/WhatsApp/MAX и шаблон с параметрами: {message}, {order_id}, {store_id}, {total}, {customer_name}, {customer_phone}.',
    secretLabel: '',
    secretPlaceholder: '',
  };
}

function validateOrderRequestTarget(channel, target, secret = '') {
  const code = normalizeOrderRequestChannel(channel);
  const raw = String(target || '').trim();
  if (!raw) return false;
  if (code === 'telegram_chat') return isValidTelegramChatId(raw);
  if (code === 'vk_messages') return isValidVkPeerId(raw) && Boolean(String(secret || '').trim());
  return isValidHttpUrl(raw);
}

function getOrderChatSettingsDraft(sourceSettings = null) {
  const settings = sourceSettings && typeof sourceSettings === 'object'
    ? sourceSettings
    : (state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {});
  const mode = normalizeOrderProcessingMode(settings.orderProcessingMode || '');
  const hasRequestUrl = Boolean(String(settings.orderRequestTarget || settings.orderRequestUrl || settings.orderRequestWebhookUrl || '').trim());
  const inferredChannel = settings.orderRequestChannelType
    || settings.orderRequestSender
    || (hasRequestUrl ? (String(settings.orderRequestWebhookUrl || '').trim() ? 'webhook' : 'messenger_link') : '');
  const channel = normalizeOrderRequestChannel(
    inferredChannel,
  );
  const target = channel === 'telegram_chat'
    ? String(settings.orderRequestChatId || settings.orderChatId || settings.chatId || settings.telegramChatId || '').trim()
    : String(settings.orderRequestTarget || settings.orderRequestUrl || settings.orderRequestWebhookUrl || '').trim();
  const vkToken = String(settings.orderRequestVkToken || settings.vkOrderToken || settings.vkCommunityToken || '').trim();
  return {
    mode,
    channel,
    target,
    vkToken,
    targetValid: validateOrderRequestTarget(channel, target, vkToken),
  };
}

function renderOrderChatSettings({ fromInputs = false } = {}) {
  const draft = fromInputs
    ? {
      mode: normalizeOrderProcessingMode(ui.orderChatModeInput?.value || 'chat'),
      channel: normalizeOrderRequestChannel(ui.orderRequestChannelInput?.value || 'telegram_chat'),
      target: String(ui.orderRequestTargetInput?.value || '').trim(),
      vkToken: String(ui.orderRequestVkTokenInput?.value || '').trim(),
      targetValid: validateOrderRequestTarget(
        ui.orderRequestChannelInput?.value || 'telegram_chat',
        ui.orderRequestTargetInput?.value || '',
        ui.orderRequestVkTokenInput?.value || '',
      ),
    }
    : getOrderChatSettingsDraft();

  const channelMeta = getOrderRequestChannelMeta(draft.channel);

  if (!fromInputs) {
    if (ui.orderChatModeInput) ui.orderChatModeInput.value = draft.mode;
    if (ui.orderRequestChannelInput) ui.orderRequestChannelInput.value = draft.channel;
    if (ui.orderRequestTargetInput) ui.orderRequestTargetInput.value = draft.target;
    if (ui.orderRequestVkTokenInput) ui.orderRequestVkTokenInput.value = draft.vkToken || '';
  }

  if (ui.orderRequestTargetLabel) {
    if (ui.orderRequestTargetLabel.firstChild && ui.orderRequestTargetLabel.firstChild.nodeType === 3) {
      ui.orderRequestTargetLabel.firstChild.textContent = `${channelMeta.label} `;
    }
  }
  if (ui.orderRequestTargetInput) {
    ui.orderRequestTargetInput.placeholder = channelMeta.placeholder;
    if (draft.channel === 'telegram_chat' || draft.channel === 'vk_messages') {
      ui.orderRequestTargetInput.type = 'text';
      ui.orderRequestTargetInput.inputMode = 'numeric';
    } else {
      ui.orderRequestTargetInput.type = 'url';
      ui.orderRequestTargetInput.inputMode = 'url';
    }
  }
  if (ui.orderRequestVkTokenLabel) {
    ui.orderRequestVkTokenLabel.classList.toggle('hidden', draft.channel !== 'vk_messages');
    if (ui.orderRequestVkTokenLabel.firstChild && ui.orderRequestVkTokenLabel.firstChild.nodeType === 3) {
      ui.orderRequestVkTokenLabel.firstChild.textContent = `${channelMeta.secretLabel || 'Токен'} `;
    }
  }
  if (ui.orderRequestVkTokenInput) {
    ui.orderRequestVkTokenInput.placeholder = channelMeta.secretPlaceholder || '';
  }
  if (ui.orderRequestHint) {
    ui.orderRequestHint.textContent = channelMeta.hint;
  }

  if (ui.orderChatStatus) {
    if (draft.mode === 'chat') {
      if (draft.targetValid) {
        if (draft.channel === 'telegram_chat') {
          ui.orderChatStatus.textContent = 'Режим заявок активен: отправка в Telegram Chat ID.';
        } else if (draft.channel === 'vk_messages') {
          ui.orderChatStatus.textContent = 'Режим заявок активен: отправка в сообщения VK.';
        } else if (draft.channel === 'webhook') {
          ui.orderChatStatus.textContent = 'Режим заявок активен: отправка в webhook.';
        } else {
          ui.orderChatStatus.textContent = 'Режим заявок активен: заказ будет открыт через ссылку мессенджера.';
        }
      } else {
        if (draft.channel === 'telegram_chat') {
          ui.orderChatStatus.textContent = 'Для режима заявок укажите корректный Chat ID Telegram.';
        } else if (draft.channel === 'vk_messages') {
          ui.orderChatStatus.textContent = 'Для режима заявок укажите корректный VK peer_id/user_id и токен сообщества.';
        } else {
          ui.orderChatStatus.textContent = 'Для режима заявок укажите корректную ссылку (http/https).';
        }
      }
    } else {
      ui.orderChatStatus.textContent = draft.targetValid
        ? 'Режим онлайн-оплаты активен. Канал заявок сохранён как резервный.'
        : 'Режим онлайн-оплаты активен.';
    }
  }
}

async function saveOrderChatSettings() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  if (!requireAdminFeatureAccess()) return;
  const mode = normalizeOrderProcessingMode(ui.orderChatModeInput?.value || 'chat');
  const channel = normalizeOrderRequestChannel(ui.orderRequestChannelInput?.value || 'telegram_chat');
  const target = String(ui.orderRequestTargetInput?.value || '').trim();
  const vkToken = String(ui.orderRequestVkTokenInput?.value || '').trim();
  if (mode === 'chat' && !validateOrderRequestTarget(channel, target, vkToken)) {
    if (ui.orderChatStatus) {
      if (channel === 'telegram_chat') {
        ui.orderChatStatus.textContent = 'Введите корректный Chat ID Telegram (например: -1001234567890).';
      } else if (channel === 'vk_messages') {
        ui.orderChatStatus.textContent = 'Введите корректный VK peer_id/user_id и токен сообщества.';
      } else {
        ui.orderChatStatus.textContent = 'Введите корректную ссылку (http/https).';
      }
    }
    return;
  }
  if ((target || vkToken) && !validateOrderRequestTarget(channel, target, vkToken)) {
    if (ui.orderChatStatus) {
      if (channel === 'telegram_chat') {
        ui.orderChatStatus.textContent = 'Chat ID должен содержать только цифры и опциональный знак "-".';
      } else if (channel === 'vk_messages') {
        ui.orderChatStatus.textContent = 'VK peer_id/user_id должен быть числом, токен сообщества обязателен.';
      } else {
        ui.orderChatStatus.textContent = 'Ссылка должна начинаться с http:// или https://';
      }
    }
    return;
  }
  if (ui.orderChatStatus) ui.orderChatStatus.textContent = 'Сохраняем настройки заявок...';
  try {
    const telegramChatId = channel === 'telegram_chat' ? target : '';
    const requestTarget = channel === 'telegram_chat' ? '' : target;
    const patch = {
      ...(state.saas.settings && typeof state.saas.settings === 'object' ? state.saas.settings : {}),
      orderProcessingMode: mode,
      orderRequestSender: channel === 'telegram_chat' ? 'admin_bot' : 'external',
      orderRequestChannelType: channel,
      orderRequestTarget: requestTarget,
      orderRequestChatId: telegramChatId,
      orderChatId: telegramChatId,
      chatId: telegramChatId,
      telegramChatId: telegramChatId,
      orderRequestVkToken: channel === 'vk_messages' ? vkToken : '',
      vkOrderToken: channel === 'vk_messages' ? vkToken : '',
      vkCommunityToken: channel === 'vk_messages' ? vkToken : '',
    };
    const payload = await saasRequest(`/admin/stores/${encodeURIComponent(state.saas.storeId)}/bot`, {
      method: 'POST',
      auth: true,
      body: { settings: patch },
    });
    state.saas.settings = payload?.settings && typeof payload.settings === 'object' ? payload.settings : patch;
    renderOrderChatSettings();
    if (ui.orderChatStatus) {
      ui.orderChatStatus.textContent = mode === 'chat'
        ? 'Режим заявок сохранён.'
        : 'Режим онлайн-оплаты сохранён.';
    }
  } catch (error) {
    if (ui.orderChatStatus) {
      ui.orderChatStatus.textContent = `Ошибка сохранения: ${String(error?.message || 'unknown')}`;
    }
  }
}

function renderProfile() {
  const user = getTelegramUser();
  const saasUser = state.saas.userProfile && typeof state.saas.userProfile === 'object' ? state.saas.userProfile : {};
  const storeMeta = getCurrentStoreMeta() || {};
  const fallbackName = String(saasUser.firstName || storeMeta.storeName || state.profile.name || 'Пользователь').trim();
  const firstName = String(user.first_name || fallbackName || 'Пользователь').trim();
  const username = String(user.username || saasUser.username || '').trim();
  const photoUrl = String(
    user.photo_url
    || saasUser.photoUrl
    || buildTelegramUsernameAvatarUrl(username)
    || ''
  ).trim();
  const tgIdFromWebApp = String(getTelegramId() || '').trim();
  const tgIdFromSaas = String(saasUser.id || (String(state.saas.userId || '').startsWith('tg:') ? String(state.saas.userId).slice(3) : '') || '').trim();
  const resolvedTgId = tgIdFromWebApp || tgIdFromSaas;
  if (ui.profileName) ui.profileName.textContent = firstName || 'Пользователь';
  if (ui.profileHandle) ui.profileHandle.textContent = username ? `@${username}` : `ID: ${resolvedTgId || '—'}`;
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
  renderProfileBotConnectSection();
  if (ui.profileSubscriptionSection) {
    ui.profileSubscriptionSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (ui.profileStatsSection) {
    ui.profileStatsSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (ui.profileOrderChatSection) {
    ui.profileOrderChatSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (ui.profilePaymentIntegrationSection) {
    ui.profilePaymentIntegrationSection.classList.toggle('hidden', !state.admin.enabled);
  }
  if (state.admin.enabled) renderOrderChatSettings();
  if (state.admin.enabled) renderPaymentIntegrationSettings();
  renderStoreSettingsSection();
  if (state.admin.enabled && ui.subscriptionStatus) {
    const t = getSelectedSubscriptionTariff();
    const code = String(state.subscription?.code || '');
    if (code === 'active') {
      ui.subscriptionStatus.textContent = `Подписка активна. Осталось дней: ${Number(state.subscription?.daysLeft || 0)}. Тариф для продления: ${t.label} — ${formatPrice(t.amount)} ₽`;
    } else if (code === 'trial') {
      ui.subscriptionStatus.textContent = `Тестовый период активен. Осталось дней: ${Number(state.subscription?.daysLeft || 0)}. Тариф: ${t.label} — ${formatPrice(t.amount)} ₽`;
    } else if (code === 'grace') {
      ui.subscriptionStatus.textContent = `Льготный период: ${Number(state.subscription?.graceDaysLeft || 0)} дн. Редактирование и статистика отключены до оплаты.`;
    } else if (code === 'expired') {
      ui.subscriptionStatus.textContent = `Подписка не активна. Редактирование и статистика отключены. Выберите тариф: ${t.label} — ${formatPrice(t.amount)} ₽`;
    } else {
      ui.subscriptionStatus.textContent = `Выбран тариф: ${t.label} — ${formatPrice(t.amount)} ₽`;
    }
  }
  if (ui.profileHistorySection) {
    ui.profileHistorySection.classList.toggle('hidden', state.admin.enabled);
  }
}

function normalizePaymentProviderCode(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'yookassa') return 'yookassa';
  if (value === 'tbank' || value === 'tinkoff') return 'tbank';
  if (value === 'robokassa') return 'robokassa';
  if (value === 'alfabank' || value === 'alfa') return 'alfabank';
  return 'yookassa';
}

function getPaymentProviderMeta(providerCode) {
  return PAYMENT_PROVIDER_META[normalizePaymentProviderCode(providerCode)] || PAYMENT_PROVIDER_META.yookassa;
}

function normalizePaymentIntegrationSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const provider = normalizePaymentProviderCode(source.provider);
  const accountId = String(
    source.accountId
    || source.yookassaShopId
    || source.shopId
    || source.terminalKey
    || source.merchantLogin
    || source.userName
    || ''
  ).trim();
  const secretConfigured = Boolean(source.secretConfigured || source.yookassaSecretConfigured);
  const apiUrl = String(source.apiUrl || source.endpoint || '').trim();
  const returnUrl = String(source.returnUrl || source.yookassaReturnUrl || '').trim();
  const webhookUrl = String(source.webhookUrl || '').trim();
  const meta = getPaymentProviderMeta(provider);
  const configured = Boolean(source.configured)
    || Boolean(
      provider
      && (!meta.needsAccount || accountId)
      && (!meta.needsSecret || secretConfigured)
    );
  return {
    provider,
    accountId,
    secretConfigured,
    apiUrl,
    returnUrl,
    webhookUrl,
    configured,
  };
}

function renderPaymentIntegrationSettings() {
  const draft = normalizePaymentIntegrationSettings(state.paymentIntegration);
  const meta = getPaymentProviderMeta(draft.provider);
  if (ui.paymentIntegrationProviderInput) ui.paymentIntegrationProviderInput.value = draft.provider;
  if (ui.paymentIntegrationAccountInput) ui.paymentIntegrationAccountInput.value = draft.accountId;
  if (ui.paymentIntegrationAccountLabel) {
    if (ui.paymentIntegrationAccountLabel.firstChild && ui.paymentIntegrationAccountLabel.firstChild.nodeType === 3) {
      ui.paymentIntegrationAccountLabel.firstChild.textContent = `${meta.accountLabel} `;
    }
  }
  if (ui.paymentIntegrationAccountInput) {
    ui.paymentIntegrationAccountInput.placeholder = meta.accountPlaceholder;
  }
  if (ui.paymentIntegrationSecretLabel) {
    if (ui.paymentIntegrationSecretLabel.firstChild && ui.paymentIntegrationSecretLabel.firstChild.nodeType === 3) {
      ui.paymentIntegrationSecretLabel.firstChild.textContent = `${meta.secretLabel} `;
    }
  }
  if (ui.paymentIntegrationSecretKeyInput) {
    ui.paymentIntegrationSecretKeyInput.placeholder = meta.secretPlaceholder;
  }
  if (ui.paymentIntegrationSecretKeyInput) ui.paymentIntegrationSecretKeyInput.value = '';
  if (ui.paymentIntegrationHint) {
    ui.paymentIntegrationHint.textContent = meta.hint;
  }
  if (ui.paymentIntegrationWebhookUrl) {
    ui.paymentIntegrationWebhookUrl.textContent = draft.webhookUrl || '—';
  }
  if (ui.paymentIntegrationStatus) {
    if (draft.configured) {
      ui.paymentIntegrationStatus.textContent = `Касса подключена (${meta.label}).`;
    } else {
      ui.paymentIntegrationStatus.textContent = `Касса не подключена (${meta.label}). Заполните обязательные поля.`;
    }
  }
}

async function loadPaymentIntegrationSettings() {
  if (!state.admin.enabled || !state.saas.storeId || !state.saas.token) return;
  try {
    const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/payment-settings`, { auth: true });
    const next = normalizePaymentIntegrationSettings(payload?.settings || {});
    state.paymentIntegration = next;
    renderPaymentIntegrationSettings();
  } catch (error) {
    if (ui.paymentIntegrationStatus) {
      ui.paymentIntegrationStatus.textContent = `Ошибка загрузки настроек кассы: ${String(error?.message || 'unknown')}`;
    }
  }
}

async function savePaymentIntegrationSettings() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  if (!requireAdminFeatureAccess()) return;
  const provider = normalizePaymentProviderCode(ui.paymentIntegrationProviderInput?.value || 'yookassa');
  const meta = getPaymentProviderMeta(provider);
  const accountId = String(ui.paymentIntegrationAccountInput?.value || '').trim();
  const secretKey = String(ui.paymentIntegrationSecretKeyInput?.value || '').trim();

  if (!PAYMENT_PROVIDER_META[provider]) {
    if (ui.paymentIntegrationStatus) ui.paymentIntegrationStatus.textContent = 'Выбран неподдерживаемый провайдер.';
    return;
  }
  if (meta.needsAccount && !accountId) {
    if (ui.paymentIntegrationStatus) ui.paymentIntegrationStatus.textContent = `Введите поле "${meta.accountLabel}".`;
    return;
  }
  // Return URL и API endpoint управляются системой, клиент задает только реквизиты кассы.
  if (meta.needsSecret && !secretKey && !state.paymentIntegration?.secretConfigured) {
    if (ui.paymentIntegrationStatus) ui.paymentIntegrationStatus.textContent = `Введите поле "${meta.secretLabel}".`;
    return;
  }

  if (ui.paymentIntegrationStatus) ui.paymentIntegrationStatus.textContent = 'Сохраняем настройки кассы...';
  try {
    const payload = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/admin/payment-settings`, {
      method: 'PUT',
      auth: true,
      body: {
        provider,
        accountId,
        secretKey,
      },
    });
    state.paymentIntegration = normalizePaymentIntegrationSettings(payload?.settings || {});
    renderPaymentIntegrationSettings();
    if (ui.paymentIntegrationStatus) {
      ui.paymentIntegrationStatus.textContent = 'Касса подключена. Оплата по заказам будет создаваться автоматически.';
    }
  } catch (error) {
    if (ui.paymentIntegrationStatus) {
      ui.paymentIntegrationStatus.textContent = `Ошибка сохранения: ${String(error?.message || 'unknown')}`;
    }
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

function renderStoreSettingsSection() {
  if (ui.profileAppearancePanel) {
    ui.profileAppearancePanel.classList.toggle('hidden', !state.admin.enabled);
  }
  if (ui.themeSelect) ui.themeSelect.value = normalizeThemeCode(state.theme);
  if (ui.accentSelect) ui.accentSelect.value = normalizeAccentCode(state.accent);
  renderAdminPromoSettings();
}

async function saveAdminPromoCode() {
  if (!state.admin.enabled || !state.saas.storeId) return;
  if (!requireAdminFeatureAccess()) return;
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
  if (!requireAdminFeatureAccess()) return;
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

function resolveOrderPaymentResult(serverOrderResult) {
  const source = serverOrderResult?.payment && typeof serverOrderResult.payment === 'object'
    ? serverOrderResult.payment
    : {};
  const url = String(source.url || source.paymentUrl || '').trim();
  const provider = String(source.provider || '').trim().toLowerCase() || 'custom';
  const paymentId = String(source.paymentId || '').trim();
  return {
    url,
    provider,
    paymentId,
    ok: Boolean(url),
    error: String(source.error || source.reason || '').trim(),
  };
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
    robokassa: 'Robokassa',
    alfabank: 'Альфа-Банк',
    custom_link: 'Касса магазина',
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

function subscriptionAllowsAdminFeatures() {
  if (!state.admin.enabled) return true;
  return state.subscription?.featureAccess !== false;
}

async function refreshSubscriptionStatus() {
  if (!state.admin.enabled || !state.saas.token) return;
  try {
    const payload = await saasRequest(`/subscription/status?storeId=${encodeURIComponent(state.saas.storeId || '')}`, { auth: true });
    if (payload?.subscription && typeof payload.subscription === 'object') {
      state.subscription = {
        ...state.subscription,
        ...payload.subscription,
      };
    }
  } catch {
    // keep previous state silently
  }
}

async function resolveSubscriptionPaymentLink(tariff) {
  const days = String(tariff?.days || '').trim();
  if (!days) return '';
  try {
    const response = await saasRequest(`/subscription/payment-link?days=${encodeURIComponent(days)}`, { auth: true });
    return String(response?.url || '').trim();
  } catch {
    return '';
  }
}

async function openSubscriptionPayment() {
  if (!state.admin.enabled) return;
  const tariff = getSelectedSubscriptionTariff();
  if (ui.subscriptionPayButton) ui.subscriptionPayButton.disabled = true;
  if (ui.subscriptionStatus) ui.subscriptionStatus.textContent = 'Готовим ссылку оплаты подписки...';
  const link = await resolveSubscriptionPaymentLink(tariff);
  if (ui.subscriptionPayButton) ui.subscriptionPayButton.disabled = false;
  if (!link) {
    if (ui.subscriptionStatus) {
      ui.subscriptionStatus.textContent = 'Ссылка оплаты подписки не настроена на сервере.';
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
  renderFavorites();
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

function bindHorizontalTrackSwipe(track) {
  if (!track || track.dataset.swipeBound === '1') return;
  track.dataset.swipeBound = '1';
  track.style.setProperty('touch-action', 'pan-x');

  // Для новых home-v2 лент оставляем нативный инерционный скролл WebView,
  // чтобы не ломать плавность ручным touchmove-перехватом.
  if (track.classList.contains('home-v2-rail')) {
    track.style.setProperty('touch-action', 'pan-x pan-y');
    track.style.setProperty('scroll-behavior', 'smooth');
    track.style.setProperty('overscroll-behavior-x', 'contain');
    return;
  }

  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let draggingX = false;
  let suppressClick = false;

  track.addEventListener('touchstart', (event) => {
    if (!event.touches || !event.touches.length) return;
    const t = event.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startScrollLeft = track.scrollLeft || 0;
    draggingX = false;
    suppressClick = false;
  }, { passive: true });

  track.addEventListener('touchmove', (event) => {
    if (!event.touches || !event.touches.length) return;
    const t = event.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (!draggingX) draggingX = true;
      track.scrollLeft = startScrollLeft - dx;
      suppressClick = true;
      event.preventDefault();
    }
  }, { passive: false });

  track.addEventListener('touchend', () => {
    draggingX = false;
    if (!suppressClick) return;
    window.setTimeout(() => {
      suppressClick = false;
    }, 220);
  }, { passive: true });

  track.addEventListener('touchcancel', () => {
    draggingX = false;
    suppressClick = false;
  }, { passive: true });

  track.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);

  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
    event.preventDefault();
    track.scrollBy({
      left: event.shiftKey ? event.deltaY : event.deltaX,
      behavior: 'auto',
    });
  }, { passive: false });
}

function ensureHomeTrackScroll(track, { promo = false, article = false } = {}) {
  if (!track) return;
  track.style.overflowX = 'auto';
  track.style.overflowY = 'hidden';
  track.style.webkitOverflowScrolling = 'touch';
  track.style.setProperty('touch-action', track.classList.contains('home-v2-rail') ? 'pan-x pan-y' : 'pan-x');
  track.classList.add('home-v2-scroll-ready');
  const inner = track.querySelector('.home-v2-rail-inner') || track.querySelector('.home-carousel-inner');
  if (!inner) return;
  inner.style.display = 'grid';
  inner.style.gridAutoFlow = 'column';
  if (promo) inner.classList.add('is-promo');
  if (article) inner.classList.add('is-article');
}

function bindBannerSwipe() {
  const track = ui.homeBannerTrack;
  if (!track || track.dataset.bannerSwipeBound === '1') return;
  track.dataset.bannerSwipeBound = '1';

  let startX = 0;
  let startY = 0;
  let dragging = false;

  track.addEventListener('touchstart', (event) => {
    if (state.admin.enabled || track.classList.contains('is-admin-scroll')) return;
    if (!event.touches || !event.touches.length) return;
    const t = event.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dragging = false;
  }, { passive: true });

  track.addEventListener('touchmove', (event) => {
    if (state.admin.enabled || track.classList.contains('is-admin-scroll')) return;
    if (!event.touches || !event.touches.length) return;
    const t = event.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) <= Math.abs(dy)) return;
    dragging = true;
    event.preventDefault();
  }, { passive: false });

  track.addEventListener('touchend', (event) => {
    if (state.admin.enabled || track.classList.contains('is-admin-scroll')) return;
    if (!event.changedTouches || !event.changedTouches.length) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!dragging || Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    const slidesCount = track.children.length || 1;
    const dir = dx < 0 ? 1 : -1;
    const next = Math.max(0, Math.min(slidesCount - 1, state.homeBannerIndex + dir));
    if (next !== state.homeBannerIndex) {
      setHomeBanner(next);
      startHomeBannerAutoplay();
    }
  }, { passive: true });
}

function applyHomeTrackSizing() {
  if (!ui.promoTrack || !ui.homePopularTrack) return;
  [ui.promoTrack, ui.homePopularTrack].forEach((track) => {
    const width = track.clientWidth || track.parentElement?.clientWidth || 0;
    if (!width) return;
    const gap = 8;
    const cardWidth = Math.max(102, Math.floor((width - gap * 2) / 3));
    track.style.setProperty('--home-v2-card-width', `${cardWidth}px`);
  });
}

function scrollHomeTrackBy(track, direction) {
  if (!track) return;
  const inner = track.querySelector('.home-carousel-inner');
  const first = inner?.firstElementChild;
  const gap = inner ? (parseFloat(window.getComputedStyle(inner).gap || '8') || 8) : 8;
  const step = first ? Math.max(64, Math.round(first.getBoundingClientRect().width + gap)) : Math.max(120, Math.round(track.clientWidth * 0.5));
  track.scrollBy({
    left: direction * step,
    behavior: 'smooth',
  });
}

// Центральная регистрация всех обработчиков интерфейса.
function bindEvents() {
  const isNearPageTop = (offset = 6) => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    return scrollTop <= offset;
  };
  const isTopRefreshBlockedTarget = (target) => {
    if (!target || !target.closest) return false;
    return Boolean(target.closest(
      'input, textarea, select, [contenteditable="true"], .product-gallery, .recommended-track, .home-v2-rail, .promo-track, .home-article-track, .catalog-chips, .admin-edit-modal, .admin-actions-modal',
    ));
  };
  let topRefreshStartX = 0;
  let topRefreshStartY = 0;
  let topRefreshArmed = false;
  let topRefreshTriggered = false;
  let topRefreshCooldownUntil = 0;
  const triggerTopSwipeRefresh = () => {
    if (topRefreshTriggered) return;
    if (Date.now() < topRefreshCooldownUntil) return;
    topRefreshTriggered = true;
    topRefreshCooldownUntil = Date.now() + 1600;
    reportStatus('Обновляем страницу...');
    window.setTimeout(() => {
      window.location.reload();
    }, 80);
  };

  on(document, 'touchstart', (e) => {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    topRefreshStartX = touch.clientX;
    topRefreshStartY = touch.clientY;
    topRefreshTriggered = false;
    topRefreshArmed = isNearPageTop(4) && !isTopRefreshBlockedTarget(e.target);
  }, { passive: true });
  on(document, 'touchmove', (e) => {
    if (!topRefreshArmed || topRefreshTriggered) return;
    if (Date.now() < topRefreshCooldownUntil) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    if (!isNearPageTop(18)) {
      topRefreshArmed = false;
      return;
    }
    const dx = touch.clientX - topRefreshStartX;
    const dy = touch.clientY - topRefreshStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) {
      topRefreshArmed = false;
      return;
    }
    // Вверху страницы свайп вниз (палец уходит вниз => dy положительный) обновляет экран.
    if (dy >= 96 && Math.abs(dy) > Math.abs(dx)) {
      triggerTopSwipeRefresh();
    }
  }, { passive: true });
  on(document, 'touchend', () => {
    topRefreshArmed = false;
    topRefreshTriggered = false;
  }, { passive: true });
  on(document, 'touchcancel', () => {
    topRefreshArmed = false;
    topRefreshTriggered = false;
  }, { passive: true });

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
    adminBindTapIntent(ui.headerStoreButton, {
      onSingleTap: () => {
        renderStores();
        setScreen('stores');
      },
      tapGroup: 'header-store',
      onDoubleTap: () => {
        const selected = getSelectedStore();
        if (!selected) return;
        adminOpenActionSheet(`Текущий адрес: ${selected.city}`, [
          { id: 'edit-city', label: 'Изменить город' },
          { id: 'edit-address', label: 'Изменить полный адрес' },
        ]).then((action) => {
          if (!action) return;
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
      },
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
    if (ui.profileBotConnectSection && !ui.profileBotConnectSection.classList.contains('hidden')) {
      ui.profileBotConnectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (ui.profileBotPlatformInput) ui.profileBotPlatformInput.focus();
      if (ui.profileBotConnectStatus && !String(ui.profileBotConnectStatus.textContent || '').trim()) {
        ui.profileBotConnectStatus.textContent = 'Выберите платформу, заполните данные бота и добавьте подключение.';
      }
      return;
    }
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
  on(ui.orderChatModeInput, 'change', () => {
    renderOrderChatSettings({ fromInputs: true });
  });
  on(ui.orderRequestChannelInput, 'change', () => {
    renderOrderChatSettings({ fromInputs: true });
  });
  on(ui.orderRequestTargetInput, 'input', () => {
    renderOrderChatSettings({ fromInputs: true });
  });
  on(ui.orderRequestVkTokenInput, 'input', () => {
    renderOrderChatSettings({ fromInputs: true });
  });
  on(ui.orderChatSettingsForm, 'submit', async (e) => {
    e.preventDefault();
    await saveOrderChatSettings();
  });
  on(ui.profileBotPlatformInput, 'change', () => {
    renderProfileBotConnectSection();
  });
  on(ui.profileBotCatalogUrlCopyButton, 'click', async () => {
    const value = getCurrentStoreCatalogUrl();
    if (!value) {
      if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Ссылка каталога пока недоступна.';
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        window.prompt('Скопируйте ссылку каталога:', value);
      }
      if (ui.profileBotConnectStatus) ui.profileBotConnectStatus.textContent = 'Ссылка каталога скопирована.';
    } catch {
      window.prompt('Скопируйте ссылку каталога:', value);
    }
  });
  on(ui.profileBotConnectForm, 'submit', async (e) => {
    e.preventDefault();
    await saveProfileBotConnection();
  });
  on(ui.profileBotConnectionsList, 'click', async (e) => {
    const removeButton = e.target.closest('[data-catalog-bot-remove]');
    if (!removeButton) return;
    const connectionId = Number(removeButton.dataset.catalogBotRemove || 0);
    if (!connectionId) return;
    await removeProfileBotConnection(connectionId);
  });
  on(ui.platformBindingForm, 'submit', async (e) => {
    e.preventDefault();
    await savePlatformBinding();
  });
  const handlePlatformBindingActionsClick = async (e) => {
    const copyUrlButton = e.target.closest('[data-platform-binding-copy-url]');
    if (copyUrlButton) {
      const value = String(copyUrlButton.dataset.platformBindingCopyUrl || '').trim();
      if (!value) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          window.prompt('Скопируйте URL VK Catalog App:', value);
        }
        if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'URL VK Catalog App скопирован.';
      } catch {
        window.prompt('Скопируйте URL VK Catalog App:', value);
      }
      return;
    }
    const openUrlButton = e.target.closest('[data-platform-binding-open-url]');
    if (openUrlButton) {
      const value = String(openUrlButton.dataset.platformBindingOpenUrl || '').trim();
      if (!value) return;
      openExternalPaymentLink(value);
      if (ui.platformBindingStatus) ui.platformBindingStatus.textContent = 'Открываем VK Catalog App URL.';
      return;
    }
    const removeButton = e.target.closest('[data-platform-binding-remove]');
    if (!removeButton) return;
    const bindingId = Number(removeButton.dataset.platformBindingRemove || 0);
    if (!bindingId) return;
    await removePlatformBinding(bindingId);
  };
  on(ui.platformBindingsList, 'click', handlePlatformBindingActionsClick);
  on(ui.platformBindingSetupInfo, 'click', handlePlatformBindingActionsClick);
  on(ui.paymentIntegrationProviderInput, 'change', () => {
    const nextProvider = normalizePaymentProviderCode(ui.paymentIntegrationProviderInput?.value || 'yookassa');
    const prevProvider = normalizePaymentProviderCode(state.paymentIntegration?.provider || 'yookassa');
    const providerChanged = nextProvider !== prevProvider;
    state.paymentIntegration = normalizePaymentIntegrationSettings({
      ...state.paymentIntegration,
      provider: nextProvider,
      secretConfigured: providerChanged ? false : state.paymentIntegration?.secretConfigured,
    });
    renderPaymentIntegrationSettings();
  });
  on(ui.paymentIntegrationForm, 'submit', async (e) => {
    e.preventDefault();
    await savePaymentIntegrationSettings();
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
    if (!requireAdminFeatureAccess()) return;
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
      if (state.currentScreen === 'home') renderHomeBanners();
      if (state.currentScreen === 'product') renderProductView();
      reportStatus('Режим выделения выключен');
      return;
    }
    if (!state.admin.selectionMode) adminToggleSelectionMode(scope);
    else {
      state.admin.selectedType = scope;
      state.admin.selectedId = '';
      state.admin.selectedIds = [];
      applyAdminModeUi();
      if (state.currentScreen === 'categories') renderCategories();
      if (state.currentScreen === 'products') renderProducts();
      if (state.currentScreen === 'home') renderHomeBanners();
      if (state.currentScreen === 'product') renderProductView();
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
    const actionBtn = e.target.closest('[data-admin-image-action]');
    if (!actionBtn || !state.admin.enabled) return;
    e.preventDefault();
    e.stopPropagation();
    const action = String(actionBtn.dataset.adminImageAction || '');
    if (action === 'delete') adminDeleteSelectedImage();
  });

  on(ui.adminDeleteSelectedButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminDeleteSelectedProducts();
  });

  on(ui.adminDeleteSelectedCategoriesButton, 'click', () => {
    if (!state.admin.enabled) return;
    adminDeleteSelectedCategories();
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

  on(document, 'click', (e) => {
    const btn = e.target.closest('[data-admin-screen]');
    if (!btn || !state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    const target = String(btn.dataset.adminScreen || '').trim();
    if (!target) return;
    setScreen(target);
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
    openCategoryEntry(btn.dataset.category);
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

  on(ui.catalogImportFile, 'change', () => {
    const importState = getImportScopeState('catalog');
    const [file] = Array.from(ui.catalogImportFile?.files || []);
    importState.previewRequestId += 1;
    importState.file = file || null;
    importState.fileName = String(file?.name || '').trim();
    importState.fileLabel = formatImportFileLabel(file);
    importState.previewRows = [];
    importState.summary = null;
    importState.status = file
      ? `Файл выбран: ${importState.fileLabel || importState.fileName}. Нажмите «Проверить».`
      : 'Файл не выбран.';
    renderProductImportPanel('catalog');
  });

  on(ui.catalogImportPreviewButton, 'click', () => {
    void previewProductImportFile('catalog');
  });

  on(ui.catalogImportSubmitButton, 'click', () => {
    void importProductsFromPreview('catalog');
  });

  on(ui.productsImportFile, 'change', () => {
    const importState = getImportScopeState('category');
    const [file] = Array.from(ui.productsImportFile?.files || []);
    importState.previewRequestId += 1;
    importState.file = file || null;
    importState.fileName = String(file?.name || '').trim();
    importState.fileLabel = formatImportFileLabel(file);
    importState.previewRows = [];
    importState.summary = null;
    importState.status = file
      ? `Файл выбран: ${importState.fileLabel || importState.fileName}. Нажмите «Проверить».`
      : 'Файл не выбран.';
    renderProductImportPanel('category');
  });

  on(ui.productsImportPreviewButton, 'click', () => {
    void previewProductImportFile('category');
  });

  on(ui.productsImportSubmitButton, 'click', () => {
    void importProductsFromPreview('category');
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

  on(ui.homeBannerTrack, 'click', (e) => {
    const card = e.target.closest('[data-banner-id]');
    if (!card) return;
    if (!(state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'banner')) return;
    e.preventDefault();
    e.stopPropagation();
    adminSelectItem('banner', card.dataset.bannerId || '');
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

  bindHorizontalTrackSwipe(ui.promoTrack);
  bindHorizontalTrackSwipe(ui.homePopularTrack);
  bindHorizontalTrackSwipe(ui.homeArticleTrack);
  ensureHomeTrackScroll(ui.promoTrack, { promo: true });
  ensureHomeTrackScroll(ui.homePopularTrack, { promo: true });
  ensureHomeTrackScroll(ui.homeArticleTrack, { article: true });
  bindBannerSwipe();
  applyHomeTrackSizing();

  on(window, 'resize', () => {
    applyHomeTrackSizing();
    ensureHomeTrackScroll(ui.promoTrack, { promo: true });
    ensureHomeTrackScroll(ui.homePopularTrack, { promo: true });
    ensureHomeTrackScroll(ui.homeArticleTrack, { article: true });
  }, { passive: true });

  on(ui.themeSelect, 'change', () => {
    if (!state.admin.enabled) {
      applyAppearanceFromConfig();
      return;
    }
    updateAdminAppearanceDraft({ theme: ui.themeSelect?.value || DEFAULT_APPEARANCE.theme });
    renderProfile();
  });
  on(ui.accentSelect, 'change', () => {
    if (!state.admin.enabled) {
      applyAppearanceFromConfig();
      return;
    }
    updateAdminAppearanceDraft({ accent: ui.accentSelect?.value || DEFAULT_APPEARANCE.accent });
    renderProfile();
  });

  document.querySelectorAll('[data-carousel-arrow]').forEach((btn) => {
    on(btn, 'click', () => {
      const targetId = btn.dataset.carouselTarget;
      const dir = btn.dataset.carouselArrow === 'left' ? -1 : 1;
      if (!targetId) return;
      const track = document.getElementById(targetId);
      scrollHomeTrackBy(track, dir);
    });
  });


  on(ui.homeProductionButton, 'click', () => {
    if (state.admin.enabled) return;
    setScreen('production');
  });

  on(ui.productView, 'click', (e) => {
    if (state.admin.enabled && state.admin.selectionMode && state.admin.selectedType === 'image') {
      const image = e.target.closest('[data-product-image-id]');
      if (image) {
        e.preventDefault();
        e.stopPropagation();
        adminSelectItem('image', image.dataset.productImageId || '');
        return;
      }
    }
    const btn = e.target.closest('button');
    if (!btn) return;
    if (state.admin.enabled) {
      if (btn.dataset.adminPromo) {
        const product = getProduct(btn.dataset.adminPromo);
        if (product) adminConfigureProductPromo(product);
      }
      return;
    }
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
  on(ui.ordersButton, 'click', () => {
    renderProfile();
    if (!state.admin.enabled) {
      renderOrders();
      void syncCustomerOrdersFromServer().then(() => renderOrders());
    }
    setScreen('profile');
  });
  on(ui.profileButton, 'click', () => {
    if (state.admin.enabled) {
      void refreshSubscriptionStatus().then(() => {
        applyAdminModeUi();
        renderProfile();
      });
    } else {
      renderProfile();
      renderOrders();
    }
    setScreen('profile');
  });
  on(ui.botButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    renderBotSettings();
    setScreen('bot');
  });
  on(ui.profileOpenStatsButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminStatsOverview();
    setScreen('stats');
  });
  on(ui.statsButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminOrdersOverview();
    setScreen('orders');
  });
  on(ui.ordersOpenNewButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminOrdersByBucket('new');
    setScreen('orders-new');
  });
  on(ui.ordersOpenActiveButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminOrdersByBucket('active');
    setScreen('orders-active');
  });
  on(ui.ordersOpenCompletedButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminOrdersByBucket('completed');
    setScreen('orders-completed');
  });
  on(ui.ordersOpenCanceledButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminOrdersByBucket('canceled');
    setScreen('orders-canceled');
  });
  on(ui.statsOpenRevenueButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminStatsRevenue();
    setScreen('stats-revenue');
  });
  on(ui.statsOpenOrdersButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminStatsOrders();
    setScreen('stats-orders');
  });
  on(ui.statsOpenPopularButton, 'click', () => {
    if (!state.admin.enabled) return;
    if (!requireAdminFeatureAccess()) return;
    void renderAdminStatsPopular();
    setScreen('stats-popular');
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
        const priceView = getProductPriceView(item, { withOldPrice: false });
        count += item.qty || 0;
        if (!priceView.hasPrice) {
          missing = true;
          requestCount += item.qty || 0;
          return;
        }
        const lineSum = Number(priceView.finalPrice || 0) * (item.qty || 0);
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
    const mappedItems = items.map((i) => {
      const priceView = getProductPriceView(i, { withOldPrice: false });
      return {
        id: i.id,
        title: i.title,
        sku: i.sku,
        price: priceView.hasPrice ? Number(priceView.finalPrice || 0) : null,
        basePrice: hasPrice(i) ? Number(i.price || 0) : null,
        discountPercent: priceView.promoPercent || 0,
        qty: i.qty,
        isPromo: priceView.hasPromo,
        isRequestPrice: !priceView.hasPrice,
      };
    });
    const pricedItems = mappedItems.filter((i) => !i.isRequestPrice);
    const requestPriceItems = mappedItems.filter((i) => i.isRequestPrice);

    if (summary.sum <= 0) {
      ui.orderStatus.textContent = 'В корзине нет товаров с ценой для оплаты.';
      return;
    }

    const context = getClientPlatformContext();
    const telegramId = context.telegramUserId;
    const telegramUsername = telegramId ? getTelegramUsername() : '';

    const order = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      customer: {
        ...profile,
        comment: ui.inputComment ? ui.inputComment.value.trim() : '',
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : '',
        telegramId: telegramId || '',
        telegramUsername,
        platform: context.platform,
        customerPlatform: context.platform,
        platformUserId: context.platformUserId,
        customerPlatformUserId: context.platformUserId,
        customerIdentity: context.customerIdentity,
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
      customerPlatform: context.platform,
      customerPlatformUserId: context.platformUserId,
      customerIdentity: context.customerIdentity,
      status: 'new',
      paymentStatus: '',
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
      let serverOrderResult = null;
      if (state.saas.storeId) {
        const result = await saasRequest(`/stores/${encodeURIComponent(state.saas.storeId)}/orders`, {
          method: 'POST',
          body: {
            order,
            telegramUserId: telegramId || '',
            customerPlatform: context.platform,
            customerPlatformUserId: context.platformUserId,
            customerIdentity: context.customerIdentity,
          },
        });
        serverOrderResult = result;
        sendOk = Boolean(result?.ok);
      } else {
        const result = await window.HORECA_TG.sendCheckoutOrder(order);
        sendOk = Boolean(result?.ok);
      }
      if (!sendOk) throw new Error('SEND_FAILED');

      if (serverOrderResult?.orderId) order.id = serverOrderResult.orderId;
      if (Number(serverOrderResult?.orderNumber || 0) > 0) order.orderNumber = Number(serverOrderResult.orderNumber);
      order.status = normalizeWorkflowStatus(serverOrderResult?.status || order.status);
      order.paymentStatus = normalizePaymentStatus(serverOrderResult?.paymentStatus || order.paymentStatus);

      const existingOrderIndex = state.orders.findIndex((item) => String(item?.id || '').trim() === String(order.id || '').trim());
      if (existingOrderIndex >= 0) state.orders.splice(existingOrderIndex, 1, order);
      else state.orders.push(order);
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
      void syncCustomerOrdersFromServer();
      saasTrackEvent('create_order', { payload: { orderId: order.id, total: summary.sum } });
      const payment = resolveOrderPaymentResult(serverOrderResult);
      const subscriptionLocked = String(serverOrderResult?.notification?.reason || '') === 'SUBSCRIPTION_INACTIVE';
      const orderMode = normalizeOrderProcessingMode(serverOrderResult?.orderMode || '');
      const notification = serverOrderResult?.notification && typeof serverOrderResult.notification === 'object'
        ? serverOrderResult.notification
        : {};
      const chatDelivered = Boolean(notification?.ok);
      const requestRedirectUrl = String(notification?.redirectUrl || '').trim();
      if (subscriptionLocked) {
        ui.orderStatus.textContent = 'Заказ принят. Онлайн-оплата и уведомления временно отключены до продления подписки магазина.';
        setScreen('confirmation');
      } else if (orderMode === 'chat') {
        state.pendingPayment = null;
        if (requestRedirectUrl) {
          ui.orderStatus.textContent = 'Заказ принят. Открываем канал связи для отправки заявки.';
          openExternalPaymentLink(requestRedirectUrl);
        } else {
          ui.orderStatus.textContent = chatDelivered
            ? 'Заявка отправлена в канал связи.'
            : 'Заказ принят, но канал заявок не подтвердил доставку. Проверьте настройки в профиле админки.';
        }
        setScreen('confirmation');
      } else if (payment.ok) {
        state.pendingPayment = payment;
        ui.orderStatus.textContent = 'Заказ отправлен. Переходим к оплате...';
        openExternalPaymentLink(payment.url);
        setScreen('pay');
      } else {
        if (payment.error && !(payment.error === 'PAYMENT_NOT_CONFIGURED' && chatDelivered)) {
          reportStatus(`Онлайн-оплата недоступна: ${payment.error}`);
        }
        saasTrackEvent('payment_success', { payload: { orderId: order.id, total: summary.sum } });
        ui.orderStatus.textContent = chatDelivered ? 'Заказ отправлен в канал связи.' : 'Заказ отправлен.';
        setScreen('confirmation');
      }
    } catch (err) {
      saasTrackEvent('payment_fail', { payload: { reason: String(err?.message || 'unknown') } });
      ui.orderStatus.textContent = 'Ошибка отправки заявки. Попробуйте ещё раз.';
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
      const orderId = String(card.dataset.orderId || '').trim();
      const order = state.orders.find((o) => String(o.id || '').trim() === orderId);
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
  if (!state.admin.enabled && state.saas.publicResolveError?.blocking) {
    renderPublicPlatformUnavailableState();
    return;
  }
  if (!state.saas.datasetLoaded) {
    const res = await fetch('config.json', { cache: 'no-store' });
    state.config = await res.json();
  }
  applyAppearanceFromConfig({ fallbackToState: state.admin.enabled });
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
  if (!state.admin.enabled && state.saas.publicResolveError?.blocking) {
    renderPublicPlatformUnavailableState();
    return;
  }
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
  state.admin.enabled = isAdminModeRequested();
  loadStorage();
  if (!state.admin.enabled) {
    state.theme = DEFAULT_APPEARANCE.theme;
    state.accent = DEFAULT_APPEARANCE.accent;
  }
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
  applyAppearance(state.theme, state.accent);
  state.stores = getFallbackStores();
  if (!state.selectedStoreId) state.selectedStoreId = state.stores[0]?.id || null;
  state.screenStack = ['home'];
  state.currentScreen = 'home';
  ensureProfileAdminSections();
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
        const storeReady = await saasEnsureCurrentAdminStoreSelection({
          interactive: true,
          title: 'Выберите магазин для админки',
        });
        if (storeReady) {
          await saasLoadDatasetForCurrentContext();
          const onboardingShown = await runPendingPlatformOnboarding();
          if (!onboardingShown) {
            reportStatus(`SaaS магазин подключен: ${state.saas.storeId}`);
            void maybeOpenCurrentPlatformConnectionPrompt();
          }
        } else if (state.saas.stores.length > 1) {
          reportStatus('Выберите магазин для продолжения работы в админке.');
        }
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
  if (state.admin.enabled && state.saas.storeId) {
    await loadPaymentIntegrationSettings();
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
  if (state.admin.enabled && !state.saas.datasetLoaded && adminRestoreDraft()) {
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
