import { expect } from 'chai';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ComputeOrganizationLearnerCertificabilityJobProvidedDateError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
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

    context('when computation is asynchronous', function () {
      beforeEach(function () {
        config.features.scheduleComputeOrganizationLearnersCertificability.synchronously = false;
      });

      it('should schedule multiple ComputeCertificabilityJob', async function () {
        // given
        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
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
        expect(computeCertificabilityJobRepository.performAsync.getCall(0).args[0]).to.be.deep.equal({
          organizationLearnerId: 1,
        });
        expect(computeCertificabilityJobRepository.performAsync.getCall(1).args[0]).to.be.deep.equal({
          organizationLearnerId: 2,
        });
        expect(computeCertificabilityJobRepository.performAsync.getCall(2).args[0]).to.be.deep.equal({
          organizationLearnerId: 3,
        });
      });

      it('should use pagination with a lot of results', async function () {
        // given
        const chunkCount = 10;
        const limit = 3;

        config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize = limit;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
          })
          .resolves(30);

        for (let index = 0; index < chunkCount; index++) {
          organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
            .withArgs({
              limit,
              offset: index * limit,
              fromUserActivityDate,
              toUserActivityDate,
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

        const jobCalls = computeCertificabilityJobRepository.performAsync.getCalls();
        expect(jobCalls.length).to.equal(chunkCount * limit);

        const expectedArgs = [];
        for (let index = 0; index < chunkCount; index++) {
          expectedArgs.push(
            { organizationLearnerId: index * limit + 1 },
            { organizationLearnerId: index * limit + 2 },
            { organizationLearnerId: index * limit + 3 },
          );
        }
        expect(jobCalls.map((t) => t.firstArg)).to.deep.equal(expectedArgs);
      });
    });

    context('when computation is synchronous', function () {
      beforeEach(function () {
        config.features.scheduleComputeOrganizationLearnersCertificability.synchronously = true;
        sinon.stub(usecases, 'computeOrganizationLearnerCertificability');
      });

      it('should call usecase directly', async function () {
        // given
        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
          })
          .resolves(3);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 0,
          })
          .resolves([1, 2]);
        organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
            limit: 2,
            offset: 2,
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
        expect(computeCertificabilityJobRepository.performAsync).to.not.have.been.called;
      });

      it('should use pagination with a lot of results', async function () {
        // given
        const chunkCount = 10;
        const limit = 3;

        config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize = limit;

        organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability
          .withArgs({
            fromUserActivityDate,
            toUserActivityDate,
          })
          .resolves(30);

        for (let index = 0; index < chunkCount; index++) {
          organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
            .withArgs({
              limit,
              offset: index * limit,
              fromUserActivityDate,
              toUserActivityDate,
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
