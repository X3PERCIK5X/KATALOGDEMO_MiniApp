import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import XLSX from 'xlsx';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const STORAGE_DIR = path.join(ROOT, 'storage');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const DB_PATH = path.join(STORAGE_DIR, 'saas.sqlite3');
const DEFAULT_STORE_ID = String(process.env.DEFAULT_STORE_ID || '111111').trim().toUpperCase();
const DEFAULT_ADMIN_EMAIL = String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@demokatalog.app').trim();
const DEFAULT_ADMIN_PASSWORD = String(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin12345').trim();
const OWNER_API_KEY = String(process.env.OWNER_API_KEY || '').trim();
const BOT_TOKEN_SECRET = String(process.env.BOT_TOKEN_SECRET || '').trim();
const ADMIN_BOT_TOKEN = String(process.env.ADMIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
const ADMIN_BOT_WEBHOOK_SECRET = String(process.env.ADMIN_BOT_WEBHOOK_SECRET || '').trim();
const WEBAPP_URL = String(process.env.WEBAPP_URL || '').trim();
const PUBLIC_API_BASE = String(process.env.PUBLIC_API_BASE || '').trim().replace(/\/$/, '');
const SUBSCRIPTION_PAYMENT_URL = String(process.env.SUBSCRIPTION_PAYMENT_URL || '').trim();
const SUBSCRIPTION_PAYMENT_URL_30 = String(process.env.SUBSCRIPTION_PAYMENT_URL_30 || '').trim();
const SUBSCRIPTION_PAYMENT_URL_180 = String(process.env.SUBSCRIPTION_PAYMENT_URL_180 || '').trim();
const SUBSCRIPTION_PAYMENT_URL_365 = String(process.env.SUBSCRIPTION_PAYMENT_URL_365 || '').trim();
const YOOKASSA_SHOP_ID = String(process.env.YOOKASSA_SHOP_ID || '').trim();
const YOOKASSA_SECRET_KEY = String(process.env.YOOKASSA_SECRET_KEY || '').trim();
const SUBSCRIPTION_RETURN_URL = String(process.env.SUBSCRIPTION_RETURN_URL || '').trim();
const PRODUCT_IMPORT_MAX_FILE_SIZE = 5 * 1024 * 1024;
const PRODUCT_IMPORT_MAX_ROWS = 1000;
const PRODUCT_IMPORT_PLACEHOLDER_IMAGE = 'assets/placeholder.svg';
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

fs.mkdirSync(STORAGE_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
app.set('trust proxy', 1);

db.exec(`
CREATE TABLE IF NOT EXISTS stores (
  store_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  owner_email TEXT NOT NULL DEFAULT '',
  owner_user_id TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  invite_code TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  bot_token_enc TEXT NOT NULL DEFAULT '',
  bot_username TEXT NOT NULL DEFAULT '',
  settings_json TEXT NOT NULL DEFAULT '{}',
  config_json TEXT NOT NULL,
  categories_json TEXT NOT NULL DEFAULT '[]',
  products_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TEXT NOT NULL,
  UNIQUE(store_id, user_id),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS store_catalog_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'telegram',
  title TEXT NOT NULL DEFAULT '',
  bot_identifier TEXT NOT NULL DEFAULT '',
  bot_username TEXT NOT NULL DEFAULT '',
  bot_token_enc TEXT NOT NULL DEFAULT '',
  webhook_secret TEXT NOT NULL DEFAULT '',
  meta_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_store_catalog_connections_store_sort
  ON store_catalog_connections(store_id, sort_order ASC, id ASC);
CREATE INDEX IF NOT EXISTS idx_store_catalog_connections_store_platform
  ON store_catalog_connections(store_id, platform);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  group_id TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, category_id),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  category_id TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  old_price REAL NOT NULL DEFAULT 0,
  sku TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, product_id),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  telegram_user_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'created',
  total_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  customer_json TEXT NOT NULL DEFAULT '{}',
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL DEFAULT 0,
  is_request_price INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT '',
  telegram_user_id TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_store_sort ON categories(store_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_products_store_sort ON products(store_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_events_store_type_created ON events(store_id, event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_resets_store_created ON password_resets(store_id, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_telegram_users (
  user_id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_seen_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_telegram_users_last_seen ON admin_telegram_users(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS pending_admin_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL DEFAULT '',
  telegram_user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pending_admin_messages_state
  ON pending_admin_messages(status, telegram_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS store_subscriptions (
  store_id TEXT PRIMARY KEY,
  trial_started_at TEXT NOT NULL,
  trial_ends_at TEXT NOT NULL,
  paid_until TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_store_subscriptions_paid_until ON store_subscriptions(paid_until);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'yookassa',
  amount REAL NOT NULL DEFAULT 0,
  tariff_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(provider, payment_id),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_store_created
  ON subscription_payments(store_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscription_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  reminder_date TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(store_id, reminder_date, reminder_type),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_lookup
  ON subscription_reminders(store_id, reminder_date, reminder_type);

CREATE TABLE IF NOT EXISTS order_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'yookassa',
  payment_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'pending',
  confirmation_url TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(provider, payment_id),
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_payments_store_order_created
  ON order_payments(store_id, order_id, created_at DESC);
`);

function ensureStoresColumn(columnName, ddl) {
  const rows = db.prepare('PRAGMA table_info(stores)').all();
  const exists = rows.some((r) => String(r.name) === columnName);
  if (!exists) db.exec(`ALTER TABLE stores ADD COLUMN ${ddl}`);
}

function ensureSessionsColumn(columnName, ddl) {
  const rows = db.prepare('PRAGMA table_info(sessions)').all();
  const exists = rows.some((r) => String(r.name) === columnName);
  if (!exists) db.exec(`ALTER TABLE sessions ADD COLUMN ${ddl}`);
}

function ensureOrdersColumn(columnName, ddl) {
  const rows = db.prepare('PRAGMA table_info(orders)').all();
  const exists = rows.some((r) => String(r.name) === columnName);
  if (!exists) db.exec(`ALTER TABLE orders ADD COLUMN ${ddl}`);
}

ensureStoresColumn('owner_user_id', "owner_user_id TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_token_enc', "bot_token_enc TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_username', "bot_username TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_webhook_secret', "bot_webhook_secret TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('settings_json', "settings_json TEXT NOT NULL DEFAULT '{}'");
ensureStoresColumn('categories_json', "categories_json TEXT NOT NULL DEFAULT '[]'");
ensureStoresColumn('products_json', "products_json TEXT NOT NULL DEFAULT '[]'");
ensureStoresColumn('payment_provider', "payment_provider TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('payment_account_id', "payment_account_id TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('payment_secret_enc', "payment_secret_enc TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('payment_api_url', "payment_api_url TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('payment_extra_json', "payment_extra_json TEXT NOT NULL DEFAULT '{}'");
ensureStoresColumn('yookassa_shop_id', "yookassa_shop_id TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('yookassa_secret_enc', "yookassa_secret_enc TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('payment_return_url', "payment_return_url TEXT NOT NULL DEFAULT ''");
ensureSessionsColumn('user_id', "user_id TEXT NOT NULL DEFAULT ''");
ensureOrdersColumn('order_number', 'order_number INTEGER NOT NULL DEFAULT 0');
ensureOrdersColumn('workflow_status', "workflow_status TEXT NOT NULL DEFAULT 'new'");
ensureOrdersColumn('payment_status', "payment_status TEXT NOT NULL DEFAULT ''");

function readJsonFallback(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(String(value || ''));
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function isValidStoreId(value) {
  return /^[A-Z0-9]{6}$/.test(String(value || '').trim().toUpperCase());
}

function randomStoreId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function uniqueStoreId() {
  for (let i = 0; i < 100; i += 1) {
    const candidate = randomStoreId();
    const row = db.prepare('SELECT store_id FROM stores WHERE store_id = ?').get(candidate);
    if (!row) return candidate;
  }
  throw new Error('STORE_ID_GENERATION_FAILED');
}

function randomInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function nowIso() {
  return new Date().toISOString();
}

const TRIAL_DAYS = 14;
const GRACE_DAYS = 3;

function addDaysIso(iso, days) {
  const ms = new Date(String(iso || nowIso())).getTime();
  return new Date(ms + Number(days || 0) * 24 * 60 * 60 * 1000).toISOString();
}

function hashResetCode(storeId, code) {
  return crypto.createHash('sha256').update(`${String(storeId || '')}:${String(code || '')}`).digest('hex');
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function telegramIdFromIdentity(identity) {
  const raw = String(identity || '').trim();
  // Backward compatibility: в старых записях owner_user_id мог храниться без префикса.
  if (/^[0-9]{5,20}$/.test(raw)) return raw;
  if (raw.startsWith('telegram:')) {
    const id = raw.slice('telegram:'.length).trim();
    return /^[0-9]{5,20}$/.test(id) ? id : '';
  }
  if (!raw.startsWith('tg:')) return '';
  const id = raw.slice(3).trim();
  return /^[0-9]{5,20}$/.test(id) ? id : '';
}

function upsertAdminTelegramUser(userId, chatId, username = '', firstName = '') {
  const uid = String(userId || '').trim();
  const cid = String(chatId || '').trim();
  if (!/^[0-9]{5,20}$/.test(uid) || !cid) return;
  db.prepare(`
    INSERT INTO admin_telegram_users (user_id, chat_id, username, first_name, last_seen_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      chat_id = excluded.chat_id,
      username = excluded.username,
      first_name = excluded.first_name,
      last_seen_at = excluded.last_seen_at
  `).run(uid, cid, String(username || '').trim(), String(firstName || '').trim(), nowIso());
}

function getAdminTelegramUserById(userId) {
  const uid = String(userId || '').trim();
  if (!/^[0-9]{5,20}$/.test(uid)) return null;
  return db.prepare(`
    SELECT user_id, username, first_name, chat_id, last_seen_at
    FROM admin_telegram_users
    WHERE user_id = ?
  `).get(uid) || null;
}

function resolveRecentAdminTelegramId(maxAgeMinutes = 120) {
  const row = db.prepare(`
    SELECT user_id, last_seen_at
    FROM admin_telegram_users
    ORDER BY datetime(last_seen_at) DESC
    LIMIT 1
  `).get();
  const userId = String(row?.user_id || '').trim();
  if (!/^[0-9]{5,20}$/.test(userId)) return '';
  const seen = String(row?.last_seen_at || '').trim();
  if (maxAgeMinutes > 0 && seen) {
    const ageMs = Date.now() - new Date(seen).getTime();
    if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs > maxAgeMinutes * 60 * 1000) return '';
  }
  return userId;
}

function queueAdminMessage({ storeId = '', telegramUserId = '', text = '', payload = {} }) {
  const uid = String(telegramUserId || '').trim();
  const body = String(text || '').trim();
  if (!/^[0-9]{5,20}$/.test(uid) || !body) return;
  const ts = nowIso();
  db.prepare(`
    INSERT INTO pending_admin_messages
      (store_id, telegram_user_id, text, payload_json, status, attempts, last_error, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', 0, '', ?, ?)
  `).run(
    String(storeId || '').trim().toUpperCase(),
    uid,
    body,
    JSON.stringify(payload || {}),
    ts,
    ts,
  );
}

function markPendingAdminMessageResult(id, ok, errorCode = '') {
  const ts = nowIso();
  if (ok) {
    db.prepare(`
      UPDATE pending_admin_messages
      SET status = 'sent',
          attempts = attempts + 1,
          last_error = '',
          updated_at = ?
      WHERE id = ?
    `).run(ts, id);
    return;
  }
  db.prepare(`
    UPDATE pending_admin_messages
    SET status = CASE WHEN attempts >= 9 THEN 'failed' ELSE 'pending' END,
        attempts = attempts + 1,
        last_error = ?,
        updated_at = ?
    WHERE id = ?
  `).run(String(errorCode || 'SEND_FAILED'), ts, id);
}

function deriveBotKey() {
  if (!BOT_TOKEN_SECRET) return null;
  return crypto.createHash('sha256').update(BOT_TOKEN_SECRET).digest();
}

const BOT_KEY = deriveBotKey();

function encryptBotToken(token) {
  const raw = String(token || '').trim();
  if (!raw) return '';
  if (!BOT_KEY) return raw;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', BOT_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptBotToken(value) {
  const raw = String(value || '');
  if (!raw) return '';
  if (!raw.startsWith('enc:v1:')) return raw;
  if (!BOT_KEY) return '';
  const parts = raw.split(':');
  if (parts.length !== 5) return '';
  const iv = Buffer.from(parts[2], 'base64');
  const tag = Buffer.from(parts[3], 'base64');
  const encrypted = Buffer.from(parts[4], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', BOT_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function createSession(storeId, userId = '') {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (token, store_id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(token, storeId, String(userId || ''), expiresAt, createdAt);
  return token;
}

function getStoreRow(storeId) {
  return db.prepare('SELECT * FROM stores WHERE store_id = ?').get(storeId);
}

function resolvePublicApiBase(req) {
  if (PUBLIC_API_BASE) return PUBLIC_API_BASE;
  const host = String(req?.get?.('host') || '').trim();
  if (!host) return '';
  const proto = String(req?.protocol || 'https').trim() || 'https';
  return `${proto}://${host}`.replace(/\/$/, '');
}

function normalizeCatalogBase(rawBase) {
  const normalized = String(rawBase || '').trim().replace(/\/$/, '');
  if (!normalized) return '';
  const lowered = normalized.toLowerCase();
  // Жесткая защита от старых ссылок на GitHub Pages / legacy-стенд.
  if (lowered.includes('github.io') || lowered.includes('lambrizsel.duckdns.org')) return '';
  return normalized;
}

function resolveCatalogBaseFromEnv() {
  const envBase = normalizeCatalogBase(WEBAPP_URL);
  if (envBase) return envBase;
  const apiBase = normalizeCatalogBase(PUBLIC_API_BASE);
  if (!apiBase) return '';
  return apiBase.replace(/\/api$/i, '');
}

function resolveCatalogBase(req) {
  const preferred = resolveCatalogBaseFromEnv();
  if (preferred) return preferred;
  const apiBase = resolvePublicApiBase(req);
  if (!apiBase) return '';
  return apiBase.replace(/\/api$/i, '');
}

function appendWebAppVersion(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  try {
    const u = new URL(value);
    if (WEBAPP_VERSION) u.searchParams.set('v', WEBAPP_VERSION);
    return u.toString();
  } catch {
    return value;
  }
}

function getStoreCatalogUrl(storeId, req) {
  const base = resolveCatalogBase(req);
  if (!base) return '';
  const sid = encodeURIComponent(String(storeId || '').trim().toUpperCase());
  return appendWebAppVersion(`${base}/store/${sid}`);
}

const SUBSCRIPTION_TARIFFS = {
  '30': 4000,
  '180': 20000,
  '365': 30000,
};

function resolveSubscriptionBaseUrl(days) {
  const key = String(days || '').trim();
  if (key === '30' && SUBSCRIPTION_PAYMENT_URL_30) return SUBSCRIPTION_PAYMENT_URL_30;
  if (key === '180' && SUBSCRIPTION_PAYMENT_URL_180) return SUBSCRIPTION_PAYMENT_URL_180;
  if (key === '365' && SUBSCRIPTION_PAYMENT_URL_365) return SUBSCRIPTION_PAYMENT_URL_365;
  return SUBSCRIPTION_PAYMENT_URL;
}

function buildSubscriptionPaymentLink({ days, storeId, userId }) {
  const daysKey = String(days || '').trim();
  if (!Object.prototype.hasOwnProperty.call(SUBSCRIPTION_TARIFFS, daysKey)) return '';
  const base = resolveSubscriptionBaseUrl(daysKey);
  if (!base) return '';
  const amount = SUBSCRIPTION_TARIFFS[daysKey];
  try {
    const u = new URL(base);
    u.searchParams.set('kind', 'subscription');
    u.searchParams.set('store_id', String(storeId || '').trim().toUpperCase());
    u.searchParams.set('bot_id', String(storeId || '').trim().toUpperCase());
    u.searchParams.set('tariff_days', daysKey);
    u.searchParams.set('amount', String(amount));
    if (String(userId || '').startsWith('tg:')) {
      u.searchParams.set('telegram_user_id', String(userId).slice(3));
    }
    return u.toString();
  } catch {
    return base;
  }
}

function yookassaConfigured() {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) return false;
  const value = `${YOOKASSA_SHOP_ID} ${YOOKASSA_SECRET_KEY}`.toLowerCase();
  return !value.includes('your_shop_id') && !value.includes('your_secret_key') && !value.includes('replace_me');
}

async function createYookassaSubscriptionPayment({ storeId, userId, days, amount, req }) {
  if (!yookassaConfigured()) return { ok: false, error: 'SUBSCRIPTION_PAYMENT_NOT_CONFIGURED' };
  const idempotenceKey = crypto.randomUUID();
  const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
  const fallbackReturn = `${resolveCatalogBase(req) || resolveCatalogBaseFromEnv() || 'https://api.saaskatalog.ru'}/?admin=1`;
  const returnUrl = SUBSCRIPTION_RETURN_URL || fallbackReturn;
  const payload = {
    amount: {
      value: Number(amount).toFixed(2),
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    capture: true,
    description: `Подписка SaaS каталога (${days} дней, Store ${storeId})`,
    metadata: {
      kind: 'subscription',
      store_id: String(storeId || '').trim().toUpperCase(),
      bot_id: String(storeId || '').trim().toUpperCase(),
      tariff_days: String(days || ''),
      telegram_user_id: String(userId || '').startsWith('tg:') ? String(userId).slice(3) : '',
    },
  };
  try {
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: 'SUBSCRIPTION_PAYMENT_CREATE_FAILED' };
    const url = String(data?.confirmation?.confirmation_url || '').trim();
    if (!url) return { ok: false, error: 'SUBSCRIPTION_PAYMENT_CREATE_FAILED' };
    const paymentId = String(data?.id || '').trim();
    if (paymentId) {
      const ts = nowIso();
      db.prepare(`
        INSERT INTO subscription_payments (store_id, payment_id, provider, amount, tariff_days, status, payload_json, created_at, updated_at)
        VALUES (?, ?, 'yookassa', ?, ?, 'pending', ?, ?, ?)
        ON CONFLICT(provider, payment_id) DO UPDATE SET
          amount = excluded.amount,
          tariff_days = excluded.tariff_days,
          payload_json = excluded.payload_json,
          updated_at = excluded.updated_at
      `).run(
        String(storeId || '').trim().toUpperCase(),
        paymentId,
        Number(amount || 0),
        Number(days || 0),
        JSON.stringify({
          request_metadata: payload.metadata,
          response_status: String(data?.status || ''),
          user_id: String(userId || ''),
        }),
        ts,
        ts,
      );
    }
    return { ok: true, url, paymentId };
  } catch {
    return { ok: false, error: 'SUBSCRIPTION_PAYMENT_CREATE_FAILED' };
  }
}

function getStoreSettings(row) {
  return safeJsonParse(row?.settings_json || '{}', {});
}

function normalizeCatalogConnectionPlatform(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram' || value === 'telegram_bot' || value === 'tg') return 'telegram';
  if (value === 'vk' || value === 'vk_bot' || value === 'vkontakte') return 'vk';
  if (value === 'max' || value === 'max_bot') return 'max';
  return 'custom';
}

function getCatalogConnectionPlatformLabel(platform) {
  const normalized = normalizeCatalogConnectionPlatform(platform);
  if (normalized === 'telegram') return 'Telegram';
  if (normalized === 'vk') return 'VK';
  if (normalized === 'max') return 'MAX';
  return 'Другая платформа';
}

function normalizeCatalogConnectionTitle(raw, platform = 'custom', fallback = '') {
  const value = String(raw || '').trim().slice(0, 120);
  if (value) return value;
  const fallbackValue = String(fallback || '').trim().slice(0, 120);
  if (fallbackValue) return fallbackValue;
  return `${getCatalogConnectionPlatformLabel(platform)} бот`;
}

function normalizeCatalogConnectionIdentifier(raw) {
  return String(raw || '').trim().slice(0, 300);
}

function serializeCatalogConnection(row, { req = null } = {}) {
  if (!row) return null;
  const platform = normalizeCatalogConnectionPlatform(row.platform);
  const title = normalizeCatalogConnectionTitle(row.title, platform, row.bot_username || row.bot_identifier || '');
  const botUsername = String(row.bot_username || '').trim();
  const identifier = String(row.bot_identifier || '').trim();
  return {
    id: Number(row.id || 0),
    platform,
    platformLabel: getCatalogConnectionPlatformLabel(platform),
    title,
    identifier,
    botUsername,
    hasToken: Boolean(String(row.bot_token_enc || '').trim()),
    webhookConfigured: Boolean(String(row.webhook_secret || '').trim()),
    managed: platform === 'telegram' && Boolean(String(row.bot_token_enc || '').trim()),
    catalogUrl: getStoreCatalogUrl(row.store_id, req),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function listStoreCatalogConnections(storeId, { req = null } = {}) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!sid) return [];
  const storeRow = getStoreRow(sid);
  if (storeRow) ensureLegacyStoreCatalogConnection(storeRow);
  const rows = db.prepare(`
    SELECT *
    FROM store_catalog_connections
    WHERE store_id = ?
    ORDER BY sort_order ASC, id ASC
  `).all(sid);
  return rows.map((row) => serializeCatalogConnection(row, { req })).filter(Boolean);
}

function listStoreCatalogConnectionRows(storeId) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!sid) return [];
  const storeRow = getStoreRow(sid);
  if (storeRow) ensureLegacyStoreCatalogConnection(storeRow);
  return db.prepare(`
    SELECT *
    FROM store_catalog_connections
    WHERE store_id = ?
    ORDER BY sort_order ASC, id ASC
  `).all(sid);
}

function getPrimaryTelegramCatalogConnectionRow(storeId) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!sid) return null;
  return db.prepare(`
    SELECT *
    FROM store_catalog_connections
    WHERE store_id = ?
      AND platform = 'telegram'
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
  `).get(sid) || null;
}

function getTelegramCatalogConnectionBySecret(storeId, webhookSecret) {
  const sid = String(storeId || '').trim().toUpperCase();
  const secret = String(webhookSecret || '').trim();
  if (!sid || !secret) return null;
  return db.prepare(`
    SELECT *
    FROM store_catalog_connections
    WHERE store_id = ?
      AND platform = 'telegram'
      AND webhook_secret = ?
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
  `).get(sid, secret) || null;
}

function getStoreTelegramBotTokens(storeRow) {
  const sid = String(storeRow?.store_id || '').trim().toUpperCase();
  if (!sid) return [];
  const unique = new Set();
  const out = [];
  const rows = listStoreCatalogConnectionRows(sid);
  rows.forEach((row) => {
    if (normalizeCatalogConnectionPlatform(row.platform) !== 'telegram') return;
    const token = decryptBotToken(String(row.bot_token_enc || ''));
    if (!token || unique.has(token)) return;
    unique.add(token);
    out.push(token);
  });
  const legacy = decryptBotToken(String(storeRow?.bot_token_enc || ''));
  if (legacy && !unique.has(legacy)) out.push(legacy);
  return out;
}

function ensureLegacyStoreCatalogConnection(storeRow) {
  const sid = String(storeRow?.store_id || '').trim().toUpperCase();
  if (!sid) return;
  const legacyToken = String(storeRow?.bot_token_enc || '').trim();
  const legacyUsername = String(storeRow?.bot_username || '').trim();
  const legacySecret = String(storeRow?.bot_webhook_secret || '').trim();
  if (!legacyToken && !legacyUsername) return;
  const existing = db.prepare(`
    SELECT id
    FROM store_catalog_connections
    WHERE store_id = ?
      AND platform = 'telegram'
    ORDER BY id ASC
    LIMIT 1
  `).get(sid);
  if (existing?.id) return;
  const ts = nowIso();
  db.prepare(`
    INSERT INTO store_catalog_connections (
      store_id, platform, title, bot_identifier, bot_username, bot_token_enc, webhook_secret, meta_json, sort_order, created_at, updated_at
    )
    VALUES (?, 'telegram', ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    sid,
    normalizeCatalogConnectionTitle('', 'telegram', legacyUsername || 'Telegram бот'),
    legacyUsername,
    legacyUsername,
    legacyToken,
    legacySecret,
    JSON.stringify({ migratedFrom: 'stores' }),
    ts,
    ts,
  );
}

function syncLegacyStoreBotColumns(storeId) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!sid) return;
  const primary = getPrimaryTelegramCatalogConnectionRow(sid);
  const current = getStoreRow(sid);
  const nextToken = String(primary?.bot_token_enc || '');
  const nextUsername = String(primary?.bot_username || primary?.bot_identifier || '');
  const nextSecret = String(primary?.webhook_secret || '');
  if (
    current
    && String(current.bot_token_enc || '') === nextToken
    && String(current.bot_username || '') === nextUsername
    && String(current.bot_webhook_secret || '') === nextSecret
  ) {
    return;
  }
  db.prepare(`
    UPDATE stores
    SET bot_token_enc = ?,
        bot_username = ?,
        bot_webhook_secret = ?,
        updated_at = ?
    WHERE store_id = ?
  `).run(
    nextToken,
    nextUsername,
    nextSecret,
    nowIso(),
    sid,
  );
}

function createCatalogConnectionRecord({
  storeId,
  platform,
  title = '',
  botIdentifier = '',
  botUsername = '',
  botTokenEnc = '',
  webhookSecret = '',
  meta = {},
}) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!sid) throw new Error('STORE_ID_REQUIRED');
  const normalizedPlatform = normalizeCatalogConnectionPlatform(platform);
  const safeTitle = normalizeCatalogConnectionTitle(title, normalizedPlatform, botUsername || botIdentifier || '');
  const safeIdentifier = normalizeCatalogConnectionIdentifier(botIdentifier || botUsername || '');
  const safeUsername = String(botUsername || '').trim().slice(0, 120);
  const safeMeta = meta && typeof meta === 'object' ? meta : {};
  const nextSort = Number(
    db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM store_catalog_connections WHERE store_id = ?').get(sid)?.next_sort || 0,
  );
  const ts = nowIso();
  const result = db.prepare(`
    INSERT INTO store_catalog_connections (
      store_id, platform, title, bot_identifier, bot_username, bot_token_enc, webhook_secret, meta_json, sort_order, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sid,
    normalizedPlatform,
    safeTitle,
    safeIdentifier,
    safeUsername,
    String(botTokenEnc || ''),
    String(webhookSecret || ''),
    JSON.stringify(safeMeta),
    nextSort,
    ts,
    ts,
  );
  return db.prepare('SELECT * FROM store_catalog_connections WHERE id = ?').get(result.lastInsertRowid) || null;
}

function migrateLegacyCatalogConnections() {
  const stores = db.prepare('SELECT store_id, bot_token_enc, bot_username, bot_webhook_secret FROM stores').all();
  stores.forEach((row) => {
    ensureLegacyStoreCatalogConnection(row);
    syncLegacyStoreBotColumns(row.store_id);
  });
}

function getStoreCatalogConnectionSummary(storeRow) {
  const sid = String(storeRow?.store_id || '').trim().toUpperCase();
  if (!sid) return { total: 0, botUsername: '' };
  ensureLegacyStoreCatalogConnection(storeRow);
  const rows = listStoreCatalogConnectionRows(sid);
  if (!rows.length) {
    return { total: 0, botUsername: '' };
  }
  const primaryTelegram = rows.find((row) => normalizeCatalogConnectionPlatform(row.platform) === 'telegram') || null;
  const total = rows.length;
  if (primaryTelegram) {
    const label = String(primaryTelegram.bot_username || primaryTelegram.bot_identifier || '').trim() || 'Telegram';
    return {
      total,
      botUsername: total > 1 ? `${label} +${total - 1}` : label,
    };
  }
  const first = rows[0];
  const platformLabel = getCatalogConnectionPlatformLabel(first.platform);
  return {
    total,
    botUsername: total > 1 ? `${platformLabel} +${total - 1}` : platformLabel,
  };
}

function normalizeOrderProcessingMode(raw) {
  return String(raw || '').trim().toLowerCase() === 'chat' ? 'chat' : 'payment';
}

function normalizeOrderRequestChannelType(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'telegram_chat' || value === 'telegram' || value === 'admin_bot') return 'telegram_chat';
  if (value === 'webhook' || value === 'http_webhook') return 'webhook';
  if (value === 'external') return 'messenger_link';
  if (value === 'messenger_link' || value === 'messenger' || value === 'link') return 'messenger_link';
  return 'telegram_chat';
}

function normalizeTelegramChatId(raw) {
  const value = String(raw || '').trim();
  return /^-?[0-9]{5,20}$/.test(value) ? value : '';
}

function resolveOrderRequestChatIdFromSettings(settings) {
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

function resolveOrderRequestTargetFromSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  return String(
    source.orderRequestTarget
    || source.orderRequestUrl
    || source.orderRequestWebhookUrl
    || source.orderRequestLink
    || '',
  ).trim();
}

function resolveOrderRequestChannelConfig(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  const hasRequestUrl = Boolean(String(
    source.orderRequestTarget
    || source.orderRequestUrl
    || source.orderRequestWebhookUrl
    || source.orderRequestLink
    || '',
  ).trim());
  const channelType = normalizeOrderRequestChannelType(
    source.orderRequestChannelType
    || source.orderRequestSender
    || (hasRequestUrl ? (String(source.orderRequestWebhookUrl || '').trim() ? 'webhook' : 'messenger_link') : '')
    || '',
  );
  if (channelType === 'telegram_chat') {
    return {
      channelType,
      target: resolveOrderRequestChatIdFromSettings(source),
    };
  }
  return {
    channelType,
    target: resolveOrderRequestTargetFromSettings(source),
  };
}

function normalizePaymentProvider(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'yookassa') return 'yookassa';
  if (value === 'tbank' || value === 'tinkoff') return 'tbank';
  if (value === 'robokassa') return 'robokassa';
  if (value === 'alfabank' || value === 'alfa') return 'alfabank';
  if (value === 'custom_link' || value === 'custom' || value === 'link') return 'custom_link';
  return '';
}

const PAYMENT_PROVIDER_DEFAULT_API = {
  yookassa: 'https://api.yookassa.ru/v3/payments',
  tbank: 'https://securepay.tinkoff.ru/v2/Init',
  robokassa: 'https://auth.robokassa.ru/Merchant/Index.aspx',
  alfabank: 'https://pay.alfabank.ru/payment/rest/register.do',
  custom_link: '',
};

function providerNeedsSecret(provider) {
  const normalized = normalizePaymentProvider(provider);
  return normalized !== 'custom_link';
}

function providerNeedsAccount(provider) {
  const normalized = normalizePaymentProvider(provider);
  return normalized !== 'custom_link';
}

function normalizePaymentExtra(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return { ...raw };
  if (typeof raw === 'string' && raw.trim()) return safeJsonParse(raw, {});
  return {};
}

function resolvePaymentWebhookUrl(storeId, provider, req = null) {
  const normalized = normalizePaymentProvider(provider);
  if (!normalized || normalized === 'custom_link') return '';
  const publicApi = resolvePublicApiBase(req);
  if (!publicApi) return '';
  return `${publicApi}/api/stores/${encodeURIComponent(String(storeId || '').trim().toUpperCase())}/payments/${normalized}/webhook`;
}

function getStorePaymentIntegration(row, { includeSecret = false, req = null } = {}) {
  const settings = getStoreSettings(row);
  const provider = normalizePaymentProvider(
    row?.payment_provider
    || settings?.paymentProvider
    || settings?.paymentGatewayProvider
    || '',
  );
  const accountId = String(
    row?.payment_account_id
    || row?.yookassa_shop_id
    || settings?.paymentAccountId
    || settings?.paymentShopId
    || settings?.yookassaShopId
    || settings?.terminalKey
    || settings?.merchantLogin
    || settings?.userName
    || '',
  ).trim();
  const secretEnc = String(row?.payment_secret_enc || row?.yookassa_secret_enc || '').trim();
  const secretKey = includeSecret ? decryptBotToken(secretEnc) : '';
  const apiUrl = String(
    row?.payment_api_url
    || settings?.paymentApiUrl
    || settings?.apiUrl
    || PAYMENT_PROVIDER_DEFAULT_API[provider]
    || ''
  ).trim();
  const fallbackCatalogUrl = getStoreCatalogUrl(row?.store_id || '', req);
  const returnUrl = String(fallbackCatalogUrl || row?.payment_return_url || '').trim();
  const extra = normalizePaymentExtra(row?.payment_extra_json || settings?.paymentExtra || settings?.paymentExtraJson || '{}');
  const webhookUrl = resolvePaymentWebhookUrl(row?.store_id || '', provider, req);
  const needsSecret = providerNeedsSecret(provider);
  const needsAccount = providerNeedsAccount(provider);
  const customTemplate = String(extra?.templateUrl || '').trim();
  const secretConfigured = Boolean(secretEnc);
  const configured = Boolean(
    provider
    && (!needsAccount || accountId)
    && (!needsSecret || (includeSecret ? secretKey : secretEnc))
    && (provider !== 'custom_link' || customTemplate)
  );
  return {
    provider,
    accountId,
    secretKey,
    secretConfigured,
    apiUrl,
    returnUrl,
    extra,
    webhookUrl,
    configured,
  };
}

function getCachedOrderPayment(storeId, orderId, provider) {
  return db.prepare(`
    SELECT payment_id, confirmation_url, status
    FROM order_payments
    WHERE store_id = ? AND order_id = ? AND provider = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(storeId, orderId, provider);
}

function normalizeOrderWorkflowStatus(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'canceled' || value === 'cancelled' || value === 'canceled_by_store' || value === 'cancelled_by_store') return 'canceled';
  if (value === 'completed' || value === 'done' || value === 'finished') return 'completed';
  if (value === 'shipped' || value === 'sent' || value === 'delivery' || value === 'in_delivery') return 'shipped';
  if (value === 'accepted' || value === 'processing' || value === 'in_progress' || value === 'accepted_by_store') return 'accepted';
  if (value === 'new' || value === 'created' || value === 'pending') return 'new';
  return 'new';
}

function normalizeOrderPaymentStatus(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return '';
  if (value === 'payment_success' || value === 'paid' || value === 'succeeded' || value === 'success' || value === 'confirmed') return 'paid';
  if (value === 'payment_pending' || value === 'pending' || value === 'created' || value === 'authorized') return 'pending';
  if (value === 'payment_failed' || value === 'failed' || value === 'fail' || value === 'canceled' || value === 'cancelled' || value === 'expired') return 'failed';
  return value;
}

function getNextOrderNumber(storeId) {
  const row = db.prepare('SELECT MAX(order_number) AS max_number FROM orders WHERE store_id = ?').get(storeId);
  const current = Number(row?.max_number || 0);
  return Number.isFinite(current) ? current + 1 : 1;
}

function buildOrderSequenceMap(rows = []) {
  const ordered = rows.slice().sort((a, b) => {
    const byDate = Number(new Date(String(a.created_at || 0))) - Number(new Date(String(b.created_at || 0)));
    if (byDate !== 0) return byDate;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  const used = new Set(ordered
    .map((row) => Number(row?.order_number || 0))
    .filter((num) => Number.isFinite(num) && num > 0));
  let next = 1;
  const map = new Map();
  ordered.forEach((row) => {
    const existing = Number(row?.order_number || 0);
    if (Number.isFinite(existing) && existing > 0) {
      map.set(String(row.id || ''), existing);
      return;
    }
    while (used.has(next)) next += 1;
    map.set(String(row.id || ''), next);
    used.add(next);
    next += 1;
  });
  return map;
}

function hydrateOrderRow(row, sequenceMap = new Map()) {
  const payload = safeJsonParse(row?.payload_json, {});
  const customer = safeJsonParse(row?.customer_json, {});
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  const workflowStatus = normalizeOrderWorkflowStatus(row?.workflow_status || row?.status || payload?.workflowStatus || payload?.status);
  const paymentStatus = normalizeOrderPaymentStatus(row?.payment_status || payload?.paymentStatus || (
    /^payment_/i.test(String(row?.status || '')) || /paid|succeed|fail|cancel|expire/i.test(String(row?.status || ''))
      ? row?.status
      : ''
  ));
  const total = Number(row?.total_amount || payload?.total || 0);
  const fallbackNumber = Number(sequenceMap.get(String(row?.id || '')) || 0);
  const orderNumber = Number(row?.order_number || 0) > 0 ? Number(row.order_number) : fallbackNumber;
  return {
    id: String(row?.id || ''),
    orderNumber,
    telegramUserId: String(row?.telegram_user_id || customer?.telegramId || payload?.telegramUserId || '').trim(),
    status: workflowStatus,
    paymentStatus,
    total: Number.isFinite(total) ? total : 0,
    totalDisplay: payload?.totalDisplay || '',
    currency: String(row?.currency || 'RUB').trim().toUpperCase() || 'RUB',
    customer,
    items: rawItems,
    payload,
    createdAt: String(row?.created_at || ''),
    updatedAt: String(row?.updated_at || ''),
  };
}

function saveOrderPaymentRecord({
  storeId,
  orderId,
  provider,
  paymentId,
  amount,
  currency,
  status = 'pending',
  confirmationUrl = '',
  payload = {},
}) {
  const ts = nowIso();
  db.prepare(`
    INSERT INTO order_payments (
      store_id, order_id, provider, payment_id, amount, currency, status, confirmation_url, payload_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(provider, payment_id) DO UPDATE SET
      amount = excluded.amount,
      currency = excluded.currency,
      status = excluded.status,
      confirmation_url = excluded.confirmation_url,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(
    storeId,
    orderId,
    provider,
    paymentId,
    Number(amount || 0),
    String(currency || 'RUB').trim().toUpperCase() || 'RUB',
    String(status || 'pending').trim().toLowerCase() || 'pending',
    String(confirmationUrl || '').trim(),
    JSON.stringify(payload && typeof payload === 'object' ? payload : {}),
    ts,
    ts,
  );
  db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ? AND store_id = ?')
    .run(normalizeOrderPaymentStatus(status || 'pending') || 'pending', ts, orderId, storeId);
}

function fillPaymentTemplate(template, values) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => encodeURIComponent(String(values?.[key] ?? '')));
}

function isValidHttpUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function buildTbankToken(params, password) {
  const source = {
    ...params,
    Password: String(password || ''),
  };
  const serialized = Object.keys(source)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => String(source[key] == null ? '' : source[key]))
    .join('');
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function hashString(source, algorithm = 'md5') {
  const normalized = String(algorithm || 'md5').trim().toLowerCase();
  const allowed = new Set(['md5', 'sha1', 'sha256', 'sha384', 'sha512']);
  const resolved = allowed.has(normalized) ? normalized : 'md5';
  return crypto.createHash(resolved).update(String(source || '')).digest('hex');
}

function mapPaymentResultError(error, fallback = 'PAYMENT_CREATE_FAILED') {
  const value = String(error || '').trim();
  return value || fallback;
}

async function createYookassaOrderPayment({
  integration,
  storeId,
  orderId,
  amount,
  currency,
  telegramUserId = '',
  req = null,
}) {
  if (!integration.accountId || !integration.secretKey) {
    return { ok: false, error: 'PAYMENT_NOT_CONFIGURED' };
  }
  const fallbackReturnUrl = getStoreCatalogUrl(storeId, req) || `${resolveCatalogBase(req)}/store/${encodeURIComponent(storeId)}`;
  const returnUrl = integration.returnUrl || fallbackReturnUrl || 'https://yookassa.ru';
  const idempotenceKey = crypto.randomUUID();
  const auth = Buffer.from(`${integration.accountId}:${integration.secretKey}`).toString('base64');
  const body = {
    amount: {
      value: amount.toFixed(2),
      currency,
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    description: `Оплата заказа ${orderId} (${storeId})`,
    metadata: {
      kind: 'order',
      store_id: storeId,
      order_id: orderId,
      telegram_user_id: String(telegramUserId || '').trim(),
    },
  };
  try {
    const endpoint = integration.apiUrl || PAYMENT_PROVIDER_DEFAULT_API.yookassa;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: mapPaymentResultError(payload?.description || payload?.type || payload?.error || `HTTP ${response.status}`) };
    }
    const paymentId = String(payload?.id || '').trim();
    const confirmationUrl = String(payload?.confirmation?.confirmation_url || '').trim();
    const status = String(payload?.status || 'pending').trim().toLowerCase() || 'pending';
    if (!paymentId || !confirmationUrl) {
      return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
    }
    saveOrderPaymentRecord({
      storeId,
      orderId,
      provider: 'yookassa',
      paymentId,
      amount,
      currency,
      status,
      confirmationUrl,
      payload,
    });
    return {
      ok: true,
      provider: 'yookassa',
      paymentId,
      url: confirmationUrl,
    };
  } catch {
    return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
  }
}

async function createTbankOrderPayment({
  integration,
  storeId,
  orderId,
  amount,
  currency,
  telegramUserId = '',
  req = null,
}) {
  if (!integration.accountId || !integration.secretKey) {
    return { ok: false, error: 'PAYMENT_NOT_CONFIGURED' };
  }
  const amountMinor = Math.max(1, Math.round(amount * 100));
  const endpoint = integration.apiUrl || PAYMENT_PROVIDER_DEFAULT_API.tbank;
  const returnUrl = integration.returnUrl || getStoreCatalogUrl(storeId, req) || `${resolveCatalogBase(req)}/store/${encodeURIComponent(storeId)}`;
  const webhookUrl = integration.webhookUrl || resolvePaymentWebhookUrl(storeId, 'tbank', req);
  const apiToken = String(integration.extra?.apiToken || '').trim();
  const requestBody = {
    TerminalKey: integration.accountId,
    Amount: amountMinor,
    OrderId: orderId,
    Description: `Оплата заказа ${orderId}`,
    NotificationURL: webhookUrl,
    SuccessURL: returnUrl,
    FailURL: returnUrl,
  };
  requestBody.Token = buildTbankToken(requestBody, integration.secretKey);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiToken) headers.Authorization = `Bearer ${apiToken}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.Success === false) {
      return { ok: false, error: mapPaymentResultError(payload?.Details || payload?.Message || `HTTP ${response.status}`) };
    }
    const paymentId = String(payload?.PaymentId || payload?.paymentId || `TB-${Date.now()}`).trim();
    const paymentUrl = String(payload?.PaymentURL || payload?.paymentUrl || '').trim();
    if (!paymentUrl) return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
    saveOrderPaymentRecord({
      storeId,
      orderId,
      provider: 'tbank',
      paymentId,
      amount,
      currency,
      status: 'pending',
      confirmationUrl: paymentUrl,
      payload: {
        response: payload,
        telegram_user_id: String(telegramUserId || '').trim(),
      },
    });
    return {
      ok: true,
      provider: 'tbank',
      paymentId,
      url: paymentUrl,
    };
  } catch {
    return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
  }
}

async function createRobokassaOrderPayment({
  integration,
  storeId,
  orderId,
  amount,
  currency,
}) {
  if (!integration.accountId || !integration.secretKey) {
    return { ok: false, error: 'PAYMENT_NOT_CONFIGURED' };
  }
  const endpoint = integration.apiUrl || PAYMENT_PROVIDER_DEFAULT_API.robokassa;
  const extra = normalizePaymentExtra(integration.extra);
  const invId = Number(extra?.invoiceOffset || 0) + Date.now();
  const outSum = amount.toFixed(2);
  const description = `Оплата заказа ${orderId}`;
  const hashAlgorithm = String(extra?.hashAlgorithm || 'md5').trim().toLowerCase() || 'md5';
  const signatureBase = `${integration.accountId}:${outSum}:${invId}:${integration.secretKey}`;
  const signature = hashString(signatureBase, hashAlgorithm);
  const params = new URLSearchParams({
    MerchantLogin: integration.accountId,
    OutSum: outSum,
    InvId: String(invId),
    Description: description,
    SignatureValue: signature,
    Culture: 'ru',
    Encoding: 'utf-8',
    SuccessUrl: integration.returnUrl || '',
    FailUrl: integration.returnUrl || '',
  });
  if (Number(extra?.isTest || 0) === 1) params.set('IsTest', '1');
  const paymentUrl = `${endpoint}?${params.toString()}`;
  saveOrderPaymentRecord({
    storeId,
    orderId,
    provider: 'robokassa',
    paymentId: String(invId),
    amount,
    currency,
    status: 'pending',
    confirmationUrl: paymentUrl,
    payload: {
      description,
      request: Object.fromEntries(params.entries()),
    },
  });
  return {
    ok: true,
    provider: 'robokassa',
    paymentId: String(invId),
    url: paymentUrl,
  };
}

async function createAlfabankOrderPayment({
  integration,
  storeId,
  orderId,
  amount,
  currency,
  req = null,
}) {
  if (!integration.accountId || !integration.secretKey) {
    return { ok: false, error: 'PAYMENT_NOT_CONFIGURED' };
  }
  const endpoint = integration.apiUrl || PAYMENT_PROVIDER_DEFAULT_API.alfabank;
  const amountMinor = Math.max(1, Math.round(amount * 100));
  const returnUrl = integration.returnUrl || getStoreCatalogUrl(storeId, req) || `${resolveCatalogBase(req)}/store/${encodeURIComponent(storeId)}`;
  const orderNumber = `${storeId}-${orderId}`.slice(0, 32);
  const form = new URLSearchParams({
    userName: integration.accountId,
    password: integration.secretKey,
    orderNumber,
    amount: String(amountMinor),
    returnUrl,
    currency: '643',
    description: `Оплата заказа ${orderId}`,
  });
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const payload = await response.json().catch(() => ({}));
    const errorCode = String(payload?.errorCode ?? '').trim();
    if (!response.ok || (errorCode && errorCode !== '0')) {
      return { ok: false, error: mapPaymentResultError(payload?.errorMessage || `HTTP ${response.status}`) };
    }
    const paymentId = String(payload?.orderId || `ALFA-${Date.now()}`).trim();
    const paymentUrl = String(payload?.formUrl || '').trim();
    if (!paymentUrl) return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
    saveOrderPaymentRecord({
      storeId,
      orderId,
      provider: 'alfabank',
      paymentId,
      amount,
      currency,
      status: 'pending',
      confirmationUrl: paymentUrl,
      payload,
    });
    return {
      ok: true,
      provider: 'alfabank',
      paymentId,
      url: paymentUrl,
    };
  } catch {
    return { ok: false, error: 'PAYMENT_CREATE_FAILED' };
  }
}

async function createCustomLinkOrderPayment({
  integration,
  storeId,
  orderId,
  amount,
  currency,
  telegramUserId = '',
}) {
  const extra = normalizePaymentExtra(integration.extra);
  const templateUrl = String(extra?.templateUrl || '').trim();
  if (!templateUrl) return { ok: false, error: 'CUSTOM_TEMPLATE_REQUIRED' };
  let parsedTemplate = null;
  try {
    parsedTemplate = new URL(templateUrl);
    if (!/^https?:$/i.test(parsedTemplate.protocol)) throw new Error('INVALID_TEMPLATE');
  } catch {
    return { ok: false, error: 'INVALID_CUSTOM_TEMPLATE' };
  }
  const values = {
    storeId,
    orderId,
    amount: amount.toFixed(2),
    amountMinor: String(Math.max(1, Math.round(amount * 100))),
    currency,
    returnUrl: integration.returnUrl || '',
    telegramUserId: String(telegramUserId || '').trim(),
    accountId: String(integration.accountId || '').trim(),
  };
  const paymentUrl = fillPaymentTemplate(parsedTemplate.toString(), values);
  const paymentId = `custom-${crypto.randomBytes(6).toString('hex')}`;
  saveOrderPaymentRecord({
    storeId,
    orderId,
    provider: 'custom_link',
    paymentId,
    amount,
    currency,
    status: 'pending',
    confirmationUrl: paymentUrl,
    payload: { templateUrl, values },
  });
  return {
    ok: true,
    provider: 'custom_link',
    paymentId,
    url: paymentUrl,
  };
}

async function createOrderPayment({ storeRow, orderRow, telegramUserId = '', req = null }) {
  const integration = getStorePaymentIntegration(storeRow, { includeSecret: true, req });
  const provider = normalizePaymentProvider(integration.provider);
  if (!provider) return { ok: false, provider: '', url: '', paymentId: '', error: 'PAYMENT_NOT_CONFIGURED' };
  const amount = Number(orderRow?.total_amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, provider, url: '', paymentId: '', error: 'INVALID_ORDER_AMOUNT' };
  }
  const currency = String(orderRow?.currency || 'RUB').trim().toUpperCase() || 'RUB';
  const storeId = String(storeRow?.store_id || '').trim().toUpperCase();
  const orderId = String(orderRow?.id || '').trim();
  if (!storeId || !orderId) return { ok: false, provider, url: '', paymentId: '', error: 'ORDER_NOT_FOUND' };

  const existing = getCachedOrderPayment(storeId, orderId, provider);
  if (
    existing
    && String(existing.status || '').toLowerCase() !== 'succeeded'
    && String(existing.confirmation_url || '').trim()
  ) {
    return {
      ok: true,
      provider,
      paymentId: String(existing.payment_id || '').trim(),
      url: String(existing.confirmation_url || '').trim(),
      cached: true,
    };
  }

  if (providerNeedsAccount(provider) && !integration.accountId) {
    return { ok: false, provider, url: '', paymentId: '', error: 'PAYMENT_ACCOUNT_ID_REQUIRED' };
  }
  if (providerNeedsSecret(provider) && !integration.secretKey) {
    return { ok: false, provider, url: '', paymentId: '', error: 'PAYMENT_SECRET_REQUIRED' };
  }
  if (!integration.returnUrl) {
    return { ok: false, provider, url: '', paymentId: '', error: 'PAYMENT_RETURN_URL_REQUIRED' };
  }

  try {
    if (provider === 'yookassa') {
      return await createYookassaOrderPayment({ integration, storeId, orderId, amount, currency, telegramUserId, req });
    }
    if (provider === 'tbank') {
      return await createTbankOrderPayment({ integration, storeId, orderId, amount, currency, telegramUserId, req });
    }
    if (provider === 'robokassa') {
      return await createRobokassaOrderPayment({ integration, storeId, orderId, amount, currency });
    }
    if (provider === 'alfabank') {
      return await createAlfabankOrderPayment({ integration, storeId, orderId, amount, currency, req });
    }
    if (provider === 'custom_link') {
      return await createCustomLinkOrderPayment({ integration, storeId, orderId, amount, currency, telegramUserId });
    }
  } catch {}
  return { ok: false, provider, url: '', paymentId: '', error: 'PAYMENT_CREATE_FAILED' };
}

function normalizePromoCode(raw) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
}

function normalizePromoCodes(raw) {
  if (!Array.isArray(raw)) return [];
  const unique = new Map();
  raw.forEach((item) => {
    const code = normalizePromoCode(item?.code || '');
    if (!code) return;
    const type = String(item?.type || '').trim().toLowerCase() === 'fixed' ? 'fixed' : 'percent';
    const num = Number(item?.value || 0);
    if (!Number.isFinite(num) || num <= 0) return;
    const value = type === 'fixed'
      ? Math.max(1, Math.round(num))
      : Math.max(1, Math.min(100, Math.round(num)));
    unique.set(code, { code, type, value, active: item?.active !== false });
  });
  return Array.from(unique.values()).slice(0, 100);
}

function sanitizeSettingsPatch(settingsPatch) {
  if (!settingsPatch || typeof settingsPatch !== 'object') return {};
  const out = { ...settingsPatch };
  if (Object.prototype.hasOwnProperty.call(out, 'promoCodes')) {
    out.promoCodes = normalizePromoCodes(out.promoCodes);
  }
  if (Object.prototype.hasOwnProperty.call(out, 'orderProcessingMode')) {
    out.orderProcessingMode = normalizeOrderProcessingMode(out.orderProcessingMode);
  }
  if (Object.prototype.hasOwnProperty.call(out, 'orderRequestChannelType')) {
    out.orderRequestChannelType = normalizeOrderRequestChannelType(out.orderRequestChannelType);
  }

  const rawProvidedTarget = [
    out.orderRequestTarget,
    out.orderRequestUrl,
    out.orderRequestWebhookUrl,
    out.orderRequestLink,
    out.orderRequestChatId,
    out.orderChatId,
    out.chatId,
    out.telegramChatId,
  ].find((value) => value !== undefined);
  const hasProvidedTarget = rawProvidedTarget !== undefined;
  const resolvedChannel = normalizeOrderRequestChannelType(
    out.orderRequestChannelType
    || out.orderRequestSender
    || (hasProvidedTarget ? (isValidHttpUrl(rawProvidedTarget) ? 'messenger_link' : 'telegram_chat') : 'telegram_chat'),
  );

  if (hasProvidedTarget) {
    if (resolvedChannel === 'telegram_chat') {
      const chatId = normalizeTelegramChatId(rawProvidedTarget);
      out.orderRequestTarget = '';
      out.orderRequestUrl = '';
      out.orderRequestWebhookUrl = '';
      out.orderRequestLink = '';
      out.orderRequestChatId = chatId;
      out.orderChatId = chatId;
      out.chatId = chatId;
      out.telegramChatId = chatId;
    } else {
      const target = String(rawProvidedTarget || '').trim();
      out.orderRequestTarget = target;
      out.orderRequestUrl = target;
      out.orderRequestLink = target;
      if (resolvedChannel === 'webhook') {
        out.orderRequestWebhookUrl = target;
      }
      out.orderRequestChatId = '';
      out.orderChatId = '';
      out.chatId = '';
      out.telegramChatId = '';
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(out, 'orderRequestChatId')
    || Object.prototype.hasOwnProperty.call(out, 'orderChatId')
    || Object.prototype.hasOwnProperty.call(out, 'chatId')
    || Object.prototype.hasOwnProperty.call(out, 'telegramChatId')
  ) {
    const isTelegramChannel = normalizeOrderRequestChannelType(out.orderRequestChannelType || '') === 'telegram_chat';
    if (isTelegramChannel) {
      const provided = [
        out.orderRequestChatId,
        out.orderChatId,
        out.chatId,
        out.telegramChatId,
      ].find((value) => value !== undefined);
      const chatId = normalizeTelegramChatId(provided);
      out.orderRequestChatId = chatId;
      out.orderChatId = chatId;
      out.chatId = chatId;
      out.telegramChatId = chatId;
    }
  }
  return out;
}

function listCategories(storeId) {
  const rows = db.prepare(`
    SELECT category_id, title, image, group_id, payload_json, sort_order
    FROM categories
    WHERE store_id = ?
    ORDER BY sort_order ASC, id ASC
  `).all(storeId);
  return rows.map((r) => {
    const payload = safeJsonParse(r.payload_json, {});
    return {
      ...payload,
      id: r.category_id,
      title: r.title,
      image: r.image || '',
      groupId: r.group_id || payload.groupId || '',
    };
  });
}

function listProducts(storeId) {
  const rows = db.prepare(`
    SELECT product_id, category_id, title, price, old_price, sku, short_description, description, image, payload_json, sort_order
    FROM products
    WHERE store_id = ?
    ORDER BY sort_order ASC, id ASC
  `).all(storeId);
  return rows.map((r) => {
    const payload = safeJsonParse(r.payload_json, {});
    const images = Array.isArray(payload.images) && payload.images.length
      ? payload.images
      : [r.image].filter(Boolean);
    return {
      ...payload,
      id: r.product_id,
      categoryId: r.category_id || payload.categoryId || '',
      title: r.title,
      price: Number(r.price || 0),
      oldPrice: Number(r.old_price || 0),
      sku: r.sku || payload.sku || '',
      shortDescription: r.short_description || payload.shortDescription || '',
      description: r.description || payload.description || '',
      images,
    };
  });
}

const replaceCategoriesTx = db.transaction((storeId, categories) => {
  db.prepare('DELETE FROM categories WHERE store_id = ?').run(storeId);
  const stmt = db.prepare(`
    INSERT INTO categories (store_id, category_id, title, image, group_id, sort_order, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const ts = nowIso();
  categories.forEach((cat, idx) => {
    const categoryId = String(cat?.id || `category-${Date.now()}-${idx}`);
    const payload = { ...cat, id: categoryId };
    stmt.run(
      storeId,
      categoryId,
      String(cat?.title || 'Категория'),
      String(cat?.image || ''),
      String(cat?.groupId || ''),
      idx,
      JSON.stringify(payload),
      ts,
      ts,
    );
  });
});

const replaceProductsTx = db.transaction((storeId, products) => {
  db.prepare('DELETE FROM products WHERE store_id = ?').run(storeId);
  const stmt = db.prepare(`
    INSERT INTO products (store_id, product_id, category_id, title, price, old_price, sku, short_description, description, image, sort_order, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const ts = nowIso();
  products.forEach((p, idx) => {
    const productId = String(p?.id || `product-${Date.now()}-${idx}`);
    const images = Array.isArray(p?.images) ? p.images : [];
    const payload = { ...p, id: productId, images };
    stmt.run(
      storeId,
      productId,
      String(p?.categoryId || ''),
      String(p?.title || 'Товар'),
      Number(p?.price || 0),
      Number(p?.oldPrice || 0),
      String(p?.sku || ''),
      String(p?.shortDescription || ''),
      String(p?.description || ''),
      String(images[0] || ''),
      idx,
      JSON.stringify(payload),
      ts,
      ts,
    );
  });
});

function persistStoreDataset(storeId, row, { config, settings, categories, products }) {
  const nextConfig = config && typeof config === 'object'
    ? config
    : safeJsonParse(row?.config_json || '{}', {});
  const nextSettings = settings && typeof settings === 'object'
    ? sanitizeSettingsPatch(settings)
    : safeJsonParse(row?.settings_json || '{}', {});
  const nextCategories = Array.isArray(categories) ? categories : listCategories(storeId);
  const nextProducts = Array.isArray(products) ? products : listProducts(storeId);

  replaceCategoriesTx(storeId, nextCategories);
  replaceProductsTx(storeId, nextProducts);

  db.prepare(`
    UPDATE stores
    SET config_json = ?, settings_json = ?, categories_json = ?, products_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    JSON.stringify(nextConfig),
    JSON.stringify(nextSettings),
    JSON.stringify(nextCategories),
    JSON.stringify(nextProducts),
    nowIso(),
    storeId,
  );
}

function normalizeImportFieldName(value) {
  const base = String(value || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  const map = {
    title: 'title',
    description: 'description',
    price: 'price',
    old_price: 'old_price',
    oldprice: 'old_price',
    category: 'category',
    image_url: 'image_url',
    imageurl: 'image_url',
    image: 'image_url',
    active: 'active',
    stock: 'stock',
  };
  return map[base] || base;
}

function normalizeImportObject(row) {
  const out = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeImportFieldName(key);
    if (!normalizedKey) return;
    out[normalizedKey] = value;
  });
  return out;
}

function parseImportNumber(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { ok: false, value: 0 };
  const normalized = raw
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.') return { ok: false, value: 0 };
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return { ok: false, value: 0 };
  return { ok: true, value: parsed };
}

function parseImportBoolean(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return true;
  if (['true', '1', 'yes', 'y', 'да', 'active'].includes(raw)) return true;
  if (['false', '0', 'no', 'n', 'нет', 'inactive'].includes(raw)) return false;
  return true;
}

function parseImportInteger(value, fallback = 0) {
  const parsed = parseImportNumber(value);
  if (!parsed.ok) return fallback;
  return Math.max(0, Math.round(parsed.value));
}

function validateImportProductRow(sourceRow, index) {
  const rowNumber = index + 2;
  const normalized = normalizeImportObject(sourceRow);
  const errors = [];
  const warnings = [];
  const title = String(normalized.title || '').trim();
  const description = String(normalized.description || '').trim();
  const priceParsed = parseImportNumber(normalized.price);
  const oldPriceRaw = String(normalized.old_price ?? '').trim();
  const oldPriceParsed = oldPriceRaw ? parseImportNumber(oldPriceRaw) : { ok: true, value: 0 };
  let category = String(normalized.category || '').trim();
  const imageUrl = String(normalized.image_url || '').trim();
  const active = parseImportBoolean(normalized.active);
  const stock = parseImportInteger(normalized.stock, 0);

  if (!title) errors.push('Не заполнено поле title');
  if (!priceParsed.ok) errors.push('Поле price должно быть числом');
  if (typeof category !== 'string') errors.push('Поле category должно быть строкой');
  if (!category) {
    category = 'Без категории';
    warnings.push('Категория не указана, будет создан раздел "Без категории"');
  }
  if (oldPriceRaw && !oldPriceParsed.ok) warnings.push('Поле old_price не распознано, будет сохранено как 0');
  if (imageUrl && !isValidHttpUrl(imageUrl)) warnings.push('Поле image_url не является валидным URL, товар будет создан без изображения');

  return {
    rowNumber,
    source: {
      title,
      description,
      price: String(normalized.price ?? ''),
      old_price: oldPriceRaw,
      category: category || '',
      image_url: imageUrl,
      active: String(normalized.active ?? ''),
      stock: String(normalized.stock ?? ''),
    },
    normalized: {
      title,
      description,
      price: priceParsed.ok ? priceParsed.value : 0,
      oldPrice: oldPriceParsed.ok ? oldPriceParsed.value : 0,
      category,
      imageUrl: isValidHttpUrl(imageUrl) ? imageUrl : '',
      active,
      stock,
    },
    errors,
    warnings,
    canImport: errors.length === 0,
  };
}

function parseProductImportFile(file) {
  if (!file || !file.buffer?.length) {
    const error = new Error('IMPORT_FILE_REQUIRED');
    error.statusCode = 400;
    throw error;
  }
  const originalName = String(file.originalname || '').trim();
  const ext = path.extname(originalName).toLowerCase();
  if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
    const error = new Error('IMPORT_FILE_FORMAT_UNSUPPORTED');
    error.statusCode = 400;
    throw error;
  }
  let workbook;
  try {
    if (ext === '.csv') {
      const csvText = Buffer.from(file.buffer).toString('utf8').replace(/^\uFEFF/, '');
      workbook = XLSX.read(csvText, { type: 'string', raw: false, codepage: 65001 });
    } else {
      workbook = XLSX.read(file.buffer, { type: 'buffer', raw: false });
    }
  } catch {
    const error = new Error('IMPORT_FILE_PARSE_FAILED');
    error.statusCode = 400;
    throw error;
  }
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    const error = new Error('IMPORT_FILE_EMPTY');
    error.statusCode = 400;
    throw error;
  }
  const worksheet = workbook.Sheets[firstSheet];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false, blankrows: false });
  if (!Array.isArray(rawRows) || !rawRows.length) {
    const error = new Error('IMPORT_FILE_EMPTY');
    error.statusCode = 400;
    throw error;
  }
  if (rawRows.length > PRODUCT_IMPORT_MAX_ROWS) {
    const error = new Error('IMPORT_TOO_MANY_ROWS');
    error.statusCode = 400;
    throw error;
  }
  return rawRows.map((row, index) => validateImportProductRow(row, index));
}

