import { glob } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import _ from 'lodash';

import { databaseConnections } from './db/database-connections.js';
import { Metrics } from './src/monitoring/infrastructure/metrics.js';
import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config, schema as configSchema } from './src/shared/config.js';
import { learningContentCache } from './src/shared/infrastructure/caches/learning-content-cache.js';
import { JobQueue } from './src/shared/infrastructure/jobs/JobQueue.js';
import { quitAllStorages } from './src/shared/infrastructure/key-value-storages/index.js';
import { quitMutex } from './src/shared/infrastructure/mutex/RedisMutex.js';
import { pgBoss } from './src/shared/infrastructure/repositories/jobs/job-repository.js';
import { importNamedExportFromFile } from './src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { child } from './src/shared/infrastructure/utils/logger.js';
import { validateEnvironmentVariables } from './src/shared/infrastructure/validate-environment-variables.js';

const logger = child('worker', { event: 'worker' });

const workerDirPath = dirname(fileURLToPath(import.meta.url));

const metrics = new Metrics({ config });

export async function startPgBoss() {
  logger.info('Starting pg-boss');

  pgBoss.on('monitor-states', (state) => {
    logger.info({ event: 'pg-boss-state', name: 'global' }, { ...state, queues: undefined });
    _.each(state.queues, (queueState, queueName) => {
      logger.info({ event: 'pg-boss-state', name: queueName }, queueState);
    });
  });
  pgBoss.on('error', (err) => {
    logger.error({ event: 'pg-boss-error' }, err);
  });
  pgBoss.on('wip', (data) => {
    logger.info({ event: 'pg-boss-wip' }, data);
  });
  await pgBoss.start();
  return pgBoss;
}

function checkJobGroups(jobGroups) {
  if (!jobGroups) throw new Error('Job groups are mandatory');
  jobGroups.forEach((jobGroup) => checkJobGroup(jobGroup));
}

function checkJobGroup(jobGroup) {
  if (!Object.values(JobGroup).includes(jobGroup)) {
    throw new Error(`Job group invalid, allowed Job groups are [${Object.values(JobGroup)}]`);
  }
}

export async function registerJobs({ jobGroups, dependencies = { startPgBoss } }) {
  checkJobGroups(jobGroups);

  const pgBoss = await dependencies.startPgBoss();

  if (pgBoss == null) {
    logger.info('Pgboss has not been instanciated. Job registration cancelled.');
    return;
  }

  const jobQueues = new JobQueue(pgBoss);

  const globPattern = `${workerDirPath}/src/**/application/**/*job-controller.js`;

  logger.info(`Search for job handlers in ${globPattern}`);
  const jobFiles = await Array.fromAsync(glob(globPattern, { exclude: ['**/job-controller.js'] }));
  logger.info(`${jobFiles.length} job handlers files found.`);

  let jobModules = {};
  for (const jobFile of jobFiles) {
    const fileModules = await importNamedExportFromFile(jobFile);
    jobModules = { ...jobModules, ...fileModules };
  }

  let jobRegisteredCount = 0;
  let cronJobCount = 0;
  for (const [moduleName, ModuleClass] of Object.entries(jobModules)) {
    const job = new ModuleClass();

    if (!jobGroups.includes(job.jobGroup)) continue;

    if (job.isJobEnabled) {
      logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
      await jobQueues.register(metrics, job.jobName, ModuleClass);

      if (!job.jobCron && job.legacyName) {
        logger.warn(`Temporary Job" ${job.legacyName}" registered from module "${moduleName}."`);
        jobQueues.register(metrics, job.legacyName, ModuleClass);
      }

      if (job.jobCron) {
        await jobQueues.registerScheduleJob({
          name: job.jobName,
          cron: job.jobCron,
          options: { tz: 'Europe/Paris', expireInSeconds: job.expireIn },
        });
        logger.info(`Cron for job "${job.jobName}" scheduled "${job.jobCron}"`);

        // For cronJob we need to unschedule older cron
        if (job.legacyName) {
          await jobQueues.unscheduleCronJob(job.legacyName);
        }

        cronJobCount++;
      } else {
        jobRegisteredCount++;
      }
    } else {
      logger.warn(`Job "${job.jobName}" is disabled.`);

      // For cronJob we need to unschedule older cron
      if (job.jobCron) {
        await jobQueues.unscheduleCronJob(job.jobName);
        logger.info(`Job CRON "${job.jobName}" is unscheduled.`);
      }
    }
  }

  logger.info(`${jobRegisteredCount} jobs registered for groups "${jobGroups}".`);
  logger.info(`${cronJobCount} cron jobs scheduled for groups "${jobGroups}".`);
}

const isRunningFromCli = import.meta.filename === process.argv[1];

let isShuttingDown = false;

async function exitOnSignal(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received signal: ${signal}.`);
  await pgBoss.stop({ graceful: false, timeout: 1000, destroy: true });
  await databaseConnections.disconnect();
  await metrics.clearMetrics();
  await learningContentCache.quit();
  await quitAllStorages();
  await quitMutex();
}

async function main() {
  validateEnvironmentVariables(configSchema);

  const jobGroup = process.argv[2] ? JobGroup[process.argv[2]?.toUpperCase()] : JobGroup.DEFAULT;
  await registerJobs({ jobGroups: [jobGroup] });

  process.on('SIGTERM', async () => {
    await exitOnSignal('SIGTERM');
  });
  process.on('SIGINT', async () => {
    await exitOnSignal('SIGINT');
  });
}

if (isRunningFromCli) {
  main().catch((err) => {
    logger.error({ err }, 'worker crashed');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
}
