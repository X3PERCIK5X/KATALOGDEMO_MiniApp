import { mapImportFieldName } from './dictionary.js';
import { parseImportFile } from './parser.js';
import { buildPreviewRows, resolveImportContext } from './validator.js';

export function createImportPreview({ file, requestContext, storeId, uploadsDir, categories, products }) {
  const context = resolveImportContext(requestContext, categories);
  const rawRows = parseImportFile(file);
  const sourceFieldSet = new Set();
  const recognizedFieldSet = new Set();
  rawRows.slice(0, 25).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    Object.keys(row).forEach((key) => {
      const field = String(key || '').trim();
      if (!field) return;
      sourceFieldSet.add(field);
      const mapped = String(mapImportFieldName(field) || '').trim();
      if (!mapped) return;
      if (mapped !== field) recognizedFieldSet.add(mapped);
    });
  });
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
      sourceFields: Array.from(sourceFieldSet),
      recognizedFields: Array.from(new Set([
        ...(Array.isArray(preview.summary?.recognizedFields) ? preview.summary.recognizedFields : []),
        ...recognizedFieldSet,
      ])).sort(),
    },
  };
}
