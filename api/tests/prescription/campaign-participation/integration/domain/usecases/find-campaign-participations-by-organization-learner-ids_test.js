import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-campaign-participations-by-organization-learner-ids', function () {
  it('should return participations for the given organizationLearnerIds', async function () {
    // given
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
    const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
      organizationLearnerId,
      campaignId,
    });
    await databaseBuilder.commit();

    // when
    const results = await usecases.findCampaignParticipationsByOrganizationLearnerIds({
      organizationLearnerIds: [organizationLearnerId],
    });

    // then
    expect(results).to.have.lengthOf(1);
    expect(results[0].id).to.equal(participationId);
    expect(results[0].organizationLearnerId).to.equal(organizationLearnerId);
  });
});
