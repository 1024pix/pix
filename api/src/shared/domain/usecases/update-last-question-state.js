import { logger } from '../../infrastructure/utils/logger.js';
import { Assessment } from '../models/Assessment.js';

export async function updateLastQuestionState({
  assessmentId,
  lastQuestionState,
  challengeId,
  assessmentRepository,
  challengeToPlayApi,
}) {
  if (lastQuestionState === Assessment.statesOfLastQuestion.FOCUSEDOUT && challengeId !== undefined) {
    const challenge = await challengeToPlayApi.get(challengeId);
    if (!challenge.focused) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeId: challengeId,
          assessmentId: assessmentId,
        },
        'Trying to focusOut a non focused challenge',
      );

      return;
    }

    const assessment = await assessmentRepository.get(assessmentId);
    if (challengeId !== assessment.lastChallengeId) {
      logger.warn(
        {
          subject: 'focusOut',
          challengeId: challengeId,
          assessmentId: assessmentId,
        },
        'An event has been received on a answer that has already been answered',
      );

      return;
    }
  }

  return assessmentRepository.updateLastQuestionState({
    id: assessmentId,
    lastQuestionState,
  });
}
