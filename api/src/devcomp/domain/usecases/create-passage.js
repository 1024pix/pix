import * as injectedUserRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import * as injectedModuleRepository from '../../infrastructure/repositories/module-repository.js';
import * as injectedPassageRepository from '../../infrastructure/repositories/passage-repository.js';
import { ModuleDoesNotExistError } from '../errors.js';

const createPassage = withTransaction(async function ({
  moduleId,
  userId,
  moduleRepository = injectedModuleRepository,
  passageRepository = injectedPassageRepository,
  userRepository = injectedUserRepository,
} = {}) {
  const module = await _getModule({ id: moduleId, moduleRepository });
  if (userId !== null) {
    await userRepository.get(userId);
  }

  return await passageRepository.save({ moduleId: module.id, userId });
});

async function _getModule({ id, moduleRepository }) {
  try {
    return await moduleRepository.getById({ id });
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw new ModuleDoesNotExistError();
    }
    throw e;
  }
}

export { createPassage };
