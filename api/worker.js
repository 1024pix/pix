import 'dotenv/config';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import _ from 'lodash';
import PgBoss from 'pg-boss';

import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './src/prescription/learner-management/domain/models/ScheduleComputeOrganizationLearnersCertificabilityJob.js';
import { config } from './src/shared/config.js';
import { scheduleCpfJobs } from './src/shared/infrastructure/jobs/cpf-export/schedule-cpf-jobs.js';
import { JobQueue } from './src/shared/infrastructure/jobs/JobQueue.js';
import { MonitoredJobQueue } from './src/shared/infrastructure/jobs/monitoring/MonitoredJobQueue.js';
import { importNamedExportFromFile } from './src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';

const workerPath = fileURLToPath(import.meta.url);
const workerDirPath = dirname(workerPath);

async function startPgBoss() {
  logger.info('Starting pg-boss');
  const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;
  const pgBoss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    max: config.pgBoss.connexionPoolMaxSize,
    ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
    archiveFailedAfterSeconds: config.pgBoss.archiveFailedAfterSeconds,
  });
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

function createMonitoredJobQueue(pgBoss) {
  const jobQueue = new JobQueue(pgBoss);
  const monitoredJobQueue = new MonitoredJobQueue(jobQueue);
  process.on('SIGINT', async () => {
    await monitoredJobQueue.stop();

    // Make sure pgBoss stopped before quitting
    pgBoss.on('stopped', () => {
      // eslint-disable-next-line n/no-process-exit
      process.exit(0);
    });
  });
  return monitoredJobQueue;
}

export async function registerJobs(dependencies = { startPgBoss, createMonitoredJobQueue, scheduleCpfJobs }) {
  const pgBoss = await dependencies.startPgBoss();
  const monitoredJobQueue = dependencies.createMonitoredJobQueue(pgBoss);

  const globPattern = `${workerDirPath}/src/**/application/**/*job-controller.js`;

  logger.info(`Search for job handlers in ${globPattern}`);
  const jobFiles = await glob(globPattern, { ignore: '**/job-controller.js' });

  logger.info(`${jobFiles.length} job handlers files found.`);
  let jobModules = {};
  for (const jobFile of jobFiles) {
    const fileModules = await importNamedExportFromFile(jobFile);
    jobModules = { ...jobModules, ...fileModules };
  }

  for (const [moduleName, ModuleClass] of Object.entries(jobModules)) {
    const job = new ModuleClass();

    if (job.isJobEnabled()) {
      logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
      monitoredJobQueue.registerJob(job.jobName, ModuleClass);
    } else {
      logger.warn(`Job "${job.jobName}" is disabled.`);
    }
  }

  // TODO - use abstraction for CRON

  //schudeler
  await pgBoss.schedule(
    ScheduleComputeOrganizationLearnersCertificabilityJob.name,
    config.features.scheduleComputeOrganizationLearnersCertificability.cron,
    null,
    { tz: 'Europe/Paris' },
  );

  // Certification
  await dependencies.scheduleCpfJobs(pgBoss);
}

const startInWebProcess = process.env.START_JOB_IN_WEB_PROCESS;
const isTestEnv = process.env.NODE_ENV === 'test';
const isEntryPointFromOtherFile = process.argv[1] !== workerPath;

if (!isTestEnv) {
  if (!startInWebProcess || (startInWebProcess && isEntryPointFromOtherFile)) {
    await registerJobs();
  } else {
    logger.error(
      'Worker process is started in the web process. Please unset the START_JOB_IN_WEB_PROCESS environment variable to start a dedicated worker process.',
    );
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}
