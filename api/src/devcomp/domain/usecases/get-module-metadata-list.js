import * as injectedModuleRepository from '../../infrastructure/repositories/module-repository.js';
import { ModuleMetadata } from '../models/module/ModuleMetadata.js';

async function getModuleMetadataList({ ids, moduleRepository = injectedModuleRepository } = {}) {
  const modules = await moduleRepository.getAllByIds({ ids });

  return modules.map(
    ({ id, slug, title, isBeta, details }) =>
      new ModuleMetadata({ id, slug, title, isBeta, duration: details.duration }),
  );
}

export { getModuleMetadataList };
