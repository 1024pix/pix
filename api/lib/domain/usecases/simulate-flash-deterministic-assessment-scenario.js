import { AssessmentSimulator, FlashAssessmentAlgorithm } from '../models/index.js';

export async function simulateFlashDeterministicAssessmentScenario({
  challengeRepository,
  locale,
  simulationAnswers,
  pickChallengeService,
  pickAnswer,
  assessmentId,
  stopAtChallenge,
}) {
  const challenges = await challengeRepository.findOperativeFlashCompatible({ locale });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm();

  const pickChallenge = ({ possibleChallenges }) =>
    pickChallengeService.chooseNextChallenge({
      possibleChallenges,
      assessmentId,
    });

  const simulator = new AssessmentSimulator({
    answers: simulationAnswers,
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    pickAnswer,
    stopAtChallenge,
  });

  return simulator.run();
}
