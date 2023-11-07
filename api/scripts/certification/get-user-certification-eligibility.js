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
 *    Will display certifications eligibility for a user at a specific date
 *    Note: by default date is full today's date at 23h 59m 59s
 *
 * USAGE
 *    $ node ./scripts/certification/get-user-certification-eligibility.js <userId> [<YYYY-MM-DD>] [HH:mm:ss]
 *
 * EXAMPLES:
 *    # Today at 23h59:59
 *    $ node get-user-certification-eligibility.js 147114
 *
 *    # On 26/07/2023 at 23h 59m 59s
 *    $ node get-user-certification-eligibility.js 147114 2023-07-26
 *
 *    # On 22/01/2000 at 11h 52m 00s
 *    $ node get-user-certification-eligibility.js 147114 2000-01-22 11:52
 */

// TODO : add "outdated" info display (PIX-9023))
async function getUserCertificationEligibility({ userId, limitDate }) {
  logger.info('Starting script get-user-certification-eligibility');

  const { pixCertificationEligible, complementaryCertifications } = await usecases.getUserCertificationEligibility({
    userId,
    placementProfileService,
    certificationBadgesService,
    limitDate,
  });

  console.log(`--------------------------------------------------------------`);
  console.log(`Eligibilité utilisateur ${userId} à ${limitDate.toISOString()}`);
  console.log(`PIX: ${pixCertificationEligible ? '✅' : '❌'}`);
  if (pixCertificationEligible) {
    const complementaryCertificationsInfo =
      complementaryCertifications
        .map(({ label, isOutdated }) => {
          const outdatedIcon = isOutdated ? ' 💀' : '';
          return `${label}${outdatedIcon}`;
        })
        .join(', ') || '❌';
    console.log(`COMPLEMENTAIRES: ${complementaryCertificationsInfo}`);
  }
  console.log(`--------------------------------------------------------------`);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const userId = process.argv[2];
  const limitDay = process.argv[3];
  const limitHours = process.argv[4] ?? '23:59:59';
  const limitDate = limitDay ? new Date(`${limitDay} ${limitHours}`) : new Date();

  await getUserCertificationEligibility({ userId, limitDate });
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

export { getUserCertificationEligibility };
