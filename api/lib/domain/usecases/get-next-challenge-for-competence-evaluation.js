/* eslint-disable no-unused-vars */
const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const hashInt = require('hash-int');
const UNEXISTING_ITEM = null;

const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

module.exports = async function getNextChallengeForCompetenceEvaluation({
  knowledgeElementRepository,
  challengeRepository,
  answerRepository,
  skillRepository,
  pickChallengeService,
  assessment,
  userId,
}) {

  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await dataFetcher.fetchForCompetenceEvaluations(...arguments);

  const {
    possibleSkillsForNextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getPossibleSkillsForNextChallenge(inputValues);

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge(possibleSkillsForNextChallenge, assessment.id);
};

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}
