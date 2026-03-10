import fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { knex } from '../knex-database-connection.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function toSQL(b) {
  const { sql } = b.toSQL();
  return Array.isArray(sql) ? sql.map((s) => s.sql).join('; ') : sql;
}

async function main() {
  logger.info("Début de l'évaluation de la migration");

  const filePath = process.argv[2];
  if (!filePath) throw new Error('Pas de fichier');

  const { builder } = await import(pathToFileURL(resolve(filePath)).href);

  const sql = builder(knex).map(toSQL).filter(Boolean).join('; ');

  await fs.writeFile(`${__dirname}migration.sql`, sql, () => {});
}

(async () => {
  await main();
})();
