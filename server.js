import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

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

ensureStoresColumn('owner_user_id', "owner_user_id TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_token_enc', "bot_token_enc TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_username', "bot_username TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('bot_webhook_secret', "bot_webhook_secret TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('settings_json', "settings_json TEXT NOT NULL DEFAULT '{}'");
ensureStoresColumn('categories_json', "categories_json TEXT NOT NULL DEFAULT '[]'");
ensureStoresColumn('products_json', "products_json TEXT NOT NULL DEFAULT '[]'");
ensureSessionsColumn('user_id', "user_id TEXT NOT NULL DEFAULT ''");

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

function hashResetCode(storeId, code) {
  return crypto.createHash('sha256').update(`${String(storeId || '')}:${String(code || '')}`).digest('hex');
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function telegramIdFromIdentity(identity) {
  const raw = String(identity || '').trim();
  if (!raw.startsWith('tg:')) return '';
  const id = raw.slice(3).trim();
  return /^[0-9]{5,20}$/.test(id) ? id : '';
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

function resolveCatalogBase(req) {
  const preferred = String(WEBAPP_URL || '').trim().replace(/\/$/, '');
  if (preferred) return preferred;
  const apiBase = resolvePublicApiBase(req);
  if (!apiBase) return '';
  return apiBase.replace(/\/api$/i, '');
}

function getStoreCatalogUrl(storeId, req) {
  const base = resolveCatalogBase(req);
  if (!base) return '';
  return `${base}/store/${encodeURIComponent(String(storeId || '').trim().toUpperCase())}`;
}

function getStoreSettings(row) {
  return safeJsonParse(row?.settings_json || '{}', {});
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
  });
}

seedDefaultStore();
migrateLegacyToTenantTables();

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
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 8 * 1024 * 1024 },
});

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

function userIdentityFromRequest(body) {
  const tg = String(body?.telegramUserId || '').trim();
  if (tg) return `tg:${tg}`;
  const email = String(body?.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
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
  const base = String(WEBAPP_URL || '').trim().replace(/\/$/, '');
  if (!base) return { ok: false, skipped: true, reason: 'WEBAPP_URL_NOT_CONFIGURED' };
  const webAppUrl = `${base}/store/${encodeURIComponent(storeId)}`;
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
        allowed_updates: ['message'],
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SET_ADMIN_WEBHOOK_FAILED' };

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
  const base = String(WEBAPP_URL || '').trim().replace(/\/$/, '');
  if (!base) return { ok: false, error: 'WEBAPP_URL_NOT_CONFIGURED' };
  const webAppUrl = `${base}/store/${encodeURIComponent(storeId)}`;
  const settings = getStoreSettings(storeRow);
  const ownerNote = isOwner ? '\n\nДля админки используйте ваш Bot ID + пароль в Admin mini app.' : '';
  const welcomeTextRaw = String(settings?.botWelcomeText || '').trim();
  const welcomeText = welcomeTextRaw || `Добро пожаловать в каталог.${ownerNote}`;
  const welcomeImage = String(settings?.botWelcomeImage || '').trim();
  try {
    if (welcomeImage) {
      const photoResp = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: String(chatId || '').trim(),
          photo: welcomeImage,
          caption: welcomeText.slice(0, 1024),
        }),
      });
      const photoPayload = await photoResp.json().catch(() => ({}));
      if (!photoResp.ok || !photoPayload?.ok) return { ok: false, error: 'SEND_START_PHOTO_FAILED' };
    }
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId || '').trim(),
        text: welcomeImage ? 'Откройте каталог кнопкой ниже.' : welcomeText,
        reply_markup: {
          inline_keyboard: [[{ text: 'Открыть каталог', web_app: { url: webAppUrl } }]],
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SEND_START_KEYBOARD_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'SEND_START_KEYBOARD_FAILED' };
  }
}

