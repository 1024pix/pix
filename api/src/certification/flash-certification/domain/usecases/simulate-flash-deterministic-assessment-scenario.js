import { FlashAssessmentAlgorithm } from '../model/FlashAssessmentAlgorithm.js';
import { AssessmentSimulator } from '../model/AssessmentSimulator.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../model/AssessmentSimulatorSingleMeasureStrategy.js';

export async function simulateFlashDeterministicAssessmentScenario({
  challengeRepository,
  locale,
  pickChallenge,
  pickAnswerStatus,
  stopAtChallenge,
  initialCapacity,
  useObsoleteChallenges,
  flashAlgorithmService,
  warmUpLength = 0,
  forcedCompetences = [],
  challengesBetweenSameCompetence = 0,
  limitToOneQuestionPerTube = true,
  minimumEstimatedSuccessRateRanges = [],
  enablePassageByAllCompetences = false,
  variationPercent,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, useObsoleteChallenges });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength: stopAtChallenge,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
    minimumEstimatedSuccessRateRanges,
    flashAlgorithmImplementation: flashAlgorithmService,
    enablePassageByAllCompetences,
    variationPercent,
  });

  const strategy = new AssessmentSimulatorSingleMeasureStrategy({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
  });

  const simulator = new AssessmentSimulator({
    strategy,
  });

  return simulator.run();
}
