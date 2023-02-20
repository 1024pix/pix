import { expect, databaseBuilder, sinon } from '../../../test-helper';
import { knex } from '../../../../db/knex-database-connection';
import logger from '../../../../lib/infrastructure/logger';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import { copySkills } from '../../../../scripts/prod/target-profile-migrations/copy-target-profile-skills-into-campaign-skills';

describe('Acceptance | Scripts | copy-target-profile-skills-into-campaign-skills', function () {
  afterEach(function () {
    return knex('campaign_skills').delete();
  });

  it('should execute the script as expected', async function () {
    // given
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
    databaseBuilder.factory.buildTargetProfile({ id: 1 });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1, skillId: 'skillA' });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1, skillId: 'skillB' });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1, skillId: 'skillC' });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1, skillId: 'skillC' });
    databaseBuilder.factory.buildTargetProfile({ id: 2 });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 2, skillId: 'skillA' });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 2, skillId: 'skillD' });
    databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 2, skillId: 'skillE' });
    databaseBuilder.factory.buildCampaign({ id: 10, type: CampaignTypes.ASSESSMENT, targetProfileId: 1 });
    databaseBuilder.factory.buildCampaign({ id: 11, type: CampaignTypes.ASSESSMENT, targetProfileId: 1 });
    databaseBuilder.factory.buildCampaign({ id: 12, type: CampaignTypes.ASSESSMENT, targetProfileId: 2 });
    databaseBuilder.factory.buildCampaign({ id: 13, type: CampaignTypes.PROFILES_COLLECTION, targetProfileId: 2 });
    await databaseBuilder.commit();

    // when
    await copySkills({ maxCampaignCount: 100, concurrency: 1 });

    // then
    const skillIdsForCampaign10 = await knex('campaign_skills')
      .pluck('skillId')
      .where('campaignId', 10)
      .orderBy('skillId');
    const skillIdsForCampaign11 = await knex('campaign_skills')
      .pluck('skillId')
      .where('campaignId', 11)
      .orderBy('skillId');
    const skillIdsForCampaign12 = await knex('campaign_skills')
      .pluck('skillId')
      .where('campaignId', 12)
      .orderBy('skillId');
    const skillIdsForCampaign13 = await knex('campaign_skills')
      .pluck('skillId')
      .where('campaignId', 13)
      .orderBy('skillId');
    expect(skillIdsForCampaign10).to.deep.equal(['skillA', 'skillB', 'skillC']);
    expect(skillIdsForCampaign11).to.deep.equal(['skillA', 'skillB', 'skillC']);
    expect(skillIdsForCampaign12).to.deep.equal(['skillA', 'skillD', 'skillE']);
    expect(skillIdsForCampaign13).to.be.empty;
  });
});
