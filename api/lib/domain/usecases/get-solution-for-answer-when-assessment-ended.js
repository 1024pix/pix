const { NotCompletedAssessmentError } = require('../errors');

module.exports = function({
  assessmentRepository,
  answerRepository,
  solutionRepository,
  assessmentId,
  answerId
}) {

  return assessmentRepository.get(assessmentId)
    .then((assessment) => {
      if (!assessment.isCompleted())
        throw new NotCompletedAssessmentError();
    })
    .then(() => answerRepository.get(answerId))
    .then(answer => solutionRepository.getForChallengeId(answer.challengeId));
};
