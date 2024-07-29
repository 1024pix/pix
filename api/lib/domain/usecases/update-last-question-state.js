import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

const updateLastQuestionState = async function ({
  assessmentId,
  lastQuestionState,
  challengeId,
  assessmentRepository,
  challengeRepository,
}) {
  if (lastQuestionState === Assessment.statesOfLastQuestion.FOCUSEDOUT && challengeId !== undefined) {
    const challenge = await challengeRepository.get(challengeId);
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
};

export { updateLastQuestionState };
