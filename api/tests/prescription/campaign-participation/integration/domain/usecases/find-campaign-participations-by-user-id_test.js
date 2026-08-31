import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-campaign-participations-by-user-id', function () {
  it('should return empty array when user has no participations', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    // when
    const results = await usecases.findCampaignParticipationsByUserId({ userId });

    // then
    expect(results).to.deep.equal([]);
  });

  it('should return participations for the given userId', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser().id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
    const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
    await databaseBuilder.commit();

    // when
    const results = await usecases.findCampaignParticipationsByUserId({ userId });

    // then
    expect(results).to.deep.equal([{ id: participationId, campaignId, targetProfileId }]);
  });
});
