import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';

const findAnswerByChallengeAndAssessment = async function ({
  challengeId,
  assessmentId,
  userId,
  answerRepository = injectedAnswerRepository,
  assessmentRepository = injectedAssessmentRepository,
} = {}) {
  const integerAssessmentId = parseInt(assessmentId);
  if (!Number.isFinite(integerAssessmentId)) {
    return null;
  }

  const ownedByUser = await assessmentRepository.ownedByUser({ id: assessmentId, userId });
  if (!ownedByUser) {
    return null;
  }

  return answerRepository.findByChallengeAndAssessment({ challengeId, assessmentId: integerAssessmentId });
};

export { findAnswerByChallengeAndAssessment };
