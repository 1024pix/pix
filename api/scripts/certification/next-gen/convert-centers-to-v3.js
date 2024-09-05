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
  const centerIds = await usecases.findAndTriggerV2CenterToConvertInV3();
  logger.info(`Conversion jobs sent for [${centerIds.length}] V2 centers`);
  logger.info(`Centers IDS marked for conversion: [${centerIds}]`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  }
})();

export { main };
