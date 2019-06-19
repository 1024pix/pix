const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const KnowledgeElement = require('../models/KnowledgeElement');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

async function computeScorecard({ userId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository }) {

  const [knowledgeElements, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(userId),
  ]);

  const competenceEvaluation = _.find(competenceEvaluations, { competenceId: competence.id });

  return Scorecard.buildFrom({
    userId,
    knowledgeElements,
    competenceEvaluation,
    competence,
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
}) {

  // user can have only answered to questions in campaign, in that case, competenceEvaluation does not exists
  if (shouldResetCompetenceEvaluation) {
    return Promise.all([
      _resetSmartPlacementAssessments({ userId, assessmentRepository, campaignParticipationRepository }),
      _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }),
      _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }),
    ]);
  }

  return Promise.all([
    _resetSmartPlacementAssessments({ userId, assessmentRepository, campaignParticipationRepository }),
    _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }),
  ]);
}

async function _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId, competenceId
  });
  const resetKnowledgeElementsPromises = _.map(knowledgeElements,
    (knowledgeElement) => _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository })
  );
  return Promise.all(resetKnowledgeElementsPromises);
}

function _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository }) {
  const newKnowledgeElement = {
    ...knowledgeElement,
    status: KnowledgeElement.StatusType.RESET,
    earnedPix: 0,
  };
  return knowledgeElementRepository.save(newKnowledgeElement);
}

function _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }) {
  return competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
    competenceId, userId, status: CompetenceEvaluation.statuses.RESET
  });
}

async function _resetSmartPlacementAssessments({ userId, assessmentRepository, campaignParticipationRepository }) {
  const smartPlacementAssessments = await assessmentRepository.findSmartPlacementAssessmentsByUserId(userId);

  if (!smartPlacementAssessments) {
    return null;
  }

  const resetSmartPlacementAssessmentsPromises = _.map(smartPlacementAssessments,
    (smartPlacementAssessment) => _resetSmartPlacementAssessment({ assessment: smartPlacementAssessment, assessmentRepository, campaignParticipationRepository })
  );
  return Promise.all(resetSmartPlacementAssessmentsPromises);
}

async function _resetSmartPlacementAssessment({ assessment, assessmentRepository, campaignParticipationRepository }) {
  const campaignParticipation = await campaignParticipationRepository.findOneByAssessmentId(assessment.id);

  if (!campaignParticipation || campaignParticipation.isShared) {
    return null;
  }

  const newAssessment = new Assessment({
    userId: assessment.userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    courseId: 'Smart Placement Tests CourseId Not Used'
  });

  const [, newAssessmentSaved ] = await Promise.all([
    assessmentRepository.updateStateById({ id: assessment.id, state: Assessment.states.ABORTED }),
    assessmentRepository.save(newAssessment)
  ]);

  return campaignParticipationRepository.updateAssessmentIdByOldAssessmentId({
    oldAssessmentId: assessment.id, assessmentId: newAssessmentSaved.id
  });
}

module.exports = {
  resetScorecard,
  computeScorecard,
};
