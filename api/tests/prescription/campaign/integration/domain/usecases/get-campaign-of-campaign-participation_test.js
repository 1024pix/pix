import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaign-of-campaign-participation', function () {
  it('should return campaign linked to the campaign participation the id is passed', async function () {
    const { id: campaignParticipationId, campaignId } = databaseBuilder.factory.buildCampaignParticipation();
    await databaseBuilder.commit();

    const campaign = await usecases.getCampaignOfCampaignParticipation({
      campaignParticipationId,
    });

    expect(campaign).to.be.instanceOf(Campaign);
    expect(campaign.id).to.equal(campaignId);
  });
});
