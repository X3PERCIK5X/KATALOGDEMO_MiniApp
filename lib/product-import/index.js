import crypto from 'node:crypto';
import { PRODUCT_IMPORT_MAX_FILE_SIZE, PRODUCT_IMPORT_MAX_ROWS, PRODUCT_IMPORT_PLACEHOLDER_IMAGE } from './constants.js';
import { createImportPreview } from './preview.js';
import { resolveImportContext } from './validator.js';
import { applyImportRows } from './importer.js';

export { PRODUCT_IMPORT_MAX_FILE_SIZE, PRODUCT_IMPORT_MAX_ROWS, PRODUCT_IMPORT_PLACEHOLDER_IMAGE };
export { resolveImportContext };

export function previewImport({ file, requestContext, storeId, uploadsDir, categories, products }) {
  return createImportPreview({ file, requestContext, storeId, uploadsDir, categories, products });
}

export async function executeImport({ previewRows, requestContext, storeId, uploadsDir, categories, products }) {
  const context = resolveImportContext(requestContext, categories);
  const execution = await applyImportRows(previewRows, {
    storeId,
    context,
    categories,
    products,
    uploadsDir,
    randomBytesFactory: (size) => crypto.randomBytes(size),
  });
  return {
    ...execution,
    context,
  };
}
