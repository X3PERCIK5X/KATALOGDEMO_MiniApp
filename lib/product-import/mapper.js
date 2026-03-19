import fs from 'node:fs';
import path from 'node:path';
import { mapImportFieldName, normalizeImportHeaderBase } from './dictionary.js';
import { parseImportBoolean, parseImportInteger, parseImportNumber } from './utils.js';

const CORE_IMPORT_FIELDS = new Set([
  'title',
  'sku',
  'description',
  'characteristics',
  'price',
  'old_price',
  'category',
  'subcategory',
  'stock',
  'active',
  'image_url',
  'image_urls',
]);

export function normalizeImportObject(row) {
  const out = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    const normalizedKey = mapImportFieldName(key);
    if (!normalizedKey) return;
    const nextValue = value == null ? '' : String(value);
    const currentValue = out[normalizedKey] == null ? '' : String(out[normalizedKey]);
    if (!currentValue.trim() && nextValue.trim()) {
      out[normalizedKey] = value;
      return;
    }
    if (!nextValue.trim()) return;
    if (normalizedKey === 'image_urls') {
      const merged = [currentValue, nextValue].filter(Boolean).join(' | ');
      out[normalizedKey] = merged;
      return;
    }
    if (normalizedKey === 'description') {
      out[normalizedKey] = nextValue.length > currentValue.length ? value : out[normalizedKey];
      return;
    }
    if (normalizedKey === 'title') {
      out[normalizedKey] = currentValue.trim() ? out[normalizedKey] : value;
      return;
    }
    out[normalizedKey] = value;
  });
  return out;
}

export function looksLikeImageUrl(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return false;
  return /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(raw) || /image|img|photo|picture|cdn|uploads/i.test(raw);
}

function parseImageList(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.split(/\r?\n|\s*\|\s*|\s*;\s*/).map((item) => String(item || '').trim()).filter(Boolean);
}

function pushUnique(list, value) {
  if (!value || list.includes(value)) return;
  list.push(value);
}

export function resolveImageCandidates(sourceRow, normalized) {
  const candidates = [];
  const pushCandidate = (value) => {
    if (Array.isArray(value)) {
      value.forEach(pushCandidate);
      return;
    }
    parseImageList(value).forEach((item) => pushUnique(candidates, item));
  };
  pushCandidate(normalized.image_urls);
  pushCandidate(normalized.image_url);
  Object.entries(sourceRow || {}).forEach(([key, value]) => {
    const mapped = mapImportFieldName(key);
    const base = normalizeImportHeaderBase(key);
    if (mapped === 'image_url' || mapped === 'image_urls' || /^(gallery|галерея|photo_urls?|фотографии)(_|$)/.test(mapped)) pushCandidate(value);
    if (looksLikeImageUrl(value) && (!mapped || mapped === base || mapped === 'image_url' || mapped === 'image_urls')) pushCandidate(value);
  });
  return candidates.slice(0, 8);
}

function parseCharacteristicsValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (!item) return '';
          if (typeof item === 'string') return item.trim();
          if (typeof item === 'object') {
            const label = String(item.label || item.name || item.key || '').trim();
            const itemValue = String(item.value || item.text || '').trim();
            return label && itemValue ? `${label}: ${itemValue}` : label || itemValue;
          }
          return String(item).trim();
        }).filter(Boolean);
      }
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, itemValue]) => {
          const label = String(key || '').trim();
          const valueText = String(itemValue || '').trim();
          return label && valueText ? `${label}: ${valueText}` : label || valueText;
        }).filter(Boolean);
      }
    } catch {}
  }
  return raw.split(/\r?\n|\s*[;|]\s*/).map((line) => String(line || '').trim()).filter(Boolean);
}

export function extractCharacteristics(sourceRow, normalized) {
  const specs = [];
  const pushSpec = (value) => {
    parseCharacteristicsValue(value).forEach((item) => pushUnique(specs, item));
  };
  pushSpec(normalized.characteristics);
  Object.entries(sourceRow || {}).forEach(([key, value]) => {
    const rawBase = normalizeImportHeaderBase(key);
    const normalizedField = mapImportFieldName(key);
    if (normalizedField === 'characteristics' && rawBase === 'characteristics') {
      pushSpec(value);
      return;
    }
    const match = rawBase.match(/^(?:characteristics?|characteristic|specs?|specification|attributes?|характеристик[аи]?|свойств[ао]?|attribute|attr|параметр)_(.+)$/);
    if (!match) return;
    const label = String(match[1] || '').replace(/_/g, ' ').trim();
    const valueText = String(value || '').trim();
    if (!label || !valueText) return;
    pushSpec(`${label[0].toUpperCase()}${label.slice(1)}: ${valueText}`);
  });
  Object.entries(sourceRow || {}).forEach(([key, value]) => {
    const valueText = String(value || '').trim();
    if (!valueText || looksLikeImageUrl(valueText)) return;
    const mapped = mapImportFieldName(key);
    const base = normalizeImportHeaderBase(key);
    if (mapped && mapped !== base) return;
    if (CORE_IMPORT_FIELDS.has(base) || CORE_IMPORT_FIELDS.has(mapped)) return;
    if (!/[a-zа-яё0-9]/i.test(base)) return;
    const label = String(key || '').replace(/\s+/g, ' ').trim();
    if (!label) return;
    pushSpec(`${label}: ${valueText}`);
  });
  return specs;
}

