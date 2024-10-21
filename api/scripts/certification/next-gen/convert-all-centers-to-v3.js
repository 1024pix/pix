import 'dotenv/config';

import * as url from 'node:url';

import { disconnect as disconnectFromDb } from '../../../db/knex-database-connection.js';
import { usecases } from '../../../src/certification/configuration/domain/usecases/index.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { parseCsvWithHeaderAndRequiredFields } from '../../helpers/csvHelpers.js';

/**
 * Usage: DRY_RUN=true node scripts/certification/next-gen/convert-all-centers-to-v3.js <file.csv>
 * file.csv is a csv file containing a single id column to specify certification center ids we want to preserve
 * ie. these centers will not be converted to v3
 **/

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main({ isDryRun, preservedCenterIds, dependencies }) {
  await dependencies.convertSessionsWithNoCoursesToV3({ isDryRun });
  await dependencies.convertCentersToV3({ isDryRun, preservedCenterIds });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 0;
    try {
      const isDryRun = process.env.DRY_RUN === 'true';
      const filePath = process.argv[2];
      const preservedCenters = filePath
        ? await parseCsvWithHeaderAndRequiredFields({
            filePath,
            requiredFieldNames: ['id'],
          })
        : [];
      const preservedCenterIds = preservedCenters.map(({ id }) => id);

      logger.info(`Converting centers to v3...`);
      await main({ isDryRun, preservedCenterIds, dependencies: usecases });
      logger.info(`Converting centers to v3 successfully!`);
    } catch (error) {
      logger.error(error, `Error while converting centers to v3`);
      exitCode = 1;
    } finally {
      await disconnectFromDb();
      // eslint-disable-next-line n/no-process-exit
      process.exit(exitCode);
    }
  }
})();

export { main };
