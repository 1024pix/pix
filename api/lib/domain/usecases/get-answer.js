import { NotFoundError } from '../../../src/shared/domain/errors.js';

const getAnswer = async function ({ answerId, userId, answerRepository, assessmentRepository } = {}) {
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

export { getAnswer };
