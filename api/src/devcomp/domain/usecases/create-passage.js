import { NotFoundError } from '../../../shared/domain/errors.js';
import { ModuleDoesNotExistError } from '../errors.js';

const createPassage = async function ({ moduleId, userId, moduleRepository, passageRepository, userRepository }) {
  await _verifyIfModuleExists({ moduleId, moduleRepository });
  if (userId !== null) {
    await userRepository.get(userId);
  }
  return passageRepository.save({ moduleId, userId });
};

async function _verifyIfModuleExists({ moduleId, moduleRepository }) {
  try {
    await moduleRepository.getBySlug({ slug: moduleId });
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw new ModuleDoesNotExistError();
    }
    throw e;
  }
}

export { createPassage };