function createImportPreviewSummary(rows, categories = []) {
  const validRows = rows.filter((row) => row.canImport);
  const existingCategoryKeys = new Set(categories.map((category) => String(category?.title || '').trim().toLowerCase()).filter(Boolean));
  const missingCategoryKeys = new Set();
  let warningRows = 0;
  let imageRows = 0;
  rows.forEach((row) => {
    if (row.warnings.length) warningRows += 1;
    if (row.normalized?.imageUrl) imageRows += 1;
    const key = String(row.normalized?.category || '').trim().toLowerCase();
    if (row.canImport && key && !existingCategoryKeys.has(key)) missingCategoryKeys.add(key);
  });
  return {
    totalRows: rows.length,
    readyToImport: validRows.length,
    invalidRows: rows.length - validRows.length,
    warningRows,
    categoriesToCreate: missingCategoryKeys.size,
    imageRows,
  };
}

function nextImportEntityId(prefix, usedIds) {
  let id = '';
  do {
    id = `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

function deriveImageExtensionFromResponse(imageUrl, contentType) {
  const byMime = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  };
  const normalizedType = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (byMime[normalizedType]) return byMime[normalizedType];
  try {
    const parsed = new URL(imageUrl);
    const ext = path.extname(parsed.pathname || '').toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  } catch {}
  return '.jpg';
}

async function downloadImportImage(storeId, imageUrl) {
  const response = await fetch(imageUrl, { redirect: 'follow' });
  if (!response.ok) throw new Error(`IMAGE_FETCH_${response.status}`);
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.startsWith('image/')) throw new Error('IMAGE_INVALID_CONTENT_TYPE');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error('IMAGE_EMPTY');
  if (bytes.length > 8 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  const ext = deriveImageExtensionFromResponse(imageUrl, contentType);
  const storeUploadsDir = path.join(UPLOADS_DIR, storeId);
  fs.mkdirSync(storeUploadsDir, { recursive: true });
  const finalName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const finalPath = path.join(storeUploadsDir, finalName);
  fs.writeFileSync(finalPath, bytes);
  return `/uploads/${storeId}/${finalName}`;
}

async function importProductsForStore(storeId, row, previewRows) {
  const categories = listCategories(storeId);
  const products = listProducts(storeId);
  const existingCategoryByKey = new Map();
  const usedCategoryIds = new Set();
  const usedProductIds = new Set();

  categories.forEach((category) => {
    const key = String(category?.title || '').trim().toLowerCase();
    if (key && !existingCategoryByKey.has(key)) existingCategoryByKey.set(key, category);
    if (category?.id) usedCategoryIds.add(String(category.id));
  });
  products.forEach((product) => {
    if (product?.id) usedProductIds.add(String(product.id));
  });

  const nextCategories = [...categories];
  const nextProducts = [...products];
  const importedRows = [];
  const skippedRows = [];
  const warnings = [];

  for (const rawRow of previewRows) {
    const validated = validateImportProductRow(rawRow?.source || rawRow, Number(rawRow?.rowNumber || 2) - 2);
    if (!validated.canImport) {
      skippedRows.push({ rowNumber: validated.rowNumber, errors: validated.errors });
      continue;
    }
    const categoryKey = String(validated.normalized.category || '').trim().toLowerCase();
    let category = existingCategoryByKey.get(categoryKey) || null;
    if (!category) {
      category = {
        id: nextImportEntityId('category', usedCategoryIds),
        title: validated.normalized.category,
        image: '',
        groupId: '',
      };
      existingCategoryByKey.set(categoryKey, category);
      nextCategories.push(category);
    }

    let primaryImage = PRODUCT_IMPORT_PLACEHOLDER_IMAGE;
    if (validated.normalized.imageUrl) {
      try {
        // eslint-disable-next-line no-await-in-loop
        primaryImage = await downloadImportImage(storeId, validated.normalized.imageUrl);
      } catch {
        warnings.push({
          rowNumber: validated.rowNumber,
          message: 'Не удалось скачать изображение, товар создан без изображения',
        });
      }
    }

    nextProducts.push({
      id: nextImportEntityId('product', usedProductIds),
      title: validated.normalized.title,
      price: validated.normalized.price,
      oldPrice: validated.normalized.oldPrice,
      sku: '',
      shortDescription: validated.normalized.description,
      description: validated.normalized.description,
      specs: [],
      images: [primaryImage || PRODUCT_IMPORT_PLACEHOLDER_IMAGE],
      categoryId: category.id,
      badge: '',
      tags: [],
      active: validated.normalized.active,
      stock: validated.normalized.stock,
      importImageUrl: validated.normalized.imageUrl,
    });
    importedRows.push(validated.rowNumber);
  }

  persistStoreDataset(storeId, row, {
    config: safeJsonParse(row?.config_json || '{}', {}),
    settings: safeJsonParse(row?.settings_json || '{}', {}),
    categories: nextCategories,
    products: nextProducts,
  });

  return {
    importedCount: importedRows.length,
    skippedCount: skippedRows.length,
    createdCategories: nextCategories.length - categories.length,
    warnings,
    skippedRows,
  };
}

function upsertStoreUser(storeId, userId, role = 'owner') {
  const uid = String(userId || '').trim();
  if (!uid) return;
  db.prepare(`
    INSERT INTO store_users (store_id, user_id, role, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(store_id, user_id) DO UPDATE SET role = excluded.role
  `).run(storeId, uid, role, nowIso());
}

function hasStoreAccess(userId, storeId) {
  const uid = String(userId || '').trim();
  if (!uid) return false;
  const row = db.prepare('SELECT 1 AS ok FROM store_users WHERE store_id = ? AND user_id = ?').get(storeId, uid);
  return Boolean(row?.ok);
}

function resolveOwnerTelegramId(storeRow) {
  const direct = telegramIdFromIdentity(storeRow?.owner_user_id || '');
  if (direct) return direct;
  const fromLinks = db.prepare(`
    SELECT user_id
    FROM store_users
    WHERE store_id = ? AND role = 'owner'
    ORDER BY id ASC
  `).all(String(storeRow?.store_id || ''));
  for (const row of fromLinks) {
    const parsed = telegramIdFromIdentity(row?.user_id || '');
    if (parsed) return parsed;
  }
  return '';
}

function ensureStoreSubscriptionRow(storeId, anchorIso = '') {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!isValidStoreId(sid)) return null;
  const existing = db.prepare('SELECT * FROM store_subscriptions WHERE store_id = ?').get(sid);
  if (existing) return existing;
  const base = String(anchorIso || nowIso()).trim() || nowIso();
  const trialEnds = addDaysIso(base, TRIAL_DAYS);
  const ts = nowIso();
  db.prepare(`
    INSERT INTO store_subscriptions (store_id, trial_started_at, trial_ends_at, paid_until, created_at, updated_at)
    VALUES (?, ?, ?, '', ?, ?)
  `).run(sid, base, trialEnds, ts, ts);
  return db.prepare('SELECT * FROM store_subscriptions WHERE store_id = ?').get(sid);
}

function getStoreSubscriptionState(storeId) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!isValidStoreId(sid)) {
    return {
      code: 'expired',
      isActive: false,
      isTrial: false,
      isGrace: false,
      featureAccess: false,
      notifyOrders: false,
      reason: 'INVALID_STORE_ID',
      trialEndsAt: '',
      paidUntil: '',
      graceEndsAt: '',
      daysLeft: 0,
      graceDaysLeft: 0,
    };
  }
  const row = ensureStoreSubscriptionRow(sid);
  if (!row) {
    return {
      code: 'expired',
      isActive: false,
      isTrial: false,
      isGrace: false,
      featureAccess: false,
      notifyOrders: false,
      reason: 'SUBSCRIPTION_NOT_FOUND',
      trialEndsAt: '',
      paidUntil: '',
      graceEndsAt: '',
      daysLeft: 0,
      graceDaysLeft: 0,
    };
  }
  const now = Date.now();
  const trialEndsAt = String(row.trial_ends_at || '').trim();
  const paidUntil = String(row.paid_until || '').trim();
  const trialEndMs = trialEndsAt ? new Date(trialEndsAt).getTime() : 0;
  const paidUntilMs = paidUntil ? new Date(paidUntil).getTime() : 0;
  const paidActive = paidUntilMs > now;
  const trialActive = !paidActive && trialEndMs > now;
  const baseEndMs = Math.max(trialEndMs || 0, paidUntilMs || 0);
  const graceEndsMs = baseEndMs > 0 ? baseEndMs + GRACE_DAYS * 24 * 60 * 60 * 1000 : 0;
  const graceActive = !paidActive && !trialActive && graceEndsMs > now;

  let code = 'expired';
  if (paidActive) code = 'active';
  else if (trialActive) code = 'trial';
  else if (graceActive) code = 'grace';

  const daysLeft = code === 'active'
    ? Math.max(0, Math.ceil((paidUntilMs - now) / (24 * 60 * 60 * 1000)))
    : code === 'trial'
      ? Math.max(0, Math.ceil((trialEndMs - now) / (24 * 60 * 60 * 1000)))
      : 0;
  const graceDaysLeft = code === 'grace'
    ? Math.max(0, Math.ceil((graceEndsMs - now) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    code,
    isActive: code === 'active' || code === 'trial',
    isTrial: code === 'trial',
    isGrace: code === 'grace',
    featureAccess: code === 'active' || code === 'trial',
    // Заказы продолжают создаваться даже без подписки, но уведомления отключаем.
    notifyOrders: code === 'active' || code === 'trial',
    reason: '',
    trialEndsAt,
    paidUntil,
    graceEndsAt: graceEndsMs > 0 ? new Date(graceEndsMs).toISOString() : '',
    daysLeft,
    graceDaysLeft,
  };
}

function upsertStoreSubscriptionPaidUntil(storeId, paidUntilIso) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!isValidStoreId(sid)) return;
  ensureStoreSubscriptionRow(sid);
  db.prepare(`
    UPDATE store_subscriptions
    SET paid_until = ?, updated_at = ?
    WHERE store_id = ?
  `).run(String(paidUntilIso || '').trim(), nowIso(), sid);
}

function activateStoreTrialIfNeeded(storeId) {
  const sid = String(storeId || '').trim().toUpperCase();
  if (!isValidStoreId(sid)) return;
  const row = ensureStoreSubscriptionRow(sid);
  const hasPaid = String(row?.paid_until || '').trim().length > 0;
  if (hasPaid) return;
  const started = nowIso();
  db.prepare(`
    UPDATE store_subscriptions
    SET trial_started_at = ?, trial_ends_at = ?, updated_at = ?
    WHERE store_id = ?
  `).run(started, addDaysIso(started, TRIAL_DAYS), nowIso(), sid);
}

function requireActiveSubscriptionForAdmin(req, res, next) {
  const sid = String(req.storeId || req.auth?.storeId || '').trim().toUpperCase();
  const subscription = getStoreSubscriptionState(sid);
  req.subscription = subscription;
  if (subscription.featureAccess) return next();
  return res.status(402).json({
    error: 'SUBSCRIPTION_REQUIRED',
    storeId: sid,
    subscription,
  });
}

function rowToDataset(row) {
  return {
    storeId: row.store_id,
    storeName: row.store_name,
    isActive: Number(row.is_active || 0) === 1,
    config: safeJsonParse(row.config_json, {}),
    settings: safeJsonParse(row.settings_json || '{}', {}),
    categories: listCategories(row.store_id),
    products: listProducts(row.store_id),
  };
}

function buildDefaultDataset() {
  return {
    config: readJsonFallback(path.join(ROOT, 'config.json'), {}),
    categories: readJsonFallback(path.join(ROOT, 'data', 'categories.json'), []),
    products: readJsonFallback(path.join(ROOT, 'data', 'products.json'), []),
    settings: {},
  };
}

function seedDefaultStore() {
  if (!isValidStoreId(DEFAULT_STORE_ID)) return;
  const exists = db.prepare('SELECT store_id FROM stores WHERE store_id = ?').get(DEFAULT_STORE_ID);
  if (exists) return;

  const dataset = buildDefaultDataset();
  const ts = nowIso();
  const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, owner_user_id, password_hash, invite_code, is_active, settings_json, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, '', ?, '', 1, ?, ?, ?, ?, ?, ?)
  `).run(
    DEFAULT_STORE_ID,
    'Demo Store',
    DEFAULT_ADMIN_EMAIL,
    hash,
    JSON.stringify(dataset.settings || {}),
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    ts,
    ts,
  );

  replaceCategoriesTx(DEFAULT_STORE_ID, dataset.categories);
  replaceProductsTx(DEFAULT_STORE_ID, dataset.products);
  upsertStoreUser(DEFAULT_STORE_ID, `email:${DEFAULT_ADMIN_EMAIL}`, 'owner');
  console.log(`[seed] store created: ${DEFAULT_STORE_ID}`);
}

function migrateLegacyToTenantTables() {
  const stores = db.prepare('SELECT store_id, categories_json, products_json, settings_json, owner_user_id, owner_email FROM stores').all();
  stores.forEach((store) => {
    const categoryCount = db.prepare('SELECT COUNT(*) AS c FROM categories WHERE store_id = ?').get(store.store_id)?.c || 0;
    const productCount = db.prepare('SELECT COUNT(*) AS c FROM products WHERE store_id = ?').get(store.store_id)?.c || 0;
    if (categoryCount === 0) {
      const categories = safeJsonParse(store.categories_json || '[]', []);
      if (Array.isArray(categories)) replaceCategoriesTx(store.store_id, categories);
    }
    if (productCount === 0) {
      const products = safeJsonParse(store.products_json || '[]', []);
      if (Array.isArray(products)) replaceProductsTx(store.store_id, products);
    }

    const uid = String(store.owner_user_id || '').trim();
    const email = String(store.owner_email || '').trim().toLowerCase();
    if (uid) upsertStoreUser(store.store_id, uid, 'owner');
    if (email) upsertStoreUser(store.store_id, `email:${email}`, 'owner');

    if (!store.settings_json) {
      db.prepare('UPDATE stores SET settings_json = ? WHERE store_id = ?').run('{}', store.store_id);
    }
    ensureStoreSubscriptionRow(store.store_id);
  });
}

seedDefaultStore();
migrateLegacyToTenantTables();
migrateLegacyCatalogConnections();

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!ALLOWED_ORIGINS.length) return callback(null, true);
    const ok = ALLOWED_ORIGINS.includes(origin);
    return callback(ok ? null : new Error('CORS_NOT_ALLOWED'), ok);
  },
  credentials: true,
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 8 * 1024 * 1024 },
});

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PRODUCT_IMPORT_MAX_FILE_SIZE },
});

