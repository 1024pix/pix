import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const findPaginatedFilteredOrganizations = function(
  {
    filter,
    page,
    organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository,
  } = {},
) {
  return organizationForAdminRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredOrganizations };
