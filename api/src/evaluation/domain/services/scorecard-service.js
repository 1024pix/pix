import _ from 'lodash';

import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';
import { CompetenceEvaluation } from '../models/CompetenceEvaluation.js';
import { Scorecard } from '../models/Scorecard.js';

async function computeScorecard({
  userId,
  competenceId,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  allowExcessPix = false,
  allowExcessLevel = false,
  locale,
}) {
  const [knowledgeElements, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId }),
    competenceRepository.get({ id: competenceId, locale }),
    competenceEvaluationRepository.findByUserId(userId),
  ]);
  const competenceEvaluation = _.find(competenceEvaluations, { competenceId: competence.id });
  const area = await areaRepository.get({ id: competence.areaId, locale });
  return Scorecard.buildFrom({
    userId,
    knowledgeElements,
    competenceEvaluation,
    competence,
    area,
    allowExcessPix,
    allowExcessLevel,
  });
}

async function resetScorecard({
  userId,
  competenceId,
  shouldResetCompetenceEvaluation,
  assessmentRepository,
  knowledgeElementRepository,
  competenceEvaluationRepository,
  campaignParticipationRepository,
  campaignRepository,
}) {
  const newKnowledgeElements = await _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository });

  const resetSkillIds = _.map(newKnowledgeElements, (knowledgeElement) => knowledgeElement.skillId);

  // user can have only answered to questions in campaign, in that case, competenceEvaluation does not exists
  if (shouldResetCompetenceEvaluation) {
    return Promise.all([
      newKnowledgeElements,
      _resetCampaignAssessments({
        userId,
        resetSkillIds,
        assessmentRepository,
        campaignRepository,
        campaignParticipationRepository,
      }),
      _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }),
    ]);
  }

  return Promise.all([
    newKnowledgeElements,
    _resetCampaignAssessments({
      userId,
      resetSkillIds,
      assessmentRepository,
      campaignParticipationRepository,
      campaignRepository,
    }),
  ]);
}

async function _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
  });
  const resetKnowledgeElements = knowledgeElements.map(KnowledgeElement.reset);
  return knowledgeElementRepository.batchSave({ knowledgeElements: resetKnowledgeElements });
}

function _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }) {
  return competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
    competenceId,
    userId,
    status: CompetenceEvaluation.statuses.RESET,
  });
}

async function _resetCampaignAssessments({
  userId,
  resetSkillIds,
  assessmentRepository,
  campaignParticipationRepository,
  campaignRepository,
}) {
  const notAbortedCampaignAssessments = await assessmentRepository.findNotAbortedCampaignAssessmentsByUserId(userId);

  if (!notAbortedCampaignAssessments) {
    return null;
  }

  const resetCampaignAssessmentsPromises = _.map(notAbortedCampaignAssessments, (campaignAssessment) =>
    _resetCampaignAssessment({
      assessment: campaignAssessment,
      resetSkillIds,
      assessmentRepository,
      campaignParticipationRepository,
      campaignRepository,
    }),
  );
  return Promise.all(resetCampaignAssessmentsPromises);
}

async function _resetCampaignAssessment({
  assessment,
  resetSkillIds,
  assessmentRepository,
  campaignParticipationRepository,
  campaignRepository,
}) {
  // assessment.campaignParticipation can be null for organization that ask for
  // remove its data and users participations
  // @see pr 7853
  if (!assessment.campaignParticipationId) {
    return null;
  }
  const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);
  const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
    campaignParticipationId: assessment.campaignParticipationId,
  });

  const resetSkillsNotIncludedInCampaign = _computeResetSkillsNotIncludedInCampaign({
    skillIds,
    resetSkillIds,
  });

  if (!campaignParticipation || campaignParticipation.isShared || resetSkillsNotIncludedInCampaign) {
    return null;
  }

  const newAssessment = Assessment.createForCampaign({
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
  });
  await assessmentRepository.abortByAssessmentId(assessment.id);
  return await assessmentRepository.save({ assessment: newAssessment });
}

function _computeResetSkillsNotIncludedInCampaign({ skillIds, resetSkillIds }) {
  return _(skillIds).intersection(resetSkillIds).isEmpty();
}

export { _computeResetSkillsNotIncludedInCampaign, computeScorecard, resetScorecard };
