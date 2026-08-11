import { databaseConnectionRegistry } from './db/database-connection-registry.js';
import { checkJobGroups, JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { JobClient } from './src/shared/infrastructure/jobs/JobClient.js';
import { DatadogMetrics } from './src/shared/infrastructure/metrics/datadog-metrics.js';
import { releaseInfrastructure } from './src/shared/infrastructure/release-infrastructure.js';
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

  const requiredDatabases = jobGroup === JobGroup.MADDO ? ['api', 'datamart', 'datawarehouse'] : ['api'];
  await databaseConnectionRegistry.initialize(requiredDatabases);

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
  await metrics.clearMetrics();
  await releaseInfrastructure();
}

if (isRunningFromCli) {
  main().catch((err) => {
    logger.error({ err }, 'worker crashed');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
}
