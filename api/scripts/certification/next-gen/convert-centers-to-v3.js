import 'dotenv/config';

import * as url from 'node:url';

import { usecases } from '../../../src/certification/configuration/domain/usecases/index.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
/**
 * Usage: DRY_RUN=true node scripts/certification/next-gen/convert-centers-to-v3.js
 **/

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main({ isDryRun }) {
  logger.info('Creating orders to convert V2 centers to V3 centers');
  const numberOfCenterConversionOrders = await usecases.findAndTriggerV2CenterToConvertInV3({ isDryRun });
  logger.info(`Conversion jobs sent for [${numberOfCenterConversionOrders}] V2 centers`);
  return 0;
}

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 1;
    try {
      const isDryRun = process.env.DRY_RUN === 'true';
      await main({ isDryRun });
    } catch (error) {
      logger.error(error);
      exitCode = 1;
    } finally {
      // eslint-disable-next-line n/no-process-exit
      process.exit(exitCode);
    }
  }
})();

export { main };
