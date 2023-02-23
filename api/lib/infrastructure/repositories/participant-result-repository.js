const { knex } = require('../../../db/knex-database-connection.js');
const _ = require('lodash');
const Assessment = require('../../domain/models/Assessment.js');
const AssessmentResult = require('../../domain/read-models/participant-results/AssessmentResult.js');
const competenceRepository = require('./competence-repository.js');
const answerRepository = require('./answer-repository.js');
const challengeRepository = require('./challenge-repository.js');
const areaRepository = require('./area-repository.js');
const knowledgeElementRepository = require('./knowledge-element-repository.js');
const flashAssessmentResultRepository = require('./flash-assessment-result-repository.js');
const campaignRepository = require('./campaign-repository.js');
const flash = require('../../domain/services/algorithm-methods/flash.js');
const dataFetcher = require('../../domain/services/algorithm-methods/data-fetcher.js');
const { NotFoundError } = require('../../domain/errors.js');

const ParticipantResultRepository = {
  async getByUserIdAndCampaignId({ userId, campaignId, badges, locale }) {
    const participationResults = await _getParticipationResults(userId, campaignId, locale);
    let flashScoringResults;
    if (participationResults.isFlash) {
      flashScoringResults = await _getFlashScoringResults(participationResults.assessmentId, locale);
    }
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
      flashScoringResults,
    });
  },
};

async function _getParticipationResults(userId, campaignId) {
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

  return {
    campaignParticipationId,
    isCompleted,
    sharedAt,
    assessmentCreatedAt,
    participantExternalId,
    knowledgeElements,
    masteryRate,
    acquiredBadgeIds: acquiredBadgeIds.map(({ badgeId }) => badgeId),
    isDeleted,
    assessmentId,
    isFlash,
  };
}

async function _getFlashScoringResults(assessmentId, locale) {
  const { allAnswers, challenges, estimatedLevel } = await dataFetcher.fetchForFlashCampaigns({
    assessmentId,
    locale,
    answerRepository,
    challengeRepository,
    flashAssessmentResultRepository,
  });

  const { pixScore, pixScoreByCompetence } = flash.calculateTotalPixScoreAndScoreByCompetence({
    allAnswers,
    challenges,
    estimatedLevel,
  });

  const competences = await competenceRepository.findByRecordIds({
    competenceIds: pixScoreByCompetence.map(({ competenceId }) => competenceId),
    locale,
  });

  const areas = await areaRepository.list({ locale });

  const competencesWithPixScore = _.sortBy(
    pixScoreByCompetence.map(({ competenceId, pixScore }) => {
      const competence = competences.find(({ id }) => id === competenceId);
      const area = areas.find(({ id }) => id === competence.areaId);

      return {
        competence,
        area,
        pixScore,
      };
    }),
    'competence.index'
  );

  return { estimatedLevel, pixScore, competencesWithPixScore };
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

  for (const competence of competences) {
    const targetedSkillIds = _.intersection(competence.skillIds, skillIds);
    const area = await areaRepository.get({ id: competence.areaId, locale });
    if (targetedSkillIds.length > 0) {
      targetedCompetences.push({
        competence,
        area,
        targetedSkillIds,
      });
    }
  }

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
