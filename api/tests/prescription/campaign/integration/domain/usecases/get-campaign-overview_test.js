import { expect } from 'chai';

import { CampaignOverview } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignOverview.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaign-overview', function () {
  it('returns the campaign overview', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Pix organization' }).id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile({ description: 'Parcours rentrée 6ieme' }).id;
    const campaign = databaseBuilder.factory.buildCampaign({
      code: 'AZERTY',
      name: 'Campagne 6A',
      type: 'ASSESSMENT',
      organizationId,
      targetProfileId,
    });
    databaseBuilder.factory.buildCampaign({ organizationId });
    await databaseBuilder.commit();

    // when
    const campaignOverview = await usecases.getCampaignOverview({ campaignId: campaign.id });

    // then
    expect(campaignOverview).to.be.an.instanceOf(CampaignOverview);
    expect(campaignOverview).to.deep.include({
      id: campaign.id,
      code: 'AZERTY',
      name: 'Campagne 6A',
      type: 'ASSESSMENT',
      organizationId,
      organizationName: 'Pix organization',
      description: 'Parcours rentrée 6ieme',
    });
  });

  it('returns null when the campaign does not exist', async function () {
    // when
    const campaignOverview = await usecases.getCampaignOverview({ campaignId: 123456 });

    // then
    expect(campaignOverview).to.be.null;
  });
});
