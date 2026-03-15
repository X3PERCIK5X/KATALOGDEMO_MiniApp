export function normalizeCategoryGroupId(value) {
  return String(value || '').trim() || 'apparel';
}

export function normalizeEntityCompareKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['"`«»]/g, '')
    .replace(/\s*[-_/|]+\s*/g, ' ')
    .replace(/[(){}[\].,;:!?]+/g, '')
    .trim();
}

export function normalizeSkuKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

export function parseImportNumber(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { ok: false, value: 0 };
  const normalized = raw.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.') return { ok: false, value: 0 };
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return { ok: false, value: 0 };
  return { ok: true, value: parsed };
}

export function parseImportBoolean(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return true;
  if (['true', '1', 'yes', 'y', 'да', 'active'].includes(raw)) return true;
  if (['false', '0', 'no', 'n', 'нет', 'inactive'].includes(raw)) return false;
  return true;
}

export function parseImportInteger(value, fallback = 0) {
  const parsed = parseImportNumber(value);
  if (!parsed.ok) return fallback;
  return Math.max(0, Math.round(parsed.value));
}

export function buildCategoryKey(title, parentId = '') {
  return `${normalizeEntityCompareKey(parentId)}::${normalizeEntityCompareKey(title)}`;
}

export function buildProductCategoryKey(title, categoryId) {
  return `${normalizeEntityCompareKey(categoryId)}::${normalizeEntityCompareKey(title)}`;
}

export function nextImportEntityId(prefix, usedIds, randomBytesFactory) {
  let id = '';
  do {
    id = `${prefix}-${Date.now()}-${randomBytesFactory(3).toString('hex')}`;
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}
