/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/algorithm-methods/smart-random');
const flash = require('../services/algorithm-methods/flash');
const dataFetcher = require('../services/algorithm-methods/data-fetcher');

module.exports = async function getNextChallengeForCampaignAssessment({
  knowledgeElementRepository,
  targetProfileRepository,
  challengeRepository,
  answerRepository,
  improvementService,
  assessment,
  pickChallengeService,
  locale,
}) {
  const inputValues = await dataFetcher.fetchForCampaigns(...arguments);
  let algoResult;

  if (assessment.isFlash()) {
    algoResult = flash.getPossibleSkillsForNextChallenge({ ...inputValues, locale });
  }
  else {
    algoResult = smartRandom.getPossibleSkillsForNextChallenge({ ...inputValues, locale });
  }

  if (algoResult.hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge({
    skills: algoResult.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  });
};

