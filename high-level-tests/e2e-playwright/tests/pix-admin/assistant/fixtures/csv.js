import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Valeurs valides dans la base de données de dev (seed).
 * À mettre à jour si les seeds changent.
 */
export const VALID_VALUES = {
  type: { sco: 'SCO', pro: 'PRO', sup: 'SUP' },
  team: { alpha: 'Team Alpha', sco: 'Sco administration team', pro: 'Pro administration team' },
  learnerType: { sco: 'Sco organization learner type', pro: 'Pro organization learner type', student: 'Student' },
  country: 'FRANCE',
};

/**
 * Génère un CSV de test et l'écrit dans un fichier temporaire.
 * Retourne le chemin vers ce fichier.
 *
 * @param {Array<{nom, type, equipe, public: string, pays, externalId}>} rows
 * @param {string} [filename]
 */
export function createCsvFile(rows, filename = `test-assistant-${Date.now()}.csv`) {
  const header = 'nom,type,equipe,public,pays,identifiant_externe';
  const lines = rows.map(
    (r) => `${r.nom},${r.type},${r.equipe},${r.public},${r.pays},${r.externalId}`,
  );
  const content = [header, ...lines].join('\n');
  const path = join(tmpdir(), filename);
  writeFileSync(path, content, 'utf-8');
  return path;
}

/**
 * Génère un suffixe unique pour éviter les conflits entre exécutions de tests.
 */
export function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
