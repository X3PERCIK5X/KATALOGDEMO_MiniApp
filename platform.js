console.log('platform.js loaded');

(function () {
  function readParams(raw) {
    try {
      return new URLSearchParams(String(raw || '').replace(/^#/, ''));
    } catch {
      return new URLSearchParams();
    }
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
      'viewer_id',
      'sign',
      'max_user_id',
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
      let userInfo = null;
      try {
        userInfo = await window.vkBridge.send('VKWebAppGetUserInfo');
      } catch {
        userInfo = null;
      }
      return { ok: true, userInfo };
    } catch (error) {
      console.log('vk bridge init failed', error);
      return { ok: false, error: String(error?.message || error || 'VK_INIT_FAILED') };
    }
  }

  function detectPlatform() {
    if (isTelegramLaunch()) return 'telegram';
    if (isVkLaunch()) return 'vk';
    const explicit = getParam('platform', 'customerPlatform');
    return normalizePlatform(explicit || 'web');
  }

  async function openLink(url) {
    const safe = String(url || '').trim();
    if (!safe) return;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(safe, { try_instant_view: false });
      return;
    }
    if (detectPlatform() === 'vk' && window.vkBridge?.send) {
      try {
        await window.vkBridge.send('VKWebAppOpenURL', { url: safe });
        return;
      } catch (error) {
        console.log('VKWebAppOpenURL failed', error);
      }
    }
    window.open(safe, '_blank', 'noopener');
  }

  const state = {
    platform: detectPlatform(),
    launchParams: buildLaunchParams(),
    vkUserInfo: null,
    ready: false,
  };

  window.HORECA_PLATFORM = {
    platform: state.platform,
    launchParams: state.launchParams,
    vkUserInfo: null,
    ready: false,
    openLink,
    getParam,
  };

  (async () => {
    if (state.platform === 'vk') {
      const vk = await initVkBridge();
      if (vk.ok && vk.userInfo && typeof vk.userInfo === 'object') {
        state.vkUserInfo = vk.userInfo;
      }
    }
    state.ready = true;
    window.HORECA_PLATFORM = {
      ...window.HORECA_PLATFORM,
      platform: state.platform,
      launchParams: state.launchParams,
      vkUserInfo: state.vkUserInfo,
      ready: true,
      openLink,
      getParam,
    };
  })();
})();
