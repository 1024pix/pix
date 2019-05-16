const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, knowledgeElementRepository, targetProfileRepository }) {
  const [answers, [targetProfile, challenges], knowledgeElements] = await dataFetcher.fetchForCampaigns({
    assessment,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    targetProfileRepository,
  });

  const {
    nextChallenge,
    assessmentEnded,
  } = smartRandom.getNextChallenge({ answers, challenges, targetSkills: targetProfile.skills, knowledgeElements });

  if (assessmentEnded) {
    throw new AssessmentEndedError();
  }

  return nextChallenge;
}

module.exports = getNextChallengeForSmartPlacement;
