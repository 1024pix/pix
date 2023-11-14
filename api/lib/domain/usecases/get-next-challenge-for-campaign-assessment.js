import { AssessmentEndedError } from '../errors.js';
import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithm.js';
import { config } from '../../../src/shared/config.js';

const getNextChallengeForCampaignAssessment = async function ({
  challengeRepository,
  answerRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
  algorithmDataFetcherService,
  smartRandom,
  flashAlgorithmService,
  warmUpLength = 0,
  forcedCompetences = [],
  limitToOneQuestionPerTube = false,
  minimumEstimatedSuccessRateRanges = [],
  enablePassageByAllCompetences = false,
}) {
  let algoResult;

  if (assessment.isFlash()) {
    const { allAnswers, challenges } = await algorithmDataFetcherService.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: flashAlgorithmService,
      maximumAssessmentLength: config.features.numberOfChallengesForFlashMethod,
      warmUpLength,
      forcedCompetences,
      limitToOneQuestionPerTube,
      minimumEstimatedSuccessRateRanges,
      enablePassageByAllCompetences,
    });

    const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
      assessmentAnswers: allAnswers,
      challenges,
    });

    return pickChallengeService.chooseNextChallenge(assessment.id)({ possibleChallenges });
  } else {
    const inputValues = await algorithmDataFetcherService.fetchForCampaigns(...arguments);
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

export { getNextChallengeForCampaignAssessment };
