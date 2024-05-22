import { NotFoundError } from '../../../shared/domain/errors.js';
import { PassageDoesNotExistError, PassageTerminatedError } from '../errors.js';

async function verifyAndSaveAnswer({
  userResponse,
  elementId,
  passageId,
  passageRepository,
  elementRepository,
  elementAnswerRepository,
}) {
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
