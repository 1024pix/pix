import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { ValidateSiecleFileJob } from '../../../../../src/prescription/learner-management/domain/models/jobs/ValidateSiecleFileJob.js';
import { AuditLoggingJobController } from '../../../../../src/shared/application/jobs/audit-logging.job-controller.js';
import { JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
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
    return [];
  }
  getQueue() {
    return { queuedCount: 0 };
  }
  getQueueStats() {
    return [];
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

  insert() {
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

    describe('dead letter queue', function () {
      it('creates the dead letter queue on worker initialization', async function () {
        // given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'createQueue');
        sinon.stub(pgBossStub, 'updateQueue');

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
        expect(pgBossStub.createQueue).to.have.been.calledWith(config.pgBoss.deadLetterQueueName, {
          retentionSeconds: config.pgBoss.deadLetterQueueRetentionSeconds,
        });
        expect(pgBossStub.updateQueue).to.have.been.calledWith(config.pgBoss.deadLetterQueueName, {
          retentionSeconds: config.pgBoss.deadLetterQueueRetentionSeconds,
        });
      });

      it('attaches the dead letter queue to an event handler queue', async function () {
        // given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'createQueue');
        sinon.stub(pgBossStub, 'updateQueue');
        sinon.stub(config.pgBoss, 'useListenNotify').value(false);

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
        expect(pgBossStub.createQueue).to.have.been.calledWith('test.to-register.event-queue', {
          retentionSeconds: config.pgBoss.retentionSeconds,
          notify: false,
          deadLetter: config.pgBoss.deadLetterQueueName,
        });
      });

      it('does not attach a dead letter queue to a plain job queue', async function () {
        // given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'createQueue');
        sinon.stub(pgBossStub, 'updateQueue');
        sinon.stub(config.pgBoss, 'useListenNotify').value(false);

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
        expect(pgBossStub.createQueue).to.have.been.calledWith(AuditLoggingJob.name, {
          retentionSeconds: config.pgBoss.retentionSeconds,
          notify: false,
        });
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

        it('unschedule the job even when its cron is not set', async function () {
          //given
          const pgBossStub = new FakePgBoss();
          sinon.stub(pgBossStub, 'unschedule');
          sinon.stub(pgBossStub, 'schedule');
          sinon.stub(config.cpf.sendEmailJob, 'cron').value(undefined);

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
          expect(pgBossStub.schedule).to.not.have.been.calledWith('Test.CpfExportSenderJob');
        });
      });

      context('when an enabled cron job has no cron', function () {
        it('unschedule the job and keep its worker', async function () {
          //given
          const pgBossStub = new FakePgBoss();
          sinon.stub(pgBossStub, 'unschedule');
          sinon.stub(pgBossStub, 'schedule');
          sinon.stub(pgBossStub, 'work');
          sinon.stub(config.features.scheduleComputeOrganizationLearnersCertificability, 'cron').value(undefined);

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
          expect(pgBossStub.unschedule).to.have.been.calledWith(
            'TEST.ScheduleComputeOrganizationLearnersCertificabilityJob',
          );
          expect(pgBossStub.schedule).to.not.have.been.calledWith(
            'TEST.ScheduleComputeOrganizationLearnersCertificabilityJob',
          );
          expect(pgBossStub.work).to.have.been.calledWith('TEST.ScheduleComputeOrganizationLearnersCertificabilityJob');
        });
      });

      it('does not unschedule a job that is not a schedule controller', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'unschedule');

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
        expect(pgBossStub.unschedule).to.not.have.been.calledWith(AuditLoggingJob.name);
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
        sinon.stub(pgBossStub, 'getQueue').resolves({ queuedCount: 1 });

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
        sinon.stub(pgBossStub, 'getQueue').resolves({ queuedCount: 0 });

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
        expect(pgBossStub.deleteQueue).to.have.been.calledWith('test.to-delete.event-queue');
      });

      it('does nothing when queue has already been deleted', async function () {
        //given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'deleteQueue');
        sinon.stub(pgBossStub, 'createQueue');
        sinon.stub(pgBossStub, 'getQueue').resolves(null);

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
        expect(pgBossStub.createQueue).to.not.have.been.calledWith('test.to-delete.event-queue');
      });
    });
  });

  context('orphan queues', function () {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 3600 * 1000);
    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    const initializeWorker = (pgBossStub, jobGroups = [JobGroup.DEFAULT]) =>
      new JobClient().initialize({ jobGroups, isTestOnly: true, worker: true }, () => pgBossStub);

    it('deletes and unschedules an empty queue that no job class declares', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon
        .stub(pgBossStub, 'getQueues')
        .resolves([{ name: 'RemovedJob', queuedCount: 0, activeCount: 0, createdOn: twoDaysAgo }]);
      sinon.stub(pgBossStub, 'unschedule');
      sinon.stub(pgBossStub, 'deleteQueue');

      // when
      await initializeWorker(pgBossStub);

      // then
      expect(pgBossStub.unschedule).to.have.been.calledWith('RemovedJob');
      expect(pgBossStub.deleteQueue).to.have.been.calledWith('RemovedJob');
    });

    [
      { title: 'queued', counts: { queuedCount: 1, activeCount: 0 } },
      { title: 'active', counts: { queuedCount: 0, activeCount: 1 } },
    ].forEach(({ title, counts }) => {
      it(`unschedules but keeps an undeclared queue that still has ${title} jobs`, async function () {
        // given
        const pgBossStub = new FakePgBoss();
        sinon.stub(pgBossStub, 'getQueues').resolves([{ name: 'RemovedJob', ...counts, createdOn: twoDaysAgo }]);
        sinon.stub(pgBossStub, 'unschedule');
        sinon.stub(pgBossStub, 'deleteQueue');

        // when
        await initializeWorker(pgBossStub);

        // then
        expect(pgBossStub.unschedule).to.have.been.calledWith('RemovedJob');
        expect(pgBossStub.deleteQueue).to.not.have.been.calledWith('RemovedJob');
      });
    });

    it('unsubscribes a kept queue from the events still declared by the code', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon
        .stub(pgBossStub, 'getQueues')
        .resolves([{ name: 'RemovedEventHandler', queuedCount: 1, activeCount: 0, createdOn: twoDaysAgo }]);
      sinon.stub(pgBossStub, 'unsubscribe');
      sinon.stub(pgBossStub, 'deleteQueue');

      // when
      await initializeWorker(pgBossStub);

      // then
      expect(pgBossStub.unsubscribe).to.have.been.calledWith(TestEvent.eventName, 'RemovedEventHandler');
      expect(pgBossStub.deleteQueue).to.not.have.been.calledWith('RemovedEventHandler');
    });

    it('leaves untouched an undeclared queue created recently, as a newer deployment may own it', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon
        .stub(pgBossStub, 'getQueues')
        .resolves([{ name: 'JobOfNewerDeployment', queuedCount: 0, activeCount: 0, createdOn: oneHourAgo }]);
      sinon.stub(pgBossStub, 'unschedule');
      sinon.stub(pgBossStub, 'deleteQueue');

      // when
      await initializeWorker(pgBossStub);

      // then
      expect(pgBossStub.unschedule).to.not.have.been.calledWith('JobOfNewerDeployment');
      expect(pgBossStub.deleteQueue).to.not.have.been.calledWith('JobOfNewerDeployment');
    });

    it('leaves untouched the internal queues of pg-boss', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon
        .stub(pgBossStub, 'getQueues')
        .resolves([{ name: '__pgboss__send-it', queuedCount: 0, activeCount: 0, createdOn: twoDaysAgo }]);
      sinon.stub(pgBossStub, 'unschedule');
      sinon.stub(pgBossStub, 'deleteQueue');

      // when
      await initializeWorker(pgBossStub);

      // then
      expect(pgBossStub.unschedule).to.not.have.been.calledWith('__pgboss__send-it');
      expect(pgBossStub.deleteQueue).to.not.have.been.calledWith('__pgboss__send-it');
    });

    it('keeps the queues declared by the code, whatever their job group or status', async function () {
      // given
      const declaredQueueNames = [
        config.pgBoss.deadLetterQueueName,
        AuditLoggingJob.name,
        'TEST.ComputeOrganizationLearnersCertificabilityJob',
        ValidateSiecleFileJob.name,
        'test.to-register.event-queue',
      ];
      const pgBossStub = new FakePgBoss();
      sinon
        .stub(pgBossStub, 'getQueues')
        .resolves(declaredQueueNames.map((name) => ({ name, queuedCount: 0, activeCount: 0, createdOn: twoDaysAgo })));
      sinon.stub(pgBossStub, 'deleteQueue');
      sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

      // when
      await initializeWorker(pgBossStub, [JobGroup.MADDO]);

      // then
      declaredQueueNames.forEach((name) => expect(pgBossStub.deleteQueue).to.not.have.been.calledWith(name));
    });

    it('does not prevent the worker from starting when a deletion fails', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'getQueues').resolves([
        { name: 'FirstRemovedJob', queuedCount: 0, activeCount: 0, createdOn: twoDaysAgo },
        { name: 'SecondRemovedJob', queuedCount: 0, activeCount: 0, createdOn: twoDaysAgo },
      ]);
      sinon.stub(pgBossStub, 'deleteQueue').withArgs('FirstRemovedJob').rejects(new Error('deletion failed'));
      const jobClient = new JobClient();

      // when
      await jobClient.initialize({ jobGroups: [JobGroup.DEFAULT], isTestOnly: true, worker: true }, () => pgBossStub);

      // then
      expect(jobClient.isInitialized).to.be.true;
      expect(pgBossStub.deleteQueue).to.have.been.calledWith('SecondRemovedJob');
    });
  });

  context('#getQueuesStats', function () {
    it('returns the latest stats snapshot of each queue with percentiles', async function () {
      // given
      const pgBossStub = new FakePgBoss();
      sinon.stub(pgBossStub, 'getQueues').resolves([{ name: 'FirstJob' }, { name: 'SecondJob' }]);
      const getQueueStats = sinon.stub(pgBossStub, 'getQueueStats').resolves([]);
      getQueueStats
        .withArgs('FirstJob', { limit: 1, percentiles: [50, 95, 99] })
        .resolves([{ name: 'FirstJob', queuedCount: 3 }]);
      getQueueStats
        .withArgs('SecondJob', { limit: 1, percentiles: [50, 95, 99] })
        .resolves([{ name: 'SecondJob', queuedCount: 5 }]);

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
      const stats = await jobClient.getQueuesStats();

      // then
      expect(stats).to.deep.equal([
        { name: 'FirstJob', queuedCount: 3 },
        { name: 'SecondJob', queuedCount: 5 },
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

  context('pushing jobs', function () {
    let jobClient, insertStub;

    beforeEach(function () {
      const pgBossStub = new FakePgBoss();
      insertStub = sinon.stub(pgBossStub, 'insert');
      jobClient = new JobClient();

      return jobClient.initialize(
        {
          jobGroups: [JobGroup.DEFAULT],
          isTestOnly: true,
          worker: true,
        },
        () => pgBossStub,
      );
    });

    context('#send', function () {
      it('should create a single job', async function () {
        // given
        const job = { userId: 123 };
        const options = {
          priority: 1,
        };

        // when
        await jobClient.send('A_JOB', job, options);

        // then
        expect(insertStub).to.have.been.calledWith('A_JOB', [
          {
            data: job,
            priority: 1,
          },
        ]);
      });
    });

    context('#sendMany', function () {
      it('should create multiple jobs in bulk', async function () {
        // given
        const jobs = [{ userId: 123 }, { userId: 456 }, { userId: 789 }];
        const options = {
          priority: 1,
        };

        // when
        await jobClient.sendMany('A_JOB', jobs, options);

        // then
        expect(insertStub).to.have.been.calledWith('A_JOB', [
          {
            data: jobs[0],
            priority: 1,
          },
          {
            data: jobs[1],
            priority: 1,
          },
          {
            data: jobs[2],
            priority: 1,
          },
        ]);
      });
    });
  });
});
