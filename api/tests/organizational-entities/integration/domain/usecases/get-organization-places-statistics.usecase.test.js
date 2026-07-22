import dayjs from 'dayjs';

import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational-Entities | Domain | Use Cases | get-organization-places-statistics', function () {
  it('should get the organization places statistics', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;

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
