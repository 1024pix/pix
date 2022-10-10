require('dotenv').config();
const PgBoss = require('pg-boss');
const _ = require('lodash');
const config = require('./lib/config');
const logger = require('./lib/infrastructure/logger');
const JobQueue = require('./lib/infrastructure/jobs/JobQueue');
const ParticipationResultCalculationJob = require('./lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJob');
const SendSharedParticipationResultsToPoleEmploiJob = require('./lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob');
const ParticipationResultCalculationJobHandler = require('./lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler');
const SendSharedParticipationResultsToPoleEmploiHandler = require('./lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');
const dependenciesBuilder = require('./lib/infrastructure/jobs/JobDependenciesBuilder');
const scheduleCpfJobs = require('./lib/infrastructure/jobs/cpf-export/schedule-cpf-jobs');

async function runJobs() {
  logger.info('Starting pg-boss');
  const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;
  const pgBoss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    max: config.pgBoss.connexionPoolMaxSize,
    ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
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
  await pgBoss.start();
  const jobQueue = new JobQueue(pgBoss, dependenciesBuilder);

  process.on('SIGINT', async () => {
    await jobQueue.stop();
    // eslint-disable-next-line node/no-process-exit
    process.exit(0);
  });

  jobQueue.performJob(ParticipationResultCalculationJob.name, ParticipationResultCalculationJobHandler);
  jobQueue.performJob(
    SendSharedParticipationResultsToPoleEmploiJob.name,
    SendSharedParticipationResultsToPoleEmploiHandler
  );

  await scheduleCpfJobs(pgBoss);
}

const startInWebProcess = process.env.START_JOB_IN_WEB_PROCESS;
const isEntryPointFromOtherFile = require.main.filename !== __filename;
if (!startInWebProcess || (startInWebProcess && isEntryPointFromOtherFile)) {
  runJobs();
} else {
  logger.error(
    'Worker process is started in the web process. Please unset the START_JOB_IN_WEB_PROCESS environment variable to start a dedicated worker process.'
  );
  // eslint-disable-next-line node/no-process-exit
  process.exit(1);
}
