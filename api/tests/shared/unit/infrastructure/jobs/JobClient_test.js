import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ValidateOrganizationImportFileJob } from '../../../../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { AuditLoggingJobController } from '../../../../../src/shared/application/jobs/audit-logging.job-controller.js';
import { JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
import { config } from '../../../../../src/shared/config.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { JobClient } from '../../../../../src/shared/infrastructure/jobs/JobClient.js';
import { JobExpireIn } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';

class FakePgBoss {
  start() {
    return;
  }
  stop() {
    return;
  }
  on() {
    return;
  }
  onComplete() {
    return;
  }
  work() {
    return;
  }
  schedule() {
    return;
  }
  unschedule() {
    return;
  }
}

describe('Unit | Worker', function () {
  context('#registerJobs', function () {
    it('should register AuditLoggingJob', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'work');
      // when
      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.have.been.calledWith(AuditLoggingJob.name);
    });

    it('should register legacyName from AuditLoggingJob', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'work');
      sinon.stub(AuditLoggingJobController.prototype, 'legacyName').get(() => 'legacyNameForAuditLoggingJobController');

      // when
      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.have.been.calledWith('legacyNameForAuditLoggingJobController');
    });

    it('should register ValidateOrganizationImportFileJob when job is enabled', async function () {
      //given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'work');
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

      // when
      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.have.been.calledWith(ValidateOrganizationImportFileJob.name);
    });

    it('should not register ValidateOrganizationImportFileJob when job is disabled', async function () {
      //given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'work');
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      // when
      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.not.have.been.calledWith(ValidateOrganizationImportFileJob.name);
    });

    describe('cron Job', function () {
      it('schedule ScheduleComputeOrganizationLearnersCertificabilityJob', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'schedule');
        sinon.stub(config.features.scheduleComputeOrganizationLearnersCertificability, 'cron').value('0 21 * * *');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.schedule).to.have.been.calledWith(
          'ScheduleComputeOrganizationLearnersCertificabilityJob',
          '0 21 * * *',
          undefined,
          { tz: 'Europe/Paris', expireInSeconds: JobExpireIn.INFINITE },
        );
      });

      it('unschedule legacyName from ScheduleComputeOrganizationLearnersCertificabilityJob', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'unschedule');
        sinon
          .stub(ScheduleComputeOrganizationLearnersCertificabilityJobController.prototype, 'legacyName')
          .get(() => 'legyNameForScheduleComputeOrganizationLearnersCertificabilityJobController');
        sinon.stub(config.features.scheduleComputeOrganizationLearnersCertificability, 'cron').value('0 21 * * *');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.unschedule).to.have.been.calledWith(
          'legyNameForScheduleComputeOrganizationLearnersCertificabilityJobController',
        );
      });

      context('when a cron job is disabled', function () {
        it('unschedule the job', async function () {
          //given
          const pgBossStub = new FakePgBoss();
          sinon.stub(pgBossStub, 'unschedule');
          sinon.stub(config.cpf.sendEmailJob, 'cron').value('0 21 * * *');
          sinon.stub(config.pgBoss, 'exportSenderJobEnabled').value(false);

          // when
          const jobClient = new JobClient();
          await jobClient.initialize(
            {
              jobGroups: [JobGroup.DEFAULT],
              worker: true,
            },
            () => pgBossStub,
          );

          // then
          expect(pgBossStub.unschedule).to.have.been.calledWith('CpfExportSenderJob');
        });
      });
    });
  });
});
