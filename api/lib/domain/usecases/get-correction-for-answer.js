const { AssessmentNotCompletedError, NotFoundError } = require('../errors.js');

module.exports = async function getCorrectionForAnswer({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  answerId,
  userId,
  locale,
} = {}) {
  const integerAnswerId = parseInt(answerId);

  const answer = await answerRepository.get(integerAnswerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  if (assessment.userId !== userId) {
    throw new NotFoundError(`Not found correction for answer of ID ${answerId}`);
  }

  _validateCorrectionIsAccessible(assessment);

  return correctionRepository.getByChallengeId({ challengeId: answer.challengeId, userId, locale });
};

function _validateCorrectionIsAccessible(assessment) {
  if (assessment.isForCampaign() || assessment.isCompetenceEvaluation()) {
    return;
  }

  if (!assessment.isCompleted()) {
    throw new AssessmentNotCompletedError();
  }
}
