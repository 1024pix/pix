import 'dotenv/config';

import * as url from 'node:url';

import { disconnect as disconnectFromDb } from '../../db/knex-database-connection.js';
import { usecases } from '../../src/certification/configuration/domain/usecases/index.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

/**
 * This migration re-perform the action from api/db/migrations/20240920163000_modify-to-reconciledAt-on-certification-candidates-table .js
 *
 * Usage: CHUNK_SIZE=100000 node scripts/certification/finishing-reconciled-at-migration.js
 **/

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

const main = async ({ chunkSize }) => {
  return usecases.catchingUpCandidateReconciliation({ chunkSize });
};

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 0;
    try {
      const chunkSize = parseInt(process.env.CHUNK_SIZE, 10);
      await main({ chunkSize: isNaN(chunkSize) ? undefined : chunkSize });
    } catch (error) {
      logger.error(error);
      exitCode = 1;
    } finally {
      await disconnectFromDb();
      // eslint-disable-next-line n/no-process-exit
      process.exit(exitCode);
    }
  }
})();

export { main };
