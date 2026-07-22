import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { computeCertificabilityJobRepository } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/compute-certificability-job-repository.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobController', function () {
  context('#handle', function () {
    let logger;

    beforeEach(async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
      });
      databaseBuilder.factory.buildOrganizationFeature({ featureId: feature.id, organizationId: organization.id });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        certifiabledAt: null,
        isCertifiable: null,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        certifiabledAt: null,
        isCertifiable: null,
      });

      await databaseBuilder.commit();
      logger = {
        info: sinon.stub(),
      };
    });

    context('when computation is asynchronous', function () {
      it('should schedule multiple ComputeCertificabilityJob', async function () {
        // given
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          data: { skipActivityDate: true, onlyNotComputed: false },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config: {
              features: {
                scheduleComputeOrganizationLearnersCertificability: {
                  chunkSize: 2,
                  cron: '0 21 * * *',
                  synchronously: false,
                },
              },
            },
          },
        });

        // then
        await expect('ComputeCertificabilityJob').to.have.been.performed.withJobsCount(2);
      });
    });

    context('when computation is synchronous', function () {
      it('should not schedule any ComputeCertificabilityJob', async function () {
        // given
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          data: { skipActivityDate: true, onlyNotComputed: false },
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config: {
              features: {
                scheduleComputeOrganizationLearnersCertificability: {
                  chunkSize: 2,
                  cron: '0 21 * * *',
                  synchronously: true,
                },
              },
            },
          },
        });

        // then
        await expect('ComputeCertificabilityJob').to.have.been.performed.withJobsCount(0);
      });
    });
  });
});
