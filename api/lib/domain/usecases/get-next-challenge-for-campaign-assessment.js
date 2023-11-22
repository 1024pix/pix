import { AssessmentEndedError } from '../errors.js';
import { FlashAssessmentAlgorithm } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithm.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmConfiguration.js';

const getNextChallengeForCampaignAssessment = async function ({
  challengeRepository,
  answerRepository,
  flashAlgorithmConfigurationRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
  algorithmDataFetcherService,
  smartRandom,
  flashAlgorithmService,
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

    const configuration = (await flashAlgorithmConfigurationRepository.get()) ?? _createDefaultAlgorithmConfiguration();

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: flashAlgorithmService,
      configuration,
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

const _createDefaultAlgorithmConfiguration = () => {
  return new FlashAssessmentAlgorithmConfiguration({
    warmUpLength: 0,
    forcedCompetences: [],
    limitToOneQuestionPerTube: false,
    minimumEstimatedSuccessRateRanges: [],
    enablePassageByAllCompetences: false,
  });
};

export { getNextChallengeForCampaignAssessment };
