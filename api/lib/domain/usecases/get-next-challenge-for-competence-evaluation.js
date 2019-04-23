const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const Assessment = require('../models/Assessment');
const SmartRandom = require('../services/smart-random/SmartRandom');

async function getNextChallengeForCompetenceEvaluation({ assessment, userId, answerRepository, competenceEvaluationRepository, challengeRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {
  _checkIfUserIsAssessmentsUser(assessment, userId);
  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [answers, targetSkills, challenges, knowledgeElements] = await getSmartRandomInputValues({
    assessment,
    competenceEvaluation,
    answerRepository,
    challengeRepository,
    competenceEvaluationRepository,
    smartPlacementKnowledgeElementRepository,
    skillRepository
  });
  const nextChallenge = SmartRandom.getNextChallenge({ answers, challenges, targetSkills, knowledgeElements });
  if (nextChallenge === null) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

function _checkIfUserIsAssessmentsUser(assessment, userId) {
  if (assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}

async function getSmartRandomInputValues({ assessment, competenceEvaluation, answerRepository, challengeRepository, competenceEvaluationRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {

  const oldCompetenceEvaluation = await competenceEvaluationRepository.findOneCompletedByCompetenceIdAndUserId(competenceEvaluation.competenceId, assessment.userId);

  let knowledgeElements;

  if (oldCompetenceEvaluation && oldCompetenceEvaluation.id !== competenceEvaluation.id && oldCompetenceEvaluation.assessment.state === Assessment.states.COMPLETED) {
    knowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: assessment.userId, startDate: competenceEvaluation.createdAt });
  } else {
    const knowledgeElements1 = await smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: assessment.userId, assessmentType: Assessment.types.COMPETENCE_EVALUATION, startDate: competenceEvaluation.createdAt });
    const knowledgeElements2 = await smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: assessment.userId, assessmentType: Assessment.types.SMARTPLACEMENT });
    knowledgeElements = knowledgeElements1.concat(knowledgeElements2);
  }

  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    challengeRepository.findByCompetenceId(competenceEvaluation.competenceId),
    knowledgeElements]
  );
}

module.exports = getNextChallengeForCompetenceEvaluation;
