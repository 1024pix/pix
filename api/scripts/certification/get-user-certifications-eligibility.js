require('dotenv').config({ path: `${__dirname}/../.env` });
import logger from '../../lib/infrastructure/logger';
import usecases from '../../lib/domain/usecases';
import cache from '../../lib/infrastructure/caches/learning-content-cache';
import placementProfileService from '../../lib/domain/services/placement-profile-service';
import certificationBadgesService from '../../lib/domain/services/certification-badges-service';
// Usage: node scripts/get-certifications-eligibility 1234

('use strict');
import { disconnect } from '../../db/knex-database-connection';
import temporaryStorage from '../../lib/infrastructure/temporary-storage/index';

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

const isLaunchedFromCommandLine = require.main === module;

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

export default {
  getUserCertificationsEligibility,
};
