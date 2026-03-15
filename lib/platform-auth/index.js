import crypto from 'node:crypto';

function normalizePlatform(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram' || value === 'tg' || value === 'telegram_bot') return 'telegram';
  if (value === 'vk' || value === 'vkontakte' || value === 'vk_bot') return 'vk';
  if (value === 'max' || value === 'mail' || value === 'mailru') return 'max';
  if (value === 'whatsapp' || value === 'wa' || value === 'whats_app') return 'whatsapp';
  if (value === 'instagram' || value === 'insta' || value === 'ig') return 'instagram';
  if (value === 'web' || value === 'site' || value === 'browser') return 'web';
  return value || 'web';
}

function normalizePlatformUserId(raw) {
  return String(raw || '').trim().slice(0, 190);
}

function buildOwnerPlatformIdentity(platform, platformUserId) {
  const normalizedPlatform = normalizePlatform(platform);
  const normalizedUserId = normalizePlatformUserId(platformUserId);
  if (!normalizedUserId) return '';
  if (normalizedPlatform === 'telegram') return `tg:${normalizedUserId}`;
  if (normalizedPlatform === 'web') return '';
  return `${normalizedPlatform}:${normalizedUserId}`;
}

function normalizeVkSign(raw) {
  return String(raw || '')
    .trim()
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/=+$/g, '');
}

function parseVkLaunchParams(rawLaunchParams) {
  const raw = String(rawLaunchParams || '').trim().replace(/^[?#]/, '');
  if (!raw) return { ok: false, error: 'VK_LAUNCH_PARAMS_REQUIRED', params: new URLSearchParams() };
  try {
    const params = new URLSearchParams(raw);
    return { ok: true, params };
  } catch {
    return { ok: false, error: 'VK_LAUNCH_PARAMS_INVALID', params: new URLSearchParams() };
  }
}

function verifyVkLaunchParams(rawLaunchParams, { vkAppId = '', vkAppSecret = '' } = {}) {
  if (!vkAppSecret) return { ok: false, error: 'VK_APP_SECRET_NOT_CONFIGURED' };

  const parsed = parseVkLaunchParams(rawLaunchParams);
  if (!parsed.ok) return { ok: false, error: parsed.error || 'VK_LAUNCH_PARAMS_INVALID' };
  const params = parsed.params;
  const sign = String(params.get('sign') || '').trim();
  const vkUserId = String(params.get('vk_user_id') || params.get('viewer_id') || '').trim();
  const incomingAppId = String(params.get('vk_app_id') || '').trim();

  if (!sign) return { ok: false, error: 'VK_SIGN_REQUIRED' };
  if (!vkUserId) return { ok: false, error: 'VK_USER_ID_REQUIRED' };
  if (vkAppId && incomingAppId && incomingAppId !== vkAppId) return { ok: false, error: 'VK_APP_ID_MISMATCH' };

  const paramsForCheck = new URLSearchParams(params);
  paramsForCheck.delete('sign');
  const ordered = Array.from(paramsForCheck.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const digest = crypto
    .createHmac('sha256', vkAppSecret)
    .update(ordered)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  if (normalizeVkSign(sign) !== normalizeVkSign(digest)) {
    return { ok: false, error: 'VK_SIGN_INVALID' };
  }

  return {
    ok: true,
    platform: 'vk',
    platformUserId: vkUserId,
    identity: `vk:${vkUserId}`,
    vkGroupId: String(params.get('vk_group_id') || params.get('group_id') || '').trim(),
    vkViewerGroupRole: String(params.get('vk_viewer_group_role') || '').trim(),
  };
}

function resolveGenericPlatform(body = {}) {
  const platform = normalizePlatform(
    body?.platform
    || body?.customerPlatform
    || body?.provider
    || '',
  );
  const profile = body?.profile && typeof body.profile === 'object' ? body.profile : {};

  const platformUserId = normalizePlatformUserId(
    body?.platformUserId
    || body?.customerPlatformUserId
    || body?.vkUserId
    || body?.maxUserId
    || body?.whatsappUserId
    || body?.instagramUserId
    || '',
  );
  const identity = buildOwnerPlatformIdentity(platform, platformUserId);
  if (!identity) {
    return {
      ok: false,
      error: 'PLATFORM_USER_ID_REQUIRED',
      platform,
      platformUserId,
      identity: '',
      profile,
    };
  }
  return {
    ok: true,
    platform,
    platformUserId,
    identity,
    profile,
  };
}

function resolveTelegramPlatform(body = {}, { resolveTelegramUserIdFromBody } = {}) {
  const profile = body?.profile && typeof body.profile === 'object' ? body.profile : {};
  const telegramUserId = typeof resolveTelegramUserIdFromBody === 'function'
    ? resolveTelegramUserIdFromBody(body, { allowUnverified: true })
    : '';
  if (!telegramUserId) {
    return {
      ok: false,
      error: 'PLATFORM_USER_ID_REQUIRED',
      platform: 'telegram',
      platformUserId: '',
      identity: '',
      profile,
    };
  }
  return {
    ok: true,
    platform: 'telegram',
    platformUserId: telegramUserId,
    identity: `tg:${telegramUserId}`,
    profile,
  };
}

export function resolvePlatformBootstrapAuth(body = {}, options = {}) {
  const requestedPlatform = normalizePlatform(
    body?.platform
    || body?.customerPlatform
    || body?.provider
    || '',
  );

  if (requestedPlatform === 'vk') {
    const verifiedVk = verifyVkLaunchParams(body?.launchParamsRaw || body?.vkLaunchParams || '', {
      vkAppId: String(options?.vkAppId || '').trim(),
      vkAppSecret: String(options?.vkAppSecret || '').trim(),
    });
    if (!verifiedVk.ok) return verifiedVk;
    return {
      ok: true,
      platform: 'vk',
      platformUserId: verifiedVk.platformUserId,
      identity: verifiedVk.identity,
      vkGroupId: verifiedVk.vkGroupId,
      profile: body?.profile && typeof body.profile === 'object' ? body.profile : {},
    };
  }

  if (requestedPlatform === 'telegram') {
    return resolveTelegramPlatform(body, options);
  }

  return resolveGenericPlatform(body);
}

export function resolvePlatformStoreContext(body = {}, options = {}) {
  const requestedPlatform = normalizePlatform(
    body?.platform
    || body?.customerPlatform
    || body?.provider
    || '',
  );

  if (requestedPlatform === 'vk') {
    const verifiedVk = verifyVkLaunchParams(body?.launchParamsRaw || body?.vkLaunchParams || '', {
      vkAppId: String(options?.vkAppId || '').trim(),
      vkAppSecret: String(options?.vkAppSecret || '').trim(),
    });
    if (!verifiedVk.ok) return verifiedVk;
    return {
      ok: true,
      platform: 'vk',
      platformUserId: verifiedVk.platformUserId,
      identity: verifiedVk.identity,
      vkGroupId: String(
        body?.vkGroupId
        || body?.groupId
        || verifiedVk.vkGroupId
        || ''
      ).trim(),
    };
  }

  return {
    ok: false,
    error: 'PLATFORM_STORE_RESOLVE_NOT_SUPPORTED',
    platform: requestedPlatform || 'web',
  };
}
