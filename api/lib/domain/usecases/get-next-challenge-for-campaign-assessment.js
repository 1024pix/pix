const { AssessmentEndedError } = require('../errors.js');
const FlashAssessmentAlgorithm = require('../models/FlashAssessmentAlgorithm');

module.exports = async function getNextChallengeForCampaignAssessment({
  challengeRepository,
  answerRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
  dataFetcher,
  smartRandom,
  randomMethod,
}) {
  let algoResult;

  if (assessment.isFlash()) {
    const { allAnswers, challenges, estimatedLevel } = await dataFetcher.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      assessment,
      randomMethod,
    });

    return assessmentAlgorithm.getNextChallenge({ allAnswers, challenges, estimatedLevel });
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
