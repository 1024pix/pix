import { AssessmentSimulator, FlashAssessmentAlgorithm } from '../models/index.js';

export async function simulateFlashDeterministicAssessmentScenario({
  challengeRepository,
  locale,
  pickChallengeService,
  pickAnswerStatus,
  assessmentId,
  stopAtChallenge,
  initialCapacity,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm();

  const pickChallenge = ({ possibleChallenges }) =>
    pickChallengeService.chooseNextChallenge({
      possibleChallenges,
      assessmentId,
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
