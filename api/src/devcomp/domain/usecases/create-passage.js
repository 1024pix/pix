import { ModuleDoesNotExistError } from '../errors.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { PassageCreated } from '../models/event/PassageCreated.js';

const createPassage = async ({ moduleId, moduleRepository, passageRepository }) => {
  await _verifyIfModuleExists({ moduleId, moduleRepository });

  const passageFromRepository = await passageRepository.save({ moduleId });

  return new PassageCreated(passageFromRepository);
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
