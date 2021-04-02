const Skill = require('../../domain/models/Skill');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const { knex } = require('../bookshelf');
const _ = require('lodash');

function _toDomain(skillData) {
  return new Skill({
    id: skillData.id,
    name: skillData.name,
    pixValue: skillData.pixValue,
    competenceId: skillData.competenceId,
    tutorialIds: skillData.tutorialIds,
    tubeId: skillData.tubeId,
  });
}

module.exports = {

  async list() {
    const skillDatas = await skillDatasource.list();
    return skillDatas.map(_toDomain);
  },

  async findActiveByCompetenceId(competenceId) {
    const skillDatas = await skillDatasource.findActiveByCompetenceId(competenceId);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByCompetenceId(competenceId) {
    const skillDatas = await skillDatasource.findOperativeByCompetenceId(competenceId);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByIds(skillIds) {
    const skillDatas = await skillDatasource.findOperativeByRecordIds(skillIds);
    return skillDatas.map(_toDomain);
  },

  async assessedDuringCampaignParticipation(campaignParticipationId) {
    const skillIds = await _getTargetProfileSkillIds(campaignParticipationId);
    const operativeSkill = await skillDatasource.findOperativeByRecordIds(skillIds);
    return operativeSkill.map(({ id }) => id);
  },
};

function _getTargetProfileSkillIds(campaignParticipationId) {
  return knex('target-profiles_skills')
    .select(['skillId'])
    .innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
    .innerJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .then((skills) => _.map(skills, 'skillId'));
}
