import { parseImportFile } from './parser.js';
import { buildPreviewRows, resolveImportContext } from './validator.js';

export function createImportPreview({ file, requestContext, storeId, uploadsDir, categories, products }) {
  const context = resolveImportContext(requestContext, categories);
  const rawRows = parseImportFile(file);
  const firstRow = rawRows.find((row) => row && typeof row === 'object') || {};
  const sourceFields = Object.keys(firstRow).map((key) => String(key || '').trim()).filter(Boolean);
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
    summary: {
      ...preview.summary,
      sourceFileName: String(file?.originalname || '').trim(),
      sourceFileSize: Number(file?.size || file?.buffer?.length || 0),
      sourceRowsCount: rawRows.length,
      sourceFields,
    },
  };
}
