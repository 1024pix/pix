import { CertificationCompletedJob } from '../../lib/domain/events/CertificationCompleted.js';
import { CertificationCompletedJobController } from '../../src/certification/scoring/application/jobs/certification-completed-job-controller.js';
import { CertificationRescoringByScriptJobController } from '../../src/certification/session-management/application/jobs/certification-rescoring-by-script-job-controller.js';
import { CertificationRescoringByScriptJob } from '../../src/certification/session-management/domain/models/CertificationRescoringByScriptJob.js';
import { UserAnonymizedEventLoggingJob } from '../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { CampaignParticipationCompletedJobController } from '../../src/prescription/campaign-participation/application/jobs/campaign-participation-completed-job-controller.js';
import { ParticipationResultCalculationJobController } from '../../src/prescription/campaign-participation/application/jobs/participation-result-calculation-job-controller.js';
import { CampaignParticipationCompletedJob } from '../../src/prescription/campaign-participation/domain/models/CampaignParticipationCompletedJob.js';
import { ParticipationResultCalculationJob } from '../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { ComputeCertificabilityJobController } from '../../src/prescription/learner-management/application/jobs/compute-certificability-job-controller.js';
import { ImportOrganizationLearnersJobController } from '../../src/prescription/learner-management/application/jobs/import-organization-learners-job-controller.js';
import { ValidateOrganizationLearnersImportFileJobController } from '../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { ComputeCertificabilityJob } from '../../src/prescription/learner-management/domain/models/ComputeCertificabilityJob.js';
import { ImportOrganizationLearnersJob } from '../../src/prescription/learner-management/domain/models/ImportOrganizationLearnersJob.js';
import { ValidateOrganizationImportFileJob } from '../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { UserAnonymizedEventLoggingJobController } from '../../src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { LcmsRefreshCacheJobController } from '../../src/shared/application/jobs/lcms-refresh-cache-job-controller.js';
import { config } from '../../src/shared/config.js';
import { LcmsRefreshCacheJob } from '../../src/shared/domain/models/LcmsRefreshCacheJob.js';
import { runJobs } from '../../worker.js';
import { expect, sinon } from '../test-helper.js';

describe('#runjobs', function () {
  let startPgBossStub, createMonitoredJobQueueStub, scheduleCpfJobsStub, monitoredJobQueueStub;

  beforeEach(function () {
    const pgBossStub = { schedule: sinon.stub() };
    monitoredJobQueueStub = { performJob: sinon.stub() };
    startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    createMonitoredJobQueueStub = sinon.stub();
    createMonitoredJobQueueStub.withArgs(pgBossStub).returns(monitoredJobQueueStub);
    scheduleCpfJobsStub = sinon.stub();
  });

  describe('Acces', function () {
    it('should register UserAnonymizedEventLoggingJob', async function () {
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === UserAnonymizedEventLoggingJob.name);

      expect(calls.args[1]).to.equal(UserAnonymizedEventLoggingJobController);
    });
  });

  describe('Contenu', function () {
    it('should register LcmsRefreshCacheJob', async function () {
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === LcmsRefreshCacheJob.name);

      expect(calls.args[1]).to.equal(LcmsRefreshCacheJobController);
    });
  });

  describe('Certification', function () {
    it('should register CertificationCompletedJob', async function () {
      //given
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === CertificationCompletedJob.name);

      expect(calls.args[1]).to.equal(CertificationCompletedJobController);
    });

    it('should register CertificationRescoringByScriptJob', async function () {
      //given
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === CertificationRescoringByScriptJob.name);

      expect(calls.args[1]).to.equal(CertificationRescoringByScriptJobController);
    });
  });

  describe('Prescription', function () {
    it('should register CampaignParticipationCompletedJob', async function () {
      //given

      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === CampaignParticipationCompletedJob.name);

      expect(calls.args[1]).to.equal(CampaignParticipationCompletedJobController);
    });

    it('should register ComputeCertificabilityJob', async function () {
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === ComputeCertificabilityJob.name);

      expect(calls.args[1]).to.equal(ComputeCertificabilityJobController);
    });

    it('should register ParticipationResultCalculationJob', async function () {
      // when
      await runJobs({
        startPgBoss: startPgBossStub,
        createMonitoredJobQueue: createMonitoredJobQueueStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      });

      // then
      const calls = monitoredJobQueueStub.performJob
        .getCalls()
        .find(({ args }) => args[0] === ParticipationResultCalculationJob.name);

      expect(calls.args[1]).to.equal(ParticipationResultCalculationJobController);
    });

    describe('Import jobs', function () {
      it('should register ValidateOrganizationImportFileJob', async function () {
        //given
        sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

        // when
        await runJobs({
          startPgBoss: startPgBossStub,
          createMonitoredJobQueue: createMonitoredJobQueueStub,
          scheduleCpfJobs: scheduleCpfJobsStub,
        });

        // then
        const calls = monitoredJobQueueStub.performJob
          .getCalls()
          .find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);

        expect(calls.args[1]).to.equal(ValidateOrganizationLearnersImportFileJobController);
      });

      it('should not register import job if PGBOSS_IMPORT_FILE_JOB_ENABLED is false', async function () {
        //given
        sinon.stub(config.pgBoss, 'importFileJobEnabled').value(false);
        // when
        await runJobs({
          startPgBoss: startPgBossStub,
          createMonitoredJobQueue: createMonitoredJobQueueStub,
          scheduleCpfJobs: scheduleCpfJobsStub,
        });

        // then
        const calls = monitoredJobQueueStub.performJob.getCalls();

        const validatationJob = calls.find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);
        const importJob = calls.find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

        expect(validatationJob).to.exist;
        expect(importJob).to.be.undefined;
      });

      it('should not register validation job if PGBOSS_VALIDATION_FILE_JOB_ENABLED is false', async function () {
        //given
        sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);
        // when
        await runJobs({
          startPgBoss: startPgBossStub,
          createMonitoredJobQueue: createMonitoredJobQueueStub,
          scheduleCpfJobs: scheduleCpfJobsStub,
        });

        // then
        const calls = monitoredJobQueueStub.performJob.getCalls();

        const validatationJob = calls.find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);
        const importJob = calls.find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

        expect(validatationJob).to.be.undefined;
        expect(importJob).to.exist;
      });

      it('should register ImportOrganizationLearnersJob', async function () {
        //given
        sinon.stub(config.pgBoss, 'importFileJobEnabled').value(true);

        // when
        await runJobs({
          startPgBoss: startPgBossStub,
          createMonitoredJobQueue: createMonitoredJobQueueStub,
          scheduleCpfJobs: scheduleCpfJobsStub,
        });

        // then
        const calls = monitoredJobQueueStub.performJob
          .getCalls()
          .find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

        expect(calls.args[1]).to.equal(ImportOrganizationLearnersJobController);
      });
    });
  });
});
