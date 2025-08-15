import { NotFoundError } from '../../../shared/domain/errors.js';
import * as injectedElementAnswerRepository from '../../infrastructure/repositories/element-answer-repository.js';
import * as injectedElementRepository from '../../infrastructure/repositories/element-repository.js';
import * as injectedPassageRepository from '../../infrastructure/repositories/passage-repository.js';
import { PassageDoesNotExistError, PassageTerminatedError } from '../errors.js';

async function verifyAndSaveAnswer({
  userResponse,
  elementId,
  passageId,
  passageRepository = injectedPassageRepository,
  elementRepository = injectedElementRepository,
  elementAnswerRepository = injectedElementAnswerRepository,
} = {}) {
  const passage = await _getPassage({ passageId, passageRepository });
  if (passage.terminatedAt) {
    throw new PassageTerminatedError();
  }

  const element = await elementRepository.getByIdForAnswerVerification({ moduleId: passage.moduleId, elementId });

  element.setUserResponse(userResponse);

  const correction = element.assess();

  return await elementAnswerRepository.save({
    passageId,
    elementId,
    value: element.userResponse,
    correction,
  });
}

async function _getPassage({ passageId, passageRepository }) {
  try {
    return await passageRepository.get({ passageId });
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw new PassageDoesNotExistError();
    }
  }
}

export { verifyAndSaveAnswer };