function productImportUploadMiddleware(req, res, next) {
  const handler = importUpload.single('file');
  handler(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'IMPORT_FILE_TOO_LARGE' });
    }
    return res.status(400).json({ error: 'IMPORT_FILE_INVALID' });
  });
}

function authMiddleware(req, res, next) {
  const raw = String(req.headers.authorization || '');
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  const row = db.prepare('SELECT token, store_id, user_id, expires_at FROM sessions WHERE token = ?').get(token);
  if (!row) return res.status(401).json({ error: 'INVALID_TOKEN' });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'SESSION_EXPIRED' });
  }
  req.auth = { token: row.token, storeId: row.store_id, userId: row.user_id || '' };
  return next();
}

function ownerMiddleware(req, res, next) {
  const key = String(req.headers['x-owner-key'] || '').trim();
  if (!OWNER_API_KEY) return res.status(500).json({ error: 'OWNER_KEY_NOT_CONFIGURED' });
  if (!key || key !== OWNER_API_KEY) return res.status(401).json({ error: 'OWNER_AUTH_REQUIRED' });
  return next();
}

function storeParamMiddleware(req, res, next) {
  const storeId = String(req.params.storeId || '').trim().toUpperCase();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const store = getStoreRow(storeId);
  if (!store) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  req.store = store;
  req.storeId = storeId;
  return next();
}

