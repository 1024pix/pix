import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-campaign-skill-ids-for-campaign-participations', function () {
  it('should return campaign skill ids for campaign participations', async function () {
    // given
    const campaignId1 = databaseBuilder.factory.buildCampaign().id;
    databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId1', campaignId: campaignId1 });
    const campaignId2 = databaseBuilder.factory.buildCampaign().id;
    databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId2', campaignId: campaignId2 });

    const campaignParticipationIds = [
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId1 }).id,
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId2 }).id,
    ];
    await databaseBuilder.commit();

    // when
    const skillIds = await usecases.findCampaignSkillIdsForCampaignParticipations({ campaignParticipationIds });

    // then
    expect(skillIds).to.have.lengthOf(2);
    expect(skillIds).to.have.members(['skillId1', 'skillId2']);
  });
});
