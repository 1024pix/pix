import { databaseConnections } from './db/database-connections.js';
import { databaseConnection as liveDatabaseConnection } from './db/knex-database-connection.js';
import { createServer } from './server.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import * as prometheusPushGateway from './src/shared/infrastructure/metrics/pushgateway.js';
import { quitMutex } from './src/shared/infrastructure/mutex/RedisMutex.js';
import { close as closePubSub } from './src/shared/infrastructure/pubsub.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables(configSchema);

let server;
let isShuttingDown = false;

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

  await JobClient.instance.initialize({
    worker: config.infra.startJobInWebProcess,
    jobGroups: [JobGroup.DEFAULT, JobGroup.FAST],
  });
};

async function _exitOnSignal(signal) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  logger.info(`Received signal: ${signal}.`);
  logger.info('Stopping HAPI server...');
  await server.stop({ timeout: 30000 });
  await server.directMetrics?.clearMetrics();
  if (server.oppsy) {
    logger.info('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  logger.info('Stopping PG Boss client...');
  await JobClient.instance.stop();
  logger.info('Closing connections to databases...');
  await databaseConnections.disconnect();
  logger.info('Closing connections to pubsub...');
  await closePubSub();
  logger.info('Closing connections to storages...');
  await quitAllStorages();
  logger.info('Closing connections to redis mutex...');
  await quitMutex();
  logger.info('Closing connections to redis monitor...');
  await redisMonitor.quit();
  await prometheusPushGateway.stopPushingMetrics();
  logger.info('Exiting process...');
}

process.on('SIGTERM', async () => {
  await _exitOnSignal('SIGTERM');
});
process.on('SIGINT', async () => {
  await _exitOnSignal('SIGINT');
});

try {
  await start();
} catch (error) {
  logger.error(error);
  throw error;
}
