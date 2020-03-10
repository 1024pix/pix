const {
  NotFoundError,
} = require('../errors');

module.exports = async function getAnswer(
  {
    answerId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {
  const integerAnswerId = parseInt(answerId);
  if (!Number.isFinite(integerAnswerId)) {
    throw new NotFoundError(`Not found answer for ID ${answerId}`);
  }
  const answer = await answerRepository.get(integerAnswerId);
  const assessment = await assessmentRepository.get(answer.assessmentId);
  if (assessment.userId !== userId) {
    throw new NotFoundError(`Not found answer for ID ${integerAnswerId}`);
  }
  return answer;
};
