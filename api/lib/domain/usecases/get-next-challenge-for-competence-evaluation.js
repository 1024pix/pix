/* eslint-disable no-unused-vars */
const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

module.exports = async function getNextChallengeForCompetenceEvaluation({
  knowledgeElementRepository,
  challengeRepository,
  answerRepository,
  assessmentRepository,
  skillRepository,
  assessment,
  userId,
}) {

  _checkIfAssessmentBelongsToUser(assessment, userId);

  if (assessment.currentChallenge) {
    return challengeRepository.get(assessment.currentChallenge);
  }

  const inputValues = await dataFetcher.fetchForCompetenceEvaluations(...arguments);

  const {
    nextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getNextChallenge(inputValues);

  await assessmentRepository.setCurrentChallenge(assessment.id, nextChallenge.id);

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
};

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}
