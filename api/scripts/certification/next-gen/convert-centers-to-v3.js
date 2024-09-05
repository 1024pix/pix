import 'dotenv/config';

import * as url from 'node:url';

import { usecases } from '../../../src/certification/configuration/domain/usecases/index.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
/**
 * Usage: node scripts/certification/next-gen/convert-centers-to-v3.js
 **/

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  logger.info('Creating oders to convert V2 centers to V3 centers');
  const numberOfCenterConversionOrders = await usecases.findAndTriggerV2CenterToConvertInV3();
  logger.info(`Conversion jobs sent for [${numberOfCenterConversionOrders}] V2 centers`);
  return 0;
}

(async () => {
  if (isLaunchedFromCommandLine) {
    let exitCode = 1;
    try {
      await main();
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