export function resolveImageReference(storeId, uploadsDir, value) {
  const raw = String(value || '').trim();
  if (!raw) {
    const error = new Error('IMAGE_EMPTY_REFERENCE');
    error.code = 'IMAGE_EMPTY_REFERENCE';
    throw error;
  }
  if (/^https?:\/\//i.test(raw)) return { mode: 'remote', value: raw };
  if (raw.startsWith('/uploads/') || raw.startsWith('/assets/') || raw.startsWith('assets/')) {
    return { mode: 'local', value: raw.startsWith('/') ? raw : `/${raw}`.replace(/^\/assets\//, '/assets/') };
  }
  if (raw.startsWith('uploads/')) return { mode: 'local', value: `/${raw}` };
  if (!/[\\/]/.test(raw) && /\.[a-z0-9]{2,5}$/i.test(raw)) {
    const directPath = path.join(uploadsDir, storeId, raw);
    if (fs.existsSync(directPath)) return { mode: 'local', value: `/uploads/${storeId}/${raw}` };
  }
  const error = new Error('IMAGE_REFERENCE_UNSUPPORTED');
  error.code = 'IMAGE_REFERENCE_UNSUPPORTED';
  throw error;
}

export function mapRowToCanonical(sourceRow, { scope, categoryTitle, storeId, uploadsDir }) {
  const normalized = normalizeImportObject(sourceRow);
  const title = String(normalized.title || '').trim();
  const sku = String(normalized.sku || '').trim();
  const description = String(normalized.description || '').trim();
  const characteristics = extractCharacteristics(sourceRow, normalized);
  const priceParsed = parseImportNumber(normalized.price);
  const oldPriceRaw = String(normalized.old_price ?? '').trim();
  const oldPriceParsed = oldPriceRaw ? parseImportNumber(oldPriceRaw) : { ok: true, value: 0 };
  const rawCategory = String(normalized.category || '').trim();
  const rawSubcategory = String(normalized.subcategory || '').trim();
  let category = rawCategory;
  let subcategory = rawSubcategory;
  const errors = [];
  const warnings = [];

  if (!title) errors.push('Не заполнено поле title');
  if (!priceParsed.ok) errors.push('Поле price должно быть числом');
  if (scope === 'category' && categoryTitle) {
    if (rawCategory && rawCategory !== categoryTitle) warnings.push(`Категория из файла заменена на текущую категорию "${categoryTitle}"`);
    category = categoryTitle;
  } else if (!category) {
    category = 'Без категории';
    warnings.push('Категория не указана, будет создан раздел "Без категории"');
  }
  if (oldPriceRaw && !oldPriceParsed.ok) warnings.push('Поле old_price не распознано, будет сохранено как 0');

  const imageCandidates = resolveImageCandidates(sourceRow, normalized);
  const imageUrls = [];
  imageCandidates.forEach((imageRef) => {
    try {
      const resolved = resolveImageReference(storeId, uploadsDir, imageRef);
      pushUnique(imageUrls, resolved.value);
    } catch {
      warnings.push(`Изображение "${imageRef}" не распознано и будет пропущено`);
    }
  });

  return {
    source: {
      title,
      sku,
      description,
      characteristics: characteristics.join(' | '),
      price: String(normalized.price ?? ''),
      old_price: oldPriceRaw,
      category,
      subcategory,
      image_url: imageUrls[0] || imageCandidates[0] || '',
      image_urls: imageCandidates.join(' | '),
      active: String(normalized.active ?? ''),
      stock: String(normalized.stock ?? ''),
    },
    normalized: {
      title,
      sku,
      description,
      characteristics,
      price: priceParsed.ok ? priceParsed.value : 0,
      oldPrice: oldPriceParsed.ok ? oldPriceParsed.value : 0,
      category,
      subcategory,
      imageUrl: imageUrls[0] || '',
      imageUrls,
      active: parseImportBoolean(normalized.active),
      stock: parseImportInteger(normalized.stock, 0),
    },
    errors,
    warnings,
    canImport: errors.length === 0,
  };
}
