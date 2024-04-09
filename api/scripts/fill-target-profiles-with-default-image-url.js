import 'dotenv/config';

import perf_hooks from 'node:perf_hooks';
import * as url from 'node:url';

import { disconnect, knex } from '../db/knex-database-connection.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

const { performance } = perf_hooks;

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

async function fillTargetProfilesWithDefaultImageUrl() {
  await knex('target-profiles').whereNull('imageUrl').update({
    imageUrl: DEFAULT_IMAGE_URL,
  });
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await fillTargetProfilesWithDefaultImageUrl();
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
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
    }
  }
})();

export { fillTargetProfilesWithDefaultImageUrl };
