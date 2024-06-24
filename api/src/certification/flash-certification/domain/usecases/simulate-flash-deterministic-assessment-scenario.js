import { AssessmentSimulator } from '../models/AssessmentSimulator.js';
import { AssessmentSimulatorDoubleMeasureStrategy } from '../models/AssessmentSimulatorDoubleMeasureStrategy.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../models/AssessmentSimulatorSingleMeasureStrategy.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';
import { FlashAssessmentAlgorithmConfiguration } from '../models/FlashAssessmentAlgorithmConfiguration.js';

export async function simulateFlashDeterministicAssessmentScenario({
  locale,
  pickChallenge,
  challengePickProbability,
  pickAnswerStatus,
  stopAtChallenge,
  initialCapacity,
  useObsoleteChallenges,
  warmUpLength = 0,
  forcedCompetences = [],
  challengesBetweenSameCompetence = 0,
  limitToOneQuestionPerTube = true,
  minimumEstimatedSuccessRateRanges = [],
  enablePassageByAllCompetences = false,
  doubleMeasuresUntil = 0,
  variationPercent,
  variationPercentUntil,
  challengeRepository,
  flashAlgorithmService,
  scoringDegradationService,
  startCapacityDegradationAt,
}) {
  let simulationResult;

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
    challengePickProbability,
    pickAnswerStatus,
    initialCapacity,
  });

  const doubleMeasureStrategy = new AssessmentSimulatorDoubleMeasureStrategy({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    challengePickProbability,
    pickAnswerStatus,
    initialCapacity,
  });

  const getStrategy = (questionIndex) =>
    questionIndex >= doubleMeasuresUntil ? singleMeasureStrategy : doubleMeasureStrategy;

  const simulator = new AssessmentSimulator({
    getStrategy,
  });

  const simulatorLoops = startCapacityDegradationAt;
  simulationResult = simulator.run({ simulatorLoops });
  // console.log(simulationResult);

  if (startCapacityDegradationAt) {
    const allChallenges = simulationResult.map((result) => result.challenge);
    const allAnswers = simulationResult.map((result) => result.answerStatus);
    const capacity = simulationResult.at(-1).capacity;
    simulationResult = scoringDegradationService.downgradeCapacity({
      algorithm: flashAssessmentAlgorithm,
      flashAssessmentAlgorithmConfiguration: flashAssessmentAlgorithm.getConfiguration(),
      isSimulation: true,
      allChallenges,
      allAnswers,
      capacity,
    });
  }

  return simulationResult;
}
