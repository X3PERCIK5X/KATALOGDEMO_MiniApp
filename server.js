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

fs.mkdirSync(STORAGE_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS stores (
  store_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  invite_code TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL,
  categories_json TEXT NOT NULL,
  products_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
`);

function ensureStoresColumn(columnName, ddl) {
  const rows = db.prepare('PRAGMA table_info(stores)').all();
  const exists = rows.some((r) => String(r.name) === columnName);
  if (!exists) db.exec(`ALTER TABLE stores ADD COLUMN ${ddl}`);
}

ensureStoresColumn('invite_code', "invite_code TEXT NOT NULL DEFAULT ''");
ensureStoresColumn('is_active', 'is_active INTEGER NOT NULL DEFAULT 1');

function readJsonFallback(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
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

function createSession(storeId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (token, store_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, storeId, expiresAt, now.toISOString());
  return token;
}

function getStoreDatasetRow(storeId) {
  return db.prepare(`
    SELECT store_id, store_name, is_active, config_json, categories_json, products_json
    FROM stores
    WHERE store_id = ?
  `).get(storeId);
}

function rowToDataset(row) {
  return {
    storeId: row.store_id,
    storeName: row.store_name,
    isActive: Number(row.is_active || 0) === 1,
    config: JSON.parse(row.config_json),
    categories: JSON.parse(row.categories_json),
    products: JSON.parse(row.products_json),
  };
}

function seedDefaultStore() {
  if (!isValidStoreId(DEFAULT_STORE_ID)) return;
  const exists = db.prepare('SELECT store_id FROM stores WHERE store_id = ?').get(DEFAULT_STORE_ID);
  if (exists) return;
  const config = readJsonFallback(path.join(ROOT, 'config.json'), {});
  const categories = readJsonFallback(path.join(ROOT, 'data', 'categories.json'), []);
  const products = readJsonFallback(path.join(ROOT, 'data', 'products.json'), []);
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, password_hash, invite_code, is_active, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
  `).run(
    DEFAULT_STORE_ID,
    'Demo Store',
    DEFAULT_ADMIN_EMAIL,
    hash,
    '',
    JSON.stringify(config),
    JSON.stringify(categories),
    JSON.stringify(products),
    now,
    now,
  );
  console.log(`[seed] store created: ${DEFAULT_STORE_ID}`);
}

seedDefaultStore();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 8 * 1024 * 1024 },
});

function authMiddleware(req, res, next) {
  const raw = String(req.headers.authorization || '');
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  const row = db.prepare('SELECT token, store_id, expires_at FROM sessions WHERE token = ?').get(token);
  if (!row) return res.status(401).json({ error: 'INVALID_TOKEN' });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'SESSION_EXPIRED' });
  }
  req.auth = { token: row.token, storeId: row.store_id };
  return next();
}

function ownerMiddleware(req, res, next) {
  const key = String(req.headers['x-owner-key'] || '').trim();
  if (!OWNER_API_KEY) return res.status(500).json({ error: 'OWNER_KEY_NOT_CONFIGURED' });
  if (!key || key !== OWNER_API_KEY) return res.status(401).json({ error: 'OWNER_AUTH_REQUIRED' });
  return next();
}

function buildDefaultDataset() {
  return {
    config: readJsonFallback(path.join(ROOT, 'config.json'), {}),
    categories: readJsonFallback(path.join(ROOT, 'data', 'categories.json'), []),
    products: readJsonFallback(path.join(ROOT, 'data', 'products.json'), []),
  };
}

app.post('/api/owner/stores', ownerMiddleware, (req, res) => {
  const requestedStoreId = String(req.body?.storeId || '').trim().toUpperCase();
  const storeId = requestedStoreId ? requestedStoreId : uniqueStoreId();
  const storeName = String(req.body?.storeName || 'New Store').trim();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const exists = db.prepare('SELECT store_id FROM stores WHERE store_id = ?').get(storeId);
  if (exists) return res.status(409).json({ error: 'STORE_ALREADY_EXISTS' });
  const inviteCode = randomInviteCode();
  const now = new Date().toISOString();
  const dataset = buildDefaultDataset();
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(18).toString('hex'), 10);
  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, password_hash, invite_code, is_active, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName || 'New Store',
    '',
    placeholderHash,
    inviteCode,
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    now,
    now,
  );
  return res.json({ ok: true, storeId, inviteCode, active: false });
});

