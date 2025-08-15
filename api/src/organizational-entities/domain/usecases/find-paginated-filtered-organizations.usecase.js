import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const findPaginatedFilteredOrganizations = function ({
  filter,
  page,
  organizationForAdminRepository = injectedRepositories.organizationForAdminRepository,
} = {}) {
  return organizationForAdminRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredOrganizations };
