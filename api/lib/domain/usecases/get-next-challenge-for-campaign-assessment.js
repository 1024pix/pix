/* eslint-disable no-unused-vars */
const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo');

module.exports = async function getNextChallengeForCampaignAssessment({
  knowledgeElementRepository,
  targetProfileRepository,
  challengeRepository,
  answerRepository,
  courseRepository,
  improvementService,
  assessment,
  pickChallengeService,
  tryImproving,
  locale,
}) {

  if (process.env.IS_PIX_CONTEST === 'true') {
    return getNextChallengeForDemo({ assessment, answerRepository, challengeRepository, courseRepository });
  }

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

  return pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  });
};

