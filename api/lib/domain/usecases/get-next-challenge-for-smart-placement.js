/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForSmartPlacement({
  knowledgeElementRepository,
  targetProfileRepository,
  challengeRepository,
  answerRepository,
  assessment,
}) {

  const inputValues = await dataFetcher.fetchForCampaigns(...arguments);

  const {
    nextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getNextChallenge(inputValues);

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return nextChallenge;
}

module.exports = getNextChallengeForSmartPlacement;
