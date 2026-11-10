import { expect } from 'chai';
import dayjs from 'dayjs';
import sinon from 'sinon';

import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from '../../../../../../src/prescription/learner-management/application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { computeCertificabilityJobRepository } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/jobs/compute-certificability-job-repository.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobController', function () {
  context('#handle', function () {
    let logger;
    let organizationLearnerIds;

    beforeEach(async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
      });
      databaseBuilder.factory.buildOrganizationFeature({ featureId: feature.id, organizationId: organization.id });

      const lastLoggedAt = dayjs().subtract(3, 'hour');

      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildUserLogin({ userId: user.id, lastLoggedAt });

      const organizationLearner1 = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        userId: user.id,
        certifiabledAt: null,
        isCertifiable: null,
      });

      const secondUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildUserLogin({ userId: secondUser.id, lastLoggedAt });
      const organizationLearner2 = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        userId: secondUser.id,
        certifiabledAt: null,
        isCertifiable: null,
      });

      organizationLearnerIds = [organizationLearner1.id, organizationLearner2.id];

      await databaseBuilder.commit();
      logger = {
        info: sinon.stub(),
      };
    });

    context('when batch mode is disabled', function () {
      it('should schedule multiple ComputeCertificabilityJob', async function () {
        // given
        await featureToggles.set('scheduleCertificabilityBatchMode', false);
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config: {
              features: {
                scheduleComputeOrganizationLearnersCertificability: {
                  chunkSize: 2,
                  cron: '0 * * * *',
                },
              },
            },
          },
        });

        // then
        await expect('ComputeCertificabilityJob').to.have.been.performed.withJobPayloads([
          { organizationLearnerIds: [organizationLearnerIds[0]] },
          { organizationLearnerIds: [organizationLearnerIds[1]] },
        ]);
      });
    });

    context('when batch mode is enabled', function () {
      it('should schedule one job with an array of organizationIds as input', async function () {
        // given
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config: {
              features: {
                scheduleComputeOrganizationLearnersCertificability: {
                  chunkSize: 2,
                  cron: '0 * * * *',
                },
              },
            },
          },
        });

        // then
        await expect('ComputeCertificabilityJob').to.have.been.performed.withJobPayload({
          organizationLearnerIds,
        });
      });

      it('should paginate according chunk size', async function () {
        // given
        const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
          new ScheduleComputeOrganizationLearnersCertificabilityJobController();

        // when
        await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle({
          dependencies: {
            logger,
            organizationLearnerRepository,
            computeCertificabilityJobRepository,
            config: {
              features: {
                scheduleComputeOrganizationLearnersCertificability: {
                  chunkSize: 1,
                  cron: '0 * * * *',
                },
              },
            },
          },
        });

        // then
        await expect('ComputeCertificabilityJob').to.have.been.performed.withJobPayloads([
          { organizationLearnerIds: [organizationLearnerIds[0]] },
          { organizationLearnerIds: [organizationLearnerIds[1]] },
        ]);
      });
    });
  });
});
