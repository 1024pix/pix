import 'dotenv/config';

import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables();

import { disconnect, prepareDatabaseConnection } from './db/knex-database-connection.js';
import { createServer } from './server.js';
import { config } from './src/shared/config.js';
import { learningContentCache } from './src/shared/infrastructure/caches/learning-content-cache.js';
import { initLearningContent } from './src/shared/infrastructure/datasources/learning-content/datasource.js';
import { temporaryStorage } from './src/shared/infrastructure/temporary-storage/index.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';

let server;

async function _setupEcosystem() {
  /*
    Load learning content from Redis to memory cache can take some time
    Hence, we force this loading before the server starts so the requests can
    immediately be responded.
  */
  await initLearningContent();
  /*
    First connection with Knex requires infrastructure operations such as
    DNS resolution. So we execute one harmless query to our database
    so those matters are resolved before starting the server.
  */
  await prepareDatabaseConnection();
}

const start = async function () {
  if (config.featureToggles.setupEcosystemBeforeStart) {
    await _setupEcosystem();
  }
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
