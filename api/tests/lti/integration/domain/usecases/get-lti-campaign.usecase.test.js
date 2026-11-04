import { expect } from 'chai';

import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { PIX_ORIGIN } from '../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | LTI | Domain | Usecases | getLtiCampaign', function () {
  it('returns the LTI campaign', async function () {
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
    databaseBuilder.factory.learningContent.buildFramework({ id: 'recFramework1', name: PIX_ORIGIN });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea1',
      code: '1',
      frameworkId: 'recFramework1',
      competenceIds: ['recCompetence1'],
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence1',
      index: '1.1',
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1'],
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill1',
      status: 'actif',
      level: 1,
      tubeId: 'recTube1',
    });
    databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkill1' });
    await databaseBuilder.commit();

    // when
    const ltiCampaign = await usecases.getLtiCampaign({ campaignId: campaign.id });

    // then
    expect(ltiCampaign).to.be.an.instanceOf(LtiCampaign);
    expect(ltiCampaign.id).equal(campaign.id);
  });
});
