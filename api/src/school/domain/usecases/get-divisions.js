import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const getDivisions = async function ({ organizationId, schoolRepository = injectedRepositories.schoolRepository } = {}) {
  return schoolRepository.getDivisions({ organizationId });
};

export { getDivisions };
