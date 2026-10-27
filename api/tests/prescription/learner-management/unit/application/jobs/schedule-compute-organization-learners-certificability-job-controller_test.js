import { expect } from 'chai';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ComputeOrganizationLearnerCertificabilityJobProvidedDateError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { ComputeCertificabilityJob } from '../../../../../../src/prescription/learner-management/domain/models/jobs/ComputeCertificabilityJob.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
dayjs.extend(utc);
dayjs.extend(timezone);

describe('Unit | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobController', function () {
  context('#handle', function () {
    let computeCertificabilityJobRepository;
    let organizationLearnerRepository;
    let logger;
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
      sinon.useFakeTimers({ now, toFake: ['Date'] });

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
        performManyAsync: sinon.stub(),
      };

      computeCertificabilityJobRepository.performManyAsync.resolves();

      organizationLearnerRepository = {
        findByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
        countByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
      };

      logger = {
        info: sinon.stub(),
      };
    });

    context('when computation is asynchronous', function () {
      beforeEach(function () {
        config.features.scheduleComputeOrganizationLearnersCertificability.synchronously = false;
      });

      it('should schedule multiple ComputeCertificabilityJob', async function () {
        // given
        const skipActivityDate = undefined;
        const onlyNotComputed = undefined;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
            skipActivityDate,
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
        const calls = computeCertificabilityJobRepository.performManyAsync.getCalls();
        expect(calls).to.have.length(2);
        expect(calls[0].firstArg).to.deep.equal([
          new ComputeCertificabilityJob({ organizationLearnerId: 1 }),
          new ComputeCertificabilityJob({ organizationLearnerId: 2 }),
        ]);
        expect(calls[1].firstArg).to.deep.equal([new ComputeCertificabilityJob({ organizationLearnerId: 3 })]);
      });

      it('should take options from event', async function () {
        // given
        const skipActivityDate = false;
        const onlyNotComputed = true;
        const providedDateRange = { startDate: '2024-03-01', endDate: '2024-03-03' };

        fromUserActivityDate = dayjs(providedDateRange.startDate, 'YYYY-MM-DD').toDate();
        toUserActivityDate = dayjs(providedDateRange.endDate, 'YYYY-MM-DD').toDate();
        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([3]);
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          data: {
            skipActivityDate,
            onlyNotComputed,
            providedDateRange,
          },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config,
          },
        });

        // then
        const calls = computeCertificabilityJobRepository.performManyAsync.getCalls();
        expect(calls).to.have.length(2);
        expect(calls[0].firstArg).to.deep.equal([
          new ComputeCertificabilityJob({ organizationLearnerId: 1 }),
          new ComputeCertificabilityJob({ organizationLearnerId: 2 }),
        ]);
        expect(calls[1].firstArg).to.deep.equal([new ComputeCertificabilityJob({ organizationLearnerId: 3 })]);
      });

      it('should test pagination with a lot of results', async function () {
        // given
        const skipActivityDate = undefined;
        const onlyNotComputed = undefined;

        const chunkCount = 10;
        const limit = 3;

        config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize = limit;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
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
              skipActivityDate,
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

        const calls = computeCertificabilityJobRepository.performManyAsync.getCalls();
        expect(calls).to.have.length(chunkCount);
        for (let index = 0; index < chunkCount; index++) {
          expect(calls[index].firstArg).to.deep.equal([
            new ComputeCertificabilityJob({ organizationLearnerId: index * limit + 1 }),
            new ComputeCertificabilityJob({ organizationLearnerId: index * limit + 2 }),
            new ComputeCertificabilityJob({ organizationLearnerId: index * limit + 3 }),
          ]);
        }
      });
    });

    context('when computation is synchronous', function () {
      beforeEach(function () {
        config.features.scheduleComputeOrganizationLearnersCertificability.synchronously = true;
        sinon.stub(usecases, 'computeOrganizationLearnerCertificability');
      });

      it('should call usecase directly', async function () {
        // given
        const skipActivityDate = undefined;
        const onlyNotComputed = undefined;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
            skipActivityDate,
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
        expect(usecases.computeOrganizationLearnerCertificability).to.have.been.calledThrice;
        expect(computeCertificabilityJobRepository.performManyAsync).to.not.have.been.called;
      });

      it('should throw when end date is before start date', async function () {
        // given
        const skipActivityDate = false;
        const onlyNotComputed = true;
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        const err = await catchErr(scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle)({
          data: {
            skipActivityDate,
            onlyNotComputed,
            providedDateRange: { startDate: '2024-03-04', endDate: '2024-03-03' },
          },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config,
          },
        });

        // then
        expect(err).to.be.instanceOf(ComputeOrganizationLearnerCertificabilityJobProvidedDateError);
      });

      it('should throw when one or more given dates are not valid', async function () {
        // given
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        const err = await catchErr(scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle)({
          data: {
            providedDateRange: { startDate: 123, endDate: 123 },
          },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config,
          },
        });

        // then
        expect(err).to.be.instanceOf(ComputeOrganizationLearnerCertificabilityJobProvidedDateError);
      });

      it('should take options from event', async function () {
        // given
        const skipActivityDate = false;
        const onlyNotComputed = true;
        const providedDateRange = { startDate: '2024-03-01', endDate: '2024-03-03' };

        fromUserActivityDate = dayjs(providedDateRange.startDate, 'YYYY-MM-DD').toDate();
        toUserActivityDate = dayjs(providedDateRange.endDate, 'YYYY-MM-DD').toDate();

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
            skipActivityDate,
            onlyNotComputed,
          })
          .resolves([3]);
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          data: {
            skipActivityDate,
            onlyNotComputed,
            providedDateRange,
          },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config,
          },
        });

        // then
        expect(usecases.computeOrganizationLearnerCertificability).have.been.calledWithExactly({
          organizationLearnerId: 1,
        });
        expect(usecases.computeOrganizationLearnerCertificability).have.been.calledWithExactly({
          organizationLearnerId: 2,
        });
        expect(usecases.computeOrganizationLearnerCertificability).have.been.calledWithExactly({
          organizationLearnerId: 3,
        });
      });

      it('should test pagination with a lot of results', async function () {
        // given
        const skipActivityDate = undefined;
        const onlyNotComputed = undefined;

        const chunkCount = 10;
        const limit = 3;

        config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize = limit;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            skipActivityDate,
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
              skipActivityDate,
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
          expect(usecases.computeOrganizationLearnerCertificability.getCall(index).args[0]).to.be.deep.equal({
            organizationLearnerId: index + 1,
          });
        }
      });
    });
  });
});
