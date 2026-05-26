import { databaseConnections } from './db/database-connections.js';
import { checkJobGroups, JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import { DatadogMetrics } from './src/shared/infrastructure/metrics/datadog-metrics.js';
import { quitMutex } from './src/shared/infrastructure/mutex/RedisMutex.js';
import { close as closePubsub } from './src/shared/infrastructure/pubsub.js';
import { child } from './src/shared/infrastructure/utils/logger.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

const logger = child('worker', { event: 'worker' });

const metrics = new DatadogMetrics({ config });

const isRunningFromCli = import.meta.filename === process.argv[1];

let isShuttingDown = false;

async function main() {
  validateEnvironmentVariables(configSchema);

  const jobGroup = process.argv[2] ? JobGroup[process.argv[2]?.toUpperCase()] : JobGroup.DEFAULT;
  const jobGroups = [jobGroup];
  checkJobGroups(jobGroups);

  await JobClient.instance.initialize({ worker: true, jobGroups });

  process.on('SIGTERM', async () => {
    await exitOnSignal('SIGTERM');
  });
  process.on('SIGINT', async () => {
    await exitOnSignal('SIGINT');
  });
}

async function exitOnSignal(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received signal: ${signal}.`);
  await JobClient.instance.stop();
  await databaseConnections.disconnect();
  await metrics.clearMetrics();
  await closePubsub();
  await quitAllStorages();
  await quitMutex();
}

if (isRunningFromCli) {
  main().catch((err) => {
    logger.error({ err }, 'worker crashed');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
}
