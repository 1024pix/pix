const { UserNotAuthorizedToAccessEntity, EntityValidationError } = require('../errors');

module.exports = async function findAnswerByAssessment(
  {
    assessmentId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {
  const integerAssessmentId = parseInt(assessmentId);
  if (!Number.isFinite(integerAssessmentId)) {
    throw new EntityValidationError('This assessment ID is not valid.');
  }

  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId !== userId && assessment.userId) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this assessment.');
  }
  return answerRepository.findByAssessment(integerAssessmentId);
};