function storeAdminAccessMiddleware(req, res, next) {
  const userId = String(req.auth?.userId || '').trim();
  if (!userId) {
    if (req.auth?.storeId === req.storeId) return next();
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  if (!hasStoreAccess(userId, req.storeId)) return res.status(403).json({ error: 'FORBIDDEN' });
  return next();
}

function userIdentityFromRequest(body, options = {}) {
  const tg = resolveTelegramUserIdFromBody(body, options);
  if (tg) return `tg:${tg}`;
  const email = String(body?.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return '';
}

function parseTelegramIdFromInitData(initData, botToken) {
  const raw = String(initData || '').trim();
  const token = String(botToken || '').trim();
  if (!raw || !token) return '';
  try {
    const params = new URLSearchParams(raw);
    const hash = String(params.get('hash') || '').trim();
    if (!hash) return '';

    const dataPairs = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash') continue;
      dataPairs.push(`${key}=${value}`);
    }
    dataPairs.sort();
    const dataCheckString = dataPairs.join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    if (expectedHash !== hash) return '';

    const userRaw = String(params.get('user') || '').trim();
    if (!userRaw) return '';
    const user = JSON.parse(userRaw);
    const id = String(user?.id || '').trim();
    return /^[0-9]{5,20}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function parseTelegramIdFromInitDataUnsafe(initData) {
  const raw = String(initData || '').trim();
  if (!raw) return '';
  try {
    const params = new URLSearchParams(raw);
    const userRaw = String(params.get('user') || '').trim();
    if (!userRaw) return '';
    const user = JSON.parse(userRaw);
    const id = String(user?.id || '').trim();
    return /^[0-9]{5,20}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function resolveTelegramUserIdFromBody(body, { preferStoreToken = false, storeRow = null, allowUnverified = false } = {}) {
  const direct = String(body?.telegramUserId || '').trim();
  if (/^[0-9]{5,20}$/.test(direct)) return direct;

  const initData = String(body?.telegramInitData || '').trim();
  if (!initData) return '';

  // Для auth mini app главный источник подписи — токен admin-бота.
  const fromAdmin = parseTelegramIdFromInitData(initData, ADMIN_BOT_TOKEN);
  if (fromAdmin) return fromAdmin;

  if (preferStoreToken && storeRow) {
    const storeTokens = getStoreTelegramBotTokens(storeRow);
    for (const storeToken of storeTokens) {
      const fromStore = parseTelegramIdFromInitData(initData, storeToken);
      if (fromStore) return fromStore;
    }
  }
  if (allowUnverified) {
    const loose = parseTelegramIdFromInitDataUnsafe(initData);
    if (loose) return loose;
  }
  return '';
}

async function validateTelegramBotToken(token) {
  const trimmed = String(token || '').trim();
  if (!trimmed) return { ok: false, error: 'BOT_TOKEN_REQUIRED' };
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(trimmed)}/getMe`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'BOT_TOKEN_INVALID' };
    const user = payload.result || {};
    return { ok: true, username: user.username ? `@${user.username}` : '' };
  } catch {
    return { ok: false, error: 'BOT_TOKEN_VALIDATION_FAILED' };
  }
}

async function configureTelegramBotMenu(botToken, storeId) {
  const base = resolveCatalogBaseFromEnv();
  if (!base) return { ok: false, skipped: true, reason: 'WEBAPP_URL_NOT_CONFIGURED' };
  const webAppUrl = appendWebAppVersion(`${base}/store/${encodeURIComponent(storeId)}`);
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Открыть каталог',
          web_app: { url: webAppUrl },
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SET_MENU_BUTTON_FAILED' };
    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Открыть каталог' },
        ],
      }),
    }).catch(() => null);
    return { ok: true, webAppUrl };
  } catch {
    return { ok: false, error: 'SET_MENU_BUTTON_FAILED' };
  }
}

async function configureTelegramBotWebhook(botToken, storeId, webhookSecret, apiBase) {
  const base = String(apiBase || '').trim().replace(/\/$/, '');
  if (!base) return { ok: false, skipped: true, reason: 'PUBLIC_API_BASE_NOT_CONFIGURED' };
  const hookUrl = `${base}/api/telegram/webhook/${encodeURIComponent(storeId)}`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: hookUrl,
        secret_token: webhookSecret,
        allowed_updates: ['message'],
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SET_WEBHOOK_FAILED' };
    return { ok: true, webhookUrl: hookUrl };
  } catch {
    return { ok: false, error: 'SET_WEBHOOK_FAILED' };
  }
}

async function deleteTelegramBotWebhook(botToken) {
  const safeToken = String(botToken || '').trim();
  if (!safeToken) return { ok: false, skipped: true, reason: 'BOT_TOKEN_REQUIRED' };
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(safeToken)}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: false }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'DELETE_WEBHOOK_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'DELETE_WEBHOOK_FAILED' };
  }
}

async function configureAdminBotWebhook(apiBase) {
  if (!ADMIN_BOT_TOKEN) return { ok: false, skipped: true, reason: 'ADMIN_BOT_NOT_CONFIGURED' };
  const base = String(apiBase || '').trim().replace(/\/$/, '');
  if (!base) return { ok: false, skipped: true, reason: 'PUBLIC_API_BASE_NOT_CONFIGURED' };
  const hookUrl = `${base}/api/telegram/admin/webhook`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(ADMIN_BOT_TOKEN)}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: hookUrl,
        secret_token: ADMIN_BOT_WEBHOOK_SECRET || undefined,
        allowed_updates: ['message', 'my_chat_member'],
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SET_ADMIN_WEBHOOK_FAILED' };

    const adminUrl = getAdminMiniAppUrl();
    if (adminUrl) {
      await fetch(`https://api.telegram.org/bot${encodeURIComponent(ADMIN_BOT_TOKEN)}/setChatMenuButton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_button: {
            type: 'web_app',
            text: 'Открыть админку',
            web_app: { url: adminUrl },
          },
        }),
      }).catch(() => null);
    }

    await fetch(`https://api.telegram.org/bot${encodeURIComponent(ADMIN_BOT_TOKEN)}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Открыть панель управления' },
          { command: 'instruction', description: 'Инструкция по регистрации и настройке' },
        ],
      }),
    }).catch(() => null);

    return { ok: true, webhookUrl: hookUrl };
  } catch {
    return { ok: false, error: 'SET_ADMIN_WEBHOOK_FAILED' };
  }
}

async function sendStoreCatalogKeyboard(botToken, chatId, storeId, isOwner = false, storeRow = null) {
  const base = resolveCatalogBaseFromEnv();
  if (!base) return { ok: false, error: 'WEBAPP_URL_NOT_CONFIGURED' };
  const webAppUrl = appendWebAppVersion(`${base}/store/${encodeURIComponent(storeId)}`);
  const settings = getStoreSettings(storeRow);
  const ownerNote = isOwner ? '\n\nДля админки используйте ваш Bot ID + пароль в Admin mini app.' : '';
  const welcomeTextRaw = String(settings?.botWelcomeText || '').trim();
  const welcomeText = welcomeTextRaw ? `${welcomeTextRaw}${ownerNote}` : '';
  const welcomeImage = String(settings?.botWelcomeImage || '').trim();
  const inlineKeyboard = {
    inline_keyboard: [[{ text: 'Открыть каталог', web_app: { url: webAppUrl } }]],
  };
  try {
    if (welcomeImage) {
      const photoResp = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: String(chatId || '').trim(),
          photo: welcomeImage,
          caption: welcomeText ? welcomeText.slice(0, 1024) : undefined,
          reply_markup: inlineKeyboard,
        }),
      });
      const photoPayload = await photoResp.json().catch(() => ({}));
      if (!photoResp.ok || !photoPayload?.ok) return { ok: false, error: 'SEND_START_PHOTO_FAILED' };
      return { ok: true };
    }

    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId || '').trim(),
        text: welcomeText || 'Открыть каталог',
        reply_markup: inlineKeyboard,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SEND_START_KEYBOARD_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'SEND_START_KEYBOARD_FAILED' };
  }
}

function buildOrderNotificationText(storeRow, orderPayload) {
  const customer = orderPayload.customer || {};
  const items = Array.isArray(orderPayload.items) ? orderPayload.items : [];
  const itemsText = items.slice(0, 25).map((it) => {
    const title = String(it?.title || 'Товар');
    const qty = Number(it?.qty || 1);
    const price = Number(it?.price || 0);
    const pricePart = price > 0 ? `${price.toLocaleString('ru-RU')} ₽` : 'по запросу';
    return `• ${title} × ${qty} (${pricePart})`;
  }).join('\n');

  const text = [
    `🛒 Новый заказ (${storeRow.store_id})`,
    `ID: ${orderPayload.id}`,
    `Сумма: ${Number(orderPayload.total || 0).toLocaleString('ru-RU')} ₽`,
    `Имя: ${customer.name || '—'}`,
    `Телефон: ${customer.phone || '—'}`,
    `Email: ${customer.email || '—'}`,
    `Telegram ID: ${customer.telegramId || orderPayload.telegramUserId || '—'}`,
    customer.deliveryType ? `Получение: ${customer.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}` : '',
    customer.deliveryAddress ? `Адрес: ${customer.deliveryAddress}` : '',
    itemsText ? `\nТовары:\n${itemsText}` : '',
  ].filter(Boolean).join('\n');
  return text;
}

function buildOrderNotificationTemplateValues(storeRow, orderPayload, messageText = '') {
  const customer = orderPayload.customer || {};
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
    telegram_user_id: String(customer?.telegramId || orderPayload?.telegramUserId || '').trim(),
    message: String(messageText || '').trim(),
  };
}

function buildOrderMessengerRedirectUrl(targetTemplate, values) {
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

async function notifyOrderViaTelegram(storeRow, orderPayload, { chatIdOverride = '' } = {}) {
  const token = decryptBotToken(storeRow.bot_token_enc);
  if (!token) return { ok: false, skipped: true, reason: 'BOT_NOT_CONNECTED' };
  const settings = getStoreSettings(storeRow);
  const chatId = normalizeTelegramChatId(chatIdOverride) || resolveOrderRequestChatIdFromSettings(settings);
  if (!chatId) return { ok: false, skipped: true, reason: 'CHAT_ID_NOT_CONFIGURED' };
  const text = buildOrderNotificationText(storeRow, orderPayload);

  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {
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
  const text = buildOrderNotificationText(storeRow, orderPayload);
  const payload = {
    type: 'order_request',
    storeId: String(storeRow?.store_id || '').trim(),
    orderId: String(orderPayload?.id || '').trim(),
    order: orderPayload,
    message: text,
    createdAt: nowIso(),
  };
  try {
    const response = await fetch(endpoint, {
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

async function notifyOrderRequest(storeRow, orderPayload) {
  const settings = getStoreSettings(storeRow);
  const config = resolveOrderRequestChannelConfig(settings);
  if (config.channelType === 'telegram_chat') {
    return notifyOrderViaTelegram(storeRow, orderPayload, { chatIdOverride: config.target });
  }
  if (config.channelType === 'webhook') {
    return notifyOrderViaWebhook(config.target, storeRow, orderPayload);
  }
  const message = buildOrderNotificationText(storeRow, orderPayload);
  const values = buildOrderNotificationTemplateValues(storeRow, orderPayload, message);
  const redirectUrl = buildOrderMessengerRedirectUrl(config.target, values);
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

async function notifyResetCodeViaAdminBot(ownerTelegramId, storeId, code) {
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED' };
  const chatId = String(ownerTelegramId || '').trim();
  if (!chatId) return { ok: false, error: 'OWNER_TELEGRAM_ID_NOT_FOUND' };
  const text = [
    `Восстановление пароля магазина ${storeId}`,
    `Код: ${code}`,
    'Код действует 10 минут.',
    'Если это были не вы — проигнорируйте сообщение.',
  ].join('\n');
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(ADMIN_BOT_TOKEN)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'RESET_CODE_SEND_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'RESET_CODE_SEND_FAILED' };
  }
}

async function notifySubscriptionViaAdminBot(ownerTelegramId, text) {
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED' };
  const chatId = String(ownerTelegramId || '').trim();
  if (!chatId) return { ok: false, error: 'OWNER_TELEGRAM_ID_NOT_FOUND' };
  const sent = await sendTelegramTextByToken(ADMIN_BOT_TOKEN, chatId, String(text || '').trim(), {
    reply_markup: getAdminStartKeyboard(),
  });
  if (sent.ok) return sent;
  queueAdminMessage({
    telegramUserId: chatId,
    text: String(text || '').trim(),
    payload: { chatId, extra: { reply_markup: getAdminStartKeyboard() } },
  });
  return sent;
}

async function sendTelegramTextByToken(token, chatId, text, extra = {}) {
  const safeToken = String(token || '').trim();
  const safeChat = String(chatId || '').trim();
  if (!safeToken) return { ok: false, error: 'BOT_TOKEN_REQUIRED' };
  if (!safeChat) return { ok: false, error: 'CHAT_ID_REQUIRED' };
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(safeToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: safeChat,
        text,
        disable_web_page_preview: true,
        ...extra,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SEND_FAILED', description: String(payload?.description || '') };
    return { ok: true };
  } catch {
    return { ok: false, error: 'SEND_FAILED' };
  }
}

async function flushPendingAdminMessages(telegramUserId = '') {
  if (!ADMIN_BOT_TOKEN) return { ok: false, flushed: 0, reason: 'ADMIN_BOT_NOT_CONFIGURED' };
  const uid = String(telegramUserId || '').trim();
  const rows = uid
    ? db.prepare(`
        SELECT id, text, payload_json
        FROM pending_admin_messages
        WHERE telegram_user_id = ? AND status = 'pending'
        ORDER BY id ASC
        LIMIT 30
      `).all(uid)
    : db.prepare(`
        SELECT id, text, payload_json
        FROM pending_admin_messages
        WHERE status = 'pending'
        ORDER BY id ASC
        LIMIT 30
      `).all();
  let flushed = 0;
  for (const row of rows) {
    const payload = safeJsonParse(row?.payload_json || '{}', {});
    // eslint-disable-next-line no-await-in-loop
    const sent = await sendTelegramTextByToken(
      ADMIN_BOT_TOKEN,
      uid || payload?.chatId || '',
      String(row?.text || ''),
      payload?.extra && typeof payload.extra === 'object' ? payload.extra : {},
    );
    markPendingAdminMessageResult(row.id, Boolean(sent?.ok), String(sent?.error || 'SEND_FAILED'));
    if (sent?.ok) flushed += 1;
  }
  return { ok: true, flushed };
}

function getAdminMiniAppUrl() {
  const base = resolveCatalogBaseFromEnv();
  if (!base) return '';
  const url = new URL(`${base}/`);
  url.searchParams.set('admin', '1');
  return appendWebAppVersion(url.toString());
}

function getAdminStartKeyboard() {
  const adminUrl = getAdminMiniAppUrl();
  const row = [];
  if (adminUrl) {
    row.push({ text: 'Открыть админку', web_app: { url: adminUrl } });
  }
  row.push({ text: 'Инструкция' });
  return {
    keyboard: [row],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function getAdminBotIntroText() {
  return [
    'ADMIN KATALOG BOT',
    '',
    'Этот бот управляет вашей SaaS-витриной.',
    'Здесь вы получаете Bot ID магазина и быстрый вход в admin mini app.',
    '',
    'Нажмите «Инструкция», чтобы открыть пошаговое руководство.',
  ].join('\n');
}

function getAdminBotInstructionsText() {
  return [
    'ИНСТРУКЦИЯ',
    '',
    '1) Регистрация магазина и подключение бота',
    '• Откройте Admin mini app и выберите «Регистрация».',
    '• Введите bot token вашего магазина и пароль.',
    '• Где взять bot token:',
    '  1. Откройте @BotFather в Telegram.',
    '  2. Команда /newbot -> задайте имя и username бота.',
    '  3. BotFather выдаст token вида 123456:ABC...',
    '  4. Скопируйте token без пробелов и вставьте в регистрацию.',
    '• После регистрации система выдаст Bot ID (6 символов).',
    '• Для входа в админку используйте: Bot ID + пароль.',
    '',
    '2) Как редактировать внутри админки',
    '• Главная: баннеры, статьи, блоки акций/популярного.',
    '• Каталог: категории и товары.',
    '• Карточка товара: фото, заголовок, описание, характеристики, цены.',
    '• Управление:',
    '  - кнопка «+» добавляет новый элемент по шаблону;',
    '  - двойной тап по тексту — редактирование текста;',
    '  - зажатие элемента — действия (открыть/редактировать/удалить);',
    '  - стрелки перемещают выбранные блоки.',
    '• После изменений нажмите «Выгрузить в каталог», чтобы публикация появилась в клиентском каталоге.',
  ].join('\n');
}

async function sendAdminBotStartMessage(chatId) {
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED' };
  return sendTelegramTextByToken(ADMIN_BOT_TOKEN, chatId, getAdminBotIntroText(), {
    reply_markup: getAdminStartKeyboard(),
  });
}

async function sendAdminBotInstructions(chatId) {
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED' };
  return sendTelegramTextByToken(ADMIN_BOT_TOKEN, chatId, getAdminBotInstructionsText(), {
    reply_markup: getAdminStartKeyboard(),
  });
}

async function sendAdminChatIdHint(chatId, chatTitle = '') {
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED' };
  const normalizedChatId = String(chatId || '').trim();
  if (!normalizedChatId) return { ok: false, error: 'CHAT_ID_REQUIRED' };
  const title = String(chatTitle || '').trim();
  const text = [
    'Чат для заявок подключен.',
    title ? `Чат: ${title}` : '',
    `Chat ID: ${normalizedChatId}`,
    '',
    'Скопируйте Chat ID и вставьте в админке:',
    'Профиль -> Уведомления о заказах в чат -> поле Chat ID Telegram.',
  ].filter(Boolean).join('\n');
  return sendTelegramTextByToken(ADMIN_BOT_TOKEN, normalizedChatId, text);
}

async function notifyBotIdToOwner({ ownerTelegramId, storeId, botUsername = '', catalogUrl = '' }) {
  const chatId = String(ownerTelegramId || '').trim();
  if (!chatId) return { ok: false, error: 'OWNER_TELEGRAM_ID_NOT_FOUND', via: '' };
  const text = [
    'Регистрация магазина выполнена.',
    `Ваш Bot ID: ${storeId}`,
    botUsername ? `Подключён бот: ${botUsername}` : '',
    catalogUrl ? `Ссылка на каталог: ${catalogUrl}` : '',
    '',
    'Для входа в админку используйте Bot ID + пароль.',
  ].filter(Boolean).join('\n');
  if (!ADMIN_BOT_TOKEN) return { ok: false, error: 'ADMIN_BOT_NOT_CONFIGURED', via: '' };
  const extra = { reply_markup: getAdminStartKeyboard() };
  const sentByAdmin = await sendTelegramTextByToken(ADMIN_BOT_TOKEN, chatId, text, extra);
  if (sentByAdmin.ok) return { ok: true, via: 'admin_bot' };
  queueAdminMessage({
    storeId,
    telegramUserId: chatId,
    text,
    payload: { chatId, extra },
  });
  return { ok: false, error: 'BOT_ID_SEND_FAILED', via: '' };
}

app.post('/api/owner/stores', ownerMiddleware, (req, res) => {
  const requestedStoreId = String(req.body?.storeId || '').trim().toUpperCase();
  const storeId = requestedStoreId || uniqueStoreId();
  const storeName = String(req.body?.storeName || 'New Store').trim();
  const ownerUserId = String(req.body?.ownerUserId || '').trim();
  const ownerEmail = String(req.body?.ownerEmail || '').trim().toLowerCase();

  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const exists = getStoreRow(storeId);
  if (exists) return res.status(409).json({ error: 'STORE_ALREADY_EXISTS' });

  const inviteCode = randomInviteCode();
  const ts = nowIso();
  const dataset = buildDefaultDataset();
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(18).toString('hex'), 10);

  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, owner_user_id, password_hash, invite_code, is_active, settings_json, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName || 'New Store',
    ownerEmail,
    ownerUserId,
    placeholderHash,
    inviteCode,
    JSON.stringify(dataset.settings || {}),
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    ts,
    ts,
  );

  replaceCategoriesTx(storeId, dataset.categories);
  replaceProductsTx(storeId, dataset.products);
  ensureStoreSubscriptionRow(storeId, ts);
  if (ownerUserId) upsertStoreUser(storeId, ownerUserId, 'owner');
  if (ownerEmail) upsertStoreUser(storeId, `email:${ownerEmail}`, 'owner');

  return res.json({ ok: true, storeId, inviteCode, active: false });
});

app.post('/api/auth/activate', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const inviteCode = String(req.body?.inviteCode || '').trim().toUpperCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  const storeName = String(req.body?.storeName || '').trim();
  const identity = userIdentityFromRequest(req.body);

  if (!isValidStoreId(storeId) || !inviteCode || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_ACTIVATE_PAYLOAD' });
  }
  const row = getStoreRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) === 1) return res.status(409).json({ error: 'STORE_ALREADY_ACTIVE' });
  if (String(row.invite_code || '').toUpperCase() !== inviteCode) return res.status(401).json({ error: 'WRONG_INVITE_CODE' });

  const hash = bcrypt.hashSync(password, 10);
  const ts = nowIso();
  db.prepare(`
    UPDATE stores
    SET owner_email = COALESCE(NULLIF(?, ''), owner_email),
        owner_user_id = COALESCE(NULLIF(?, ''), owner_user_id),
        password_hash = ?,
        invite_code = '',
        is_active = 1,
        store_name = COALESCE(NULLIF(?, ''), store_name),
        updated_at = ?
    WHERE store_id = ?
  `).run(email, identity, hash, storeName, ts, storeId);

  if (identity) upsertStoreUser(storeId, identity, 'owner');
  if (email) upsertStoreUser(storeId, `email:${email}`, 'owner');
  activateStoreTrialIfNeeded(storeId);

  return res.json({ ok: true, storeId, active: true });
});

app.post('/api/auth/register-by-store', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const password = String(req.body?.password || '').trim();
  const identity = userIdentityFromRequest(req.body);
  if (!isValidStoreId(storeId) || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_BY_STORE_PAYLOAD' });
  }

  const row = getStoreRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) === 1) return res.status(409).json({ error: 'STORE_ALREADY_ACTIVE' });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    UPDATE stores
    SET password_hash = ?,
        owner_user_id = COALESCE(NULLIF(?, ''), owner_user_id),
        invite_code = '',
        is_active = 1,
        updated_at = ?
    WHERE store_id = ?
  `).run(hash, identity, nowIso(), storeId);

  if (identity) upsertStoreUser(storeId, identity, 'owner');
  activateStoreTrialIfNeeded(storeId);
  return res.json({ ok: true, storeId, active: true });
});