async function notifyOrderViaTelegram(storeRow, orderPayload) {
  const token = decryptBotToken(storeRow.bot_token_enc);
  if (!token) return { ok: false, skipped: true, reason: 'BOT_NOT_CONNECTED' };
  const settings = getStoreSettings(storeRow);
  const chatId = String(settings?.orderChatId || settings?.chatId || settings?.telegramChatId || '').trim();
  if (!chatId) return { ok: false, skipped: true, reason: 'CHAT_ID_NOT_CONFIGURED' };

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
    return { ok: true };
  } catch {
    return { ok: false, error: 'TELEGRAM_SEND_FAILED' };
  }
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
    if (!response.ok || !payload?.ok) return { ok: false, error: 'SEND_FAILED' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'SEND_FAILED' };
  }
}

function getAdminMiniAppUrl() {
  const base = String(WEBAPP_URL || '').trim().replace(/\/$/, '');
  if (!base) return '';
  return `${base}/?admin=1`;
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
  const sentByAdmin = await sendTelegramTextByToken(ADMIN_BOT_TOKEN, chatId, text, {
    reply_markup: getAdminStartKeyboard(),
  });
  if (sentByAdmin.ok) return { ok: true, via: 'admin_bot' };
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
  return res.json({ ok: true, storeId, active: true });
});

app.post('/api/auth/register-by-bot', async (req, res) => {
  const botToken = String(req.body?.botToken || '').trim();
  const password = String(req.body?.password || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const identity = userIdentityFromRequest(req.body);
  const storeNameRaw = String(req.body?.storeName || '').trim();

  if (!botToken || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_BY_BOT_PAYLOAD' });
  }
  const ownerTelegramId = telegramIdFromIdentity(identity);
  if (!ownerTelegramId) return res.status(400).json({ error: 'TELEGRAM_ID_REQUIRED' });

  const validation = await validateTelegramBotToken(botToken);
  if (!validation.ok) return res.status(400).json({ error: validation.error || 'BOT_TOKEN_INVALID' });
  const botUsername = String(validation.username || '').trim();

  const storeId = uniqueStoreId();
  const catalogUrl = getStoreCatalogUrl(storeId, req);
  const webhookSecret = crypto.randomBytes(16).toString('hex');
  const sent = await notifyBotIdToOwner({
    ownerTelegramId,
    storeId,
    botUsername,
    catalogUrl,
  });
  if (!sent.ok) {
    return res.status(500).json({ error: sent.error || 'BOT_ID_SEND_FAILED' });
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
  if (identity) upsertStoreUser(storeId, identity, 'owner');
  if (email) upsertStoreUser(storeId, `email:${email}`, 'owner');

  const apiBase = resolvePublicApiBase(req);
  const menuSetup = await configureTelegramBotMenu(botToken, storeId);
  const webhookSetup = await configureTelegramBotWebhook(botToken, storeId, webhookSecret, apiBase);
  const onboarding = await sendStoreCatalogKeyboard(botToken, ownerTelegramId, storeId, true);
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
    botIdSent: true,
    botIdSentVia: sent.via || 'admin_bot',
    botIdSendError: '',
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
  const telegramUserId = String(req.body?.telegramUserId || '').trim();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const row = getStoreRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });

  const ownerTelegramId = resolveOwnerTelegramId(row);
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
  const telegramUserId = String(req.body?.telegramUserId || '').trim();

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

  return res.json({
    ok: true,
    storeId: row.store_id,
    storeName: row.store_name,
    email: row.owner_email,
    isActive: Number(row.is_active || 0) === 1,
    userId: req.auth.userId || '',
    stores,
  });
});

