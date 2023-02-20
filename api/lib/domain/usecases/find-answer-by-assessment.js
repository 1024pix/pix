import { UserNotAuthorizedToAccessEntityError, EntityValidationError } from '../errors';

export default async function findAnswerByAssessment({
  assessmentId,
  userId,
  answerRepository,
  assessmentRepository,
} = {}) {
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
}
