const { AssessmentEndedError } = require('../errors.js');

module.exports = async function getNextChallengeForCampaignAssessment({
  challengeRepository,
  answerRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
  dataFetcher,
  smartRandom,
  flash,
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
    algoResult = flash.getPossibleNextChallenges({ ...inputValues });

    if (algoResult.hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return assessment.chooseNextFlashChallenge(algoResult.possibleChallenges);
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
