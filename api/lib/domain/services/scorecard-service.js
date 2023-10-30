import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from '../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { KnowledgeElement } from '../models/KnowledgeElement.js';
import { Scorecard } from '../models/Scorecard.js';
import _ from 'lodash';

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
  const resetKnowledgeElementsPromises = _.map(knowledgeElements, (knowledgeElement) =>
    _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository }),
  );
  return Promise.all(resetKnowledgeElementsPromises);
}

function _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository }) {
  const resetKe = KnowledgeElement.reset(knowledgeElement);
  return knowledgeElementRepository.save(resetKe);
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

export { resetScorecard, computeScorecard, _computeResetSkillsNotIncludedInCampaign };
