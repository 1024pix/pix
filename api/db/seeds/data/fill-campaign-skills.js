import { knex } from '../../../db/knex-database-connection';
import skillRepository from '../../../lib/infrastructure/repositories/skill-repository';

async function fillCampaignSkills() {
  const campaigns = await knex('campaigns')
    .select({
      campaignId: 'campaigns.id',
      targetProfileId: 'campaigns.targetProfileId',
    })
    .leftJoin('campaign_skills', 'campaign_skills.campaignId', 'campaigns.id')
    .whereNull('campaign_skills.campaignId')
    .where('campaigns.type', 'ASSESSMENT')
    .orderBy('campaigns.id');

  for (const { campaignId, targetProfileId } of campaigns) {
    const cappedTubes = await knex('target-profile_tubes')
      .select('tubeId', 'level')
      .where('targetProfileId', targetProfileId);

    const skillData = [];
    if (cappedTubes.length > 0) {
      for (const cappedTube of cappedTubes) {
        const allLevelSkills = await skillRepository.findActiveByTubeId(cappedTube.tubeId);
        const rightLevelSkills = allLevelSkills.filter((skill) => skill.difficulty <= cappedTube.level);
        skillData.push(...rightLevelSkills.map((skill) => ({ skillId: skill.id, campaignId })));
      }
    } else {
      const skillIds = await knex('target-profiles_skills')
        .pluck('skillId')
        .distinct()
        .where('targetProfileId', targetProfileId);
      skillData.push(...skillIds.map((skillId) => ({ skillId, campaignId })));
    }
    await knex.batchInsert('campaign_skills', skillData);
  }
}

export default {
  fillCampaignSkills,
};
