import 'dotenv/config';

import * as url from 'node:url';

import _ from 'lodash';
import PgBoss from 'pg-boss';

import * as knowledgeElementRepository from './lib/infrastructure/repositories/knowledge-element-repository.js';
import { config } from './src/shared/config.js';
import { SendSharedParticipationResultsToPoleEmploiHandler } from './src/shared/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler.js';
import { scheduleCpfJobs } from './src/shared/infrastructure/jobs/cpf-export/schedule-cpf-jobs.js';
import { JobQueue } from './src/shared/infrastructure/jobs/JobQueue.js';
import { MonitoredJobQueue } from './src/shared/infrastructure/jobs/monitoring/MonitoredJobQueue.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';

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

class QuestJobHandler {
  constructor({ knowledgeElementRepository }) {
    this.knowledgeElementRepository = knowledgeElementRepository;
  }

  async handle(event) {
    const { userId } = event;
    await this.knowledgeElementRepository.findAllUniqValidatedByUserId(userId);
  }

  get name() {
    return 'answer';
  }
}

export { SendSharedParticipationResultsToPoleEmploiHandler };

export async function runJobs(dependencies = { startPgBoss, createMonitoredJobQueue, scheduleCpfJobs }) {
  const pgBoss = await dependencies.startPgBoss();
  const monitoredJobQueue = dependencies.createMonitoredJobQueue(pgBoss);

  monitoredJobQueue.performJob('answer', QuestJobHandler, {
    knowledgeElementRepository,
  });
}

const startInWebProcess = process.env.START_JOB_IN_WEB_PROCESS;
const isTestEnv = process.env.NODE_ENV === 'test';
const modulePath = url.fileURLToPath(import.meta.url);
const isEntryPointFromOtherFile = process.argv[1] !== modulePath;

if (!isTestEnv) {
  if (!startInWebProcess || (startInWebProcess && isEntryPointFromOtherFile)) {
    await runJobs();
  } else {
    logger.error(
      'Worker process is started in the web process. Please unset the START_JOB_IN_WEB_PROCESS environment variable to start a dedicated worker process.',
    );
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}
