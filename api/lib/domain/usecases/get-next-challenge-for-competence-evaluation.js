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

  return _pickChallenge(possibleSkillsForNextChallenge, assessment.id);
};

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}
function _pickChallenge(skills, randomSeed) {
  if (skills.length === 0) { return UNEXISTING_ITEM; }
  const key = Math.abs(hashInt(randomSeed));
  const chosenSkill = skills[key % skills.length];
  return chosenSkill.challenges[key % chosenSkill.challenges.length];
}
