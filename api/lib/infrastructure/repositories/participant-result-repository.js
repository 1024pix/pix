const { knex } = require('../../../db/knex-database-connection');
const _ = require('lodash');
const Assessment = require('../../domain/models/Assessment');
const AssessmentResult = require('../../domain/read-models/participant-results/AssessmentResult');
const competenceRepository = require('./competence-repository');
const answerRepository = require('./answer-repository');
const challengeRepository = require('./challenge-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const flashAssessmentResultRepository = require('./flash-assessment-result-repository');
const campaignRepository = require('./campaign-repository');
const flash = require('../../domain/services/algorithm-methods/flash');
const dataFetcher = require('../../domain/services/algorithm-methods/data-fetcher');
const { NotFoundError } = require('../../domain/errors');

const ParticipantResultRepository = {
  async getByUserIdAndCampaignId({ userId, campaignId, badges, locale }) {
    const participationResults = await _getParticipationResults(userId, campaignId, locale);
    const isCampaignMultipleSendings = await _isCampaignMultipleSendings(campaignId);
    const isOrganizationLearnerActive = await _isOrganizationLearnerActive(userId, campaignId);
    const isCampaignArchived = await _isCampaignArchived(campaignId);
    const competences = await _findTargetedCompetences(campaignId, locale);
    const badgeResultsDTO = await _getBadgeResults(badges);
    const stages = await _getStages(campaignId);

    return new AssessmentResult({
      participationResults,
      competences,
      badgeResultsDTO,
      stages,
      isCampaignMultipleSendings,
      isOrganizationLearnerActive,
      isCampaignArchived,
    });
  },
};

async function _getParticipationResults(userId, campaignId, locale) {
  const {
    isCompleted,
    campaignParticipationId,
    sharedAt,
    assessmentCreatedAt,
    participantExternalId,
    masteryRate,
    isFlash,
    assessmentId,
    isDeleted,
  } = await _getParticipationAttributes(userId, campaignId);

  const knowledgeElements = await _findTargetedKnowledgeElements(campaignId, userId, sharedAt);

  const acquiredBadgeIds = await _getAcquiredBadgeIds(userId, campaignParticipationId);

  let estimatedFlashLevel;
  let flashPixScore;
  if (isFlash) {
    const { allAnswers, challenges, estimatedLevel } = await dataFetcher.fetchForFlashCampaigns({
      assessmentId,
      locale,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
    });
    estimatedFlashLevel = estimatedLevel;
    flashPixScore = flash.calculateTotalPixScore({ allAnswers, challenges, estimatedLevel }).pixScore;
  }

  return {
    campaignParticipationId,
    isCompleted,
    sharedAt,
    assessmentCreatedAt,
    participantExternalId,
    knowledgeElements,
    masteryRate,
    acquiredBadgeIds: acquiredBadgeIds.map(({ badgeId }) => badgeId),
    estimatedFlashLevel,
    isDeleted,
    flashPixScore,
  };
}

async function _getParticipationAttributes(userId, campaignId) {
  const participationAttributes = await knex('campaign-participations')
    .select([
      'state',
      'campaignParticipationId',
      'sharedAt',
      'assessments.createdAt AS assessmentCreatedAt',
      'participantExternalId',
      knex.raw('CAST("masteryRate" AS FLOAT)'),
      'method',
      'assessments.id AS assessmentId',
      'deletedAt',
    ])
    .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
    .where({ 'campaign-participations.campaignId': campaignId })
    .andWhere({ 'campaign-participations.userId': userId })
    .andWhere('campaign-participations.isImproved', '=', false)
    .orderBy('assessments.createdAt', 'DESC')
    .first();

  if (!participationAttributes) {
    throw new NotFoundError(`Participation not found for user ${userId} and campaign ${campaignId}`);
  }

  const {
    state,
    campaignParticipationId,
    sharedAt,
    assessmentCreatedAt,
    participantExternalId,
    masteryRate,
    method,
    assessmentId,
    deletedAt,
  } = participationAttributes;

  return {
    isCompleted: state === Assessment.states.COMPLETED,
    campaignParticipationId,
    sharedAt,
    assessmentCreatedAt,
    participantExternalId,
    masteryRate,
    isFlash: method === Assessment.methods.FLASH,
    assessmentId,
    isDeleted: Boolean(deletedAt),
  };
}

async function _findTargetedKnowledgeElements(campaignId, userId, sharedAt) {
  const skillIds = await campaignRepository.findSkillIds({ campaignId });
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: sharedAt });
  return knowledgeElements.filter(({ skillId }) => skillIds.includes(skillId));
}

async function _getAcquiredBadgeIds(userId, campaignParticipationId) {
  return knex('badge-acquisitions').select('badgeId').where({ userId, campaignParticipationId });
}

function _getStages(campaignId) {
  return campaignRepository.findStages({ campaignId });
}

async function _getBadgeResults(badges) {
  const competences = await _findSkillSet(badges);
  return badges.map((badge) => {
    const badgeCompetences = competences.filter(({ badgeId }) => badgeId === badge.id);

    return {
      ...badge,
      badgeCompetences,
    };
  });
}

function _findSkillSet(badges) {
  return knex('skill-sets').whereIn(
    'badgeId',
    badges.map(({ id }) => id)
  );
}

async function _findTargetedCompetences(campaignId, locale) {
  const skillIds = await campaignRepository.findSkillIds({ campaignId });
  const competences = await competenceRepository.list({ locale });
  const targetedCompetences = [];

  competences.forEach((competence) => {
    const matchingSkills = _.intersection(competence.skillIds, skillIds);

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

async function _isCampaignMultipleSendings(campaignId) {
  const campaign = await knex('campaigns').select('multipleSendings').where({ 'campaigns.id': campaignId }).first();
  return campaign.multipleSendings;
}

async function _isCampaignArchived(campaignId) {
  const campaign = await knex('campaigns').select('archivedAt').where({ 'campaigns.id': campaignId }).first();
  return Boolean(campaign.archivedAt);
}

async function _isOrganizationLearnerActive(userId, campaignId) {
  const organizationLearner = await knex('organization-learners')
    .select('organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'organization-learners.userId': userId })
    .first();
  return !organizationLearner?.isDisabled;
}

module.exports = ParticipantResultRepository;
