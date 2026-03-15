export function normalizeOrderRequestChannelType(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram_chat' || value === 'telegram' || value === 'admin_bot') return 'telegram_chat';
  if (value === 'vk_messages' || value === 'vk' || value === 'vk_group') return 'vk_messages';
  if (value === 'webhook' || value === 'http_webhook') return 'webhook';
  if (value === 'external') return 'messenger_link';
  if (value === 'messenger_link' || value === 'messenger' || value === 'link') return 'messenger_link';
  return 'telegram_chat';
}

export function normalizeTelegramChatId(raw) {
  const value = String(raw || '').trim();
  return /^-?[0-9]{5,20}$/.test(value) ? value : '';
}

export function resolveOrderRequestChatIdFromSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  const candidates = [
    source.orderRequestChatId,
    source.orderChatId,
    source.chatId,
    source.telegramChatId,
  ];
  for (const candidate of candidates) {
    const chatId = normalizeTelegramChatId(candidate);
    if (chatId) return chatId;
  }
  return '';
}

export function resolveOrderRequestTargetFromSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  return String(
    source.orderRequestTarget
    || source.orderRequestUrl
    || source.orderRequestWebhookUrl
    || source.orderRequestLink
    || '',
  ).trim();
}

export function resolveOrderRequestVkTokenFromSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  return String(
    source.orderRequestVkToken
    || source.vkOrderToken
    || source.vkCommunityToken
    || '',
  ).trim();
}

export function resolveOrderRequestChannelConfig(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  const hasRequestUrl = Boolean(String(
    source.orderRequestTarget
    || source.orderRequestUrl
    || source.orderRequestWebhookUrl
    || source.orderRequestLink
    || '',
  ).trim());
  const requestedMode = String(source.orderProcessingMode || '').trim().toLowerCase();
  const type = normalizeOrderRequestChannelType(
    source.orderRequestChannelType
    || source.orderRequestType
    || (hasRequestUrl ? 'messenger_link' : (requestedMode === 'chat' ? 'telegram_chat' : 'telegram_chat')),
  );
  if (type === 'telegram_chat') {
    return {
      channelType: 'telegram_chat',
      target: resolveOrderRequestChatIdFromSettings(source),
    };
  }
  if (type === 'vk_messages') {
    return {
      channelType: 'vk_messages',
      target: resolveOrderRequestTargetFromSettings(source),
      token: resolveOrderRequestVkTokenFromSettings(source),
    };
  }
  if (type === 'webhook') {
    return {
      channelType: 'webhook',
      target: resolveOrderRequestTargetFromSettings(source),
    };
  }
  return {
    channelType: 'messenger_link',
    target: resolveOrderRequestTargetFromSettings(source),
  };
}

export function buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity }) {
  const customer = orderPayload.customer || {};
  const items = Array.isArray(orderPayload.items) ? orderPayload.items : [];
  const identity = resolveCustomerIdentity(orderPayload, customer);
  const customerLabel = identity.customerIdentity || identity.telegramUserId || '—';
  const itemsText = items.slice(0, 25).map((it) => {
    const title = String(it?.title || 'Товар');
    const qty = Number(it?.qty || 1);
    const price = Number(it?.price || 0);
    const pricePart = price > 0 ? `${price.toLocaleString('ru-RU')} ₽` : 'по запросу';
    return `• ${title} × ${qty} (${pricePart})`;
  }).join('\n');

  return [
    `🛒 Новый заказ (${storeRow.store_id})`,
    `ID: ${orderPayload.id}`,
    `Сумма: ${Number(orderPayload.total || 0).toLocaleString('ru-RU')} ₽`,
    `Имя: ${customer.name || '—'}`,
    `Телефон: ${customer.phone || '—'}`,
    `Email: ${customer.email || '—'}`,
    `Клиент: ${customerLabel}`,
    customer.deliveryType ? `Получение: ${customer.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}` : '',
    customer.deliveryAddress ? `Адрес: ${customer.deliveryAddress}` : '',
    itemsText ? `\nТовары:\n${itemsText}` : '',
  ].filter(Boolean).join('\n');
}

export function buildOrderNotificationTemplateValues(storeRow, orderPayload, messageText = '', { resolveCustomerIdentity }) {
  const customer = orderPayload.customer || {};
  const identity = resolveCustomerIdentity(orderPayload, customer);
  const totalRaw = Number(orderPayload.total || 0);
  const total = Number.isFinite(totalRaw) ? totalRaw : 0;
  return {
    store_id: String(storeRow?.store_id || '').trim(),
    order_id: String(orderPayload?.id || '').trim(),
    total: total > 0 ? total.toFixed(2) : '0.00',
    currency: 'RUB',
    customer_name: String(customer?.name || '').trim(),
    customer_phone: String(customer?.phone || '').trim(),
    customer_email: String(customer?.email || '').trim(),
    telegram_user_id: identity.telegramUserId,
    customer_platform: identity.customerPlatform,
    customer_platform_user_id: identity.customerPlatformUserId,
    customer_identity: identity.customerIdentity,
    message: String(messageText || '').trim(),
  };
}

export function buildOrderMessengerRedirectUrl(targetTemplate, values, { fillPaymentTemplate, isValidHttpUrl }) {
  const template = String(targetTemplate || '').trim();
  if (!template) return '';
  let resolved = fillPaymentTemplate(template, values);
  if (!isValidHttpUrl(resolved)) return '';
  const hasMessagePlaceholder = /\{message\}/i.test(template);
  if (hasMessagePlaceholder) return resolved;
  try {
    const parsed = new URL(resolved);
    if (!parsed.searchParams.has('text') && !parsed.searchParams.has('message')) {
      parsed.searchParams.set('text', String(values?.message || ''));
    }
    resolved = parsed.toString();
    return isValidHttpUrl(resolved) ? resolved : '';
  } catch {
    return '';
  }
}

