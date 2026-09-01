import * as XLSX from 'xlsx';

export default async function lireFichier(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const feuilles = {};
  for (const nomFeuille of workbook.SheetNames) {
    const sheet = workbook.Sheets[nomFeuille];
    feuilles[nomFeuille] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  }

  return { nom: file.name, feuilles };
}
