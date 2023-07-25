import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

import { logger } from '../../lib/infrastructure/logger.js';
import { usecases } from '../../lib/domain/usecases/index.js';
import { learningContentCache as cache } from '../../lib/infrastructure/caches/learning-content-cache.js';
import * as placementProfileService from '../../lib/domain/services/placement-profile-service.js';
import * as certificationBadgesService from '../../lib/domain/services/certification-badges-service.js';
import { disconnect } from '../../db/knex-database-connection.js';
import { temporaryStorage } from '../../lib/infrastructure/temporary-storage/index.js';

/**
 * DESCRIPTION
 *    Will display certifications eligibiliby for a user at a specific date
 *    Note: by default date is today's date
 *
 * USAGE
 *    $ node get-user-certifications-eligibility.js <userId> [<YYYY-MM-DD>]
 */

async function getUserCertificationsEligibility({ userId, limitDate }) {
  logger.info('Starting script get-user-certifications-eligibility');

  const { pixCertificationEligible, eligibleComplementaryCertifications } =
    await usecases.getUserCertificationEligibility({
      userId,
      placementProfileService,
      certificationBadgesService,
      limitDate,
    });

  const complementaires = eligibleComplementaryCertifications.map(({ label }) => label).join(', ') || '❌';
  console.log(`Eligibilité utilisateur ${userId} à ${limitDate.toISOString()}`);
  console.log(`PIX: ${pixCertificationEligible ? '✅' : '❌'}`);
  console.log(`COMPLEMENTAIRES: ${complementaires}`);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const userId = process.argv[2];
  const limitDate = process.argv[3] ? new Date(process.argv[3]) : new Date();
  await getUserCertificationsEligibility({ userId, limitDate });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
      await temporaryStorage.quit();
    }
  }
})();

export { getUserCertificationsEligibility };
