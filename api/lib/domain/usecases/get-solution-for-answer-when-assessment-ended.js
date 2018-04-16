const { NotCompletedAssessmentError } = require('../errors');

module.exports = function({
  assessmentRepository,
  answerRepository,
  solutionRepository,
  assessmentId,
  answerId
}) {
  return assessmentRepository.get(assessmentId)
    .then(_validateAssessmentIsCompleted)
    .then(() => answerRepository.get(answerId))
    .then(answer => solutionRepository.getByChallengeId(answer.challengeId));
};

function _validateAssessmentIsCompleted(assessment) {
  if (!assessment.isCompleted())
    throw new NotCompletedAssessmentError();
}
