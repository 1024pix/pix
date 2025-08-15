import { EntityValidationError, UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';

import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';

const findAnswerByAssessment = async function ({ assessmentId, userId, answerRepository = injectedAnswerRepository, assessmentRepository = injectedAssessmentRepository } = {}) {
  const integerAssessmentId = parseInt(assessmentId);
  if (!Number.isFinite(integerAssessmentId)) {
    throw new EntityValidationError({
      invalidAttributes: [{ attribute: 'assessmentId', message: 'This assessment ID is not valid.' }],
    });
  }

  const ownedByUser = await assessmentRepository.ownedByUser({ id: assessmentId, userId });
  if (!ownedByUser) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this assessment.');
  }
  return answerRepository.findByAssessment(integerAssessmentId);
};

export { findAnswerByAssessment };
