import { setupOtel } from './src/shared/infrastructure/otel/otel-setup.js';
setupOtel('pix-api-maddo');
import { databaseConnections } from './db/database-connections.js';
import { createMaddoServer } from './server.maddo.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables(configSchema);

let server;
let isShuttingDown = false;

const start = async function () {
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
  await databaseConnections.disconnect();
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

    await JobClient.instance.initialize({
      worker: config.infra.startJobInWebProcess,
      jobGroups: [JobGroup.MADDO],
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
