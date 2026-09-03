import { expect } from 'chai';
import sinon from 'sinon';

import { ValidateSiecleFileJob } from '../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSiecleFileJob.js';
import { AuditLoggingJobController } from '../../../../../src/shared/application/jobs/audit-logging.job-controller.js';
import { JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
import { config } from '../../../../../src/shared/config.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { JobExpireIn } from '../../../../../src/shared/infrastructure/jobs/default-config.js';
import { JobClient } from '../../../../../src/shared/infrastructure/jobs/JobClient.js';
import { TestEvent } from './test-event.js';

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
  updateQueue() {
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
  getQueue() {
    return;
  }
  getQueueStats() {
    return { queuedCount: 0 };
  }
  getDb() {
    return {
      async exececuteSql() {
        return;
      },
    };
  }

  publish() {
    return;
  }

  subscribe() {
    return;
  }

  unsubscribe() {
    return;
  }

  deleteQueue() {
    return;
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
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],

          isTestOnly: true,
          worker: false,
        },
        () => pgBossStub,
      );

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
          isTestOnly: false,
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.have.been.calledWith(AuditLoggingJob.name);
    });

    it('should enable LISTEN/NOTIFY on registered queues according to configuration', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'createQueue');
      sinon.stub(pgBossStub, 'updateQueue');
      sinon.stub(config.pgBoss, 'useListenNotify').value(true);

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
      expect(pgBossStub.createQueue).to.have.been.calledWith(AuditLoggingJob.name, {
        retentionSeconds: config.pgBoss.retentionSeconds,
        notify: true,
      });
      expect(pgBossStub.updateQueue).to.have.been.calledWith(AuditLoggingJob.name, {
        retentionSeconds: config.pgBoss.retentionSeconds,
        notify: true,
      });
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
          isTestOnly: false,
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
          isTestOnly: false,
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
          isTestOnly: true,
          worker: true,
        },
        () => pgBossStub,
      );

      // then
      expect(pgBossStub.work).to.not.have.been.calledWith(ValidateSiecleFileJob.name);
    });

    describe('cron Job', function () {
      it('schedule TestScheduleComputeOrganizationLearnersCertificabilityJob', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'schedule');
        sinon.stub(config.features.scheduleComputeOrganizationLearnersCertificability, 'cron').value('0 21 * * *');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.schedule).to.have.been.calledWith(
          'TEST.ScheduleComputeOrganizationLearnersCertificabilityJob',
          '0 21 * * *',
          undefined,
          { tz: 'Europe/Paris', expireInSeconds: JobExpireIn.INFINITE },
        );
      });

      it('unschedule legacyName from TestScheduleComputeOrganizationLearnersCertificabilityJob', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'unschedule');
        sinon.stub(config.features.scheduleComputeOrganizationLearnersCertificability, 'cron').value('0 21 * * *');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.unschedule).to.have.been.calledWith('TEST.ComputeOrganizationLearnersCertificabilityJob');
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
              isTestOnly: true,
              worker: true,
            },
            () => pgBossStub,
          );

          // then
          expect(pgBossStub.unschedule).to.have.been.calledWith('Test.CpfExportSenderJob');
        });
      });
    });

    describe('event Job', function () {
      it('subscribe to TestEvent', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'subscribe');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.subscribe).to.have.been.calledWith(TestEvent.eventName, 'test.to-register.event-queue');
      });

      it('unsubscribe to TestEvent', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'unsubscribe');

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.unsubscribe).to.have.been.calledWith(TestEvent.eventName, 'test.to-delete.event-queue');
      });

      it('does not delete queue when queue is not empty', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'deleteQueue');
        sinon.stub(pgBossStub, 'createQueue');
        sinon.stub(pgBossStub, 'getQueueStats').resolves({ queuedCount: 1 });

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.deleteQueue).to.not.have.been.called;
        expect(pgBossStub.createQueue).to.have.been.calledWith('test.to-delete.event-queue');
      });

      it('deletes queue when queue is empty', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'deleteQueue');
        sinon.stub(pgBossStub, 'getQueueStats').resolves({ queuedCount: 0 });

        // when
        const jobClient = new JobClient();
        await jobClient.initialize(
          {
            jobGroups: [JobGroup.DEFAULT],
            isTestOnly: true,
            worker: true,
          },
          () => pgBossStub,
        );

        // then
        expect(pgBossStub.deleteQueue).to.have.been.calledWith();
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
          isTestOnly: true,
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

  context('#getOldestPendingJobAges', function () {
    it('returns the age in seconds of the oldest pending job per queue', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      const executeSql = sinon.stub().resolves({
        rows: [
          { name: 'FirstJob', ageInSeconds: 42 },
          { name: 'SecondJob', ageInSeconds: 3600 },
        ],
      });
      sinon.stub(pgBossStub, 'getDb').returns({ executeSql });

      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          isTestOnly: true,
          worker: true,
        },
        () => pgBossStub,
      );

      // when
      const ages = await jobClient.getOldestPendingJobAges();

      // then
      expect(ages).to.deep.equal([
        { name: 'FirstJob', ageInSeconds: 42 },
        { name: 'SecondJob', ageInSeconds: 3600 },
      ]);
    });
  });

  context('#publishEvent', function () {
    it('should publish an event', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'publish');

      const jobClient = new JobClient();
      await jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          isTestOnly: true,
          worker: true,
        },
        () => pgBossStub,
      );

      // when
      await jobClient.publishEvent(
        'UN_EVENEMENT',
        {
          userId: 123,
          adminId: 456,
        },
        {
          priority: 1,
        },
      );

      // then
      expect(pgBossStub.publish).to.have.been.calledWith(
        'UN_EVENEMENT',
        {
          userId: 123,
          adminId: 456,
        },
        {
          priority: 1,
        },
      );
    });
  });
});
