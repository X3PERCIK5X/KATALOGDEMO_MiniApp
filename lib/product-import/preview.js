import { parseImportFile } from './parser.js';
import { buildPreviewRows, resolveImportContext } from './validator.js';

export function createImportPreview({ file, requestContext, storeId, uploadsDir, categories, products }) {
  const context = resolveImportContext(requestContext, categories);
  const rawRows = parseImportFile(file);
  const preview = buildPreviewRows(rawRows, {
    categories,
    products,
    context,
    storeId,
    uploadsDir,
  });
  return {
    context,
    fileName: String(file?.originalname || ''),
    rows: preview.rows,
    summary: preview.summary,
  };
}
