const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForCompetenceEvaluation({ assessment, userId, answerRepository, competenceEvaluationRepository, challengeRepository, knowledgeElementRepository, skillRepository }) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  const [answers, targetSkills, challenges, knowledgeElements] = await dataFetcher.fetchForCompetenceEvaluations({
    assessment,
    competenceEvaluation,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    skillRepository
  });

  const {
    nextChallenge,
    assessmentEnded,
  } = smartRandom.getNextChallenge({ answers, challenges, targetSkills, knowledgeElements });

  if (assessmentEnded) {
    throw new AssessmentEndedError();
  }

  return nextChallenge;
}

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}

module.exports = getNextChallengeForCompetenceEvaluation;
