const { knex } = require('../../../../db/knex-database-connection.js');
const StageCollection = require('../../../domain/models/user-campaign-results/StageCollection.js');
const skillRepository = require('./../skill-repository.js');
const MAX_STAGE_THRESHOLD = 100;

module.exports = {
  async findStageCollection({ campaignId }) {
    const stages = await knex('stages')
      .select('stages.*')
      .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
      .where('campaigns.id', campaignId)
      .orderBy(['stages.threshold', 'stages.level']);

    await _computeStagesThresholdForCampaign(stages, campaignId);

    return new StageCollection({ campaignId, stages });
  },
};

async function _computeStagesThresholdForCampaign(stages, campaignId) {
  const stagesWithLevel = stages.filter((stage) => stage.level);

  if (stagesWithLevel.length === 0) return;

  const skills = await _findSkills({ campaignId });

  stagesWithLevel.forEach((stage) => {
    stage.threshold = _computeStageThresholdForLevel(stage.level, skills);
  });
}

function _computeStageThresholdForLevel(level, skills) {
  if (skills.length === 0) {
    return MAX_STAGE_THRESHOLD;
  }

  const stageSkillsCount = skills.filter((skill) => skill.difficulty <= level).length;
  return Math.round((stageSkillsCount / skills.length) * 100);
}

async function _findSkills({ campaignId, filterByStatus = 'operative' }) {
  const skillIds = await _findSkillIds({ campaignId });
  switch (filterByStatus) {
    case 'operative':
      return skillRepository.findOperativeByIds(skillIds);
    case 'all':
      return skillRepository.findByRecordIds(skillIds);
    default:
      throw new TypeError(`unknown filterByStatus value "${filterByStatus}", use "operative" or "all"`);
  }
}

async function _findSkillIds({ campaignId }) {
  let skillIds = await knex('campaign_skills').where({ campaignId }).pluck('skillId');
  // TODO remove it after target profile skills migration
  if (skillIds.length === 0) {
    skillIds = await knex('target-profiles_skills')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
      .where('campaigns.id', campaignId)
      .pluck('skillId');
  }
  return skillIds;
}
