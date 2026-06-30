import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ValidateSiecleFileJob } from '../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSiecleFileJob.js';
import { AuditLoggingJobController } from '../../../../../src/shared/application/jobs/audit-logging.job-controller.js';
import { JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
import { config } from '../../../../../src/shared/config.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { JobClient } from '../../../../../src/shared/infrastructure/jobs/JobClient.js';
import { JobExpireIn } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../test-helper.js';

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
  createQueue() {
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
  getQueues() {
    return;
  }
  getDb() {
    return {
      async exececuteSql() {
        return;
      },
    };
  }
}

describe('Unit | JobClient', function () {
  context('#initialize', function () {
    it('registers an error listener on the client instance to prevent process crash', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'on');

      // when
      const jobClient = new JobClient();
      await jobClient.initialize({ jobGroups: [JobGroup.DEFAULT], worker: false }, () => pgBossStub);

      // then
      expect(pgBossStub.on).to.have.been.calledWith('error');
    });
  });

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

    it('should register ValidateSiecleFileJob when job is enabled', async function () {
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
      expect(pgBossStub.work).to.have.been.calledWith(ValidateSiecleFileJob.name);
    });

    it('should not register ValidateSiecleFileJob when job is disabled', async function () {
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
      expect(pgBossStub.work).to.not.have.been.calledWith(ValidateSiecleFileJob.name);
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
  context('#getQueuesStats', function () {
    it('returns stats', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      const executeSql = sinon.stub().resolves({
        rows: [
          { name: 'FirstJob', state: 'active', count: 1 },
          { name: 'FirstJob', state: 'failed', count: 7 },
          { name: 'FirstJob', state: 'completed', count: 33 },
          { name: 'SecondJob', state: 'completed', count: 10 },
        ],
      });
      sinon.stub(pgBossStub, 'getDb').returns({ executeSql });
      sinon.stub(pgBossStub, 'getQueues').resolves([{ name: 'FirstJob' }, { name: 'SecondJob' }, { name: 'ThirdJob' }]);

      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          worker: true,
        },
        () => pgBossStub,
      );

      const stats = await jobClient.getQueuesStats();

      // then
      expect(stats).to.deep.equal({
        global: {
          pending: 0,
          created: 0,
          retry: 0,
          active: 1,
          completed: 43,
          cancelled: 0,
          failed: 7,
          all: 51,
        },
        FirstJob: {
          pending: 0,
          created: 0,
          retry: 0,
          active: 1,
          completed: 33,
          cancelled: 0,
          failed: 7,
          all: 41,
        },
        SecondJob: {
          pending: 0,
          created: 0,
          retry: 0,
          active: 0,
          completed: 10,
          cancelled: 0,
          failed: 0,
          all: 10,
        },
        ThirdJob: {
          pending: 0,
          created: 0,
          retry: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
          failed: 0,
          all: 0,
        },
      });
    });
  });
});
