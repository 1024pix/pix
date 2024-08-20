import 'dotenv/config';

import * as url from 'node:url';

import _ from 'lodash';
import PgBoss from 'pg-boss';

import { CertificationRescoringByScriptJobController } from './src/certification/session-management/application/jobs/certification-rescoring-by-script-job-controller.js';
import { CertificationRescoringByScriptJob } from './src/certification/session-management/domain/models/CertificationRescoringByScriptJob.js';
import { GarAnonymizedBatchEventsLoggingJobController } from './src/identity-access-management/application/jobs/gar-anonymized-batch-events-logging-job.controller.js';
import { GarAnonymizedBatchEventsLoggingJob } from './src/identity-access-management/domain/models/GarAnonymizedBatchEventsLoggingJob.js';
import { UserAnonymizedEventLoggingJob } from './src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { ParticipationResultCalculationJobController } from './src/prescription/campaign-participation/application/jobs/participation-result-calculation-job-controller.js';
import { SendSharedParticipationResultsToPoleEmploiJobController } from './src/prescription/campaign-participation/application/jobs/send-share-participation-results-to-pole-emploi-job-controller.js';
import { ParticipationResultCalculationJob } from './src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from './src/prescription/campaign-participation/domain/models/SendSharedParticipationResultsToPoleEmploiJob.js';
import { ComputeCertificabilityJobController } from './src/prescription/learner-management/application/jobs/compute-certificability-job-controller.js';
import { ImportOrganizationLearnersJobController } from './src/prescription/learner-management/application/jobs/import-organization-learners-job-controller.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from './src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ValidateOrganizationLearnersImportFileJobController } from './src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { ComputeCertificabilityJob } from './src/prescription/learner-management/domain/models/ComputeCertificabilityJob.js';
import { ImportOrganizationLearnersJob } from './src/prescription/learner-management/domain/models/ImportOrganizationLearnersJob.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './src/prescription/learner-management/domain/models/ScheduleComputeOrganizationLearnersCertificabilityJob.js';
import { ValidateOrganizationImportFileJob } from './src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { UserAnonymizedEventLoggingJobController } from './src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { LcmsRefreshCacheJobController } from './src/shared/application/jobs/lcms-refresh-cache-job-controller.js';
import { config } from './src/shared/config.js';
import { LcmsRefreshCacheJob } from './src/shared/domain/models/LcmsRefreshCacheJob.js';
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

export async function runJobs(dependencies = { startPgBoss, createMonitoredJobQueue, scheduleCpfJobs }) {
  const pgBoss = await dependencies.startPgBoss();
  const monitoredJobQueue = dependencies.createMonitoredJobQueue(pgBoss);

  // Access
  monitoredJobQueue.performJob(UserAnonymizedEventLoggingJob.name, UserAnonymizedEventLoggingJobController);
  monitoredJobQueue.performJob(GarAnonymizedBatchEventsLoggingJob.name, GarAnonymizedBatchEventsLoggingJobController);

  // Contenu
  monitoredJobQueue.performJob(LcmsRefreshCacheJob.name, LcmsRefreshCacheJobController);

  // Prescription
  monitoredJobQueue.performJob(ComputeCertificabilityJob.name, ComputeCertificabilityJobController);
  monitoredJobQueue.performJob(
    ScheduleComputeOrganizationLearnersCertificabilityJob.name,
    ScheduleComputeOrganizationLearnersCertificabilityJobController,
  );
  monitoredJobQueue.performJob(ParticipationResultCalculationJob.name, ParticipationResultCalculationJobController);
  monitoredJobQueue.performJob(
    SendSharedParticipationResultsToPoleEmploiJob.name,
    SendSharedParticipationResultsToPoleEmploiJobController,
  );

  if (config.pgBoss.importFileJobEnabled) {
    monitoredJobQueue.performJob(ImportOrganizationLearnersJob.name, ImportOrganizationLearnersJobController);
  }
  if (config.pgBoss.validationFileJobEnabled) {
    monitoredJobQueue.performJob(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  }

  //Certification
  monitoredJobQueue.performJob(CertificationRescoringByScriptJob.name, CertificationRescoringByScriptJobController);

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
