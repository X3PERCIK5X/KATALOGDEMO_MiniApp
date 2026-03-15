import XLSX from 'xlsx';
import { PRODUCT_IMPORT_MAX_ROWS } from './constants.js';

function scoreDecodedText(text) {
  const normalized = String(text || '').replace(/\u0000/g, '');
  const firstLine = normalized.split(/\r?\n/)[0] || '';
  let score = 0;
  if (/[;,|\t]/.test(firstLine)) score += 10;
  if (/title|name|product|price|category|image|description/i.test(firstLine)) score += 20;
  if (/назв|товар|цена|катег|опис|фото|изображ/i.test(firstLine)) score += 20;
  score -= (normalized.match(/\u0000/g) || []).length * 5;
  score -= (normalized.match(/�/g) || []).length * 3;
  return score;
}

export function decodeImportTextBuffer(buffer) {
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!bytes.length) return '';
  const hasUtf8Bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const hasUtf16LeBom = bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe;
  const hasUtf16BeBom = bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff;
  if (hasUtf8Bom) return bytes.toString('utf8').replace(/^\uFEFF/, '');
  if (hasUtf16LeBom) return new TextDecoder('utf-16le').decode(bytes).replace(/^\uFEFF/, '');
  if (hasUtf16BeBom) return new TextDecoder('utf-16be').decode(bytes).replace(/^\uFEFF/, '');
  const candidates = [
    bytes.toString('utf8'),
    new TextDecoder('utf-16le').decode(bytes),
    new TextDecoder('windows-1251').decode(bytes),
  ];
  candidates.sort((a, b) => scoreDecodedText(b) - scoreDecodedText(a));
  return String(candidates[0] || '').replace(/\u0000/g, '').replace(/^\uFEFF/, '');
}

export function detectCsvDelimiter(text) {
  const sample = String(text || '').split(/\r?\n/).slice(0, 5).join('\n');
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map((delimiter) => ({
    delimiter,
    count: delimiter === '\t' ? (sample.match(/\t/g) || []).length : (sample.split(delimiter).length - 1),
  }));
  counts.sort((a, b) => b.count - a.count);
  return counts[0]?.count > 0 ? counts[0].delimiter : ',';
}

export function parseCsvLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

export function splitPackedImportString(value) {
  const text = String(value || '').trim();
  if (!text) return [];
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map((delimiter) => ({
    delimiter,
    count: delimiter === '\t' ? (text.match(/\t/g) || []).length : (text.split(delimiter).length - 1),
  }));
  counts.sort((a, b) => b.count - a.count);
  const delimiter = counts[0]?.count > 0 ? counts[0].delimiter : ',';
  return parseCsvLine(text, delimiter).map((item) => String(item || '').trim());
}

export function unpackCompactRow(row) {
  const entries = Object.entries(row || {});
  if (entries.length !== 1) return row || {};
  const [rawHeader, rawValue] = entries[0];
  const headerText = String(rawHeader || '').trim();
  const valueText = String(rawValue || '').trim();
  if (!/[;,|\t]/.test(headerText)) return row || {};
  const headers = splitPackedImportString(headerText);
  const values = splitPackedImportString(valueText);
  if (!headers.length) return row || {};
  const out = {};
  headers.forEach((header, index) => {
    if (!header) return;
    out[header] = values[index] ?? '';
  });
  return out;
}

export function parseCsvRows(csvText) {
  const normalizedText = String(csvText || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const delimiter = detectCsvDelimiter(normalizedText);
  const lines = normalizedText.split('\n').filter((line) => String(line || '').trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0], delimiter).map((value) => String(value || '').trim());
  if (!headers.some(Boolean)) return [];
  const rows = [];
  for (let index = 1; index < lines.length; index += 1) {
    const cells = parseCsvLine(lines[index], delimiter);
    const row = {};
    let hasAnyValue = false;
    headers.forEach((header, headerIndex) => {
      if (!header) return;
      const value = String(cells[headerIndex] || '').trim();
      if (value) hasAnyValue = true;
      row[header] = value;
    });
    if (hasAnyValue) rows.push(unpackCompactRow(row));
  }
  return rows;
}

function getWorksheetCellDisplayValue(cell) {
  if (!cell) return '';
  if (cell.l?.Target) return String(cell.l.Target || '').trim();
  if (typeof cell.w === 'string' && cell.w.trim()) return cell.w.trim();
  if (cell.v == null) return '';
  return String(cell.v).trim();
}

export function worksheetToImportRows(worksheet) {
  const ref = String(worksheet?.['!ref'] || '').trim();
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const headers = [];
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: col });
    headers.push(getWorksheetCellDisplayValue(worksheet[cellRef]));
  }
  const rows = [];
  for (let rowIndex = range.s.r + 1; rowIndex <= range.e.r; rowIndex += 1) {
    const row = {};
    let hasAnyValue = false;
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const header = headers[col - range.s.c];
      if (!String(header || '').trim()) continue;
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      const rawValue = getWorksheetCellDisplayValue(worksheet[cellRef]);
      if (String(rawValue || '').trim()) hasAnyValue = true;
      row[header] = rawValue;
    }
    if (hasAnyValue) rows.push(unpackCompactRow(row));
  }
  return rows;
}

export function parseImportFile(file) {
  if (!file || !file.buffer?.length) {
    const error = new Error('IMPORT_FILE_REQUIRED');
    error.statusCode = 400;
    throw error;
  }
  const originalName = String(file.originalname || '').trim();
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase() : '';
  if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
    const error = new Error('IMPORT_FILE_FORMAT_UNSUPPORTED');
    error.statusCode = 400;
    throw error;
  }
  let rawRows = [];
  try {
    if (ext === '.csv') {
      rawRows = parseCsvRows(decodeImportTextBuffer(file.buffer));
    } else {
      const workbook = XLSX.read(file.buffer, { type: 'buffer', raw: false });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        const error = new Error('IMPORT_FILE_EMPTY');
        error.statusCode = 400;
        throw error;
      }
      rawRows = worksheetToImportRows(workbook.Sheets[firstSheet]);
    }
  } catch (error) {
    if (error?.statusCode) throw error;
    const parseError = new Error('IMPORT_FILE_PARSE_FAILED');
    parseError.statusCode = 400;
    throw parseError;
  }
  if (!Array.isArray(rawRows) || !rawRows.length) {
    const error = new Error('IMPORT_FILE_EMPTY');
    error.statusCode = 400;
    throw error;
  }
  if (rawRows.length > PRODUCT_IMPORT_MAX_ROWS) {
    const error = new Error('IMPORT_TOO_MANY_ROWS');
    error.statusCode = 400;
    throw error;
  }
  return rawRows;
}