app.get('/api/admin/stores', authMiddleware, (req, res) => {
  if (req.auth.userId) {
    const stores = db.prepare(`
      SELECT s.store_id, s.store_name, s.bot_username, s.created_at, s.updated_at
      FROM stores s
      JOIN store_users su ON su.store_id = s.store_id
      WHERE su.user_id = ?
      ORDER BY s.created_at ASC
    `).all(req.auth.userId).map((s) => ({
      storeId: s.store_id,
      storeName: s.store_name,
      botUsername: s.bot_username || '',
      catalogUrl: getStoreCatalogUrl(s.store_id, req),
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
    return res.json({ ok: true, stores });
  }

  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  return res.json({
    ok: true,
    stores: [{
      storeId: row.store_id,
      storeName: row.store_name,
      botUsername: row.bot_username || '',
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
  upsertStoreUser(storeId, identity, 'owner');

  return res.json({ ok: true, storeId, active: false });
});

app.post('/api/admin/stores/:storeId/bot', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, async (req, res) => {
  const botToken = String(req.body?.botToken || '').trim();
  const orderChatId = String(req.body?.orderChatId || '').trim();
  const settingsPatch = sanitizeSettingsPatch(req.body?.settings && typeof req.body.settings === 'object' ? req.body.settings : {});
  if (!botToken && !orderChatId && !Object.keys(settingsPatch).length) {
    return res.status(400).json({ error: 'BOT_SETTINGS_REQUIRED' });
  }

  let validation = { ok: true, username: req.store?.bot_username || '' };
  if (botToken) {
    validation = await validateTelegramBotToken(botToken);
    if (!validation.ok) return res.status(400).json({ error: validation.error });
  }

  const oldSettings = getStoreSettings(req.store);
  const mergedSettings = {
    ...oldSettings,
    ...settingsPatch,
  };
  if (orderChatId) mergedSettings.orderChatId = orderChatId;

  let webhookSecret = String(req.store?.bot_webhook_secret || '').trim();
  if (botToken && !webhookSecret) webhookSecret = crypto.randomBytes(16).toString('hex');

  const tokenToStore = botToken ? encryptBotToken(botToken) : req.store.bot_token_enc;
  const usernameToStore = botToken ? (validation.username || '') : (req.store.bot_username || '');

  db.prepare(`
    UPDATE stores
    SET bot_token_enc = ?, bot_username = ?, bot_webhook_secret = ?, settings_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    tokenToStore,
    usernameToStore,
    webhookSecret,
    JSON.stringify(mergedSettings),
    nowIso(),
    req.storeId,
  );

  let menuSetup = { ok: false, skipped: true, reason: 'BOT_TOKEN_NOT_CHANGED' };
  let webhookSetup = { ok: false, skipped: true, reason: 'BOT_TOKEN_NOT_CHANGED' };
  if (botToken) {
    menuSetup = await configureTelegramBotMenu(botToken, req.storeId);
    webhookSetup = await configureTelegramBotWebhook(botToken, req.storeId, webhookSecret, resolvePublicApiBase(req));
  }
  return res.json({ ok: true, storeId: req.storeId, botUsername: usernameToStore, menuSetup, webhookSetup, settings: mergedSettings });
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  return res.json(rowToDataset(row));
});

app.put('/api/admin/data', authMiddleware, (req, res) => {
  const row = getStoreRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });

  const config = req.body?.config;
  const settings = req.body?.settings;
  const categories = req.body?.categories;
  const products = req.body?.products;
  if (!config || !Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'INVALID_DATASET' });
  }

  replaceCategoriesTx(req.auth.storeId, categories);
  replaceProductsTx(req.auth.storeId, products);

  const nextSettings = settings && typeof settings === 'object'
    ? settings
    : safeJsonParse(row.settings_json || '{}', {});

  db.prepare(`
    UPDATE stores
    SET config_json = ?, settings_json = ?, categories_json = ?, products_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    JSON.stringify(config),
    JSON.stringify(nextSettings),
    JSON.stringify(categories),
    JSON.stringify(products),
    nowIso(),
    req.auth.storeId,
  );

  return res.json({ ok: true, storeId: req.auth.storeId });
});

app.get('/api/stores/:storeId/admin/data', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, (req, res) => {
  return res.json(rowToDataset(req.store));
});

app.put('/api/stores/:storeId/admin/data', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, (req, res) => {
  const config = req.body?.config;
  const settings = req.body?.settings;
  const categories = req.body?.categories;
  const products = req.body?.products;
  if (!config || !Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'INVALID_DATASET' });
  }

  replaceCategoriesTx(req.storeId, categories);
  replaceProductsTx(req.storeId, products);

  const nextSettings = settings && typeof settings === 'object'
    ? settings
    : safeJsonParse(req.store.settings_json || '{}', {});

  db.prepare(`
    UPDATE stores
    SET config_json = ?, settings_json = ?, categories_json = ?, products_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    JSON.stringify(config),
    JSON.stringify(nextSettings),
    JSON.stringify(categories),
    JSON.stringify(products),
    nowIso(),
    req.storeId,
  );

  return res.json({ ok: true, storeId: req.storeId });
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
  const items = Array.isArray(incoming?.items) ? incoming.items : [];
  const customer = incoming?.customer && typeof incoming.customer === 'object' ? incoming.customer : {};
  if (!items.length) return res.status(400).json({ error: 'ORDER_ITEMS_REQUIRED' });

  const orderId = String(incoming?.id || `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`);
  const total = Number(incoming?.total || 0);
  const telegramUserId = String(
    incoming?.telegramUserId || customer?.telegramId || req.body?.telegramUserId || ''
  ).trim();
  const status = String(incoming?.status || 'created').trim();
  const createdAt = String(incoming?.createdAt || nowIso());
  const ts = nowIso();

  const saveOrderTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, store_id, telegram_user_id, status, total_amount, currency, customer_json, payload_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'RUB', ?, ?, ?, ?)
    `).run(
      orderId,
      req.storeId,
      telegramUserId,
      status,
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

  const notify = await notifyOrderViaTelegram(req.store, { ...incoming, id: orderId, items, customer, total, telegramUserId });
  return res.json({ ok: true, orderId, notification: notify });
});

app.get('/api/stores/:storeId/admin/orders', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, (req, res) => {
  const orders = db.prepare(`
    SELECT id, telegram_user_id, status, total_amount, currency, customer_json, payload_json, created_at, updated_at
    FROM orders
    WHERE store_id = ?
    ORDER BY created_at DESC
    LIMIT 500
  `).all(req.storeId).map((row) => ({
    id: row.id,
    telegramUserId: row.telegram_user_id,
    status: row.status,
    total: Number(row.total_amount || 0),
    currency: row.currency || 'RUB',
    customer: safeJsonParse(row.customer_json, {}),
    payload: safeJsonParse(row.payload_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  return res.json({ ok: true, storeId: req.storeId, orders });
});

app.get('/api/stores/:storeId/admin/metrics', authMiddleware, storeParamMiddleware, storeAdminAccessMiddleware, (req, res) => {
  const ordersTotal = Number(db.prepare('SELECT COUNT(*) AS c FROM orders WHERE store_id = ?').get(req.storeId)?.c || 0);
  const paidTotal = Number(db.prepare("SELECT COUNT(*) AS c FROM orders WHERE store_id = ? AND status IN ('paid','payment_success')").get(req.storeId)?.c || 0);
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
  const expectedSecret = String(req.store?.bot_webhook_secret || '').trim();
  if (!expectedSecret || !secretHeader || secretHeader !== expectedSecret) {
    return res.status(401).json({ error: 'INVALID_WEBHOOK_SECRET' });
  }

  const update = req.body && typeof req.body === 'object' ? req.body : {};
  const message = update?.message || null;
  const text = String(message?.text || '').trim().toLowerCase();
  const chatId = message?.chat?.id ? String(message.chat.id) : '';
  if (!chatId) return res.json({ ok: true });

  if (text === '/start' || text.startsWith('/start ')) {
    const token = decryptBotToken(req.store?.bot_token_enc || '');
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
  const message = update?.message || null;
  const textRaw = String(message?.text || '').trim();
  const text = textRaw.toLowerCase();
  const chatId = message?.chat?.id ? String(message.chat.id) : '';
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

app.get(/^\/store\/[A-Za-z0-9]{6}$/u, (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use(express.static(ROOT));

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
  } else {
    console.log(`[admin-bot] webhook setup failed: ${setup?.error || setup?.reason || 'unknown'}`);
  }
}

const server = app.listen(PORT, () => {
  console.log(`SaaS server started on http://0.0.0.0:${PORT}`);
  void bootstrapAdminBot();
});

function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
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
