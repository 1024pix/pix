import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { AssessmentSimulator } from '../models/AssessmentSimulator.js';
import { AssessmentSimulatorDoubleMeasureStrategy } from '../models/AssessmentSimulatorDoubleMeasureStrategy.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../models/AssessmentSimulatorSingleMeasureStrategy.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';

export async function simulateFlashAssessmentScenario({
  locale,
  pickChallenge,
  pickAnswerStatus,
  stopAtChallenge,
  initialCapacity,
  challengesBetweenSameCompetence = 0,
  limitToOneQuestionPerTube = true,
  minimumEstimatedSuccessRateRanges = [],
  doubleMeasuresUntil = 0,
  variationPercent,
  variationPercentUntil,
  challengeRepository,
  flashAlgorithmService,
}) {
  const challenges = await challengeRepository.findActiveFlashCompatible({ locale });

  const enablePassageByAllCompetencesValueInProduction = true;

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: new FlashAssessmentAlgorithmConfiguration({
      limitToOneQuestionPerTube,
      minimumEstimatedSuccessRateRanges,
      enablePassageByAllCompetences: enablePassageByAllCompetencesValueInProduction,
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
