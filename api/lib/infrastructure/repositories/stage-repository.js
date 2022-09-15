const { knex } = require('../../../db/knex-database-connection');
const Stage = require('../../domain/models/Stage');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const campaignRepository = require('../repositories/campaign-repository');
const TABLE_NAME = 'stages';

module.exports = {
  async findByCampaignId(campaignId) {
    const stages = await knex(TABLE_NAME)
      .select('stages.*')
      .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
      .where('campaigns.id', campaignId)
      .orderBy(['stages.threshold', 'stages.level']);

    await _computeStagesThresholdForCampaign(stages, campaignId);

    return stages.map(_toDomain);
  },

  async findByTargetProfileId(targetProfileId) {
    const stages = await knex(TABLE_NAME).where({ targetProfileId }).orderBy('stages.threshold');
    return stages.map(_toDomain);
  },

  async create(stage) {
    const stageAttributes = _.pick(stage, ['title', 'message', 'threshold', 'targetProfileId']);
    const [createdStage] = await knex(TABLE_NAME).insert(stageAttributes).returning('*');
    return _toDomain(createdStage);
  },

  async updateStage({ id, title, message, threshold, prescriberTitle, prescriberDescription }) {
    const updatedRows = await knex(TABLE_NAME)
      .where('id', id)
      .update({ title, message, threshold, prescriberTitle, prescriberDescription, updatedAt: new Date() });

    if (!updatedRows) {
      throw new NotFoundError(`Le palier avec l'id ${id} n'existe pas`);
    }
  },

  async get(id) {
    const stage = await knex(TABLE_NAME).where({ id }).first();
    if (!stage) {
      throw new NotFoundError(`Not found stage for ID ${id}`);
    }
    return _toDomain(stage);
  },
};

function _toDomain(stage) {
  return new Stage(stage);
}

async function _computeStagesThresholdForCampaign(stages, campaignId) {
  const stagesWithLevel = stages.filter((stage) => stage.level);

  if (stagesWithLevel.length === 0) return;

  const skills = await campaignRepository.findSkills({ campaignId });

  stagesWithLevel.forEach((stage) => {
    stage.threshold = _computeThresholdForLevel(stage.level, skills);
  });
}

const MAX_THRESHOLD = 100;

function _computeThresholdForLevel(level, skills) {
  if (skills.length === 0) {
    return MAX_THRESHOLD;
  }

  const stageSkillsCount = skills.filter((skill) => skill.difficulty <= level).length;
  return Math.round((stageSkillsCount / skills.length) * 100);
}
