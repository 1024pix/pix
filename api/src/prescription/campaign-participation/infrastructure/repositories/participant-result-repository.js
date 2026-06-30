import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../shared/domain/read-models/participant-results/AssessmentResult.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import knowledgeElementForParticipationService from '../../../shared/domain/services/knowledge-element-for-participation-service.js';
import { convertLevelStagesIntoThresholds } from '../../../stages/domain/services/convert-level-stages-into-thresholds-service.js';

/**
 *
 * @param {number} userId
 * @param {number} campaignId
 * @param {number} campaignParticipationId
 * @param {[Badge]} badges
 * @param {{
 *  totalStage: number,
 *  reachedStage: number,
 *  reachedStageNumber: number,
 *  totalNumberOfStages: number
 * }} reachedStage
 * @param {[Stage]} stages
 * @param {string} locale
 *
 * @returns {Promise<AssessmentResult>}
 */
const get = async function ({ userId, campaignId, badges, reachedStage, stages, locale }) {
  const participationResults = await _getParticipationResults(userId, campaignId, locale);
  const campaignDTO = await _getCampaignDTO(campaignId);
  const isCampaignMultipleSendings = _isCampaignMultipleSendings(campaignDTO);
  const isCampaignArchived = _isCampaignArchived(campaignDTO);
  const isCampaignDeleted = _isCampaignDeleted(campaignDTO);
  const isOrganizationLearnerActive = await _isOrganizationLearnerActive(userId, campaignId);
  const competences = await _findTargetedCompetences(campaignId, locale);
  if (stages && stages.length) {
    const skillIds = competences.flatMap(({ targetedSkillIds }) => targetedSkillIds);
    const skills = await skillRepository.findOperativeByIds(skillIds);
    convertLevelStagesIntoThresholds(stages, skills);
    if (reachedStage) {
      const stage = stages.find((stage) => stage.id == reachedStage.id);
      // if the stage is a stage level, we need to add the converted threshold
      reachedStage = {
        ...reachedStage,
        threshold: stage?.threshold,
      };
    }
  }
  const isTargetProfileResetAllowed = await _getTargetProfileResetAllowed(campaignId);
  return new AssessmentResult({
    participationResults,
    competences,
    badgeResultsDTO: badges,
    stages,
    reachedStage,
    isCampaignMultipleSendings,
    isOrganizationLearnerActive,
    isCampaignArchived,
    isCampaignDeleted,
    campaignType: campaignDTO.type,
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
    status,
    assessmentId,
    isDeleted,
  } = await _getParticipationAttributes(userId, campaignId);

  const knowledgeElements = await _findTargetedKnowledgeElements(campaignId, userId, campaignParticipationId, sharedAt);

  const acquiredBadgeIds = await _getAcquiredBadgeIds(userId, campaignParticipationId);

  return {
    campaignParticipationId,
    isCompleted,
    sharedAt,
    status,
    assessmentCreatedAt,
    participantExternalId,
    knowledgeElements,
    masteryRate,
    acquiredBadgeIds: acquiredBadgeIds.map(({ badgeId }) => badgeId),
    isDeleted,
    assessmentId,
  };
}

async function _getParticipationAttributes(userId, campaignId) {
  const knexConn = DomainTransaction.getConnection();

  const participationAttributes = await knexConn('campaign-participations')
    .select([
      'state',
      'campaignParticipationId',
      'status',
      'sharedAt',
      'assessments.createdAt AS assessmentCreatedAt',
      'participantExternalId',
      knexConn.raw('CAST("masteryRate" AS FLOAT)'),
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
    status,
    assessmentCreatedAt,
    participantExternalId,
    masteryRate,
    assessmentId,
    deletedAt,
  } = participationAttributes;

  return {
    isCompleted: state === Assessment.states.COMPLETED,
    campaignParticipationId,
    sharedAt,
    status,
    assessmentCreatedAt,
    participantExternalId,
    masteryRate,
    assessmentId,
    isDeleted: Boolean(deletedAt),
  };
}

async function _findTargetedKnowledgeElements(campaignId, userId, campaignParticipationId, sharedAt) {
  const skillIds = await campaignRepository.findSkillIds({ campaignId });
  const knowledgeElements = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
    userId,
    campaignParticipationId,
    limitDate: sharedAt,
  });
  return knowledgeElements.filter(({ skillId }) => skillIds.includes(skillId));
}

async function _getAcquiredBadgeIds(userId, campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('badge-acquisitions').select('badgeId').where({ userId, campaignParticipationId });
}

async function _getTargetProfileResetAllowed(campaignId) {
  const knexConn = DomainTransaction.getConnection();

  const targetProfile = await knexConn('target-profiles')
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

function _getCampaignDTO(campaignId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('campaigns').select('*').where({ 'campaigns.id': campaignId }).first();
}

function _isCampaignMultipleSendings(campaignDTO) {
  return campaignDTO.multipleSendings;
}

function _isCampaignArchived(campaignDTO) {
  return Boolean(campaignDTO.archivedAt);
}

function _isCampaignDeleted(campaignDTO) {
  return Boolean(campaignDTO.deletedAt);
}

async function _isOrganizationLearnerActive(userId, campaignId) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !organizationLearner?.isDisabled;
}

export { get };
