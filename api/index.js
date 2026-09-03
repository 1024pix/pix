import { databaseConnectionRegistry } from './db/database-connection-registry.js';
import { createServer } from './server.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import * as prometheusPushGateway from './src/shared/infrastructure/metrics/pushgateway.js';
import { releaseInfrastructure } from './src/shared/infrastructure/release-infrastructure.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';
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
  await databaseConnectionRegistry.initialize(['api']);
}

const start = async function () {
  await _setupEcosystem();
  server = await createServer();
  await server.start();
  prometheusPushGateway.startPushingMetrics();

  await JobClient.instance.initialize({
    worker: config.infra.startJobInWebProcess,
    jobGroups: [JobGroup.DEFAULT],
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
  if (server.oppsy) {
    logger.info('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  await releaseInfrastructure();
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
