import { AssessmentSimulator, FlashAssessmentAlgorithm } from '../models/index.js';

export async function simulateFlashDeterministicAssessmentScenario({
  challengeRepository,
  locale,
  pickChallenge,
  pickAnswerStatus,
  stopAtChallenge,
  initialCapacity,
  warmUpLength,
  forcedCompetences,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    warmUpLength,
    forcedCompetences,
  });

  const simulator = new AssessmentSimulator({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    initialCapacity,
    pickAnswerStatus,
    stopAtChallenge,
  });

  return simulator.run();
}
