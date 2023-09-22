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
  useObsoleteChallenges,
  challengesBetweenSameCompetence,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, useObsoleteChallenges });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength: stopAtChallenge,
    challengesBetweenSameCompetence,
  });

  const simulator = new AssessmentSimulator({
    algorithm: flashAssessmentAlgorithm,
    challenges,
    pickChallenge,
    initialCapacity,
    pickAnswerStatus,
  });

  return simulator.run();
}