app.post('/api/auth/activate', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const inviteCode = String(req.body?.inviteCode || '').trim().toUpperCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  const storeName = String(req.body?.storeName || '').trim();
  if (!isValidStoreId(storeId) || !inviteCode || !password || password.length < 6 || !email) {
    return res.status(400).json({ error: 'INVALID_ACTIVATE_PAYLOAD' });
  }
  const row = db.prepare('SELECT store_id, is_active, invite_code FROM stores WHERE store_id = ?').get(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) === 1) return res.status(409).json({ error: 'STORE_ALREADY_ACTIVE' });
  if (String(row.invite_code || '').toUpperCase() !== inviteCode) return res.status(401).json({ error: 'WRONG_INVITE_CODE' });
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    UPDATE stores
    SET owner_email = ?, password_hash = ?, invite_code = '', is_active = 1, store_name = COALESCE(NULLIF(?, ''), store_name), updated_at = ?
    WHERE store_id = ?
  `).run(email, hash, storeName, now, storeId);
  return res.json({ ok: true, storeId, active: true });
});

app.post('/api/auth/register-by-store', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const password = String(req.body?.password || '').trim();
  if (!isValidStoreId(storeId) || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_BY_STORE_PAYLOAD' });
  }
  const row = db.prepare('SELECT store_id, is_active FROM stores WHERE store_id = ?').get(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) === 1) return res.status(409).json({ error: 'STORE_ALREADY_ACTIVE' });
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    UPDATE stores
    SET password_hash = ?, invite_code = '', is_active = 1, updated_at = ?
    WHERE store_id = ?
  `).run(hash, now, storeId);
  return res.json({ ok: true, storeId, active: true });
});

app.post('/api/auth/register', (req, res) => {
  const storeName = String(req.body?.storeName || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  if (!storeName || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'INVALID_REGISTER_PAYLOAD' });
  }
  const storeId = uniqueStoreId();
  const now = new Date().toISOString();
  const dataset = buildDefaultDataset();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO stores (store_id, store_name, owner_email, password_hash, invite_code, is_active, config_json, categories_json, products_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, '', 1, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    storeName,
    email,
    hash,
    JSON.stringify(dataset.config),
    JSON.stringify(dataset.categories),
    JSON.stringify(dataset.products),
    now,
    now,
  );
  return res.json({ ok: true, storeId });
});

app.post('/api/auth/login', (req, res) => {
  const storeId = String(req.body?.storeId || '').trim().toUpperCase();
  const password = String(req.body?.password || '').trim();
  if (!isValidStoreId(storeId) || !password) return res.status(400).json({ error: 'INVALID_LOGIN_PAYLOAD' });
  const row = db.prepare('SELECT store_id, password_hash, is_active FROM stores WHERE store_id = ?').get(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'WRONG_PASSWORD' });
  const token = createSession(storeId);
  return res.json({ ok: true, token, storeId });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT store_id, store_name, owner_email, is_active FROM stores WHERE store_id = ?').get(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  return res.json({
    ok: true,
    storeId: row.store_id,
    storeName: row.store_name,
    email: row.owner_email,
    isActive: Number(row.is_active || 0) === 1,
  });
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
  const row = getStoreDatasetRow(req.auth.storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  return res.json(rowToDataset(row));
});

app.put('/api/admin/data', authMiddleware, (req, res) => {
  const config = req.body?.config;
  const categories = req.body?.categories;
  const products = req.body?.products;
  if (!config || !Array.isArray(categories) || !Array.isArray(products)) {
    return res.status(400).json({ error: 'INVALID_DATASET' });
  }
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE stores
    SET config_json = ?, categories_json = ?, products_json = ?, updated_at = ?
    WHERE store_id = ?
  `).run(
    JSON.stringify(config),
    JSON.stringify(categories),
    JSON.stringify(products),
    now,
    req.auth.storeId,
  );
  return res.json({ ok: true, storeId: req.auth.storeId });
});

app.post('/api/upload-image', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });
  const extByMime = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  const ext = extByMime[req.file.mimetype] || path.extname(req.file.originalname || '') || '.jpg';
  const storeUploadsDir = path.join(UPLOADS_DIR, req.auth.storeId);
  fs.mkdirSync(storeUploadsDir, { recursive: true });
  const finalName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const finalPath = path.join(storeUploadsDir, finalName);
  fs.renameSync(req.file.path, finalPath);
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.auth.storeId}/${finalName}`;
  return res.json({ ok: true, url });
});

app.get('/api/store/:storeId/public', (req, res) => {
  const storeId = String(req.params.storeId || '').trim().toUpperCase();
  if (!isValidStoreId(storeId)) return res.status(400).json({ error: 'INVALID_STORE_ID' });
  const row = getStoreDatasetRow(storeId);
  if (!row) return res.status(404).json({ error: 'STORE_NOT_FOUND' });
  if (Number(row.is_active || 0) !== 1) return res.status(403).json({ error: 'STORE_NOT_ACTIVATED' });
  return res.json(rowToDataset(row));
});

app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`SaaS server started on http://0.0.0.0:${PORT}`);
});
