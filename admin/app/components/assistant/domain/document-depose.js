const MAX_SUMMARY_LENGTH = 8000;
const MAX_CELL_LENGTH = 30;
const FIRST_ROWS = 5;
const LAST_ROWS = 3;
const OMISSION_THRESHOLD = FIRST_ROWS + LAST_ROWS; // 8
const MAX_PLAGE_ROWS = 50;

function truncateCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return str.length > MAX_CELL_LENGTH ? str.slice(0, MAX_CELL_LENGTH) + '…' : str;
}

function formatRow(row) {
  return JSON.stringify((row || []).map(truncateCell));
}

export default class DocumentDepose {
  constructor({ id, nom, feuilles }) {
    this.id = id;
    this.nom = nom;
    this.feuilles = feuilles;
    this.plagesVues = [];
  }

  sommaire() {
    const parts = [];

    for (const [nomFeuille, grille] of Object.entries(this.feuilles)) {
      const nbRows = grille.length;
      const nbCols = nbRows > 0 ? Math.max(...grille.map((r) => (r || []).length)) : 0;
      const sheetLines = [`${nomFeuille} (${nbRows} × ${nbCols})`];

      if (nbRows <= OMISSION_THRESHOLD) {
        for (const row of grille) {
          sheetLines.push(formatRow(row));
        }
      } else {
        // First 5 rows
        for (let i = 0; i < FIRST_ROWS; i++) {
          sheetLines.push(formatRow(grille[i]));
        }
        // Omission line
        const omitted = nbRows - FIRST_ROWS - LAST_ROWS;
        sheetLines.push(`… (${omitted} lignes omises)`);
        // Last 3 rows
        for (let i = nbRows - LAST_ROWS; i < nbRows; i++) {
          sheetLines.push(formatRow(grille[i]));
        }
      }

      parts.push(sheetLines.join('\n'));
    }

    let result = parts.join('\n\n');

    if (result.length > MAX_SUMMARY_LENGTH) {
      result = result.slice(0, MAX_SUMMARY_LENGTH) + '[tronqué]';
    }

    return result;
  }

  plage(nomFeuille, from, to) {
    if (to - from > MAX_PLAGE_ROWS - 1) {
      throw new Error('50 lignes max par appel');
    }

    this.plagesVues.push({ feuille: nomFeuille, from, to });

    const grille = this.feuilles[nomFeuille];
    if (!grille) return '';

    // Convert 1-indexed to 0-indexed
    const start = from - 1;
    const end = to; // slice is exclusive at end

    return grille.slice(start, end).map(formatRow).join('\n');
  }
}