app.post('/api/auth/register-by-bot', async (req, res) => {
  const botToken = String(req.body?.botToken || '').trim();
  const password = String(req.body?.password || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  let identity = userIdentityFromRequest(req.body, { allowUnverified: true });
  const storeNameRaw = String(req.body?.storeName || '').trim();

  if (!botToken || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_BY_BOT_PAYLOAD' });
  }
  let ownerTelegramId = telegramIdFromIdentity(identity);
  if (!ownerTelegramId) {
    const recentTelegramId = resolveRecentAdminTelegramId(0);
    if (recentTelegramId) {
      ownerTelegramId = recentTelegramId;
      identity = `tg:${recentTelegramId}`;
    }
  }

  const validation = await validateTelegramBotToken(botToken);
  if (!validation.ok) return res.status(400).json({ error: validation.error || 'BOT_TOKEN_INVALID' });
  const botUsername = String(validation.username || '').trim();

  const storeId = uniqueStoreId();
  const catalogUrl = getStoreCatalogUrl(storeId, req);
  const webhookSecret = crypto.randomBytes(16).toString('hex');
  let sent = { ok: false, via: '', error: 'OWNER_TELEGRAM_ID_NOT_FOUND' };
  if (ownerTelegramId) {
    sent = await notifyBotIdToOwner({
      ownerTelegramId,
      storeId,
      botUsername,
      catalogUrl,
    });
    if (!sent.ok) {
      return res.status(500).json({ error: sent.error || 'BOT_ID_SEND_FAILED' });
    }
  }

  const dataset = buildDefaultDataset();
  const hash = bcrypt.hashSync(password, 10);
  const ts = nowIso();
  const storeName = storeNameRaw || (botUsername ? `Store ${botUsername}` : 'New Store');

  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, owner_user_id, password_hash, invite_code, is_active, bot_token_enc, bot_username, bot_webhook_secret, settings_json, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '', 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName,
    email,
    identity,
    hash,
    encryptBotToken(botToken),
    botUsername,
    webhookSecret,
    JSON.stringify({}),
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    ts,
    ts,
  );

  replaceCategoriesTx(storeId, dataset.categories);
  replaceProductsTx(storeId, dataset.products);
  ensureStoreSubscriptionRow(storeId, ts);
  if (identity) upsertStoreUser(storeId, identity, 'owner');
  if (email) upsertStoreUser(storeId, `email:${email}`, 'owner');
  createCatalogConnectionRecord({
    storeId,
    platform: 'telegram',
    title: normalizeCatalogConnectionTitle('', 'telegram', botUsername || 'Telegram бот'),
    botIdentifier: botUsername,
    botUsername,
    botTokenEnc: encryptBotToken(botToken),
    webhookSecret,
    meta: { createdBy: 'register-by-bot' },
  });
  syncLegacyStoreBotColumns(storeId);

  const apiBase = resolvePublicApiBase(req);
  const menuSetup = await configureTelegramBotMenu(botToken, storeId);
  const webhookSetup = await configureTelegramBotWebhook(botToken, storeId, webhookSecret, apiBase);
  const onboarding = ownerTelegramId
    ? await sendStoreCatalogKeyboard(botToken, ownerTelegramId, storeId, true)
    : { ok: false, skipped: true, reason: 'OWNER_TELEGRAM_ID_NOT_FOUND' };
  return res.json({
    ok: true,
    storeId,
    botId: storeId,
    catalogUrl,
    storeUrl: catalogUrl,
    botUsername,
    menuSetup,
    webhookSetup,
    onboarding,
    botIdSent: Boolean(sent.ok),
    botIdSentVia: sent.via || '',
    botIdSendError: sent.ok ? '' : String(sent.error || ''),
  });
});