export function createOrderDeliveryService(deps = {}) {
  const {
    decryptBotToken,
    getStoreSettings,
    resolveCustomerIdentity,
    fillPaymentTemplate,
    isValidHttpUrl,
    nowIso,
    fetchImpl = fetch,
  } = deps;

  function normalizeVkPeerId(raw) {
    const value = String(raw || '').trim();
    return /^-?[0-9]{4,20}$/.test(value) ? value : '';
  }

  async function notifyOrderViaTelegram(storeRow, orderPayload, { chatIdOverride = '' } = {}) {
    const token = decryptBotToken(storeRow.bot_token_enc);
    if (!token) return { ok: false, skipped: true, reason: 'BOT_NOT_CONNECTED' };
    const settings = getStoreSettings(storeRow);
    const chatId = normalizeTelegramChatId(chatIdOverride) || resolveOrderRequestChatIdFromSettings(settings);
    if (!chatId) return { ok: false, skipped: true, reason: 'CHAT_ID_NOT_CONFIGURED' };
    const text = buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity });

    try {
      const response = await fetchImpl(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) return { ok: false, error: 'TELEGRAM_SEND_FAILED' };
      return { ok: true, via: 'telegram_chat' };
    } catch {
      return { ok: false, error: 'TELEGRAM_SEND_FAILED' };
    }
  }

  async function notifyOrderViaWebhook(targetUrl, storeRow, orderPayload) {
    const endpoint = String(targetUrl || '').trim();
    if (!isValidHttpUrl(endpoint)) return { ok: false, skipped: true, reason: 'WEBHOOK_URL_NOT_CONFIGURED' };
    const text = buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity });
    const payload = {
      type: 'order_request',
      storeId: String(storeRow?.store_id || '').trim(),
      orderId: String(orderPayload?.id || '').trim(),
      order: orderPayload,
      message: text,
      createdAt: nowIso(),
    };
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseBody = await response.text().catch(() => '');
      if (!response.ok) {
        return {
          ok: false,
          error: 'WEBHOOK_SEND_FAILED',
          details: String(responseBody || '').slice(0, 200),
        };
      }
      return { ok: true, via: 'webhook' };
    } catch {
      return { ok: false, error: 'WEBHOOK_SEND_FAILED' };
    }
  }

  async function notifyOrderViaVkMessages(targetPeerId, vkToken, storeRow, orderPayload) {
    const peerId = normalizeVkPeerId(targetPeerId);
    const token = String(vkToken || '').trim();
    if (!peerId) return { ok: false, skipped: true, reason: 'VK_PEER_ID_NOT_CONFIGURED' };
    if (!token) return { ok: false, skipped: true, reason: 'VK_TOKEN_NOT_CONFIGURED' };
    const text = buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity });
    const body = new URLSearchParams({
      peer_id: peerId,
      random_id: String(Date.now()),
      message: text,
      access_token: token,
      v: '5.199',
    });
    try {
      const response = await fetchImpl('https://api.vk.com/method/messages.send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString(),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.error) {
        return {
          ok: false,
          error: 'VK_SEND_FAILED',
          details: String(payload?.error?.error_msg || payload?.error_description || '').slice(0, 200),
        };
      }
      return { ok: true, via: 'vk_messages' };
    } catch {
      return { ok: false, error: 'VK_SEND_FAILED' };
    }
  }

  async function notifyOrderRequest(storeRow, orderPayload) {
    const settings = getStoreSettings(storeRow);
    const config = resolveOrderRequestChannelConfig(settings);
    if (config.channelType === 'telegram_chat') {
      return notifyOrderViaTelegram(storeRow, orderPayload, { chatIdOverride: config.target });
    }
    if (config.channelType === 'vk_messages') {
      return notifyOrderViaVkMessages(config.target, config.token, storeRow, orderPayload);
    }
    if (config.channelType === 'webhook') {
      return notifyOrderViaWebhook(config.target, storeRow, orderPayload);
    }
    const message = buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity });
    const values = buildOrderNotificationTemplateValues(storeRow, orderPayload, message, { resolveCustomerIdentity });
    const redirectUrl = buildOrderMessengerRedirectUrl(config.target, values, { fillPaymentTemplate, isValidHttpUrl });
    if (!redirectUrl) {
      return { ok: false, skipped: true, reason: 'MESSENGER_LINK_NOT_CONFIGURED' };
    }
    return {
      ok: true,
      via: 'messenger_link',
      delivery: 'redirect',
      redirectUrl,
    };
  }

  return {
    normalizeOrderRequestChannelType,
    normalizeTelegramChatId,
    resolveOrderRequestChatIdFromSettings,
    resolveOrderRequestTargetFromSettings,
    resolveOrderRequestVkTokenFromSettings,
    resolveOrderRequestChannelConfig,
    buildOrderNotificationText: (storeRow, orderPayload) => buildOrderNotificationText(storeRow, orderPayload, { resolveCustomerIdentity }),
    buildOrderNotificationTemplateValues: (storeRow, orderPayload, messageText = '') => buildOrderNotificationTemplateValues(storeRow, orderPayload, messageText, { resolveCustomerIdentity }),
    buildOrderMessengerRedirectUrl: (targetTemplate, values) => buildOrderMessengerRedirectUrl(targetTemplate, values, { fillPaymentTemplate, isValidHttpUrl }),
    notifyOrderViaTelegram,
    notifyOrderViaVkMessages,
    notifyOrderViaWebhook,
    notifyOrderRequest,
  };
}
