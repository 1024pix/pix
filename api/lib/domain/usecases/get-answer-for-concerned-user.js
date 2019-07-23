const {
  ForbiddenAccess
} = require('../errors');

module.exports = async function getAnswerForConcernedUser(
  {
    answerId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {

  const answer = await answerRepository.get(answerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to get this answer.');
  }
  return answer;
};
