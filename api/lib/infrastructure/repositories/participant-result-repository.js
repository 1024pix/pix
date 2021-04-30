const { knex } = require('../bookshelf');
const _ = require('lodash');
const Assessment = require('../../domain/models/Assessment');
const AssessmentResult = require('../../../lib/domain/read-models/participant-results/AssessmentResult');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const competenceRepository = require('./competence-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');

const ParticipantResultRepository = {
  async getByParticipationId(campaignParticipationId, locale) {
    const [participationResults, targetProfile, isCampaignMultipleSendings] = await Promise.all([
      _getParticipationResults(campaignParticipationId),
      _getTargetProfile(campaignParticipationId, locale),
      _isCampaignMultipleSendings(campaignParticipationId),
    ]);

    return new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);
  },
};

async function _getParticipationResults(campaignParticipationId) {

  const { isCompleted, userId, sharedAt } = await _getParticipationAttributes(campaignParticipationId);

  const knowledgeElements = await _findTargetedKnowledgeElements(campaignParticipationId, userId, sharedAt);

  const acquiredBadgeIds = await _getAcquiredBadgeIds(userId);

  return {
    campaignParticipationId,
    isCompleted,
    sharedAt,
    knowledgeElements,
    acquiredBadgeIds: acquiredBadgeIds.map(({ badgeId }) => badgeId),
  };
}

async function _getParticipationAttributes(campaignParticipationId) {
  const { state, userId, sharedAt } = await knex('campaign-participations')
    .select(['state', 'campaign-participations.userId', 'sharedAt'])
    .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .orderBy('assessments.createdAt', 'DESC')
    .first();

  return { isCompleted: state === Assessment.states.COMPLETED, userId, sharedAt };
}

async function _findTargetedKnowledgeElements(campaignParticipationId, userId, sharedAt) {
  const { targetProfileId } = await _getTargetProfileId(campaignParticipationId);
  const targetedSkillIds = await _findTargetedSkillIds(targetProfileId);
  const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers({ [userId]: sharedAt });
  return knowledgeElementsByUser[userId].filter(({ skillId }) => targetedSkillIds.includes(skillId));
}

async function _getAcquiredBadgeIds(userId) {
  return knex('badge-acquisitions').select('badgeId').where({ userId });
}

async function _getTargetProfile(campaignParticipationId, locale) {
  const { targetProfileId } = await _getTargetProfileId(campaignParticipationId);

  const competences = await _findTargetedCompetences(targetProfileId, locale);
  const stages = await _getStages(targetProfileId);
  const badges = await _getBadges(targetProfileId);

  return { competences, stages, badges };
}

async function _getTargetProfileId(campaignParticipationId) {
  return knex('campaign-participations')
    .select('targetProfileId')
    .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();
}

function _getStages(targetProfileId) {
  return knex('stages').where({ targetProfileId });
}

async function _getBadges(targetProfileId) {
  const badges = await knex('badges').where({ targetProfileId });
  const competences = await _findBadgePartnerCompetence(badges);
  return badges.map((badge) => {
    const badgeCompetences = competences.filter(({ badgeId }) => badgeId === badge.id);

    return {
      ...badge,
      badgeCompetences,
    };
  });
}

function _findBadgePartnerCompetence(badges) {
  return knex('badge-partner-competences').whereIn('badgeId', badges.map(({ id }) => id));
}

async function _findTargetedCompetences(targetProfileId, locale) {
  const targetedSkillIds = await _findTargetedSkillIds(targetProfileId);
  const competences = await competenceRepository.list({ locale });
  const targetedCompetences = [];

  competences.forEach((competence) => {
    const matchingSkills = _.intersection(competence.skillIds, targetedSkillIds);

    if (matchingSkills.length > 0) {
      targetedCompetences.push({
        id: competence.id,
        name: competence.name,
        index: competence.index,
        areaName: competence.area.name,
        areaColor: competence.area.color,
        skillIds: matchingSkills,
      });
    }
  });

  return targetedCompetences;
}

async function _findTargetedSkillIds(targetProfileId) {
  const targetProfileSkillIds = await knex('target-profiles_skills').select('skillId').where({ targetProfileId }).then((skills) => skills.map(({ skillId }) => skillId));
  const targetedSkills = await skillDatasource.findOperativeByRecordIds(targetProfileSkillIds);
  return targetedSkills.map(({ id }) => id);
}

async function _isCampaignMultipleSendings(campaignParticipationId) {
  const campaignParticipation = await knex('campaign-participations')
    .select('multipleSendings')
    .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();
  return campaignParticipation.multipleSendings;
}

module.exports = ParticipantResultRepository;
