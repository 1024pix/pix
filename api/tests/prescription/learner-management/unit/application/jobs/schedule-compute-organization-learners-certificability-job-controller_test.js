import { expect } from 'chai';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ComputeCertificabilityJob } from '../../../../../../src/prescription/learner-management/domain/models/jobs/ComputeCertificabilityJob.js';
import { knex } from '../../../../../tooling/databases.js';
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

    it('should test pagination with a lot of results', async function () {
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
});
