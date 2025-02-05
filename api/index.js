import 'dotenv/config';

import { disconnect, prepareDatabaseConnection } from './db/knex-database-connection.js';
import { createServer } from './server.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { learningContentCache } from './src/shared/infrastructure/caches/learning-content-cache.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables(configSchema);

let server;

async function _setupEcosystem() {
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
  await server.directMetrics?.clearMetrics();
  if (server.oppsy) {
    logger.info('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  logger.info('Closing connections to database...');
  await disconnect();
  logger.info('Closing connections to cache...');
  await learningContentCache.quit();
  logger.info('Closing connections to storages...');
  await quitAllStorages();
  logger.info('Closing connections to redis monitor...');
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
    if (config.infra.startJobInWebProcess) {
      import('./worker.js');
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
