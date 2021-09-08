/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/algorithm-methods/smart-random');
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

