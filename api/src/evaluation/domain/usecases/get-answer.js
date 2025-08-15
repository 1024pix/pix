import { NotFoundError } from '../../../shared/domain/errors.js';

import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';

const getAnswer = async function ({ answerId, userId, answerRepository = injectedAnswerRepository, assessmentRepository = injectedAssessmentRepository } = {}) {
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