app.post('/api/auth/register', (req, res) => {
  const storeName = String(req.body?.storeName || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  const identity = userIdentityFromRequest(req.body);

  if (!storeName || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_PAYLOAD' });
  }

  const storeId = uniqueStoreId();
  const dataset = buildDefaultDataset();
  const hash = bcrypt.hashSync(password, 10);
  const ts = nowIso();

  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, owner_user_id, password_hash, invite_code, is_active, settings_json, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '', 1, ?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName,
    email,
    identity,
    hash,
    JSON.stringify(dataset.settings || {}),
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    ts,
    ts,
  );

  replaceCategoriesTx(storeId, dataset.categories);
  replaceProductsTx(storeId, dataset.products);
  ensureStoreSubscriptionRow(storeId, ts);
  if (identity) upsertStoreUser(storeId, identity, 'owner');
  if (email) upsertStoreUser(storeId, `email:${email}`, 'owner');

  return res.json({ ok: true, storeId });
});

app.post('/api/auth/login', (req, res) => {
  const storeId = String(req.body?.storeId || req.body?.botId || '').trim().toUpperCase();
  const password = String(req.body?.password || '').trim();
  const identity = userIdentityFromRequest(req.body);

  if (!isValidStoreId(storeId) || !password) return res.status(400).json({ error: 'INVALID_LOGIN_PAYLOAD' });
  const row = getStoreRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'WRONG_PASSWORD' });

  const fallbackIdentity = identity || (row.owner_user_id ? String(row.owner_user_id) : (row.owner_email ? `email:${String(row.owner_email).toLowerCase()}` : ''));
  const token = createSession(storeId, fallbackIdentity);
  if (fallbackIdentity) upsertStoreUser(storeId, fallbackIdentity, 'owner');

  const stores = fallbackIdentity
    ? db.prepare(`
        SELECT s.store_id, s.store_name
        FROM stores s
        JOIN store_users su ON su.store_id = s.store_id
        WHERE su.user_id = ? AND s.is_active = 1
        ORDER BY s.created_at ASC
      `).all(fallbackIdentity).map((s) => ({
        storeId: s.store_id,
        storeName: s.store_name,
        catalogUrl: getStoreCatalogUrl(s.store_id, req),
      }))
    : [{ storeId, storeName: row.store_name, catalogUrl: getStoreCatalogUrl(storeId, req) }];

  return res.json({ ok: true, token, storeId, botId: storeId, catalogUrl: getStoreCatalogUrl(storeId, req), stores });
});

app.post('/api/auth/password-reset/request', async (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const telegramUserId = resolveTelegramUserIdFromBody(req.body);
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const row = getStoreRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });

  let ownerTelegramId = resolveOwnerTelegramId(row);
  if (!ownerTelegramId) {
    const recentOwnerId = resolveRecentAdminTelegramId(0);
    if (recentOwnerId) {
      ownerTelegramId = recentOwnerId;
      db.prepare('UPDATE stores SET owner_user_id = ?, updated_at = ? WHERE store_id = ?')
        .run(`tg:${recentOwnerId}`, nowIso(), storeId);
      upsertStoreUser(storeId, `tg:${recentOwnerId}`, 'owner');
    }
  }
  // Авто-восстановление owner telegram id для старых магазинов:
  // если owner_user_id пуст, но текущий tg уже привязан как owner в store_users.
  if (!ownerTelegramId && telegramUserId) {
    const ownerLink = db.prepare(`
      SELECT 1 AS ok
      FROM store_users
      WHERE store_id = ? AND user_id = ? AND role = 'owner'
      LIMIT 1
    `).get(storeId, `tg:${telegramUserId}`);
    if (ownerLink?.ok) {
      ownerTelegramId = telegramUserId;
      db.prepare('UPDATE stores SET owner_user_id = ?, updated_at = ? WHERE store_id = ?')
        .run(`tg:${telegramUserId}`, nowIso(), storeId);
    }
  }
  if (!ownerTelegramId) return res.status(400).json({ error: 'OWNER_TELEGRAM_ID_NOT_FOUND' });
  if (!telegramUserId || telegramUserId !== ownerTelegramId) return res.status(403).json({ error: 'FORBIDDEN_OWNER_MISMATCH' });

  const code = generateResetCode();
  const codeHash = hashResetCode(storeId, code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const ts = nowIso();

  db.prepare('UPDATE password_resets SET used = 1 WHERE store_id = ? AND used = 0').run(storeId);
  db.prepare(`
    INSERT INTO password_resets (store_id, code_hash, expires_at, used, attempts, created_at)
    VALUES (?, ?, ?, 0, 0, ?)
  `).run(storeId, codeHash, expiresAt, ts);

  const notify = await notifyResetCodeViaAdminBot(ownerTelegramId, storeId, code);
  if (!notify.ok) return res.status(500).json({ error: notify.error || 'RESET_CODE_SEND_FAILED' });
  return res.json({ ok: true });
});

app.post('/api/auth/password-reset/confirm', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const code = String(req.body?.code || '').trim();
  const newPassword = String(req.body?.newPassword || '').trim();
  const telegramUserId = resolveTelegramUserIdFromBody(req.body);

  if (!isValidStoreId(storeId) || !/^[0-9]{6}$/.test(code) || newPassword.length < 6) {
    return res.status(400).json({ error: 'INVALID_RESET_PAYLOAD' });
  }
  const store = getStoreRow(storeId);
  if (!store) return res.status(404).json({ error: 'STORE_NOT_FOUND' });

  const ownerTelegramId = resolveOwnerTelegramId(store);
  if (!ownerTelegramId || !telegramUserId || telegramUserId !== ownerTelegramId) {
    return res.status(403).json({ error: 'FORBIDDEN_OWNER_MISMATCH' });
  }

  const resetRow = db.prepare(`
    SELECT id, code_hash, expires_at, used, attempts
    FROM password_resets
    WHERE store_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(storeId);
  if (!resetRow || Number(resetRow.used || 0) === 1) return res.status(400).json({ error: 'RESET_CODE_NOT_FOUND' });
  if (new Date(String(resetRow.expires_at || 0)).getTime() < Date.now()) {
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRow.id);
    return res.status(400).json({ error: 'RESET_CODE_EXPIRED' });
  }

  const expectedHash = hashResetCode(storeId, code);
  if (expectedHash !== String(resetRow.code_hash || '')) {
    const attempts = Number(resetRow.attempts || 0) + 1;
    const used = attempts >= 5 ? 1 : 0;
    db.prepare('UPDATE password_resets SET attempts = ?, used = ? WHERE id = ?').run(attempts, used, resetRow.id);
    return res.status(401).json({ error: used ? 'RESET_CODE_BLOCKED' : 'RESET_CODE_INVALID' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  const ts = nowIso();
  db.prepare('UPDATE stores SET password_hash = ?, updated_at = ? WHERE store_id = ?').run(hash, ts, storeId);
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRow.id);
  return res.json({ ok: true, storeId });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });

  let stores = [{ storeId: row.store_id, storeName: row.store_name, catalogUrl: getStoreCatalogUrl(row.store_id, req) }];
  if (req.auth.userId) {
    stores = db.prepare(`
      SELECT s.store_id, s.store_name
      FROM stores s
      JOIN store_users su ON su.store_id = s.store_id
      WHERE su.user_id = ? AND s.is_active = 1
      ORDER BY s.created_at ASC
    `).all(req.auth.userId).map((s) => ({
      storeId: s.store_id,
      storeName: s.store_name,
      catalogUrl: getStoreCatalogUrl(s.store_id, req),
    }));
  }

  let telegramProfile = null;
  const authUserId = String(req.auth.userId || '').trim();
  if (authUserId.startsWith('tg:')) {
    const tgUserId = authUserId.slice(3).trim();
    const tgUser = getAdminTelegramUserById(tgUserId);
    if (tgUser) {
      telegramProfile = {
        id: String(tgUser.user_id || ''),
        username: String(tgUser.username || ''),
        firstName: String(tgUser.first_name || ''),
        chatId: String(tgUser.chat_id || ''),
        lastSeenAt: String(tgUser.last_seen_at || ''),
      };
    } else {
      telegramProfile = { id: tgUserId, username: '', firstName: '' };
    }
  }

  return res.json({
    ok: true,
    storeId: row.store_id,
    storeName: row.store_name,
    email: row.owner_email,
    isActive: Number(row.is_active || 0) === 1,
    subscription: getStoreSubscriptionState(row.store_id),
    userId: req.auth.userId || '',
    telegramProfile,
    stores,
  });
});

app.get('/api/subscription/status', authMiddleware, (req, res) => {
  const storeId = String(req.query?.storeId || req.auth.storeId || '').trim().toUpperCase();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  if (req.auth.userId) {
    if (!hasStoreAccess(req.auth.userId, storeId)) return res.status(403).json({ error: 'FORBIDDEN' });
  } else if (storeId !== String(req.auth.storeId || '').trim().toUpperCase()) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  return res.json({ ok: true, storeId, subscription: getStoreSubscriptionState(storeId) });
});

app.get('/api/subscription/payment-link', authMiddleware, (req, res) => {
  const days = String(req.query?.days || '30').trim();
  const amount = SUBSCRIPTION_TARIFFS[days];
  if (!amount) return res.status(400).json({ error: 'INVALID_TARIFF_DAYS' });
  const fallbackUrl = buildSubscriptionPaymentLink({
    days,
    storeId: req.auth.storeId,
    userId: req.auth.userId,
  });
  if (yookassaConfigured()) {
    return createYookassaSubscriptionPayment({
      storeId: req.auth.storeId,
      userId: req.auth.userId,
      days,
      amount,
      req,
    }).then((created) => {
      if (!created?.ok) return res.status(503).json({ error: created?.error || 'SUBSCRIPTION_PAYMENT_NOT_CONFIGURED' });
      return res.json({
        ok: true,
        url: created.url,
        paymentId: created.paymentId || '',
        tariffDays: Number(days),
        amount,
        storeId: req.auth.storeId,
        provider: 'yookassa',
      });
    });
  }
  if (!fallbackUrl) return res.status(503).json({ error: 'SUBSCRIPTION_PAYMENT_NOT_CONFIGURED' });
  return res.json({
    ok: true,
    url: fallbackUrl,
    tariffDays: Number(days),
    amount,
    storeId: req.auth.storeId,
    provider: 'link',
  });
});

app.post('/api/subscription/yookassa/webhook', async (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const event = String(payload?.event || '').trim();
  const object = payload?.object && typeof payload.object === 'object' ? payload.object : {};
  const paymentId = String(object?.id || '').trim();
  if (!paymentId) return res.json({ ok: true });

  const metadata = object?.metadata && typeof object.metadata === 'object' ? object.metadata : {};
  const storeId = String(metadata?.store_id || metadata?.bot_id || '').trim().toUpperCase();
  const tariffDays = Number(metadata?.tariff_days || 0);
  const amountValue = Number(object?.amount?.value || 0);
  const status = String(object?.status || '').trim();
  const ts = nowIso();

  if (isValidStoreId(storeId)) {
    db.prepare(`
      INSERT INTO subscription_payments (store_id, payment_id, provider, amount, tariff_days, status, payload_json, created_at, updated_at)
      VALUES (?, ?, 'yookassa', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(provider, payment_id) DO UPDATE SET
        status = excluded.status,
        amount = excluded.amount,
        tariff_days = excluded.tariff_days,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      storeId,
      paymentId,
      amountValue,
      Number.isFinite(tariffDays) ? tariffDays : 0,
      status || event || 'pending',
      JSON.stringify(payload),
      ts,
      ts,
    );
  }

  const successEvent = event === 'payment.succeeded' || status === 'succeeded';
  if (!successEvent || !isValidStoreId(storeId) || ![30, 180, 365].includes(tariffDays)) {
    return res.json({ ok: true });
  }

  const current = ensureStoreSubscriptionRow(storeId);
  const nowMs = Date.now();
  const trialEndMs = current?.trial_ends_at ? new Date(String(current.trial_ends_at)).getTime() : 0;
  const paidMs = current?.paid_until ? new Date(String(current.paid_until)).getTime() : 0;
  const baseMs = Math.max(nowMs, trialEndMs || 0, paidMs || 0);
  const nextPaidUntil = new Date(baseMs + tariffDays * 24 * 60 * 60 * 1000).toISOString();
  upsertStoreSubscriptionPaidUntil(storeId, nextPaidUntil);

  const store = getStoreRow(storeId);
  const ownerTelegramId = resolveOwnerTelegramId(store);
  if (ownerTelegramId) {
    const text = [
      `Оплата подписки подтверждена ✅`,
      `Store: ${storeId}`,
      `Тариф: ${tariffDays} дней`,
      `Доступ активен до: ${new Date(nextPaidUntil).toLocaleString('ru-RU')}`,
    ].join('\n');
    await notifySubscriptionViaAdminBot(ownerTelegramId, text);
  }

  return res.json({ ok: true });
});

app.get('/api/admin/stores', authMiddleware, (req, res) => {
  if (req.auth.userId) {
    const stores = db.prepare(`
      SELECT s.store_id, s.store_name, s.bot_username, s.bot_token_enc, s.bot_webhook_secret, s.created_at, s.updated_at
      FROM stores s
      JOIN store_users su ON su.store_id = s.store_id
      WHERE su.user_id = ?
      ORDER BY s.created_at ASC
    `).all(req.auth.userId).map((s) => {
      const summary = getStoreCatalogConnectionSummary(s);
      return {
        storeId: s.store_id,
        storeName: s.store_name,
        botUsername: summary.botUsername || s.bot_username || '',
        catalogUrl: getStoreCatalogUrl(s.store_id, req),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });
    return res.json({ ok: true, stores });
  }

  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  const summary = getStoreCatalogConnectionSummary(row);
  return res.json({
    ok: true,
    stores: [{
      storeId: row.store_id,
      storeName: row.store_name,
      botUsername: summary.botUsername || row.bot_username || '',
      catalogUrl: getStoreCatalogUrl(row.store_id, req),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }],
  });
});

app.post('/api/admin/stores', authMiddleware, (req, res) => {
  const identity = String(req.auth.userId || '').trim();
  if (!identity) return res.status(403).json({ error: 'MULTI_STORE_REQUIRES_USER_ID' });

  const requestedStoreId = String(req.body?.storeId || '').trim().toUpperCase();
  const storeId = requestedStoreId || uniqueStoreId();
  const storeName = String(req.body?.storeName || 'New Store').trim();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  if (getStoreRow(storeId)) return res.status(409).json({ error: 'STORE_ALREADY_EXISTS' });

  const dataset = buildDefaultDataset();
  const ts = nowIso();
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(18).toString('hex'), 10);

  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, owner_user_id, password_hash, invite_code, is_active, settings_json, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, '', ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName || 'New Store',
    identity,
    placeholderHash,
    randomInviteCode(),
    JSON.stringify(dataset.settings || {}),
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    ts,
    ts,
  );

  replaceCategoriesTx(storeId, dataset.categories);
  replaceProductsTx(storeId, dataset.products);
  ensureStoreSubscriptionRow(storeId, ts);
  upsertStoreUser(storeId, identity, 'owner');

  return res.json({ ok: true, storeId, active: false });
});

app.get('/api/admin/stores/:storeId/catalog-bots', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  ensureLegacyStoreCatalogConnection(req.store);
  syncLegacyStoreBotColumns(req.storeId);
  return res.json({
    ok: true,
    storeId: req.storeId,
    catalogUrl: getStoreCatalogUrl(req.storeId, req),
    connections: listStoreCatalogConnections(req.storeId, { req }),
  });
});

