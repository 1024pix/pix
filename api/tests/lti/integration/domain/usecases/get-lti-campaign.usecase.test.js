import { expect } from 'chai';

import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | LTI | Domain | Usecases | getLtiCampaign', function () {
  it('should return the LTI campaign', async function () {
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
    const ltiCampaign = await usecases.getLtiCampaign({ campaignId: campaign.id });

    // then
    expect(ltiCampaign).to.be.an.instanceOf(LtiCampaign);
    expect(ltiCampaign).to.deep.equal({
      id: campaign.id,
      code: 'AZERTY',
      name: 'Campagne 6A',
      type: 'ASSESSMENT',
      organizationId,
      organizationName: 'Pix organization',
      description: 'Parcours rentrée 6ieme',
    });
  });

  it('should return null when the campaign does not exist', async function () {
    // when
    const ltiCampaign = await usecases.getLtiCampaign({ campaignId: 123456 });

    // then
    expect(ltiCampaign).to.be.null;
  });
});
