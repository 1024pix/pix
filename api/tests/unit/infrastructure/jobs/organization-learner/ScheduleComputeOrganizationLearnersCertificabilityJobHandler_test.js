import { expect, sinon, knex } from '../../../../test-helper.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobHandler } from '../../../../../lib/infrastructure/jobs/organization-learner/ScheduleComputeOrganizationLearnersCertificabilityJobHandler.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

describe('Unit | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobHandler', function () {
  context('#handle', function () {
    let domainTransaction;
    let pgBossRepository;
    let organizationLearnerRepository;
    let logger;
    let clock;
    let config;
    let fromUserActivityDate;
    let toUserActivityDate;

    beforeEach(function () {
      const transaction = Symbol('domainTransaction');
      sinon
        .stub(knex, 'transaction')
        .withArgs(sinon.match.func, { isolationLevel: 'repeatable read' })
        .callsFake((lambda) => {
          return lambda(transaction);
        });

      const now = dayjs('2023-10-02T21:00:01').tz('Europe/Paris').toDate();
      clock = sinon.useFakeTimers(now);

      config = {
        features: {
          scheduleComputeOrganizationLearnersCertificability: {
            chunkSize: 2,
            cron: '0 21 * * *',
          },
        },
      };

      toUserActivityDate = dayjs('2023-10-02').tz('Europe/Paris').hour(21).minute(0).second(0).millisecond(0).toDate();
      fromUserActivityDate = dayjs('2023-10-01')
        .tz('Europe/Paris')
        .hour(21)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();

      domainTransaction = {
        knexTransaction: transaction,
      };

      pgBossRepository = {
        insert: sinon.stub(),
      };

      pgBossRepository.insert.resolves([]);

      organizationLearnerRepository = {
        findByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
        countByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
      };

      logger = {
        info: sinon.stub(),
      };
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should schedule multiple ComputeCertificabilityJob', async function () {
      // given
      const skipLoggedLastDayCheck = undefined;
      const onlyNotComputed = undefined;

      organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves(3);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 2,
          offset: 0,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves([1, 2]);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 2,
          offset: 2,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves([3]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobHandler({
          pgBossRepository,
          organizationLearnerRepository,
          config,
          logger,
        });

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle(null);

      // then
      expect(pgBossRepository.insert.getCall(0).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 1 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 2 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
      expect(pgBossRepository.insert.getCall(1).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 3 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
    });

    it('should take options from event', async function () {
      // given
      const skipLoggedLastDayCheck = true;
      const onlyNotComputed = true;

      organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves(3);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 2,
          offset: 0,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves([1, 2]);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 2,
          offset: 2,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves([3]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobHandler({
          pgBossRepository,
          organizationLearnerRepository,
          config,
          logger,
        });

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
        skipLoggedLastDayCheck,
        onlyNotComputed,
      });

      // then
      expect(pgBossRepository.insert.getCall(0).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 1 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 2 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
      expect(pgBossRepository.insert.getCall(1).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 3 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
    });

    it('should test pagination with a lot of results', async function () {
      // given
      const skipLoggedLastDayCheck = undefined;
      const onlyNotComputed = undefined;

      const chunkCount = 10;
      const limit = 3;

      config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize = limit;

      organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
        .withArgs({
          fromUserActivityDate,
          toUserActivityDate,
          skipLoggedLastDayCheck,
          onlyNotComputed,
          domainTransaction,
        })
        .resolves(30);

      for (let index = 0; index < chunkCount; index++) {
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            limit,
            offset: index * limit,
            fromUserActivityDate,
            toUserActivityDate,
            skipLoggedLastDayCheck,
            onlyNotComputed,
            domainTransaction,
          })
          .resolves([index * limit + 1, index * limit + 2, index * limit + 3]);
      }

      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobHandler({
          pgBossRepository,
          organizationLearnerRepository,
          config,
          logger,
        });

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle();

      // then
      for (let index = 0; index < chunkCount; index++) {
        expect(pgBossRepository.insert.getCall(index).args[0]).to.be.deep.equal([
          {
            name: 'ComputeCertificabilityJob',
            data: { organizationLearnerId: index * limit + 1 },
            retrylimit: 0,
            retrydelay: 30,
            on_complete: true,
          },
          {
            name: 'ComputeCertificabilityJob',
            data: { organizationLearnerId: index * limit + 2 },
            retrylimit: 0,
            retrydelay: 30,
            on_complete: true,
          },
          {
            name: 'ComputeCertificabilityJob',
            data: { organizationLearnerId: index * limit + 3 },
            retrylimit: 0,
            retrydelay: 30,
            on_complete: true,
          },
        ]);
        expect(pgBossRepository.insert.getCall(index).args[1]).to.be.deep.equal(domainTransaction);
      }
    });
  });
});