app.post('/api/admin/stores/:storeId/catalog-bots', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, async (req, res) => {
  const platform = normalizeCatalogConnectionPlatform(req.body?.platform || 'telegram');
  const title = normalizeCatalogConnectionTitle(req.body?.title || '', platform, req.body?.identifier || '');
  const identifier = normalizeCatalogConnectionIdentifier(req.body?.identifier || '');
  const botToken = String(req.body?.botToken || '').trim();
  const existingRows = listStoreCatalogConnectionRows(req.storeId);

  let validation = { ok: true, username: '' };
  if (platform === 'telegram') {
    if (!botToken || !botToken.includes(':')) {
      return res.status(400).json({ error: 'BOT_TOKEN_REQUIRED' });
    }
    validation = await validateTelegramBotToken(botToken);
    if (!validation.ok) return res.status(400).json({ error: validation.error || 'BOT_TOKEN_INVALID' });
    const normalizedUsername = String(validation.username || '').trim().toLowerCase();
    const hasDuplicate = existingRows.some((row) => (
      normalizeCatalogConnectionPlatform(row.platform) === 'telegram'
      && String(row.bot_username || '').trim().toLowerCase() === normalizedUsername
      && normalizedUsername
    ));
    if (hasDuplicate) return res.status(409).json({ error: 'BOT_ALREADY_CONNECTED' });
  } else if (!identifier) {
    return res.status(400).json({ error: 'BOT_IDENTIFIER_REQUIRED' });
  }

  const normalizedIdentifier = platform === 'telegram'
    ? normalizeCatalogConnectionIdentifier(identifier || validation.username || '')
    : identifier;
  const duplicateExternal = platform !== 'telegram' && existingRows.some((row) => (
    normalizeCatalogConnectionPlatform(row.platform) === platform
    && String(row.bot_identifier || '').trim().toLowerCase() === normalizedIdentifier.toLowerCase()
  ));
  if (duplicateExternal) return res.status(409).json({ error: 'BOT_ALREADY_CONNECTED' });

  const webhookSecret = platform === 'telegram' ? crypto.randomBytes(16).toString('hex') : '';
  const created = createCatalogConnectionRecord({
    storeId: req.storeId,
    platform,
    title,
    botIdentifier: normalizedIdentifier,
    botUsername: String(validation.username || '').trim(),
    botTokenEnc: platform === 'telegram' ? encryptBotToken(botToken) : '',
    webhookSecret,
    meta: { createdBy: 'admin-profile' },
  });
  syncLegacyStoreBotColumns(req.storeId);

  let menuSetup = { ok: false, skipped: true, reason: 'PLATFORM_NOT_TELEGRAM' };
  let webhookSetup = { ok: false, skipped: true, reason: 'PLATFORM_NOT_TELEGRAM' };
  if (platform === 'telegram') {
    menuSetup = await configureTelegramBotMenu(botToken, req.storeId);
    webhookSetup = await configureTelegramBotWebhook(botToken, req.storeId, webhookSecret, resolvePublicApiBase(req));
  }

  return res.json({
    ok: true,
    storeId: req.storeId,
    connection: serializeCatalogConnection(created, { req }),
    botUsername: String(validation.username || '').trim(),
    menuSetup,
    webhookSetup,
    connections: listStoreCatalogConnections(req.storeId, { req }),
  });
});

app.delete('/api/admin/stores/:storeId/catalog-bots/:connectionId', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, async (req, res) => {
  const connectionId = Number(req.params.connectionId || 0);
  if (!Number.isInteger(connectionId) || connectionId <= 0) {
    return res.status(400).json({ error: 'INVALID_CONNECTION_ID' });
  }
  const row = db.prepare(`
    SELECT *
    FROM store_catalog_connections
    WHERE id = ?
      AND store_id = ?
    LIMIT 1
  `).get(connectionId, req.storeId);
  if (!row) return res.status(404).json({ error: 'CONNECTION_NOT_FOUND' });

  const platform = normalizeCatalogConnectionPlatform(row.platform);
  const token = platform === 'telegram' ? decryptBotToken(String(row.bot_token_enc || '')) : '';
  let webhookDelete = { ok: false, skipped: true, reason: 'PLATFORM_NOT_TELEGRAM' };
  if (token) webhookDelete = await deleteTelegramBotWebhook(token);

  db.prepare('DELETE FROM store_catalog_connections WHERE id = ? AND store_id = ?').run(connectionId, req.storeId);
  syncLegacyStoreBotColumns(req.storeId);

  return res.json({
    ok: true,
    storeId: req.storeId,
    removedId: connectionId,
    webhookDelete,
    connections: listStoreCatalogConnections(req.storeId, { req }),
  });
});

app.post('/api/admin/stores/:storeId/bot', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, async (req, res) => {
  const botToken = String(req.body?.botToken || '').trim();
  const hasOrderChatIdField = Boolean(req.body && Object.prototype.hasOwnProperty.call(req.body, 'orderChatId'));
  const orderChatId = normalizeTelegramChatId(req.body?.orderChatId || '');
  const settingsPatch = sanitizeSettingsPatch(req.body?.settings && typeof req.body.settings === 'object' ? req.body.settings : {});
  if (!botToken && !hasOrderChatIdField && !Object.keys(settingsPatch).length) {
    return res.status(400).json({ error: 'BOT_SETTINGS_REQUIRED' });
  }

  let validation = { ok: true, username: '' };
  if (botToken) {
    validation = await validateTelegramBotToken(botToken);
    if (!validation.ok) return res.status(400).json({ error: validation.error });
    const existingRows = listStoreCatalogConnectionRows(req.storeId);
    const normalizedUsername = String(validation.username || '').trim().toLowerCase();
    const hasDuplicate = existingRows.some((row) => (
      normalizeCatalogConnectionPlatform(row.platform) === 'telegram'
      && String(row.bot_username || '').trim().toLowerCase() === normalizedUsername
      && normalizedUsername
    ));
    if (hasDuplicate) return res.status(409).json({ error: 'BOT_ALREADY_CONNECTED' });
  }

  const oldSettings = getStoreSettings(req.store);
  const mergedSettings = {
    ...oldSettings,
    ...settingsPatch,
  };
  if (hasOrderChatIdField) {
    mergedSettings.orderRequestChannelType = 'telegram_chat';
    mergedSettings.orderRequestTarget = '';
    mergedSettings.orderRequestUrl = '';
    mergedSettings.orderRequestWebhookUrl = '';
    mergedSettings.orderRequestLink = '';
    mergedSettings.orderRequestChatId = orderChatId;
    mergedSettings.orderChatId = orderChatId;
    mergedSettings.chatId = orderChatId;
    mergedSettings.telegramChatId = orderChatId;
  }

  db.prepare(`
    UPDATE stores
    SET settings_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    JSON.stringify(mergedSettings),
    nowIso(),
    req.storeId,
  );

  let menuSetup = { ok: false, skipped: true, reason: 'BOT_TOKEN_NOT_CHANGED' };
  let webhookSetup = { ok: false, skipped: true, reason: 'BOT_TOKEN_NOT_CHANGED' };
  if (botToken) {
    const webhookSecret = crypto.randomBytes(16).toString('hex');
    createCatalogConnectionRecord({
      storeId: req.storeId,
      platform: 'telegram',
      title: normalizeCatalogConnectionTitle('', 'telegram', validation.username || 'Telegram бот'),
      botIdentifier: String(validation.username || '').trim(),
      botUsername: String(validation.username || '').trim(),
      botTokenEnc: encryptBotToken(botToken),
      webhookSecret,
      meta: { createdBy: 'legacy-bot-endpoint' },
    });
    syncLegacyStoreBotColumns(req.storeId);
    menuSetup = await configureTelegramBotMenu(botToken, req.storeId);
    webhookSetup = await configureTelegramBotWebhook(botToken, req.storeId, webhookSecret, resolvePublicApiBase(req));
  }

  return res.json({
    ok: true,
    storeId: req.storeId,
    botUsername: String(validation.username || '').trim(),
    menuSetup,
    webhookSetup,
    settings: mergedSettings,
    connections: listStoreCatalogConnections(req.storeId, { req }),
  });
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  const subscription = getStoreSubscriptionState(req.auth.storeId);
  if (!subscription.featureAccess) {
    return res.status(402).json({ error: 'SUBSCRIPTION_REQUIRED', storeId: req.auth.storeId, subscription });
  }
  return res.json(rowToDataset(row));
});

app.put('/api/admin/data', authMiddleware, (req, res) => {
  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  const subscription = getStoreSubscriptionState(req.auth.storeId);
  if (!subscription.featureAccess) {
    return res.status(402).json({ error: 'SUBSCRIPTION_REQUIRED', storeId: req.auth.storeId, subscription });
  }

  const config = req.body?.config;
  const settings = req.body?.settings;
  const categories = req.body?.categories;
  const products = req.body?.products;
  if (!config || !Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'INVALID_DATASET' });
  }

  persistStoreDataset(req.auth.storeId, row, { config, settings, categories, products });

  return res.json({ ok: true, storeId: req.auth.storeId });
});

app.get('/api/stores/:storeId/admin/data', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  return res.json(rowToDataset(req.store));
});

app.put('/api/stores/:storeId/admin/data', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const config = req.body?.config;
  const settings = req.body?.settings;
  const categories = req.body?.categories;
  const products = req.body?.products;
  if (!config || !Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'INVALID_DATASET' });
  }

  persistStoreDataset(req.storeId, req.store, { config, settings, categories, products });

  return res.json({ ok: true, storeId: req.storeId });
});

app.post('/api/stores/:storeId/admin/import-products/preview', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, productImportUploadMiddleware, (req, res) => {
  try {
    const previewRows = parseProductImportFile(req.file);
    const summary = createImportPreviewSummary(previewRows, listCategories(req.storeId));
    return res.json({
      ok: true,
      storeId: req.storeId,
      fileName: String(req.file?.originalname || ''),
      summary,
      rows: previewRows,
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode || 400);
    return res.status(statusCode).json({ error: String(error?.message || 'IMPORT_PREVIEW_FAILED') });
  }
});

app.post('/api/stores/:storeId/admin/import-products', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, async (req, res) => {
  try {
    const previewRows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!previewRows.length) return res.status(400).json({ error: 'IMPORT_ROWS_REQUIRED' });
    if (previewRows.length > PRODUCT_IMPORT_MAX_ROWS) return res.status(400).json({ error: 'IMPORT_TOO_MANY_ROWS' });
    const result = await importProductsForStore(req.storeId, req.store, previewRows);
    const dataset = rowToDataset(getStoreRow(req.storeId));
    return res.json({
      ok: true,
      storeId: req.storeId,
      result,
      dataset,
    });
  } catch (error) {
    return res.status(400).json({ error: String(error?.message || 'IMPORT_FAILED') });
  }
});

app.get('/api/stores/:storeId/admin/payment-settings', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const settings = getStorePaymentIntegration(req.store, { includeSecret: false, req });
  return res.json({
    ok: true,
    storeId: req.storeId,
    settings,
  });
});

app.put('/api/stores/:storeId/admin/payment-settings', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const provider = normalizePaymentProvider(req.body?.provider || '');
  if (!provider || provider === 'custom_link') return res.status(400).json({ error: 'UNSUPPORTED_PAYMENT_PROVIDER' });
  const accountId = String(req.body?.accountId || req.body?.yookassaShopId || '').trim();
  const secretKey = String(req.body?.secretKey || req.body?.yookassaSecretKey || '').trim();
  const apiUrl = String(req.body?.apiUrl || '').trim();
  const returnUrl = String(getStoreCatalogUrl(req.storeId, req) || '').trim();
  const extra = {};
  if (providerNeedsAccount(provider) && !accountId) return res.status(400).json({ error: 'PAYMENT_ACCOUNT_ID_REQUIRED' });
  if (!returnUrl) return res.status(400).json({ error: 'STORE_CATALOG_URL_REQUIRED' });
  if (apiUrl) {
    try {
      const parsedApi = new URL(apiUrl);
      if (!/^https?:$/i.test(parsedApi.protocol)) throw new Error('INVALID_PROTOCOL');
    } catch {
      return res.status(400).json({ error: 'INVALID_PAYMENT_API_URL' });
    }
  }
  const existingSecretEnc = String(req.store?.payment_secret_enc || req.store?.yookassa_secret_enc || '').trim();
  if (providerNeedsSecret(provider) && !secretKey && !existingSecretEnc) {
    return res.status(400).json({ error: 'PAYMENT_SECRET_REQUIRED' });
  }
  const secretToStore = secretKey ? encryptBotToken(secretKey) : existingSecretEnc;
  const apiToStore = apiUrl || PAYMENT_PROVIDER_DEFAULT_API[provider] || '';
  const accountToStore = accountId;
  db.prepare(`
    UPDATE stores
    SET payment_provider = ?, payment_account_id = ?, payment_secret_enc = ?, payment_api_url = ?, payment_return_url = ?, payment_extra_json = ?, yookassa_shop_id = ?, yookassa_secret_enc = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    provider,
    accountToStore,
    secretToStore,
    apiToStore,
    returnUrl,
    JSON.stringify(extra),
    provider === 'yookassa' ? accountToStore : String(req.store?.yookassa_shop_id || ''),
    provider === 'yookassa' ? secretToStore : String(req.store?.yookassa_secret_enc || ''),
    nowIso(),
    req.storeId,
  );
  const nextStore = getStoreRow(req.storeId);
  const settings = getStorePaymentIntegration(nextStore, { includeSecret: false, req });
  return res.json({
    ok: true,
    storeId: req.storeId,
    settings,
  });
});

app.post('/api/upload-image', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });
  const requestedStoreId = String(req.query?.storeId || req.auth.storeId || '').trim().toUpperCase();
  if (!isValidStoreId(requestedStoreId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const targetStore = getStoreRow(requestedStoreId);
  if (!targetStore) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  const authUserId = String(req.auth?.userId || '').trim();
  if (authUserId) {
    if (!hasStoreAccess(authUserId, requestedStoreId)) return res.status(403).json({ error: 'FORBIDDEN' });
  } else if (String(req.auth?.storeId || '').trim().toUpperCase() !== requestedStoreId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const subscription = getStoreSubscriptionState(requestedStoreId);
  if (!subscription.featureAccess) {
    return res.status(402).json({ error: 'SUBSCRIPTION_REQUIRED', storeId: requestedStoreId, subscription });
  }
  const extByMime = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  const ext = extByMime[req.file.mimetype] || path.extname(req.file.originalname || '') || '.jpg';
  const storeUploadsDir = path.join(UPLOADS_DIR, requestedStoreId);
  fs.mkdirSync(storeUploadsDir, { recursive: true });
  const finalName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const finalPath = path.join(storeUploadsDir, finalName);
  fs.renameSync(req.file.path, finalPath);
  const url = `${req.protocol}://${req.get('host')}/uploads/${requestedStoreId}/${finalName}`;
  return res.json({ ok: true, url });
});

app.get('/api/stores/:storeId/categories', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  return res.json({ ok: true, storeId: req.storeId, categories: listCategories(req.storeId) });
});

app.get('/api/stores/:storeId/products', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  return res.json({ ok: true, storeId: req.storeId, products: listProducts(req.storeId) });
});

