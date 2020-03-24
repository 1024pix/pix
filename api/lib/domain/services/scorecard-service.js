const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const KnowledgeElement = require('../models/KnowledgeElement');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

async function computeScorecard({ userId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository, blockReachablePixAndLevel = false }) {
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
    blockReachablePixAndLevel
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

  const newKnowledgeElements = await _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository });

  const resetSkills = _.map(newKnowledgeElements, (knowledgeElement) => knowledgeElement.skillId);

  // user can have only answered to questions in campaign, in that case, competenceEvaluation does not exists
  if (shouldResetCompetenceEvaluation) {
    return Promise.all([
      newKnowledgeElements,
      _resetSmartPlacementAssessments({ userId, resetSkills, assessmentRepository, campaignParticipationRepository }),
      _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }),
    ]);
  }

  return Promise.all([
    newKnowledgeElements,
    _resetSmartPlacementAssessments({
      userId,
      resetSkills,
      assessmentRepository,
      campaignParticipationRepository
    })
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

async function _resetSmartPlacementAssessments({ userId, resetSkills, assessmentRepository, campaignParticipationRepository }) {
  const notAbortedSmartPlacementAssessments = await assessmentRepository.findNotAbortedSmartPlacementAssessmentsByUserId(userId);

  if (!notAbortedSmartPlacementAssessments) {
    return null;
  }

  const resetSmartPlacementAssessmentsPromises = _.map(notAbortedSmartPlacementAssessments,
    (smartPlacementAssessment) => _resetSmartPlacementAssessment({
      assessment: smartPlacementAssessment,
      resetSkills,
      assessmentRepository,
      campaignParticipationRepository
    })
  );
  return Promise.all(resetSmartPlacementAssessmentsPromises);
}

async function _resetSmartPlacementAssessment({ assessment, resetSkills, assessmentRepository, campaignParticipationRepository }) {
  const campaignParticipation = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessment.id);

  const resetSkillsNotIncludedInTargetProfile = _computeResetSkillsNotIncludedInTargetProfile({
    targetObjectSkills: _.get(campaignParticipation, 'campaign.targetProfile.skills'),
    resetSkills
  });

  if (!campaignParticipation || campaignParticipation.isShared || resetSkillsNotIncludedInTargetProfile) {
    return null;
  }

  const newAssessment = new Assessment({
    userId: assessment.userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    campaignParticipationId: assessment.campaignParticipationId,
    courseId: 'Smart Placement Tests CourseId Not Used'
  });

  const [, newAssessmentSaved] = await Promise.all([
    assessmentRepository.updateStateById(null, { id: assessment.id, state: Assessment.states.ABORTED }),
    assessmentRepository.save(newAssessment)
  ]);
  return newAssessmentSaved;
}

function _computeResetSkillsNotIncludedInTargetProfile({ targetObjectSkills, resetSkills }) {
  const targetSkills = _.map(targetObjectSkills, (skill) => skill.id);
  return _(targetSkills).intersection(resetSkills).isEmpty();
}

module.exports = {
  resetScorecard,
  computeScorecard,
  _computeResetSkillsNotIncludedInTargetProfile,
};
