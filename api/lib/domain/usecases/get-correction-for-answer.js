const { AssessmentNotCompletedError, NotFoundError } = require('../errors');

module.exports = async function getCorrectionForAnswer({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  answerId,
  userId,
} = {}) {
  const integerAnswerId = parseInt(answerId);
  if (!Number.isFinite(integerAnswerId)) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }
  const answer = await answerRepository.get(integerAnswerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  _validateCorrectionIsAccessible(assessment, userId, integerAnswerId);

  return correctionRepository.getByChallengeId({ challengeId: answer.challengeId, userId });

};

function _validateCorrectionIsAccessible(assessment, userId, answerId) {
  if (assessment.userId !== userId) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }
  if (!assessment.isCompleted() && !assessment.isSmartPlacement() && !assessment.isCompetenceEvaluation()) {
    throw new AssessmentNotCompletedError();
  }
}
