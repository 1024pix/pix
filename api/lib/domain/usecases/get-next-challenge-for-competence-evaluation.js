const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const SmartRandom = require('../services/smart-random/SmartRandom');

async function getNextChallengeForCompetenceEvaluation({ assessment, userId, answerRepository, competenceEvaluationRepository, challengeRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {
  _checkIfUserIsAssessmentsUser(assessment, userId);
  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [answers, targetSkills, challenges, knowledgeElements] = await getSmartRandomInputValues({
    assessment,
    competenceEvaluation,
    answerRepository,
    challengeRepository,
    smartPlacementKnowledgeElementRepository,
    skillRepository
  });
  const nextChallenge = await SmartRandom.getNextChallenge({ answers, challenges, targetSkills, knowledgeElements });
  if (nextChallenge === null) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

function _checkIfUserIsAssessmentsUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}
function getSmartRandomInputValues({ assessment, competenceEvaluation, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, skillRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    challengeRepository.findByCompetenceId(competenceEvaluation.competenceId),
    smartPlacementKnowledgeElementRepository.findUniqByUserId(assessment.userId)]
  );
}

module.exports = getNextChallengeForCompetenceEvaluation;
