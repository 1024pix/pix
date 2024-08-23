import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { expect, knex, sinon } from '../../../../../test-helper.js';
dayjs.extend(utc);
dayjs.extend(timezone);

describe('Unit | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobController', function () {
  context('#handle', function () {
    let computeCertificabilityJobRepository;
    let organizationLearnerRepository;
    let logger;
    let clock;
    let config;
    let fromUserActivityDate;
    let toUserActivityDate;

    beforeEach(function () {
      sinon
        .stub(knex, 'transaction')
        .withArgs(sinon.match.func, { isolationLevel: 'repeatable read' })
        .callsFake((lambda) => {
          return lambda();
        });

      const now = dayjs('2023-10-02T21:00:01').tz('Europe/Paris').toDate();
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

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

      computeCertificabilityJobRepository = {
        performAsync: sinon.stub(),
      };

      computeCertificabilityJobRepository.performAsync.resolves([]);

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
        })
        .resolves([3]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobController();

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
        dependencies: {
          logger,
          organizationLearnerRepository,
          computeCertificabilityJobRepository,
          config,
        },
      });

      // then
      expect(computeCertificabilityJobRepository.performAsync.getCall(0).args[0]).to.be.deep.equal(
        {
          organizationLearnerId: 1,
        },
        {
          organizationLearnerId: 2,
        },
      );
      expect(computeCertificabilityJobRepository.performAsync.getCall(1).args[0]).to.be.deep.equal({
        organizationLearnerId: 3,
      });
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
        })
        .resolves([3]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobController();

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
        data: {
          skipLoggedLastDayCheck,
          onlyNotComputed,
        },
        dependencies: {
          logger,
          organizationLearnerRepository,
          computeCertificabilityJobRepository,
          config,
        },
      });

      // then
      expect(computeCertificabilityJobRepository.performAsync.getCall(0).args[0]).to.be.deep.equal(
        { organizationLearnerId: 1 },
        { organizationLearnerId: 2 },
      );
      expect(computeCertificabilityJobRepository.performAsync.getCall(1).args[0]).to.be.deep.equal({
        organizationLearnerId: 3,
      });
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
          })
          .resolves([index * limit + 1, index * limit + 2, index * limit + 3]);
      }

      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobController();

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
        dependencies: {
          logger,
          organizationLearnerRepository,
          computeCertificabilityJobRepository,
          config,
        },
      });

      // then
      for (let index = 0; index < chunkCount; index++) {
        expect(computeCertificabilityJobRepository.performAsync.getCall(index).args[0]).to.be.deep.equal(
          {
            organizationLearnerId: index * limit + 1,
          },
          {
            organizationLearnerId: index * limit + 2,
          },
          {
            organizationLearnerId: index * limit + 3,
          },
        );
      }
    });
  });
});
