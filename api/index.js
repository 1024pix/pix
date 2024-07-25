import 'dotenv/config';

import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables();

import { disconnect } from './db/knex-database-connection.js';
import { createServer } from './server.js';
import { learningContentCache } from './src/shared/infrastructure/caches/learning-content-cache.js';
import { temporaryStorage } from './src/shared/infrastructure/temporary-storage/index.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';

let server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal(signal) {
  logger.info(`Received signal: ${signal}.`);
  logger.info('Stopping HAPI server...');
  await server.stop({ timeout: 30000 });
  if (server.oppsy) {
    logger.info('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  logger.info('Closing connexions to database...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await learningContentCache.quit();
  logger.info('Closing connexions to temporary storage...');
  await temporaryStorage.quit();
  logger.info('Closing connexions to redis monitor...');
  await redisMonitor.quit();
  logger.info('Exiting process...');
}

process.on('SIGTERM', () => {
  _exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  _exitOnSignal('SIGINT');
});

(async () => {
  try {
    await start();
    if (process.env.START_JOB_IN_WEB_PROCESS) {
      import('./worker.js');
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
