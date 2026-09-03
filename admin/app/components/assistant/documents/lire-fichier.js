import * as XLSX from 'xlsx';

export default async function readFile(file) {
  const buffer = await file.arrayBuffer();
  // codepage 65001 = UTF-8; default (1252) corrupts accented characters from UTF-8 CSVs
  const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });

  const sheets = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    sheets[sheetName] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  }

  return { name: file.name, sheets };
}
