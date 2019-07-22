const {
  ForbiddenAccess
} = require('../errors');

module.exports = async function findAnswerByChallengeAndAssessment(
  {
    challengeId,
    assessmentId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId != userId) {
    throw new ForbiddenAccess('User is not allowed to access this area');
  }

  const answer = await answerRepository.findByChallengeAndAssessment({ challengeId, assessmentId });

  return answer;
};
