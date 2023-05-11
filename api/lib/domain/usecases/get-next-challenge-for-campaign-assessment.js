const { AssessmentEndedError } = require('../errors.js');
const AssessmentAlgorithm = require('../models/AssessmentAlgorithm');

module.exports = async function getNextChallengeForCampaignAssessment({
  challengeRepository,
  answerRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
  dataFetcher,
  smartRandom,
  random,
}) {
  let algoResult;

  if (assessment.isFlash()) {
    const inputValues = await dataFetcher.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const assessmentAlgorithm = new AssessmentAlgorithm({ assessment, randomAlgorithm: random.binaryTreeRandom });

    return assessmentAlgorithm.getNextChallenge({ ...inputValues });
  } else {
    const inputValues = await dataFetcher.fetchForCampaigns(...arguments);
    algoResult = smartRandom.getPossibleSkillsForNextChallenge({ ...inputValues, locale });

    if (algoResult.hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return pickChallengeService.pickChallenge({
      skills: algoResult.possibleSkillsForNextChallenge,
      randomSeed: assessment.id,
      locale,
    });
  }
};
