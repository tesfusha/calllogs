/**
 * Minimal RFC 4180 CSV reader: quoted fields, escaped double quotes, CRLF or
 * LF line endings, and a UTF-8 BOM. Written by hand to keep the import path
 * dependency-free (the file comes from a phone export, not a spreadsheet app).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const source = text.replace(/\r\n?/g, '\n');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing blank lines produced by a final newline.
  return rows.filter(
    (candidate) => candidate.some((cell) => cell.trim() !== ''),
  );
}
