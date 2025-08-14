import * as injectedOrganizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot-repository.js';
const findOrganizationPlacesLot = async function ({
  organizationId,
  organizationPlacesLotRepository = injectedOrganizationPlacesLotRepository,
} = {}) {
  return organizationPlacesLotRepository.findByOrganizationIdWithJoinedUsers(organizationId);
};

export { findOrganizationPlacesLot };
