import 'dotenv/config';

import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables();

import { disconnect, prepareDatabaseConnection } from './db/knex-database-connection.js';
import { createMaddoServer } from './server.maddo.js';
import { config } from './src/shared/config.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';

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
  server = await createMaddoServer();
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
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
