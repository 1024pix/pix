import { AssessmentSimulator, FlashAssessmentAlgorithm } from '../models/index.js';

export async function simulateFlashDeterministicAssessmentScenario({
  challengeRepository,
  locale,
  pickChallenge,
  pickAnswerStatus,
  stopAtChallenge,
  initialCapacity,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm();

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
