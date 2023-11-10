import { knex } from '../../../../db/knex-database-connection.js';
import { StageCollection } from '../../../../src/shared/domain/models/user-campaign-results/StageCollection.js';
import * as skillRepository from './../skill-repository.js';
const MAX_STAGE_THRESHOLD = 100;

const findStageCollection = async function ({ campaignId }) {
  const stages = await knex('stages')
    .select('stages.*')
    .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
    .where('campaigns.id', campaignId)
    .orderBy(['stages.threshold', 'stages.level']);

  await _computeStagesThresholdForCampaign(stages, campaignId);

  return new StageCollection({ campaignId, stages });
};

export { findStageCollection };

async function _computeStagesThresholdForCampaign(stages, campaignId) {
  const stagesWithLevel = stages.filter((stage) => stage.level || stage.level === 0);

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

async function _findSkills({ campaignId }) {
  const skillIds = await _findSkillIds({ campaignId });
  return skillRepository.findOperativeByIds(skillIds);
}

function _findSkillIds({ campaignId }) {
  return knex('campaign_skills').where({ campaignId }).pluck('skillId');
}
