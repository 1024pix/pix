import { logger } from '../../src/shared/infrastructure/utils/logger.js';

import { disconnect } from '../../db/knex-database-connection.js';
import * as url from 'url';

import { getCPfImportstatusFromXml } from '../../src/certification/session/domain/usecases/get-cpf-import-status-from-xml.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main(path) {
  logger.info("Récupération des résultats d'import CPF...");
  const filePath = path || process.argv[2];

  await getCPfImportstatusFromXml({ filePath });

  logger.info(`Done! ...`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
