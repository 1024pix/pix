import { ModuleDoesNotExistError } from '../errors.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

const createPassage = async function ({ moduleId, moduleRepository, passageRepository }) {
  await _verifyIfModuleExists({ moduleId, moduleRepository });

  return passageRepository.save({ moduleId });
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
