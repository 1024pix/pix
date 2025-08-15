import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const findPaginatedOrganizationLearners = async function ({
  organizationId,
  page,
  filter,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
} = {}) {
  return organizationLearnerRepository.findPaginatedLearners({ organizationId, page, filter });
};

export { findPaginatedOrganizationLearners };
