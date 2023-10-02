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
  limitToOneQuestionPerTube,
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, useObsoleteChallenges });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength: stopAtChallenge,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
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
