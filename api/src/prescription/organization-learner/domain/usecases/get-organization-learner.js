import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';const getOrganizationLearner = async function(
  { organizationLearnerId, organizationLearnerRepository = injectedRepositories.organizationLearnerRepository } = {},
) {
  return organizationLearnerRepository.get({ organizationLearnerId });
};

export { getOrganizationLearner };
