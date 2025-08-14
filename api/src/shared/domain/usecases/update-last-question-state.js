import * as injectedAssessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as injectedChallengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import { logger } from '../../infrastructure/utils/logger.js';
import { Assessment } from '../models/Assessment.js';

const updateLastQuestionState = async function ({
  assessmentId,
  lastQuestionState,
  challengeId,
  assessmentRepository = injectedAssessmentRepository,
  challengeRepository = injectedChallengeRepository,
} = {}) {
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
