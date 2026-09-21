const deleteOrganizationPlacesLot = async function ({ organizationPlaceId, userId, organizationPlacesLotRepository }) {
  await organizationPlacesLotRepository.get(organizationPlaceId);
  await organizationPlacesLotRepository.remove({ id: organizationPlaceId, deletedBy: userId });
};

export { deleteOrganizationPlacesLot };
