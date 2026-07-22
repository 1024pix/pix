import dayjs from 'dayjs';

import { usecases } from '../../../../../../src/prescription/organization-place/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Domain | Use Cases | get-organization-places-statistics', function () {
  let organizationId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;

    const anonymousUserId = databaseBuilder.factory.buildUser({ isAnonymous: true }).id;
    const realUserId = databaseBuilder.factory.buildUser({ isAnonymous: false }).id;

    const anonymousLearnerId = databaseBuilder.factory.buildOrganizationLearner({
      userId: anonymousUserId,
      organizationId,
    }).id;
    const realLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId: realUserId, organizationId }).id;

    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

    databaseBuilder.factory.buildCampaignParticipation();

    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      organizationLearnerId: anonymousLearnerId,
      userId: anonymousUserId,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      organizationLearnerId: realLearnerId,
      userId: realUserId,
    });

    await databaseBuilder.commit();
  });

  describe('When organization has the blocking place feature', function () {
    it('should get the organization places statistics', async function () {
      // given
      const placesManagementFeatureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      }).id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: placesManagementFeatureId,
        params: {
          enableMaximumPlacesLimit: true,
        },
      });

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        activationDate: dayjs().subtract(1, 'months').toDate(),
        count: 1,
      });

      await databaseBuilder.commit();

      // when
      const organizationPlacesStatistics = await usecases.getOrganizationPlacesStatistics({
        organizationId,
      });

      // then
      expect(organizationPlacesStatistics.total).to.equal(1);
      expect(organizationPlacesStatistics.occupied).to.equal(2);
      expect(organizationPlacesStatistics.anonymousSeat).to.equal(1);
      expect(organizationPlacesStatistics.available).to.equal(0);
      expect(organizationPlacesStatistics.hasReachedMaximumPlacesLimit).to.equal(true);
    });
  });

  describe('When organization does not have the blocking place feature', function () {
    it('should return false on hasReachedMaximumPlacesLimit', async function () {
      // given
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        activationDate: dayjs().subtract(1, 'months').toDate(),
        count: 1,
      });

      await databaseBuilder.commit();

      // when
      const organizationPlacesStatistics = await usecases.getOrganizationPlacesStatistics({
        organizationId,
      });

      // then
      expect(organizationPlacesStatistics.hasReachedMaximumPlacesLimit).to.equal(false);
    });
  });
});
