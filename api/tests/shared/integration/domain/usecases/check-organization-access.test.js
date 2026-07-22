import dayjs from 'dayjs';

import { execute } from '../../../../../src/shared/application/usecases/check-organization-access.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Shared | Domain | UseCase | check-organization-access', function () {
  context('when all arguments are undefined', function () {
    it('should throw en Error', async function () {
      // when
      const error = await catchErr(execute)({
        organizationId: undefined,
        campaignId: undefined,
        campaignParticipationId: undefined,
      });

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });

  context('when organizationId is given', function () {
    context('when the PLACE_MANAGEMENT organization feature is not enabled', function () {
      it('should not throw', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        // when
        const result = await execute({ organizationId: organization.id });

        // then
        expect(result).to.be.true;
      });
    });

    context('when the PLACE_MANAGEMENT organization feature is enabled', function () {
      context('when maximum places limit is disabled', function () {
        it('should not throw', async function () {
          // given
          const placeManagementFeature = databaseBuilder.factory.buildFeature({
            key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
          });
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildOrganizationFeature({
            organizationId: organization.id,
            featureId: placeManagementFeature.id,
            params: {
              enableMaximumPlacesLimit: false,
            },
          });
          await databaseBuilder.commit();

          // when
          const result = await execute({ organizationId: organization.id });

          // then
          expect(result).to.be.true;
        });
      });

      context('when maximum places limit is enabled', function () {
        context('when the amount of maximum places is not reached', function () {
          it('should not throw', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });
            const organization = databaseBuilder.factory.buildOrganization();
            databaseBuilder.factory.buildOrganizationFeature({
              organizationId: organization.id,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });
            await databaseBuilder.commit();

            // when
            const result = await execute({ organizationId: organization.id });

            // then
            expect(result).to.be.true;
          });
        });

        context('when the amount of maximum places is reached', function () {
          it('should throw a forbidden access error', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });

            const organization = databaseBuilder.factory.buildOrganization();

            databaseBuilder.factory.buildOrganizationFeature({
              organizationId: organization.id,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });

            databaseBuilder.factory.buildOrganizationPlace({
              organizationId: organization.id,
              createdAt: dayjs().subtract(1, 'year').toDate(),
              activationDate: dayjs().subtract(6, 'months').toDate(),
              expirationDate: dayjs().subtract(1, 'months').toDate(),
              count: 1,
            });

            const campaign = databaseBuilder.factory.buildCampaign({
              organizationId: organization.id,
            });
            const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
            databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              organizationLearnerId: learner1.id,
            });

            await databaseBuilder.commit();

            // when
            const error = await catchErr(execute)({ organizationId: organization.id });

            // then
            expect(error).to.be.instanceOf(ForbiddenAccess);
          });
        });
      });
    });
  });

  context('when we only know the campaignId', function () {
    let campaignId, organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();
    });

    context('when the PLACE_MANAGEMENT organization feature is not enabled', function () {
      it('should not throw', async function () {
        // when
        const result = await execute({ campaignId });

        // then
        expect(result).to.be.true;
      });
    });

    context('when the PLACE_MANAGEMENT organization feature is enabled', function () {
      context('when maximum places limit is disabled', function () {
        it('should not throw', async function () {
          // given
          const placeManagementFeature = databaseBuilder.factory.buildFeature({
            key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
          });
          databaseBuilder.factory.buildOrganizationFeature({
            organizationId: organizationId,
            featureId: placeManagementFeature.id,
            params: {
              enableMaximumPlacesLimit: false,
            },
          });
          await databaseBuilder.commit();

          // when
          const result = await execute({ campaignId });

          // then
          expect(result).to.be.true;
        });
      });

      context('when maximum places limit is enabled', function () {
        context('when the amount of maximum places is not reached', function () {
          it('should not throw', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });
            databaseBuilder.factory.buildOrganizationFeature({
              organizationId,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });
            await databaseBuilder.commit();

            // when
            const result = await execute({ campaignId });

            // then
            expect(result).to.be.true;
          });
        });

        context('when the amount of maximum places is reached', function () {
          it('should throw a forbidden access error', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });

            databaseBuilder.factory.buildOrganizationFeature({
              organizationId: organizationId,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });

            databaseBuilder.factory.buildOrganizationPlace({
              organizationId,
              createdAt: dayjs().subtract(1, 'year').toDate(),
              activationDate: dayjs().subtract(6, 'months').toDate(),
              expirationDate: dayjs().subtract(1, 'months').toDate(),
              count: 1,
            });

            const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: learner1.id,
            });

            await databaseBuilder.commit();

            // when
            const error = await catchErr(execute)({ campaignId });

            // then
            expect(error).to.be.instanceOf(ForbiddenAccess);
          });
        });
      });
    });
  });

  context('when we only know the campaignParticipationId', function () {
    let campaignId, campaignParticipationId, organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

      await databaseBuilder.commit();
    });

    context('when the PLACE_MANAGEMENT organization feature is not enabled', function () {
      it('should not throw', async function () {
        // when
        const result = await execute({ campaignParticipationId });

        // then
        expect(result).to.be.true;
      });
    });

    context('when the PLACE_MANAGEMENT organization feature is enabled', function () {
      context('when maximum places limit is disabled', function () {
        it('should not throw', async function () {
          // given
          const placeManagementFeature = databaseBuilder.factory.buildFeature({
            key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
          });
          databaseBuilder.factory.buildOrganizationFeature({
            organizationId: organizationId,
            featureId: placeManagementFeature.id,
            params: {
              enableMaximumPlacesLimit: false,
            },
          });
          await databaseBuilder.commit();

          // when
          const result = await execute({ campaignParticipationId });

          // then
          expect(result).to.be.true;
        });
      });

      context('when maximum places limit is enabled', function () {
        context('when the amount of maximum places is not reached', function () {
          it('should not throw', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });
            databaseBuilder.factory.buildOrganizationFeature({
              organizationId,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });
            await databaseBuilder.commit();

            // when
            const result = await execute({ campaignParticipationId });

            // then
            expect(result).to.be.true;
          });
        });

        context('when the amount of maximum places is reached', function () {
          it('should throw a forbidden access error', async function () {
            // given
            const placeManagementFeature = databaseBuilder.factory.buildFeature({
              key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            });

            databaseBuilder.factory.buildOrganizationFeature({
              organizationId: organizationId,
              featureId: placeManagementFeature.id,
              params: {
                enableMaximumPlacesLimit: true,
              },
            });

            databaseBuilder.factory.buildOrganizationPlace({
              organizationId,
              createdAt: dayjs().subtract(1, 'year').toDate(),
              activationDate: dayjs().subtract(6, 'months').toDate(),
              expirationDate: dayjs().subtract(1, 'months').toDate(),
              count: 1,
            });

            const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
            const campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: learner1.id,
            }).id;

            await databaseBuilder.commit();

            // when
            const error = await catchErr(execute)({ campaignParticipationId: campaignParticipationId1 });

            // then
            expect(error).to.be.instanceOf(ForbiddenAccess);
          });
        });
      });
    });
  });
});
