console.log("✅ telegram.js loaded");
// telegram.js
(function () {
  const isTelegram = !!(window.Telegram && window.Telegram.WebApp);
  const initData = isTelegram ? (Telegram.WebApp.initData || "") : "";
  const initDataUnsafe = isTelegram ? (Telegram.WebApp.initDataUnsafe || {}) : {};
  const hasInitData = Boolean(initData && initData.length > 0);
  const apiUrl = window.HORECA_API_URL || "";
  const apiKey = window.HORECA_API_KEY || "";

  function show(msg) {
    const isWarning = typeof msg === "string" && (msg.startsWith("❌") || msg.startsWith("⚠️"));
    if (isTelegram && Telegram.WebApp.showAlert && isWarning) Telegram.WebApp.showAlert(msg);
    else if (!isTelegram) alert(msg);
    else console.log(msg);
  }

  function sendOrder(payload) {
    if (!isTelegram) {
      show("❌ Mini App открыт не в Telegram.");
      return;
    }
    if (!hasInitData) {
      show("❌ Mini App открыт не через кнопку бота. Открой из чата и попробуй снова.");
      return;
    }

    try {
      Telegram.WebApp.ready();
      Telegram.WebApp.sendData(JSON.stringify(payload));
      show("✅ Предзаказ отправлен! Подтверждение придёт сообщением в чате.");
    } catch (e) {
      console.log(e);
      show("❌ Ошибка отправки. Проверь консоль/бота.");
    }
  }

  async function sendCheckoutOrder(order) {
    if (!isTelegram) {
      return { ok: false, error: "Mini App открыт не в Telegram." };
    }
    if (!hasInitData) {
      return {
        ok: false,
        error: "Mini App открыт не через кнопку бота. Откройте его из чата.",
      };
    }
    try {
      Telegram.WebApp.ready();
      Telegram.WebApp.sendData(
        JSON.stringify({
          type: "checkout_order",
          order,
        })
      );
      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: "Не удалось отправить заказ в бота." };
    }
  }


  async function sendOrderViaApi(payload) {
    if (!apiUrl || !apiKey) {
      show("❌ Не настроен API для отправки заказа.");
      return { ok: false };
    }
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        return { ok: false, error: data.error || res.statusText };
      }
      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: "network" };
    }
  }

  // Экспортируем API
  window.HORECA_TG = {
    isTelegram,
    initData,
    initDataUnsafe,
    hasInitData,
    apiUrl,
    show,
    sendCheckoutOrder,
    sendOrder,
    sendOrderViaApi,
  };

  // Инициализация Telegram WebApp
  if (isTelegram) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    try {
      if (typeof Telegram.WebApp.disableVerticalSwipes === "function") {
        Telegram.WebApp.disableVerticalSwipes();
      }
    } catch (e) {
      console.log("disableVerticalSwipes failed", e);
    }
    try {
      if (typeof Telegram.WebApp.enableClosingConfirmation === "function") {
        Telegram.WebApp.enableClosingConfirmation();
      }
    } catch (e) {
      console.log("enableClosingConfirmation failed", e);
    }
  }

  // Fallback на уровне документа: убираем pull-to-refresh/overscroll вверх-вниз.
  // Не мешает горизонтальным лентам (pan-x остаётся в компонентах).
  document.documentElement.style.overscrollBehaviorY = "none";
  document.body.style.overscrollBehaviorY = "none";
})();
