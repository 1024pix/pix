import { FlashAssessmentAlgorithm } from '../../../../shared/domain/models/FlashAssessmentAlgorithm.js';
import { AssessmentSimulator } from '../models/AssessmentSimulator.js';

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
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, useObsoleteChallenges });

  const flashAssessmentAlgorithm = new FlashAssessmentAlgorithm({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength: stopAtChallenge,
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
