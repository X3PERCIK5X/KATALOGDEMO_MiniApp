(function attachClientRouting(global) {
  function normalizeUrlBase(value) {
    return String(value || '').trim().replace(/\/$/, '');
  }

  function resolveSaasApiBase({
    search = '',
    storageValue = '',
    origin = '',
    defaultRemoteApi = '',
    legacyHost = 'lambrizsel.duckdns.org',
  } = {}) {
    const remapLegacyApi = (value) => {
      const raw = normalizeUrlBase(value);
      if (!raw) return '';
      if (raw.includes(legacyHost)) return normalizeUrlBase(defaultRemoteApi);
      return raw;
    };

    try {
      const params = new URLSearchParams(String(search || ''));
      const queryApi = String(params.get('api') || '').trim();
      if (queryApi) {
        const normalized = remapLegacyApi(queryApi);
        return { base: normalized, persistedBase: normalized };
      }
    } catch {}

    const fromStorage = remapLegacyApi(storageValue);
    if (fromStorage) {
      return { base: fromStorage, persistedBase: fromStorage };
    }

    return {
      base: remapLegacyApi(`${normalizeUrlBase(origin)}/api`),
      persistedBase: '',
    };
  }

  function buildSaasUrl(base, path) {
    const normalizedBase = normalizeUrlBase(base);
    const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  function resolveRequestedStoreId({
    search = '',
    pathname = '',
    telegramStartParam = '',
  } = {}) {
    try {
      const params = new URLSearchParams(String(search || ''));
      const storeParam = String(params.get('store') || '').trim();
      if (storeParam) return storeParam;
    } catch {}

    const match = String(pathname || '').match(/\/store\/([A-Za-z0-9]{6})/);
    if (match && match[1]) return String(match[1]).trim();

    const tgStore = String(telegramStartParam || '').trim();
    if (tgStore && !tgStore.toLowerCase().includes('admin')) return tgStore;
    return '';
  }

  function resolveStorageScopeStoreId({ currentStoreId = '', requestedStoreId = '' } = {}) {
    const fromState = String(currentStoreId || '').trim().toUpperCase();
    if (fromState) return fromState;
    const fromRoute = String(requestedStoreId || '').trim().toUpperCase();
    if (fromRoute) return fromRoute;
    return 'GLOBAL';
  }

  function buildScopedStorageKey(baseKey, scopeStoreId) {
    return `${baseKey}_${scopeStoreId}`;
  }

  function buildOrderHistoryStorageKey({ storeScope = 'GLOBAL', userScope = 'guest' } = {}) {
    return `demo_catalog_orders_${storeScope}_${userScope}`;
  }

  function shouldUseLegacyStorageFallback(scopeStoreId) {
    return scopeStoreId === 'GLOBAL' || scopeStoreId === '111111';
  }

  function readScopedStorageValue({
    storage,
    baseKey,
    scopeStoreId,
    defaultRaw,
  } = {}) {
    const scoped = storage.getItem(buildScopedStorageKey(baseKey, scopeStoreId));
    if (scoped != null) return scoped;
    if (shouldUseLegacyStorageFallback(scopeStoreId)) {
      const legacy = storage.getItem(baseKey);
      if (legacy != null) return legacy;
    }
    return defaultRaw;
  }

  global.HORECA_ROUTING = {
    ...(global.HORECA_ROUTING || {}),
    resolveSaasApiBase,
    buildSaasUrl,
    resolveRequestedStoreId,
    resolveStorageScopeStoreId,
    buildScopedStorageKey,
    buildOrderHistoryStorageKey,
    shouldUseLegacyStorageFallback,
    readScopedStorageValue,
  };
}(window));
