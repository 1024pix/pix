import 'dotenv/config';

import * as url from 'node:url';

import _ from 'lodash';
import PgBoss from 'pg-boss';

import { eventDispatcher } from './lib/domain/events/index.js';
import * as organizationLearnerRepository from './lib/infrastructure/repositories/organization-learner-repository.js';
import * as pgBossRepository from './lib/infrastructure/repositories/pgboss-repository.js';
import { CertificationRescoringByScriptJobHandler } from './src/certification/session-management/infrastructure/jobs/CertificationRescoringByScriptHandler.js';
import { CertificationRescoringByScriptJob } from './src/certification/session-management/infrastructure/jobs/CertificationRescoringByScriptJob.js';
import { UserAnonymizedEventLoggingJob } from './src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { GarAnonymizedBatchEventsLoggingJob } from './src/identity-access-management/infrastructure/jobs/audit-log/GarAnonymizedBatchEventsLoggingJob.js';
import { GarAnonymizedBatchEventsLoggingJobHandler } from './src/identity-access-management/infrastructure/jobs/audit-log/GarAnonymizedBatchEventsLoggingJobHandler.js';
import { ImportOrganizationLearnersJob } from './src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJob.js';
import { ImportOrganizationLearnersJobHandler } from './src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJobHandler.js';
import { ValidateOrganizationImportFileJob } from './src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJob.js';
import { ValidateOrganizationImportFileJobHandler } from './src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJobHandler.js';
import { UserAnonymizedEventLoggingJobController } from './src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { config } from './src/shared/config.js';
import * as learningContentDatasource from './src/shared/infrastructure/datasources/learning-content/datasource.js';
import { ParticipationResultCalculationJob } from './src/shared/infrastructure/jobs/campaign-result/ParticipationResultCalculationJob.js';
import { ParticipationResultCalculationJobHandler } from './src/shared/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler.js';
import { SendSharedParticipationResultsToPoleEmploiHandler } from './src/shared/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from './src/shared/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob.js';
import { scheduleCpfJobs } from './src/shared/infrastructure/jobs/cpf-export/schedule-cpf-jobs.js';
import { JobQueue } from './src/shared/infrastructure/jobs/JobQueue.js';
import { LcmsRefreshCacheJob } from './src/shared/infrastructure/jobs/lcms/LcmsRefreshCacheJob.js';
import { LcmsRefreshCacheJobHandler } from './src/shared/infrastructure/jobs/lcms/LcmsRefreshCacheJobHandler.js';
import { MonitoredJobQueue } from './src/shared/infrastructure/jobs/monitoring/MonitoredJobQueue.js';
import { ComputeCertificabilityJob } from './src/shared/infrastructure/jobs/organization-learner/ComputeCertificabilityJob.js';
import { ComputeCertificabilityJobHandler } from './src/shared/infrastructure/jobs/organization-learner/ComputeCertificabilityJobHandler.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './src/shared/infrastructure/jobs/organization-learner/ScheduleComputeOrganizationLearnersCertificabilityJob.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobHandler } from './src/shared/infrastructure/jobs/organization-learner/ScheduleComputeOrganizationLearnersCertificabilityJobHandler.js';
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

export async function runJobs(dependencies = { startPgBoss, createMonitoredJobQueue, scheduleCpfJobs }) {
  const pgBoss = await dependencies.startPgBoss();
  const monitoredJobQueue = dependencies.createMonitoredJobQueue(pgBoss);

  monitoredJobQueue.performJob(LcmsRefreshCacheJob.name, LcmsRefreshCacheJobHandler, {
    learningContentDatasource,
    logger,
  });
  monitoredJobQueue.performJob(
    ScheduleComputeOrganizationLearnersCertificabilityJob.name,
    ScheduleComputeOrganizationLearnersCertificabilityJobHandler,
    {
      pgBossRepository,
      organizationLearnerRepository,
      config,
    },
  );
  monitoredJobQueue.performJob(ComputeCertificabilityJob.name, ComputeCertificabilityJobHandler);
  monitoredJobQueue.performJob(ParticipationResultCalculationJob.name, ParticipationResultCalculationJobHandler);
  monitoredJobQueue.performJob(
    SendSharedParticipationResultsToPoleEmploiJob.name,
    SendSharedParticipationResultsToPoleEmploiHandler,
  );

  monitoredJobQueue.performJob(UserAnonymizedEventLoggingJob.name, UserAnonymizedEventLoggingJobController);

  monitoredJobQueue.performJob(GarAnonymizedBatchEventsLoggingJob.name, GarAnonymizedBatchEventsLoggingJobHandler);
  monitoredJobQueue.performJob(CertificationRescoringByScriptJob.name, CertificationRescoringByScriptJobHandler, {
    eventDispatcher,
  });

  if (config.pgBoss.validationFileJobEnabled) {
    monitoredJobQueue.performJob(ValidateOrganizationImportFileJob.name, ValidateOrganizationImportFileJobHandler);
  }

  if (config.pgBoss.importFileJobEnabled) {
    monitoredJobQueue.performJob(ImportOrganizationLearnersJob.name, ImportOrganizationLearnersJobHandler);
  }

  await pgBoss.schedule(
    ScheduleComputeOrganizationLearnersCertificabilityJob.name,
    config.features.scheduleComputeOrganizationLearnersCertificability.cron,
    null,
    { tz: 'Europe/Paris' },
  );
  await dependencies.scheduleCpfJobs(pgBoss);
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
