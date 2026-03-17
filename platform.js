console.log('platform.js loaded');

(function () {
  function readParams(raw) {
    try {
      return new URLSearchParams(String(raw || '').replace(/^#/, ''));
    } catch {
      return new URLSearchParams();
    }
  }

  function normalizePlatform(raw) {
    const value = String(raw || '').trim().toLowerCase();
    if (value === 'telegram' || value === 'tg') return 'telegram';
    if (value === 'vk' || value === 'vkontakte') return 'vk';
    if (value === 'max') return 'max';
    if (value === 'whatsapp' || value === 'wa') return 'whatsapp';
    if (value === 'instagram' || value === 'insta' || value === 'ig') return 'instagram';
    if (value === 'web' || value === 'browser' || value === 'site') return 'web';
    return value || 'web';
  }

  function getForcedRouteContext() {
    const pathname = String(window.location.pathname || '').trim().toLowerCase().replace(/\/+$/, '');
    if (!pathname) return { surface: '', platform: '' };
    const match = pathname.match(/^\/(admin|catalog)\/(tg|telegram|vk|max)(?:\/|$)/);
    if (!match) return { surface: '', platform: '' };
    return {
      surface: String(match[1] || '').trim(),
      platform: normalizePlatform(match[2] || ''),
    };
  }

  function getParam(...keys) {
    const query = readParams(window.location.search || '');
    const hash = readParams(window.location.hash || '');
    for (const key of keys) {
      const fromQuery = String(query.get(key) || '').trim();
      if (fromQuery) return fromQuery;
      const fromHash = String(hash.get(key) || '').trim();
      if (fromHash) return fromHash;
    }
    return '';
  }

  function buildRawLaunchParams() {
    const search = String(window.location.search || '').replace(/^\?/, '').trim();
    const hash = String(window.location.hash || '').replace(/^#/, '').trim();
    const vkPattern = /(?:^|&)(vk_app_id|vk_user_id|viewer_id|sign|vk_group_id)=/;
    if (search && vkPattern.test(search)) return search;
    if (hash && vkPattern.test(hash)) return hash;
    return search || hash || '';
  }

  function toPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out = {};
    Object.entries(value).forEach(([key, raw]) => {
      const normalizedKey = String(key || '').trim();
      if (!normalizedKey) return;
      const normalizedValue = raw == null ? '' : String(raw).trim();
      if (!normalizedValue) return;
      out[normalizedKey] = normalizedValue;
    });
    return out;
  }

  function serializeParams(params) {
    const normalized = toPlainObject(params);
    const entries = Object.entries(normalized);
    if (!entries.length) return '';
    const search = new URLSearchParams();
    entries.forEach(([key, value]) => search.set(key, value));
    return search.toString();
  }

  function isTelegramLaunch() {
    return Boolean(
      window.Telegram?.WebApp
      || getParam('tgWebAppData', 'tgWebAppPlatform', 'tgWebAppStartParam')
    );
  }

  function isVkLaunch() {
    return Boolean(
      getParam('vk_app_id', 'vk_user_id', 'viewer_id', 'sign', 'platform') === 'vk'
      || getParam('vk_app_id', 'vk_user_id', 'viewer_id', 'sign')
    );
  }

  function detectPlatform() {
    const forced = getForcedRouteContext();
    if (forced.platform) return forced.platform;
    if (isTelegramLaunch()) return 'telegram';
    if (isVkLaunch()) return 'vk';
    const explicit = getParam('platform', 'customerPlatform');
    return normalizePlatform(explicit || 'web');
  }

  function buildLaunchParams() {
    const keys = [
      'platform',
      'customerPlatform',
      'customerPlatformUserId',
      'platformUserId',
      'tgWebAppData',
      'tgWebAppPlatform',
      'tgWebAppStartParam',
      'vk_app_id',
      'vk_user_id',
      'vk_group_id',
      'vk_viewer_group_role',
      'viewer_id',
      'sign',
      'max_user_id',
      'maxUserId',
      'wa_user_id',
      'whatsapp_user_id',
      'ig_user_id',
      'instagram_user_id',
    ];
    const out = {};
    keys.forEach((key) => {
      const value = getParam(key);
      if (value) out[key] = value;
    });
    return out;
  }

  async function initVkBridge() {
    if (!isVkLaunch() || !window.vkBridge?.send) return { ok: false, skipped: true };
    try {
      await window.vkBridge.send('VKWebAppInit');
      let launchParams = null;
      try {
        launchParams = await window.vkBridge.send('VKWebAppGetLaunchParams');
      } catch {
        launchParams = null;
      }
      let userInfo = null;
      try {
        userInfo = await window.vkBridge.send('VKWebAppGetUserInfo');
      } catch {
        userInfo = null;
      }
      return { ok: true, userInfo, launchParams };
    } catch (error) {
      console.log('vk bridge init failed', error);
      return { ok: false, error: String(error?.message || error || 'VK_INIT_FAILED') };
    }
  }

  async function openLink(url) {
    const safe = String(url || '').trim();
    if (!safe) return;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(safe, { try_instant_view: false });
      return;
    }
    if (state.platform === 'vk' && window.vkBridge?.send) {
      try {
        await window.vkBridge.send('VKWebAppOpenURL', { url: safe });
        return;
      } catch (error) {
        console.log('VKWebAppOpenURL failed', error);
      }
    }
    window.open(safe, '_blank', 'noopener');
  }

  const adapters = {
    telegram: {
      canAutoBootstrap() {
        return false;
      },
      buildBootstrapPayload() {
        return null;
      },
    },
    vk: {
      canAutoBootstrap(ctx) {
        return Boolean(ctx.platformUserId);
      },
      buildBootstrapPayload(ctx) {
        return {
          platform: 'vk',
          platformUserId: String(ctx.platformUserId || '').trim(),
          profile: ctx.profile && typeof ctx.profile === 'object' ? ctx.profile : {},
          launchParamsRaw: String(state.launchParamsRaw || buildRawLaunchParams()).trim(),
        };
      },
    },
    max: {
      canAutoBootstrap(ctx) {
        return Boolean(ctx.platformUserId);
      },
      buildBootstrapPayload(ctx) {
        return {
          platform: 'max',
          platformUserId: String(ctx.platformUserId || '').trim(),
          profile: ctx.profile && typeof ctx.profile === 'object' ? ctx.profile : {},
        };
      },
    },
    whatsapp: {
      canAutoBootstrap() {
        return false;
      },
      buildBootstrapPayload() {
        return null;
      },
    },
    instagram: {
      canAutoBootstrap() {
        return false;
      },
      buildBootstrapPayload() {
        return null;
      },
    },
    web: {
      canAutoBootstrap() {
        return false;
      },
      buildBootstrapPayload() {
        return null;
      },
    },
  };

  function buildRuntimeContext(state) {
    const profile = state.platform === 'vk' && state.vkUserInfo && typeof state.vkUserInfo === 'object'
      ? {
          id: String(state.vkUserInfo.id || '').trim(),
          firstName: String(state.vkUserInfo.first_name || '').trim(),
          lastName: String(state.vkUserInfo.last_name || '').trim(),
          username: String(state.vkUserInfo.screen_name || '').trim(),
          photoUrl: String(state.vkUserInfo.photo_200 || state.vkUserInfo.photo_100 || '').trim(),
        }
      : {};
    let platformUserId = '';
    if (state.platform === 'vk') {
      platformUserId = String(state.vkUserInfo?.id || state.launchParams.vk_user_id || state.launchParams.viewer_id || '').trim();
    } else if (state.platform === 'max') {
      platformUserId = String(state.launchParams.max_user_id || state.launchParams.maxUserId || state.launchParams.platformUserId || '').trim();
    } else if (state.platform !== 'web' && state.platform !== 'telegram') {
      platformUserId = String(state.launchParams.platformUserId || state.launchParams.customerPlatformUserId || '').trim();
    }
    return {
      platform: state.platform,
      platformUserId,
      launchParams: state.launchParams,
      profile,
    };
  }

  const state = {
    routeContext: getForcedRouteContext(),
    platform: detectPlatform(),
    launchParams: buildLaunchParams(),
    launchParamsRaw: buildRawLaunchParams(),
    vkUserInfo: null,
    ready: false,
  };

  function expose() {
    const runtimeContext = buildRuntimeContext(state);
    const adapter = adapters[state.platform] || adapters.web;
    window.HORECA_PLATFORM = {
      platform: state.platform,
      routeSurface: state.routeContext.surface,
      forcedPlatform: state.routeContext.platform,
      launchParams: state.launchParams,
      launchParamsRaw: state.launchParamsRaw,
      vkUserInfo: state.vkUserInfo,
      ready: state.ready,
      openLink,
      getParam,
      getContext() {
        return buildRuntimeContext(state);
      },
      canAutoBootstrap() {
        return Boolean(adapter?.canAutoBootstrap?.(runtimeContext));
      },
      buildBootstrapPayload() {
        return adapter?.buildBootstrapPayload?.(runtimeContext) || null;
      },
    };
  }

  expose();

  (async () => {
    if (state.platform === 'vk') {
      const vk = await initVkBridge();
      if (vk.ok && vk.launchParams && typeof vk.launchParams === 'object') {
        const bridgeLaunchParams = toPlainObject(vk.launchParams);
        if (Object.keys(bridgeLaunchParams).length) {
          state.launchParams = {
            ...state.launchParams,
            ...bridgeLaunchParams,
          };
          state.launchParamsRaw = serializeParams(state.launchParams);
        }
      }
      if (vk.ok && vk.userInfo && typeof vk.userInfo === 'object') {
        state.vkUserInfo = vk.userInfo;
      }
    }
    state.ready = true;
    expose();
  })();
})();
