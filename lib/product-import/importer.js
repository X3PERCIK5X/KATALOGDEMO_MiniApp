import fs from 'node:fs';
import path from 'node:path';
import { PRODUCT_IMPORT_PLACEHOLDER_IMAGE } from './constants.js';
import { resolveImageReference } from './mapper.js';
import { buildCategoryKey, buildProductCategoryKey, nextImportEntityId, normalizeCategoryGroupId, normalizeSkuKey } from './utils.js';

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

async function materializeImage(storeId, uploadsDir, randomBytesFactory, imageRef) {
  const resolved = resolveImageReference(storeId, uploadsDir, imageRef);
  if (resolved.mode === 'local') return resolved.value;
  const response = await fetch(resolved.value, { redirect: 'follow' });
  if (!response.ok) throw new Error(`IMAGE_FETCH_${response.status}`);
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.startsWith('image/')) throw new Error('IMAGE_INVALID_CONTENT_TYPE');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error('IMAGE_EMPTY');
  if (bytes.length > 8 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  const ext = deriveImageExtensionFromResponse(resolved.value, contentType);
  const storeUploadsDir = path.join(uploadsDir, storeId);
  fs.mkdirSync(storeUploadsDir, { recursive: true });
  const finalName = `${Date.now()}-${randomBytesFactory(4).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(storeUploadsDir, finalName), bytes);
  return `/uploads/${storeId}/${finalName}`;
}

export async function applyImportRows(previewRows, {
  storeId,
  context,
  categories,
  products,
  uploadsDir,
  randomBytesFactory,
}) {
  const existingCategoryByKey = new Map();
  const usedCategoryIds = new Set();
  const usedProductIds = new Set();
  categories.forEach((category) => {
    const key = buildCategoryKey(category?.title, category?.parentId || '');
    if (key && !existingCategoryByKey.has(key)) existingCategoryByKey.set(key, category);
    if (category?.id) usedCategoryIds.add(String(category.id));
  });
  products.forEach((product) => {
    if (product?.id) usedProductIds.add(String(product.id));
  });

  const nextCategories = [...categories];
  const nextProducts = [...products];
  const nextProductsById = new Map(nextProducts.map((product) => [String(product?.id || ''), product]));
  const nextProductsBySku = new Map();
  const nextProductsByTitleCategory = new Map();
  nextProducts.forEach((product) => {
    const skuKey = normalizeSkuKey(product?.sku || '');
    if (skuKey && !nextProductsBySku.has(skuKey)) nextProductsBySku.set(skuKey, product);
    const fallbackKey = buildProductCategoryKey(product?.title, product?.categoryId);
    if (fallbackKey && !nextProductsByTitleCategory.has(fallbackKey)) nextProductsByTitleCategory.set(fallbackKey, product);
  });

  const warnings = [];
  const skippedRows = [];
  let createdCount = 0;
  let updatedCount = 0;

  for (const previewRow of previewRows) {
    if (!previewRow?.canImport) {
      skippedRows.push({ rowNumber: previewRow?.rowNumber || 0, errors: Array.isArray(previewRow?.errors) ? previewRow.errors : ['INVALID_ROW'] });
      continue;
    }
    const rootCategoryTitle = String(previewRow.normalized.category || '').trim();
    const subcategoryTitle = String(previewRow.normalized.subcategory || '').trim();
    const rootCategoryKey = buildCategoryKey(rootCategoryTitle, '');
    let rootCategory = (context?.scope === 'category' && String(context?.categoryId || '').trim())
      ? nextCategories.find((category) => String(category?.id || '').trim() === String(context.categoryId).trim()) || null
      : null;
    if (!rootCategory) rootCategory = existingCategoryByKey.get(rootCategoryKey) || null;
    if (!rootCategory) {
      rootCategory = {
        id: nextImportEntityId('category', usedCategoryIds, randomBytesFactory),
        title: rootCategoryTitle,
        image: '',
        groupId: normalizeCategoryGroupId(context?.groupId || ''),
      };
      existingCategoryByKey.set(rootCategoryKey, rootCategory);
      nextCategories.push(rootCategory);
    }
    let targetCategory = rootCategory;
    if (subcategoryTitle) {
      const childKey = buildCategoryKey(subcategoryTitle, rootCategory.id);
      targetCategory = existingCategoryByKey.get(childKey) || null;
      if (!targetCategory) {
        targetCategory = {
          id: nextImportEntityId('category', usedCategoryIds, randomBytesFactory),
          title: subcategoryTitle,
          image: '',
          groupId: normalizeCategoryGroupId(rootCategory.groupId || context?.groupId || ''),
          parentId: rootCategory.id,
        };
        existingCategoryByKey.set(childKey, targetCategory);
        nextCategories.push(targetCategory);
      }
    }

    const importedImages = [];
    const imageRefs = Array.isArray(previewRow.normalized.imageUrls) ? previewRow.normalized.imageUrls : [];
    for (const imageRef of imageRefs) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const imagePath = await materializeImage(storeId, uploadsDir, randomBytesFactory, imageRef);
        if (imagePath && !importedImages.includes(imagePath)) importedImages.push(imagePath);
      } catch {
        warnings.push({ rowNumber: previewRow.rowNumber, message: `Не удалось загрузить изображение "${imageRef}", оно пропущено` });
      }
    }
    const finalImages = importedImages.length ? importedImages : (previewRow.operation === 'update' ? [] : [PRODUCT_IMPORT_PLACEHOLDER_IMAGE]);
    const skuKey = normalizeSkuKey(previewRow.normalized.sku);
    const fallbackKey = buildProductCategoryKey(previewRow.normalized.title, targetCategory.id);
    const matchedProduct = (
      (previewRow.matchedProductId && nextProductsById.get(previewRow.matchedProductId))
      || (skuKey && nextProductsBySku.get(skuKey))
      || nextProductsByTitleCategory.get(fallbackKey)
      || null
    );

    if (matchedProduct) {
      matchedProduct.title = previewRow.normalized.title;
      matchedProduct.price = previewRow.normalized.price;
      matchedProduct.oldPrice = previewRow.normalized.oldPrice;
      matchedProduct.sku = previewRow.normalized.sku || matchedProduct.sku || '';
      matchedProduct.shortDescription = previewRow.normalized.description;
      matchedProduct.description = previewRow.normalized.description;
      matchedProduct.specs = previewRow.normalized.characteristics.length ? previewRow.normalized.characteristics : (Array.isArray(matchedProduct.specs) ? matchedProduct.specs : []);
      matchedProduct.categoryId = targetCategory.id;
      matchedProduct.active = previewRow.normalized.active;
      matchedProduct.stock = previewRow.normalized.stock;
      matchedProduct.importImageUrl = imageRefs[0] || matchedProduct.importImageUrl || '';
      if (finalImages.length) matchedProduct.images = finalImages;
      if (skuKey) nextProductsBySku.set(skuKey, matchedProduct);
      nextProductsByTitleCategory.set(buildProductCategoryKey(matchedProduct.title, matchedProduct.categoryId), matchedProduct);
      updatedCount += 1;
    } else {
      const createdProduct = {
        id: nextImportEntityId('product', usedProductIds, randomBytesFactory),
        title: previewRow.normalized.title,
        price: previewRow.normalized.price,
        oldPrice: previewRow.normalized.oldPrice,
        sku: previewRow.normalized.sku || '',
        shortDescription: previewRow.normalized.description,
        description: previewRow.normalized.description,
        specs: previewRow.normalized.characteristics,
        images: finalImages,
        categoryId: targetCategory.id,
        badge: '',
        tags: [],
        active: previewRow.normalized.active,
        stock: previewRow.normalized.stock,
        importImageUrl: imageRefs[0] || '',
      };
      nextProducts.push(createdProduct);
      nextProductsById.set(createdProduct.id, createdProduct);
      if (skuKey) nextProductsBySku.set(skuKey, createdProduct);
      nextProductsByTitleCategory.set(buildProductCategoryKey(createdProduct.title, createdProduct.categoryId), createdProduct);
      createdCount += 1;
    }
  }

  return {
    categories: nextCategories,
    products: nextProducts,
    result: {
      importedCount: createdCount + updatedCount,
      createdCount,
      updatedCount,
      skippedCount: skippedRows.length,
      createdCategories: nextCategories.length - categories.length,
      warnings,
      skippedRows,
    },
  };
}
