/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');
const hashInt = require('hash-int');
const UNEXISTING_ITEM = null;

module.exports = async function getNextChallengeForSmartPlacement({
  knowledgeElementRepository,
  targetProfileRepository,
  challengeRepository,
  answerRepository,
  improvementService,
  assessment,
  tryImproving
}) {
  if (tryImproving) {
    assessment.isImproving = true;
  }

  const inputValues = await dataFetcher.fetchForCampaigns(...arguments);

  const {
    possibleSkillsForNextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getPossibleSkillsForNextChallenge(inputValues);

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return _pickChallenge(possibleSkillsForNextChallenge, assessment.id);

};

function _pickChallenge(skills, randomSeed) {
  if (skills.length === 0) { return UNEXISTING_ITEM; }
  const key = Math.abs(hashInt(randomSeed));
  const chosenSkill = skills[key % skills.length];
  return chosenSkill.challenges[key % chosenSkill.challenges.length];
}
