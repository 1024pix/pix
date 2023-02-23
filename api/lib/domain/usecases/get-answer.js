const { NotFoundError } = require('../errors.js');

module.exports = async function getAnswer({ answerId, userId, answerRepository, assessmentRepository } = {}) {
  const integerAnswerId = parseInt(answerId);
  if (!Number.isFinite(integerAnswerId)) {
    throw new NotFoundError(`Not found answer for ID ${answerId}`);
  }
  const answer = await answerRepository.get(integerAnswerId);
  const ownedByUser = await assessmentRepository.ownedByUser({ id: answer.assessmentId, userId });
  if (!ownedByUser) {
    throw new NotFoundError(`Not found answer for ID ${integerAnswerId}`);
  }
  return answer;
};
