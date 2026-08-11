import { databaseConnectionRegistry } from './db/database-connection-registry.js';
import { createMaddoServer } from './server.maddo.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import { quitMutex } from './src/shared/infrastructure/mutex/RedisMutex.js';
import { close as closePubSub } from './src/shared/infrastructure/pubsub.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { redisMonitor } from './src/shared/infrastructure/utils/redis-monitor.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables(configSchema);

let server;
let isShuttingDown = false;

const start = async function () {
  await databaseConnectionRegistry.initialize(['api', 'datamart', 'datawarehouse']);
  server = await createMaddoServer();
  await server.start();
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
  await databaseConnectionRegistry.disconnect();
  logger.info('Closing connections to pubsub...');
  await closePubSub();
  logger.info('Closing connections to storages...');
  await quitAllStorages();
  logger.info('Closing connections to redis mutex...');
  await quitMutex();
  logger.info('Closing connections to redis monitor...');
  await redisMonitor.quit();
  logger.info('Exiting process...');
}

process.on('SIGTERM', async () => {
  await _exitOnSignal('SIGTERM');
});
process.on('SIGINT', async () => {
  await _exitOnSignal('SIGINT');
});

(async () => {
  try {
    await start();

    await JobClient.instance.initialize({
      worker: config.infra.startJobInWebProcess,
      jobGroups: [JobGroup.MADDO],
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
