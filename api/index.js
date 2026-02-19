import { databaseConnections } from './db/database-connections.js';
import { databaseConnection as liveDatabaseConnection } from './db/knex-database-connection.js';
import { createServer } from './server.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { learningContentCache } from './src/shared/infrastructure/caches/learning-content-cache.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import * as prometheusPushGateway from './src/shared/infrastructure/metrics/pushgateway.js';
import { quitMutex } from './src/shared/infrastructure/mutex/RedisMutex.js';
import { pgBoss } from './src/shared/infrastructure/repositories/jobs/pg-boss.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';
import { registerJobs } from './worker.js';

validateEnvironmentVariables(configSchema);

let server;

async function _setupEcosystem() {
  /*
    First connection with Knex requires infrastructure operations such as
    DNS resolution. So we execute one harmless query to our database
    so those matters are resolved before starting the server.
  */
  await liveDatabaseConnection.prepare();
}

const start = async function () {
  await _setupEcosystem();
  server = await createServer();
  await server.start();
  prometheusPushGateway.startPushingMetrics();
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
  logger.info('Closing connections to databases...');
  await databaseConnections.disconnect();
  logger.info('Closing connections to cache...');
  await learningContentCache.quit();
  logger.info('Closing connections to storages...');
  await quitAllStorages();
  logger.info('Closing connections to redis mutex...');
  await quitMutex();
  logger.info('Closing connections to redis monitor...');
  await redisMonitor.quit();
  await prometheusPushGateway.stopPushingMetrics();
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
      registerJobs({ jobGroups: [JobGroup.DEFAULT, JobGroup.FAST] });
      import('./worker.js');
    } else {
      // when worker is in its own process we need to start pgBoss in server container too
      await pgBoss.start();
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
