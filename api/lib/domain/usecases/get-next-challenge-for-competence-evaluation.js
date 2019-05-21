/* eslint-disable no-unused-vars */
const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForCompetenceEvaluation({
  knowledgeElementRepository,
  competenceEvaluationRepository,
  challengeRepository,
  answerRepository,
  skillRepository,
  assessment,
  userId,
}) {

  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await dataFetcher.fetchForCompetenceEvaluations(...arguments);

  const {
    nextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getNextChallenge(inputValues);

  if (hasAssessmentEnded) {
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
