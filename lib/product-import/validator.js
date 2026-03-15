import { buildCategoryKey, buildProductCategoryKey, normalizeCategoryGroupId, normalizeEntityCompareKey, normalizeSkuKey } from './utils.js';
import { mapRowToCanonical } from './mapper.js';

function resolveExistingProductSku(product) {
  const direct = String(product?.sku || '').trim();
  if (direct) return direct;
  const specs = Array.isArray(product?.specs) ? product.specs : [];
  for (const item of specs) {
    const text = typeof item === 'string'
      ? item
      : `${String(item?.label || '').trim()}: ${String(item?.value || '').trim()}`;
    const match = String(text || '').match(/^(артикул|sku|код)\s*:\s*(.+)$/i);
    if (match?.[2]) return String(match[2]).trim();
  }
  return '';
}

export function resolveImportContext(rawContext, categories = []) {
  const scope = String(rawContext?.scope || '').trim().toLowerCase() === 'category' ? 'category' : 'catalog';
  if (scope !== 'category') {
    return {
      scope: 'catalog',
      categoryId: '',
      categoryTitle: '',
      groupId: normalizeCategoryGroupId(rawContext?.groupId || ''),
    };
  }
  const categoryId = String(rawContext?.categoryId || '').trim();
  const category = categories.find((item) => String(item?.id || '').trim() === categoryId) || null;
  if (!category) {
    const error = new Error('IMPORT_CATEGORY_NOT_FOUND');
    error.statusCode = 400;
    throw error;
  }
  return {
    scope: 'category',
    categoryId,
    categoryTitle: String(category.title || '').trim(),
    groupId: normalizeCategoryGroupId(category.groupId || ''),
  };
}

export function buildPreviewRows(rawRows, { categories = [], products = [], context, storeId, uploadsDir }) {
  const existingCategoryByKey = new Map();
  const rootCategoryByTitle = new Map();
  const existingProductBySku = new Map();
  const existingProductByTitleCategory = new Map();
  const simulatedCategories = categories.map((item) => ({ ...item }));

  simulatedCategories.forEach((category) => {
    const key = buildCategoryKey(category?.title, category?.parentId || '');
    if (key && !existingCategoryByKey.has(key)) existingCategoryByKey.set(key, category);
    if (!String(category?.parentId || '').trim()) rootCategoryByTitle.set(normalizeEntityCompareKey(category?.title), category);
  });
  products.forEach((product) => {
    const skuKey = normalizeSkuKey(resolveExistingProductSku(product));
    if (skuKey && !existingProductBySku.has(skuKey)) existingProductBySku.set(skuKey, product);
    const fallbackKey = buildProductCategoryKey(product?.title, product?.categoryId);
    if (fallbackKey && !existingProductByTitleCategory.has(fallbackKey)) existingProductByTitleCategory.set(fallbackKey, product);
  });

  let createdRootCategories = 0;
  let createdSubcategories = 0;
  let warningRows = 0;
  let imageRows = 0;
  let createCount = 0;
  let updateCount = 0;
  const fieldMatches = new Set();

  const rows = rawRows.map((rawRow, index) => {
    const row = mapRowToCanonical(rawRow, { ...context, storeId, uploadsDir });
    fieldMatches.add('title');
    if (row.normalized.sku) fieldMatches.add('sku');
    if (row.normalized.description) fieldMatches.add('description');
    if (row.normalized.characteristics.length) fieldMatches.add('characteristics');
    if (row.normalized.category) fieldMatches.add('category');
    if (row.normalized.subcategory) fieldMatches.add('subcategory');
    if (Number.isFinite(row.normalized.price)) fieldMatches.add('price');
    if (row.normalized.oldPrice) fieldMatches.add('old_price');
    if (row.normalized.imageUrls.length) fieldMatches.add('image');
    if (row.warnings.length) warningRows += 1;
    if (row.normalized.imageUrls.length) imageRows += 1;
    if (!row.canImport) {
      return {
        ...row,
        rowNumber: index + 2,
        operation: 'error',
        matchedProductId: '',
        targetCategoryId: '',
        targetCategoryPath: [row.normalized.category, row.normalized.subcategory].filter(Boolean),
      };
    }

    const rootTitle = String(row.normalized.category || '').trim();
    const childTitle = String(row.normalized.subcategory || '').trim();
    const rootKey = buildCategoryKey(rootTitle, '');
    let rootCategory = null;
    if (context.scope === 'category' && String(context.categoryId || '').trim()) {
      rootCategory = simulatedCategories.find((item) => String(item?.id || '').trim() === String(context.categoryId).trim()) || null;
    }
    if (!rootCategory) rootCategory = existingCategoryByKey.get(rootKey) || rootCategoryByTitle.get(normalizeEntityCompareKey(rootTitle)) || null;
    if (!rootCategory) {
      rootCategory = {
        id: `__preview_root_${createdRootCategories + 1}`,
        title: rootTitle,
        image: '',
        groupId: normalizeCategoryGroupId(context?.groupId || ''),
      };
      simulatedCategories.push(rootCategory);
      existingCategoryByKey.set(rootKey, rootCategory);
      rootCategoryByTitle.set(normalizeEntityCompareKey(rootTitle), rootCategory);
      createdRootCategories += 1;
    }

    let targetCategory = rootCategory;
    if (childTitle) {
      const childKey = buildCategoryKey(childTitle, rootCategory.id);
      targetCategory = existingCategoryByKey.get(childKey) || null;
      if (!targetCategory) {
        targetCategory = {
          id: `__preview_child_${createdSubcategories + 1}`,
          title: childTitle,
          image: '',
          groupId: normalizeCategoryGroupId(rootCategory.groupId || context?.groupId || ''),
          parentId: rootCategory.id,
        };
        simulatedCategories.push(targetCategory);
        existingCategoryByKey.set(childKey, targetCategory);
        createdSubcategories += 1;
      }
    }

    const skuKey = normalizeSkuKey(row.normalized.sku);
    const fallbackKey = buildProductCategoryKey(row.normalized.title, targetCategory.id);
    const matchedProduct = (skuKey && existingProductBySku.get(skuKey)) || existingProductByTitleCategory.get(fallbackKey) || null;
    const operation = matchedProduct ? 'update' : 'create';
    if (operation === 'update') updateCount += 1;
    else createCount += 1;

    return {
      ...row,
      rowNumber: index + 2,
      operation,
      matchedProductId: String(matchedProduct?.id || ''),
      targetCategoryId: String(targetCategory?.id || ''),
      targetCategoryPath: [rootCategory?.title, childTitle || (targetCategory?.id !== rootCategory?.id ? targetCategory?.title : '')].filter(Boolean),
    };
  });

  return {
    rows,
    summary: {
      totalRows: rows.length,
      readyToImport: rows.filter((item) => item.canImport).length,
      invalidRows: rows.filter((item) => !item.canImport).length,
      warningRows,
      imageRows,
      createCount,
      updateCount,
      categoriesToCreate: createdRootCategories + createdSubcategories,
      rootCategoriesToCreate: createdRootCategories,
      subcategoriesToCreate: createdSubcategories,
      recognizedFields: Array.from(fieldMatches).sort(),
    },
  };
}
