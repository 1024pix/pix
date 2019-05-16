/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForSmartPlacement(
  knowledgeElementRepository,
  targetProfileRepository,
  challengeRepository,
  answerRepository,
  assessment,
) {

  const [
    answers,
    targetProfile,
    challenges,
    knowledgeElements,
  ] = await dataFetcher.fetchForCampaigns(...arguments);

  const {
    nextChallenge,
    assessmentEnded,

  } = smartRandom.getNextChallenge({
    answers,
    challenges,
    targetSkills: targetProfile.skills,
    knowledgeElements,
  });

  if (assessmentEnded) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

module.exports = getNextChallengeForSmartPlacement;
