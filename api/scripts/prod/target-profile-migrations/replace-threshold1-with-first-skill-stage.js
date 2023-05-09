import dotenv from 'dotenv';
dotenv.config();
import perf_hooks from 'perf_hooks';

const { performance } = perf_hooks;

import { logger } from '../../../lib/infrastructure/logger.js';
import { cache } from '../../../lib/infrastructure/caches/learning-content-cache.js';
import { knex, disconnect } from '../../../db/knex-database-connection.js';

const replaceThreshold = async () => {
  const results = await knex('stages').select('*').where('threshold', 1);
  logger.info(`${results.length} paliers trouvés à convertir...`);

  const ids = await knex('stages')
    .update({ isFirstSkill: true, threshold: null })
    .where('threshold', 1)
    .returning('id');
  logger.info(`${ids.length} paliers convertis...`);
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await replaceThreshold();
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
      await cache.quit();
    }
  }
})();

export { main };
