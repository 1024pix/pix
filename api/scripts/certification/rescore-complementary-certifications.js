import 'dotenv/config';

import * as url from 'node:url';

import { disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

/**
 * IMPORTANT
 *
 * This script is a TEMPORARY script, it is not crafter to be re-used in a context outside the one
 * it has been made for
 *
 * IMPORTANT
 *
 * Usage : node scripts/certification/rescore-complementary-certifications.js 111[xxx,yyy,]
 *
 * @returns {number} process exit code
 */
async function main(certificationCourseIds) {
  logger.info(`Rescoring ${certificationCourseIds.length} complementary certifications`);

  return 0;
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      const certificationCourseIds = process.argv[2]
        .split(',')
        .map((str) => parseInt(str, 10))
        .filter(Number.isInteger);
      const exitCode = await main(certificationCourseIds);
      return exitCode;
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
