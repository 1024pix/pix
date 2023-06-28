import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

import { logger } from '../../lib/shared/infrastructure/logger.js';
import { usecases } from '../../lib/shared/domain/usecases/index.js';
import { learningContentCache as cache } from '../../lib/shared/infrastructure/caches/learning-content-cache.js';
import * as placementProfileService from '../../lib/shared/domain/services/placement-profile-service.js';
import * as certificationBadgesService from '../../lib/shared/domain/services/certification-badges-service.js';
// Usage: node scripts/get-certifications-eligibility 1234

import { disconnect } from '../../db/knex-database-connection.js';
import { temporaryStorage } from '../../lib/shared/infrastructure/temporary-storage/index.js';

async function getUserCertificationsEligibility(userId) {
  logger.info('Starting script get-user-certifications-eligibility');

  const { pixCertificationEligible, eligibleComplementaryCertifications } =
    await usecases.getUserCertificationEligibility({
      userId,
      placementProfileService,
      certificationBadgesService,
    });

  const complementaires = eligibleComplementaryCertifications.map(({ label }) => label).join(', ') || '❌';
  console.log(`Eligibilité user ${userId}`);
  console.log(`PIX: ${pixCertificationEligible ? '✅' : '❌'}`);
  console.log(`COMPLEMENTAIRES: ${complementaires}`);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const userId = process.argv[2];
  await getUserCertificationsEligibility(userId);
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
