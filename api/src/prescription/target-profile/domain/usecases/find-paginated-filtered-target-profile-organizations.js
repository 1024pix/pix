import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
const findPaginatedFilteredOrganizationByTargetProfileId = function ({
  targetProfileId,
  filter,
  page,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  return organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });
};

export { findPaginatedFilteredOrganizationByTargetProfileId };
