import * as url from 'node:url';

import { disconnect } from '../../db/knex-database-connection.js';
import { usecases } from '../../src/certification/session-management/domain/usecases/index.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  logger.info('Integrating CPF processing receipts files...');
  await usecases.integrateCpfProccessingReceipts();
  logger.info(`Done! ...`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('An error occured', error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
