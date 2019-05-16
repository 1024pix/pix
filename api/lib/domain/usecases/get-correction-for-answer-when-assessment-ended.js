const { AssessmentNotCompletedError } = require('../errors');

module.exports = async function getCorrectionForAnswerWhenAssessmentEnded({
  assessmentRepository,
  answerRepository,
  correctionRepository,
  answerId
} = {}) {
  const answer = await answerRepository.get(answerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);

  _validateCorrectionIsAccessible(assessment);

  return correctionRepository.getByChallengeId(answer.challengeId);
};

function _validateCorrectionIsAccessible(assessment) {
  if (!assessment.isCompleted() && !assessment.isSmartPlacement() && !assessment.isCompetenceEvaluation()) {
    throw new AssessmentNotCompletedError();
  }
}
