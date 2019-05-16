const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const smartRandom = require('../services/smart-random/smartRandom');

async function getNextChallengeForCompetenceEvaluation({ assessment, userId, answerRepository, competenceEvaluationRepository, challengeRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [answers, targetSkills, challenges, knowledgeElements] = await getSmartRandomInputValues({
    assessment,
    competenceEvaluation,
    answerRepository,
    challengeRepository,
    smartPlacementKnowledgeElementRepository,
    skillRepository
  });
  const nextChallenge = smartRandom.getNextChallenge({ answers, challenges, targetSkills, knowledgeElements });

  if (nextChallenge === null) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}

function getSmartRandomInputValues({ assessment, competenceEvaluation, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    challengeRepository.findByCompetenceId(competenceEvaluation.competenceId),
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );
}

module.exports = getNextChallengeForCompetenceEvaluation;