app.post('/api/stores/:storeId/events', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  const eventType = String(req.body?.eventType || '').trim();
  const productId = String(req.body?.productId || '').trim();
  const telegramUserId = String(req.body?.telegramUserId || '').trim();
  const sessionId = String(req.body?.sessionId || '').trim();
  const payload = req.body?.payload && typeof req.body.payload === 'object' ? req.body.payload : {};

  if (!eventType) return res.status(400).json({ error: 'EVENT_TYPE_REQUIRED' });
  db.prepare(`
    INSERT INTO events (store_id, event_type, product_id, telegram_user_id, session_id, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.storeId,
    eventType,
    productId,
    telegramUserId,
    sessionId,
    JSON.stringify(payload),
    nowIso(),
  );

  return res.json({ ok: true });
});

app.post('/api/stores/:storeId/orders', storeParamMiddleware, async (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });

  const incoming = req.body?.order && typeof req.body.order === 'object' ? req.body.order : req.body;
  const rawItems = Array.isArray(incoming?.items) ? incoming.items : [];
  const customer = incoming?.customer && typeof incoming.customer === 'object' ? incoming.customer : {};
  if (!rawItems.length) return res.status(400).json({ error: 'ORDER_ITEMS_REQUIRED' });

  const items = rawItems.map((it) => {
    const qtyRaw = Number(it?.qty || 1);
    const qty = Number.isFinite(qtyRaw) ? Math.max(1, Math.round(qtyRaw)) : 1;
    const isRequestPrice = Boolean(it?.isRequestPrice);
    const priceRaw = Number(it?.price || 0);
    const price = !isRequestPrice && Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : 0;
    return {
      ...it,
      qty,
      price,
      isRequestPrice,
    };
  });

  const orderId = String(incoming?.id || `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`);
  const orderNumber = getNextOrderNumber(req.storeId);
  const computedTotal = items.reduce((acc, it) => {
    if (it.isRequestPrice) return acc;
    return acc + (Number(it.price || 0) * Number(it.qty || 1));
  }, 0);
  const total = Number(computedTotal.toFixed(2));
  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ error: 'ORDER_TOTAL_REQUIRED' });
  }
  const telegramUserId = String(
    incoming?.telegramUserId || customer?.telegramId || req.body?.telegramUserId || ''
  ).trim();
  const workflowStatus = normalizeOrderWorkflowStatus(incoming?.status || incoming?.workflowStatus || 'new');
  const createdAt = String(incoming?.createdAt || nowIso());
  const ts = nowIso();

  const saveOrderTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, store_id, telegram_user_id, order_number, status, workflow_status, payment_status, total_amount, currency, customer_json, payload_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, '', ?, 'RUB', ?, ?, ?, ?)
    `).run(
      orderId,
      req.storeId,
      telegramUserId,
      orderNumber,
      workflowStatus,
      workflowStatus,
      total,
      JSON.stringify(customer),
      JSON.stringify(incoming),
      createdAt,
      ts,
    );

    const itemStmt = db.prepare(`
      INSERT INTO order_items (store_id, order_id, product_id, title, qty, price, is_request_price, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    items.forEach((it) => {
      itemStmt.run(
        req.storeId,
        orderId,
        String(it?.id || ''),
        String(it?.title || 'Товар'),
        Math.max(1, Number(it?.qty || 1)),
        Number(it?.price || 0),
        Number(it?.isRequestPrice ? 1 : 0),
        JSON.stringify(it),
        ts,
      );
    });

    db.prepare(`
      INSERT INTO events (store_id, event_type, product_id, telegram_user_id, session_id, payload_json, created_at)
      VALUES (?, 'create_order', '', ?, ?, ?, ?)
    `).run(
      req.storeId,
      telegramUserId,
      String(req.body?.sessionId || ''),
      JSON.stringify({ orderId, total }),
      ts,
    );
  });

  try {
    saveOrderTx();
  } catch {
    return res.status(409).json({ error: 'ORDER_ALREADY_EXISTS' });
  }

  const storeSettings = getStoreSettings(req.store);
  const orderMode = normalizeOrderProcessingMode(storeSettings?.orderProcessingMode || '');
  const orderRequestChannel = resolveOrderRequestChannelConfig(storeSettings);
  const subscription = getStoreSubscriptionState(req.storeId);
  const notify = subscription.notifyOrders
    ? await notifyOrderRequest(req.store, { ...incoming, id: orderId, items, customer, total, telegramUserId })
    : { ok: false, skipped: true, reason: 'SUBSCRIPTION_INACTIVE' };
  let payment = { ok: false, provider: '', url: '', paymentId: '', error: 'PAYMENT_NOT_CONFIGURED' };
  if (subscription.notifyOrders) {
    if (orderMode === 'chat') {
      payment = { ok: false, provider: '', url: '', paymentId: '', error: 'PAYMENT_SKIPPED_CHAT_MODE' };
    } else {
      payment = await createOrderPayment({
        storeRow: req.store,
        orderRow: {
          id: orderId,
          total_amount: total,
          currency: 'RUB',
          telegram_user_id: telegramUserId,
        },
        telegramUserId,
        req,
      });
    }
  } else {
    payment = { ok: false, provider: '', url: '', paymentId: '', error: 'SUBSCRIPTION_INACTIVE' };
  }
  return res.json({
    ok: true,
    orderId,
    orderNumber,
    total,
    status: workflowStatus,
    paymentStatus: payment.ok ? normalizeOrderPaymentStatus(payment?.provider ? 'pending' : '') : '',
    orderMode,
    notification: notify,
    payment,
    chat: {
      configured: Boolean(orderRequestChannel?.target),
      channelType: orderRequestChannel?.channelType || 'telegram_chat',
    },
  });
});

app.get('/api/stores/:storeId/orders/history', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  const telegramUserId = String(req.query?.telegramUserId || '').trim();
  if (!telegramUserId) return res.status(400).json({ error: 'TELEGRAM_USER_ID_REQUIRED' });
  const rows = db.prepare(`
    SELECT id, order_number, telegram_user_id, status, workflow_status, payment_status, total_amount, currency, customer_json, payload_json, created_at, updated_at
    FROM orders
    WHERE store_id = ? AND telegram_user_id = ?
    ORDER BY created_at DESC
    LIMIT 200
  `).all(req.storeId, telegramUserId);
  const sequenceMap = buildOrderSequenceMap(rows);
  const orders = rows.map((row) => hydrateOrderRow(row, sequenceMap));
  return res.json({ ok: true, storeId: req.storeId, telegramUserId, orders });
});

function updateOrderPaymentFromCallback({
  storeId,
  provider,
  paymentId,
  orderId = '',
  status = 'pending',
  amount = 0,
  currency = 'RUB',
  confirmationUrl = '',
  telegramUserId = '',
  payload = {},
}) {
  const normalizedProvider = normalizePaymentProvider(provider);
  const normalizedPaymentId = String(paymentId || '').trim();
  if (!normalizedProvider || !normalizedPaymentId) return { ok: false, reason: 'PAYMENT_ID_REQUIRED' };
  const normalizedStoreId = String(storeId || '').trim().toUpperCase();
  const existing = db.prepare(`
    SELECT order_id
    FROM order_payments
    WHERE provider = ? AND payment_id = ? AND store_id = ?
    LIMIT 1
  `).get(normalizedProvider, normalizedPaymentId, normalizedStoreId);
  const resolvedOrderId = String(existing?.order_id || orderId || '').trim();
  if (!resolvedOrderId) return { ok: false, reason: 'ORDER_NOT_FOUND' };

  const amountValue = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const statusCode = String(status || '').trim().toLowerCase() || 'pending';
  const currencyCode = String(currency || 'RUB').trim().toUpperCase() || 'RUB';
  const ts = nowIso();
  db.prepare(`
    INSERT INTO order_payments (
      store_id, order_id, provider, payment_id, amount, currency, status, confirmation_url, payload_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(provider, payment_id) DO UPDATE SET
      amount = excluded.amount,
      currency = excluded.currency,
      status = excluded.status,
      confirmation_url = excluded.confirmation_url,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(
    normalizedStoreId,
    resolvedOrderId,
    normalizedProvider,
    normalizedPaymentId,
    amountValue,
    currencyCode,
    statusCode,
    String(confirmationUrl || '').trim(),
    JSON.stringify(payload && typeof payload === 'object' ? payload : {}),
    ts,
    ts,
  );

  const successStatuses = new Set(['succeeded', 'success', 'paid', 'authorized', 'confirmed']);
  const failedStatuses = new Set(['failed', 'fail', 'canceled', 'cancelled', 'rejected', 'declined', 'expired']);
  const success = successStatuses.has(statusCode);
  const canceled = failedStatuses.has(statusCode);
  const paymentStatus = success ? 'paid' : (canceled ? 'failed' : 'pending');
  db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ? AND store_id = ?')
    .run(paymentStatus, ts, resolvedOrderId, normalizedStoreId);

  const eventType = success ? 'payment_success' : (canceled ? 'payment_fail' : 'payment_pending');
  db.prepare(`
    INSERT INTO events (store_id, event_type, product_id, telegram_user_id, session_id, payload_json, created_at)
    VALUES (?, ?, '', ?, '', ?, ?)
  `).run(
    normalizedStoreId,
    eventType,
    String(telegramUserId || '').trim(),
    JSON.stringify({ orderId: resolvedOrderId, paymentId: normalizedPaymentId, status: statusCode, amount: amountValue, provider: normalizedProvider }),
    ts,
  );
  return { ok: true, orderId: resolvedOrderId };
}

app.post('/api/stores/:storeId/payments/yookassa/webhook', storeParamMiddleware, (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const event = String(payload?.event || '').trim().toLowerCase();
  const object = payload?.object && typeof payload.object === 'object' ? payload.object : {};
  const paymentId = String(object?.id || '').trim();
  if (!paymentId) return res.json({ ok: true });
  const metadata = object?.metadata && typeof object.metadata === 'object' ? object.metadata : {};
  const metadataStoreId = String(metadata?.store_id || '').trim().toUpperCase();
  if (metadataStoreId && metadataStoreId !== req.storeId) return res.json({ ok: true });
  const status = String(object?.status || '').trim().toLowerCase() || (event === 'payment.succeeded' ? 'succeeded' : 'pending');
  updateOrderPaymentFromCallback({
    storeId: req.storeId,
    provider: 'yookassa',
    paymentId,
    orderId: String(metadata?.order_id || '').trim(),
    status,
    amount: Number(object?.amount?.value || 0),
    currency: String(object?.amount?.currency || 'RUB'),
    confirmationUrl: String(object?.confirmation?.confirmation_url || '').trim(),
    telegramUserId: String(metadata?.telegram_user_id || '').trim(),
    payload,
  });
  return res.json({ ok: true });
});

app.post('/api/stores/:storeId/payments/tbank/webhook', storeParamMiddleware, (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const orderId = String(payload?.OrderId || payload?.orderId || '').trim();
  const paymentId = String(payload?.PaymentId || payload?.paymentId || '').trim();
  if (!paymentId) return res.json({ ok: true });
  const status = String(payload?.Status || payload?.status || '').trim().toLowerCase()
    || (payload?.Success === true || String(payload?.Success || '').toLowerCase() === 'true' ? 'succeeded' : 'pending');
  updateOrderPaymentFromCallback({
    storeId: req.storeId,
    provider: 'tbank',
    paymentId,
    orderId,
    status,
    amount: Number(payload?.Amount || 0) / 100,
    currency: 'RUB',
    payload,
  });
  return res.json({ ok: true });
});

app.all('/api/stores/:storeId/payments/robokassa/webhook', storeParamMiddleware, (req, res) => {
  const src = req.method === 'GET'
    ? (req.query && typeof req.query === 'object' ? req.query : {})
    : (req.body && typeof req.body === 'object' ? req.body : {});
  const paymentId = String(src?.InvId || src?.invId || '').trim();
  if (!paymentId) return res.send('OK');
  const amount = Number(src?.OutSum || src?.outSum || 0);
  updateOrderPaymentFromCallback({
    storeId: req.storeId,
    provider: 'robokassa',
    paymentId,
    orderId: String(src?.Shp_order_id || src?.shp_order_id || '').trim(),
    status: 'succeeded',
    amount,
    currency: 'RUB',
    payload: src,
  });
  return res.send(`OK${paymentId}`);
});

app.post('/api/stores/:storeId/payments/alfabank/webhook', storeParamMiddleware, (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const paymentId = String(payload?.orderId || payload?.paymentId || '').trim();
  if (!paymentId) return res.json({ ok: true });
  const status = String(payload?.orderStatus || payload?.status || '').trim().toLowerCase() || 'pending';
  updateOrderPaymentFromCallback({
    storeId: req.storeId,
    provider: 'alfabank',
    paymentId,
    orderId: String(payload?.orderNumber || '').trim(),
    status,
    amount: Number(payload?.amount || 0) / 100,
    currency: 'RUB',
    payload,
  });
  return res.json({ ok: true });
});

app.get('/api/stores/:storeId/admin/orders', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, order_number, telegram_user_id, status, workflow_status, payment_status, total_amount, currency, customer_json, payload_json, created_at, updated_at
    FROM orders
    WHERE store_id = ?
    ORDER BY created_at DESC
    LIMIT 500
  `).all(req.storeId);
  const sequenceMap = buildOrderSequenceMap(rows);
  const orders = rows.map((row) => hydrateOrderRow(row, sequenceMap));
  return res.json({ ok: true, storeId: req.storeId, orders });
});

app.patch('/api/stores/:storeId/admin/orders/:orderId/status', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const orderId = String(req.params.orderId || '').trim();
  const nextStatus = normalizeOrderWorkflowStatus(req.body?.status || '');
  if (!orderId) return res.status(400).json({ error: 'ORDER_ID_REQUIRED' });
  const current = db.prepare(`
    SELECT id, order_number, telegram_user_id, status, workflow_status, payment_status, total_amount, currency, customer_json, payload_json, created_at, updated_at
    FROM orders
    WHERE store_id = ? AND id = ?
    LIMIT 1
  `).get(req.storeId, orderId);
  if (!current) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
  const ts = nowIso();
  db.prepare('UPDATE orders SET status = ?, workflow_status = ?, updated_at = ? WHERE store_id = ? AND id = ?')
    .run(nextStatus, nextStatus, ts, req.storeId, orderId);
  const updated = db.prepare(`
    SELECT id, order_number, telegram_user_id, status, workflow_status, payment_status, total_amount, currency, customer_json, payload_json, created_at, updated_at
    FROM orders
    WHERE store_id = ? AND id = ?
    LIMIT 1
  `).get(req.storeId, orderId);
  return res.json({
    ok: true,
    storeId: req.storeId,
    order: hydrateOrderRow(updated, buildOrderSequenceMap([updated])),
  });
});

app.get('/api/stores/:storeId/admin/metrics', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, requireActiveSubscriptionForAdmin, (req, res) => {
  const ordersTotal = Number(db.prepare('SELECT COUNT(*) AS c FROM orders WHERE store_id = ?').get(req.storeId)?.c || 0);
  const paidTotal = Number(db.prepare("SELECT COUNT(DISTINCT order_id) AS c FROM order_payments WHERE store_id = ? AND status IN ('paid','payment_success','success','succeeded','confirmed')").get(req.storeId)?.c || 0);
  const beginCheckout = Number(db.prepare("SELECT COUNT(*) AS c FROM events WHERE store_id = ? AND event_type = 'begin_checkout'").get(req.storeId)?.c || 0);
  const topProducts = db.prepare(`
    SELECT oi.product_id, oi.title, SUM(oi.qty) AS qty, SUM(oi.price * oi.qty) AS revenue
    FROM order_items oi
    WHERE oi.store_id = ?
    GROUP BY oi.product_id, oi.title
    ORDER BY qty DESC
    LIMIT 10
  `).all(req.storeId).map((row) => ({
    productId: row.product_id,
    title: row.title,
    qty: Number(row.qty || 0),
    revenue: Number(row.revenue || 0),
  }));

  const conversion = beginCheckout > 0 ? Number(((ordersTotal / beginCheckout) * 100).toFixed(2)) : 0;
  const paymentConversion = ordersTotal > 0 ? Number(((paidTotal / ordersTotal) * 100).toFixed(2)) : 0;

  return res.json({
    ok: true,
    storeId: req.storeId,
    metrics: {
      ordersTotal,
      paidTotal,
      beginCheckout,
      conversion,
      paymentConversion,
      topProducts,
    },
  });
});

app.get('/api/store/:storeId/public', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  return res.json(rowToDataset(req.store));
});

app.get('/api/stores/:storeId/public', storeParamMiddleware, (req, res) => {
  if (Number(req.store.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  return res.json(rowToDataset(req.store));
});

app.post('/api/telegram/webhook/:storeId', storeParamMiddleware, async (req, res) => {
  const secretHeader = String(req.headers['x-telegram-bot-api-secret-token'] || '').trim();
  const matchedConnection = getTelegramCatalogConnectionBySecret(req.storeId, secretHeader);
  const expectedSecret = String(req.store?.bot_webhook_secret || '').trim();
  const isLegacySecret = Boolean(expectedSecret && secretHeader && secretHeader === expectedSecret);
  if (!matchedConnection && !isLegacySecret) {
    return res.status(401).json({ error: 'INVALID_WEBHOOK_SECRET' });
  }

  const update = req.body && typeof req.body === 'object' ? req.body : {};
  const message = update?.message || null;
  const text = String(message?.text || '').trim().toLowerCase();
  const chatId = message?.chat?.id ? String(message.chat.id) : '';
  if (!chatId) return res.json({ ok: true });

  if (text === '/start' || text.startsWith('/start ')) {
    const token = matchedConnection
      ? decryptBotToken(String(matchedConnection.bot_token_enc || ''))
      : decryptBotToken(String(req.store?.bot_token_enc || ''));
    if (token) await sendStoreCatalogKeyboard(token, chatId, req.storeId, false, req.store);
  }

  return res.json({ ok: true });
});

app.post('/api/telegram/admin/webhook', async (req, res) => {
  const expectedSecret = String(ADMIN_BOT_WEBHOOK_SECRET || '').trim();
  const secretHeader = String(req.headers['x-telegram-bot-api-secret-token'] || '').trim();
  if (expectedSecret && (!secretHeader || secretHeader !== expectedSecret)) {
    return res.status(401).json({ error: 'INVALID_ADMIN_WEBHOOK_SECRET' });
  }

  const update = req.body && typeof req.body === 'object' ? req.body : {};
  const chatMemberUpdate = update?.my_chat_member && typeof update.my_chat_member === 'object'
    ? update.my_chat_member
    : null;
  if (chatMemberUpdate) {
    const chat = chatMemberUpdate?.chat && typeof chatMemberUpdate.chat === 'object' ? chatMemberUpdate.chat : {};
    const chatIdFromMember = chat?.id ? String(chat.id) : '';
    const chatType = String(chat?.type || '').trim().toLowerCase();
    const oldStatus = String(chatMemberUpdate?.old_chat_member?.status || '').trim().toLowerCase();
    const newStatus = String(chatMemberUpdate?.new_chat_member?.status || '').trim().toLowerCase();
    const wasActive = oldStatus === 'member' || oldStatus === 'administrator';
    const isActive = newStatus === 'member' || newStatus === 'administrator';
    const isGroupChat = chatType === 'group' || chatType === 'supergroup';
    if (isGroupChat && chatIdFromMember && isActive && !wasActive) {
      await sendAdminChatIdHint(chatIdFromMember, String(chat?.title || '').trim());
    }
    return res.json({ ok: true });
  }

  const message = update?.message || null;
  const textRaw = String(message?.text || '').trim();
  const text = textRaw.toLowerCase();
  const chatId = message?.chat?.id ? String(message.chat.id) : '';
  const fromId = message?.from?.id ? String(message.from.id) : '';
  const fromUsername = String(message?.from?.username || '').trim();
  const fromFirstName = String(message?.from?.first_name || '').trim();
  if (/^[0-9]{5,20}$/.test(fromId) && chatId) {
    upsertAdminTelegramUser(fromId, chatId, fromUsername, fromFirstName);
    await flushPendingAdminMessages(fromId);
  }
  if (!chatId) return res.json({ ok: true });

  if (
    text === '/start'
    || text.startsWith('/start ')
    || text === '/instruction'
    || text === '/help'
    || text === 'инструкция'
    || text === 'instruction'
  ) {
    if (text === '/instruction' || text === '/help' || text === 'инструкция' || text === 'instruction') {
      await sendAdminBotInstructions(chatId);
    } else {
      await sendAdminBotStartMessage(chatId);
    }
  }

  return res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'demo-katalog-lite-saas', ts: nowIso() });
});

async function runSubscriptionReminderTick() {
  if (!ADMIN_BOT_TOKEN) return;
  const stores = db.prepare('SELECT store_id, owner_user_id FROM stores WHERE is_active = 1').all();
  const today = new Date().toISOString().slice(0, 10);
  for (const row of stores) {
    const storeId = String(row?.store_id || '').trim().toUpperCase();
    if (!isValidStoreId(storeId)) continue;
    const sub = getStoreSubscriptionState(storeId);
    if (!sub.isGrace) continue;

    const exists = db.prepare(`
      SELECT 1 AS ok
      FROM subscription_reminders
      WHERE store_id = ? AND reminder_date = ? AND reminder_type = 'grace'
      LIMIT 1
    `).get(storeId, today);
    if (exists?.ok) continue;

    const ownerTg = resolveOwnerTelegramId(getStoreRow(storeId));
    if (!ownerTg) continue;

    const text = [
      'Подписка скоро отключится ⚠️',
      `Store: ${storeId}`,
      `Льготный период: ${sub.graceDaysLeft} дн.`,
      'Продлите подписку, чтобы не потерять доступ к редактированию и статистике.',
    ].join('\n');
    // eslint-disable-next-line no-await-in-loop
    const sent = await notifySubscriptionViaAdminBot(ownerTg, text);
    if (sent?.ok) {
      db.prepare(`
        INSERT OR IGNORE INTO subscription_reminders (store_id, reminder_date, reminder_type, created_at)
        VALUES (?, ?, 'grace', ?)
      `).run(storeId, today, nowIso());
    }
  }
}

function sendNoCacheFile(res, filePath, contentType) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (contentType) res.type(contentType);
  res.sendFile(filePath);
}

app.get(/^\/store\/[A-Za-z0-9]{6}$/u, (_req, res) => {
  sendNoCacheFile(res, path.join(ROOT, 'index.html'), 'html');
});

app.get('/', (_req, res) => {
  sendNoCacheFile(res, path.join(ROOT, 'index.html'), 'html');
});

app.get('/index.html', (_req, res) => {
  sendNoCacheFile(res, path.join(ROOT, 'index.html'), 'html');
});

app.get('/app.js', (_req, res) => {
  sendNoCacheFile(res, path.join(ROOT, 'app.js'), 'application/javascript');
});

app.get('/style.css', (_req, res) => {
  sendNoCacheFile(res, path.join(ROOT, 'style.css'), 'text/css');
});

app.use(express.static(ROOT, { maxAge: 0, etag: true, lastModified: true }));

app.use((err, _req, res, _next) => {
  if (String(err?.message || '') === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ error: 'CORS_NOT_ALLOWED' });
  }
  console.error('Unhandled API error:', err?.message || err);
  return res.status(500).json({ error: 'INTERNAL_ERROR' });
});

async function bootstrapAdminBot() {
  if (!ADMIN_BOT_TOKEN) {
    console.log('[admin-bot] skipped: ADMIN_BOT_TOKEN not configured');
    return;
  }
  const base = String(PUBLIC_API_BASE || '').trim();
  if (!base) {
    console.log('[admin-bot] skipped: PUBLIC_API_BASE not configured');
    return;
  }
  const setup = await configureAdminBotWebhook(base);
  if (setup?.ok) {
    console.log(`[admin-bot] webhook configured: ${setup.webhookUrl}`);
    await flushPendingAdminMessages();
  } else {
    console.log(`[admin-bot] webhook setup failed: ${setup?.error || setup?.reason || 'unknown'}`);
  }
}

async function syncStoreCatalogMenus() {
  const base = resolveCatalogBaseFromEnv();
  if (!base) {
    console.log('[store-bot] menu sync skipped: WEBAPP_URL/PUBLIC_API_BASE not configured');
    return;
  }
  const connections = db.prepare(`
    SELECT s.store_id, c.bot_token_enc
    FROM store_catalog_connections c
    JOIN stores s ON s.store_id = c.store_id
    WHERE s.is_active = 1
      AND c.platform = 'telegram'
      AND c.bot_token_enc IS NOT NULL
      AND TRIM(c.bot_token_enc) <> ''
  `).all();
  let ok = 0;
  let failed = 0;
  for (const row of connections) {
    const storeId = String(row?.store_id || '').trim().toUpperCase();
    const botToken = decryptBotToken(String(row?.bot_token_enc || ''));
    if (!storeId || !botToken) continue;
    // eslint-disable-next-line no-await-in-loop
    const setup = await configureTelegramBotMenu(botToken, storeId);
    if (setup?.ok) ok += 1;
    else failed += 1;
  }
  console.log(`[store-bot] menu sync finished: ok=${ok}, failed=${failed}`);
}

const server = app.listen(PORT, () => {
  console.log(`SaaS server started on http://0.0.0.0:${PORT}`);
  void bootstrapAdminBot();
  void syncStoreCatalogMenus();
});

const pendingAdminMessagesTimer = setInterval(() => {
  void flushPendingAdminMessages();
}, 60 * 1000);
pendingAdminMessagesTimer.unref?.();

const subscriptionReminderTimer = setInterval(() => {
  void runSubscriptionReminderTick();
}, 60 * 60 * 1000);
subscriptionReminderTimer.unref?.();
void runSubscriptionReminderTick();

function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  clearInterval(pendingAdminMessagesTimer);
  clearInterval(subscriptionReminderTimer);
  server.close(() => {
    try {
      db.close();
    } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
