/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

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

  const {
    possibleSkillsForNextChallenge,
    hasAssessmentEnded,
  } = smartRandom.getPossibleSkillsForNextChallenge({ ...inputValues, locale });

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  });
};

