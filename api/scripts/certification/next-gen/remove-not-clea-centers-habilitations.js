import 'dotenv/config';

import * as url from 'node:url';

import { disconnect as disconnectFromDb } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../lib/infrastructure/DomainTransaction.js';
import { usecases } from '../../../src/certification/configuration/domain/usecases/index.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

/**
 * Usage: DRY_RUN=true node scripts/certification/next-gen/remove-not-clea-centers-habilitations.js
 * @param {Object} params
 * @param {boolean} params.[isDryRun] - default true
 **/
async function main({ isDryRun = true }) {
  logger.info(`Removing centers habilitations that are not CLEA...`);

  await DomainTransaction.execute(async () => {
    const numberOfHabiliationsRemoved = await usecases.removeCentersHabilitationsExceptCLEA();

    if (isDryRun) {
      const transaction = DomainTransaction.getConnection();
      logger.warn(`DRY RUN: Habilitations removal estimated to ${numberOfHabiliationsRemoved} !`);
      await transaction.rollback();
      return;
    }

    logger.info(`Habilitations removal is successfull for ${numberOfHabiliationsRemoved} !`);
  });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 0;
    try {
      const isDryRun = process.env.DRY_RUN === 'true';
      await main({ isDryRun });
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
