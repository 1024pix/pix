import _ from 'lodash';

import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from '../models/CompetenceEvaluation.js';
import { Scorecard } from '../models/Scorecard.js';

export async function computeScorecard({
  userId,
  competenceId,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeStateRepository,
  allowExcessPix = false,
  allowExcessLevel = false,
  locale,
}) {
  const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
  const competence = await competenceRepository.get({ id: competenceId, locale });
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);

  const competenceEvaluation = _.find(competenceEvaluations, { competenceId: competence.id });
  const area = await areaRepository.get({ id: competence.areaId, locale });
  return Scorecard.buildFrom({
    userId,
    knowledgeState: knowledgeState.restrictedToCompetence(competenceId),
    competenceEvaluation,
    competence,
    area,
    allowExcessPix,
    allowExcessLevel,
  });
}

export function computeLevelUpInformation({
  answer,
  userId,
  area,
  competence,
  competenceEvaluationForCompetence,
  knowledgeStateForCompetenceBefore,
  knowledgeStateForCompetenceAfter,
  allowExcessPix = false,
  allowExcessLevel = false,
}) {
  const scorecardBefore = Scorecard.buildFrom({
    userId,
    knowledgeState: knowledgeStateForCompetenceBefore,
    competenceEvaluation: competenceEvaluationForCompetence,
    competence,
    area,
    allowExcessPix,
    allowExcessLevel,
  });
  const scorecardAfter = Scorecard.buildFrom({
    userId,
    knowledgeState: knowledgeStateForCompetenceAfter,
    competenceEvaluation: competenceEvaluationForCompetence,
    competence,
    area,
    allowExcessPix,
    allowExcessLevel,
  });

  if (scorecardBefore.level < scorecardAfter.level) {
    return {
      id: answer.id,
      competenceName: scorecardAfter.name,
      level: scorecardAfter.level,
    };
  }
  return {};
}

export async function resetScorecard({
  userId,
  competenceId,
  shouldResetCompetenceEvaluation,
  assessmentRepository,
  knowledgeStateRepository,
  competenceEvaluationRepository,
  campaignParticipationRepository,
  campaignRepository,
}) {
  const resetSkillIds = await _forgetCompetence({ userId, competenceId, knowledgeStateRepository });

  // user can have only answered to questions in campaign, in that case, competenceEvaluation does not exists
  await _resetCampaignAssessments({
    userId,
    resetSkillIds,
    assessmentRepository,
    campaignRepository,
    campaignParticipationRepository,
  });

  if (shouldResetCompetenceEvaluation) {
    await _resetCompetenceEvaluation({
      userId,
      competenceId,
      competenceEvaluationRepository,
    });
  }
}

/**
 * Oublie la compétence : son état est effacé, sans trace. Les acquis qui
 * étaient évalués sont retenus juste le temps de décider quels parcours de
 * campagne doivent repartir de zéro.
 */
async function _forgetCompetence({ userId, competenceId, knowledgeStateRepository }) {
  const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
  const resetSkillIds = knowledgeState
    .restrictedToCompetence(competenceId)
    .assessedSkills()
    .map(({ id }) => id);

  await knowledgeStateRepository.forgetCompetence({ userId, competenceId });
  return resetSkillIds;
}

async function _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }) {
  return await competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
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

  for (const campaignAssessment of notAbortedCampaignAssessments) {
    await _resetCampaignAssessment({
      assessment: campaignAssessment,
      resetSkillIds,
      assessmentRepository,
      campaignParticipationRepository,
      campaignRepository,
    });
  }
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
  const campaign = await campaignRepository.get(campaignParticipation.campaignId);
  const newAssessment = Assessment.createForCampaign({
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
    campaign,
  });

  await assessmentRepository.abortByAssessmentId(assessment.id);
  return await assessmentRepository.save({ assessment: newAssessment });
}

export function _computeResetSkillsNotIncludedInCampaign({ skillIds, resetSkillIds }) {
  return _(skillIds).intersection(resetSkillIds).isEmpty();
}
