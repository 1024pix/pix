import { knex } from '../../../db/knex-database-connection.js';
import _ from 'lodash';
import { Assessment } from '../../domain/models/index.js';
import { AssessmentResult } from '../../domain/read-models/participant-results/AssessmentResult.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as answerRepository from '../../../src/evaluation/infrastructure/repositories/answer-repository.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as areaRepository from './area-repository.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';
import * as flashAssessmentResultRepository from './flash-assessment-result-repository.js';
import * as campaignRepository from './campaign-repository.js';
import * as flash from '../../../src/certification/flash-certification/domain/services/algorithm-methods/flash.js';
import * as dataFetcher from '../../domain/services/algorithm-methods/data-fetcher.js';
import { NotFoundError } from '../../domain/errors.js';
import { StageCollection } from '../../../src/shared/domain/models/user-campaign-results/StageCollection.js';

const getByUserIdAndCampaignId = async function ({ userId, campaignId, badges, reachedStage, stages, locale }) {
  const participationResults = await _getParticipationResults(userId, campaignId, locale);
  let flashScoringResults;
  if (participationResults.isFlash) {
    flashScoringResults = await _getFlashScoringResults(participationResults.assessmentId, locale);
  }
  const isCampaignMultipleSendings = await _isCampaignMultipleSendings(campaignId);
  const isOrganizationLearnerActive = await _isOrganizationLearnerActive(userId, campaignId);
  const isCampaignArchived = await _isCampaignArchived(campaignId);
  const competences = await _findTargetedCompetences(campaignId, locale);
  const stageCollection = new StageCollection({ campaignId, stages });
  const isTargetProfileResetAllowed = await _getTargetProfileResetAllowed(campaignId);

  return new AssessmentResult({
    participationResults,
    competences,
    badgeResultsDTO: badges,
    stageCollection,
    reachedStage,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isCampaignArchived,
    flashScoringResults,
    isTargetProfileResetAllowed,
  });
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
    'competence.index',
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

async function _getTargetProfileResetAllowed(campaignId) {
  const targetProfile = await knex('target-profiles')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', campaignId)
    .first('areKnowledgeElementsResettable');

  return targetProfile ? targetProfile.areKnowledgeElementsResettable : false;
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
  const organizationLearner = await knex('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !organizationLearner?.isDisabled;
}

export { getByUserIdAndCampaignId };
