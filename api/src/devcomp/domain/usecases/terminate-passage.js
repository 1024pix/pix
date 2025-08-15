import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import * as injectedPassageRepository from '../../infrastructure/repositories/passage-repository.js';
import { PassageDoesNotExistError, PassageTerminatedError } from '../errors.js';

const terminatePassage = withTransaction(async function ({
  passageId,
  passageRepository = injectedPassageRepository,
} = {}) {
  const passage = await _getPassage({ passageId, passageRepository });
  if (passage.terminatedAt) {
    throw new PassageTerminatedError();
  }
  passage.terminate();
  const terminatedPassage = await passageRepository.update({ passage });
  return terminatedPassage;
});

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
