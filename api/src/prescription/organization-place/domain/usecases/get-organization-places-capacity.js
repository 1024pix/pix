import * as injectedOrganizationPlacesCapacityRepository from '../../infrastructure/repositories/organization-places-capacity-repository.js';
const getOrganizationPlacesCapacity = function ({
  organizationId,
  organizationPlacesCapacityRepository = injectedOrganizationPlacesCapacityRepository,
} = {}) {
  return organizationPlacesCapacityRepository.findByOrganizationId(organizationId);
};

export { getOrganizationPlacesCapacity };
