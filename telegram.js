console.log('telegram.js loaded');

(function () {
  const TELEGRAM_SDK_URL = 'https://telegram.org/js/telegram-web-app.js';
  const TELEGRAM_SDK_TIMEOUT_MS = 1800;

  const state = {
    sdkRequested: false,
    sdkResolved: false,
  };

  function readTelegramContext() {
    const webApp = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    const isTelegram = Boolean(webApp);
    const initData = isTelegram ? String(webApp.initData || '') : '';
    const initDataUnsafe = isTelegram && webApp.initDataUnsafe && typeof webApp.initDataUnsafe === 'object'
      ? webApp.initDataUnsafe
      : {};
    return {
      isTelegram,
      initData,
      initDataUnsafe,
      hasInitData: Boolean(initData),
    };
  }

  function updateExport() {
    const context = readTelegramContext();

    function show(msg) {
      const isWarning = typeof msg === 'string' && (msg.startsWith('❌') || msg.startsWith('⚠️'));
      if (context.isTelegram && window.Telegram?.WebApp?.showAlert && isWarning) {
        window.Telegram.WebApp.showAlert(msg);
      } else if (!context.isTelegram) {
        console.log(msg);
      } else {
        console.log(msg);
      }
    }

    function sendOrder(payload) {
      if (!context.isTelegram) {
        show('❌ Mini App открыт не в Telegram.');
        return;
      }
      if (!context.hasInitData) {
        show('❌ Mini App открыт не через кнопку бота. Открой из чата и попробуй снова.');
        return;
      }
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
        show('✅ Предзаказ отправлен! Подтверждение придёт сообщением в чате.');
      } catch (error) {
        console.log(error);
        show('❌ Ошибка отправки. Проверь консоль/бота.');
      }
    }

    async function sendCheckoutOrder(order) {
      if (!context.isTelegram) {
        return { ok: false, error: 'Mini App открыт не в Telegram.' };
      }
      if (!context.hasInitData) {
        return {
          ok: false,
          error: 'Mini App открыт не через кнопку бота. Откройте его из чата.',
        };
      }
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.sendData(JSON.stringify({
          type: 'checkout_order',
          order,
        }));
        return { ok: true };
      } catch (error) {
        console.log(error);
        return { ok: false, error: 'Не удалось отправить заказ в бота.' };
      }
    }

    async function sendOrderViaApi(payload) {
      const apiUrl = window.HORECA_API_URL || '';
      const apiKey = window.HORECA_API_KEY || '';
      if (!apiUrl || !apiKey) {
        show('❌ Не настроен API для отправки заказа.');
        return { ok: false };
      }
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
          return { ok: false, error: data.error || response.statusText };
        }
        return { ok: true };
      } catch (error) {
        console.log(error);
        return { ok: false, error: 'network' };
      }
    }

    window.HORECA_TG = {
      ...window.HORECA_TG,
      isTelegram: context.isTelegram,
      initData: context.initData,
      initDataUnsafe: context.initDataUnsafe,
      hasInitData: context.hasInitData,
      apiUrl: window.HORECA_API_URL || '',
      show,
      sendCheckoutOrder,
      sendOrder,
      sendOrderViaApi,
      refresh: updateExport,
    };

    if (context.isTelegram) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (error) {
        console.log('telegram webapp init failed', error);
      }
      try {
        if (typeof window.Telegram.WebApp.disableVerticalSwipes === 'function') {
          window.Telegram.WebApp.disableVerticalSwipes();
        }
      } catch (error) {
        console.log('disableVerticalSwipes failed', error);
      }
      try {
        if (typeof window.Telegram.WebApp.enableClosingConfirmation === 'function') {
          window.Telegram.WebApp.enableClosingConfirmation();
        }
      } catch (error) {
        console.log('enableClosingConfirmation failed', error);
      }
    }
  }

  function looksLikeTelegramLaunch() {
    try {
      const query = new URLSearchParams(window.location.search || '');
      if (String(query.get('tgWebAppData') || '').trim()) return true;
      if (String(query.get('tgWebAppPlatform') || '').trim()) return true;
      if (String(query.get('tgWebAppStartParam') || '').trim()) return true;
    } catch {}
    return Boolean(window.Telegram && window.Telegram.WebApp);
  }

  function loadTelegramSdkAsync() {
    if (state.sdkRequested || window.Telegram?.WebApp) return;
    state.sdkRequested = true;

    const script = document.createElement('script');
    script.src = TELEGRAM_SDK_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      state.sdkResolved = true;
      updateExport();
    };

    const timer = window.setTimeout(() => {
      console.log('telegram sdk timed out');
      finish();
    }, TELEGRAM_SDK_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timer);
      finish();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      console.log('telegram sdk failed to load');
      finish();
    };

    document.head.appendChild(script);
  }

  document.documentElement.style.overscrollBehaviorY = 'none';
  document.body.style.overscrollBehaviorY = 'none';

  updateExport();
  if (looksLikeTelegramLaunch()) {
    loadTelegramSdkAsync();
  }
})();
