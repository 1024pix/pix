import * as dotenv from 'dotenv';

dotenv.config();
import { validateEnvironmentVariables } from './lib/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables();

import { createServer } from './server.js';
import { logger } from './lib/infrastructure/logger.js';
import { disconnect } from './db/knex-database-connection.js';
import { learningContentCache } from './lib/infrastructure/caches/learning-content-cache.js';
import { temporaryStorage } from './lib/infrastructure/temporary-storage/index.js';
import { redisMonitor } from './lib/infrastructure/utils/redis-monitor.js';

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
