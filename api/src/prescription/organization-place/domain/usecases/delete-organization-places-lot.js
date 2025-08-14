import * as injectedOrganizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot-repository.js';
const deleteOrganizationPlacesLot = async function ({
  organizationPlaceId,
  userId,
  organizationPlacesLotRepository = injectedOrganizationPlacesLotRepository,
} = {}) {
  await organizationPlacesLotRepository.get(organizationPlaceId);
  await organizationPlacesLotRepository.remove({ id: organizationPlaceId, deletedBy: userId });
};

export { deleteOrganizationPlacesLot };
