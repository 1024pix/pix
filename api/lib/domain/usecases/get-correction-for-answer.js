const { AssessmentNotCompletedError, ForbiddenAccess } = require('../errors');

module.exports = async function getCorrectionForAnswer({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  answerId,
  userId
} = {}) {
  const answer = await answerRepository.get(answerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  _validateCorrectionIsAccessible(assessment, userId);

  return correctionRepository.getByChallengeId(answer.challengeId);
};

function _validateCorrectionIsAccessible(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to see correction of this assessment.');
  }
  if (!assessment.isCompleted() && !assessment.isSmartPlacement() && !assessment.isCompetenceEvaluation()) {
    throw new AssessmentNotCompletedError();
  }
}
