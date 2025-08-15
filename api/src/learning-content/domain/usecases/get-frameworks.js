import * as injectedSharedFrameworkRepository from '../../../shared/infrastructure/repositories/framework-repository.js';

const getFrameworks = async function ({ sharedFrameworkRepository = injectedSharedFrameworkRepository } = {}) {
  return sharedFrameworkRepository.list();
};

export { getFrameworks };
