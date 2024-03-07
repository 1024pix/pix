import { NotFoundError } from '../../../shared/domain/errors.js';
import { PassageDoesNotExistError, PassageTerminatedError } from '../errors.js';

async function terminatePassage({ passageId, passageRepository }) {
  const passage = await _getPassage({ passageId, passageRepository });
  if (passage.terminatedAt) {
    throw new PassageTerminatedError();
  }
  passage.terminate();
  return passageRepository.update({ passage });
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

export { terminatePassage };
