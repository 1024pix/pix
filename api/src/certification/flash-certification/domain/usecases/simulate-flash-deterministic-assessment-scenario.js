import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';
import { AssessmentSimulator } from '../models/AssessmentSimulator.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../models/AssessmentSimulatorSingleMeasureStrategy.js';
import { AssessmentSimulatorDoubleMeasureStrategy } from '../models/AssessmentSimulatorDoubleMeasureStrategy.js';
import { FlashAssessmentAlgorithmConfiguration } from '../models/FlashAssessmentAlgorithmConfiguration.js';

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
  doubleMeasuresUntil = 0,
  variationPercent,
  variationPercentUntil,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, useObsoleteChallenges });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: new FlashAssessmentAlgorithmConfiguration({
      warmUpLength,
      forcedCompetences,
      limitToOneQuestionPerTube,
      minimumEstimatedSuccessRateRanges,
      enablePassageByAllCompetences,
      variationPercent,
      variationPercentUntil,
      doubleMeasuresUntil,
      challengesBetweenSameCompetence,
      maximumAssessmentLength: stopAtChallenge,
    }),
  });

  const singleMeasureStrategy = new AssessmentSimulatorSingleMeasureStrategy({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
  });

  const doubleMeasureStrategy = new AssessmentSimulatorDoubleMeasureStrategy({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    pickAnswerStatus,
    initialCapacity,
  });

  const getStrategy = (questionIndex) =>
    questionIndex >= doubleMeasuresUntil ? singleMeasureStrategy : doubleMeasureStrategy;

  const simulator = new AssessmentSimulator({
    getStrategy,
  });

  return simulator.run();
}
