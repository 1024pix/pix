import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

export async function updateLastQuestionState({
  assessmentId,
  lastQuestionState,
  challengeId,
  assessmentRepository,
  challengeToPlayRepository,
}) {
  if (lastQuestionState === Assessment.statesOfLastQuestion.FOCUSEDOUT && challengeId !== undefined) {
    const challenge = await challengeToPlayRepository.get(challengeId);
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

  await assessmentRepository.updateLastQuestionState({
    id: assessmentId,
    lastQuestionState,
  });
}
