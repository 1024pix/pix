import 'dotenv/config';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import _ from 'lodash';
import PgBoss from 'pg-boss';

import { JobGroup } from './src/shared/application/jobs/job-controller.js';
import { config } from './src/shared/config.js';
import { JobQueue } from './src/shared/infrastructure/jobs/JobQueue.js';
import { importNamedExportFromFile } from './src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';

const isTestEnv = process.env.NODE_ENV === 'test';
const isJobInWebProcess = process.env.START_JOB_IN_WEB_PROCESS === 'true';
const workerDirPath = dirname(fileURLToPath(import.meta.url));

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

function createJobQueues(pgBoss) {
  const jobQueues = new JobQueue(pgBoss);
  process.on('SIGINT', async () => {
    await jobQueues.stop();

    // Make sure pgBoss stopped before quitting
    pgBoss.on('stopped', () => {
      // eslint-disable-next-line n/no-process-exit
      process.exit(0);
    });
  });
  return jobQueues;
}

function checkJobGroup(jobGroup) {
  if (!jobGroup) {
    throw new Error(`Job group invalid, allowed Job groups are [${Object.values(JobGroup)}]`);
  }
  logger.info(`Job group "${jobGroup}"`);
}

export async function registerJobs({ jobGroup, dependencies = { startPgBoss, createJobQueues } }) {
  checkJobGroup(jobGroup);

  const pgBoss = await dependencies.startPgBoss();

  const jobQueues = dependencies.createJobQueues(pgBoss);

  const globPattern = `${workerDirPath}/src/**/application/**/*job-controller.js`;

  logger.info(`Search for job handlers in ${globPattern}`);
  const jobFiles = await glob(globPattern, { ignore: '**/job-controller.js' });
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

    if (!isJobInWebProcess && job.jobGroup !== jobGroup) continue;

    if (job.isJobEnabled) {
      logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
      jobQueues.register(job.jobName, ModuleClass);

      if (!job.jobCron && job.legacyName) {
        logger.warn(`Temporary Job" ${job.legacyName}" registered from module "${moduleName}."`);
        jobQueues.register(job.legacyName, ModuleClass);
      }

      if (job.jobCron) {
        await jobQueues.scheduleCronJob({ name: job.jobName, cron: job.jobCron, options: { tz: 'Europe/Paris' } });
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
    }
  }

  logger.info(`${jobRegisteredCount} jobs registered for group "${jobGroup}".`);
  logger.info(`${cronJobCount} cron jobs scheduled for group "${jobGroup}".`);
}

if (!isTestEnv) {
  const jobGroup = process.argv[2] ? JobGroup[process.argv[2]?.toUpperCase()] : JobGroup.DEFAULT;
  await registerJobs({ jobGroup });
}
