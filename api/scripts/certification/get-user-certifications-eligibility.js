require('dotenv').config({ path: `${__dirname}/../.env` });
const logger = require('../../lib/infrastructure/logger');
const usecases = require('../../lib/domain/usecases/index.js');
const cache = require('../../lib/infrastructure/caches/learning-content-cache');
const placementProfileService = require('../../lib/domain/services/placement-profile-service');
const certificationBadgesService = require('../../lib/domain/services/certification-badges-service');
// Usage: node scripts/get-certifications-eligibility 1234

('use strict');
const { disconnect } = require('../../db/knex-database-connection');
const temporaryStorage = require('../../lib/infrastructure/temporary-storage/index');

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

module.exports = {
  getUserCertificationsEligibility,
};
