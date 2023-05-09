const deleteOrganizationPlaceLot = async function ({ organizationPlaceId, userId, organizationPlacesLotRepository }) {
  await organizationPlacesLotRepository.get(organizationPlaceId);
  await organizationPlacesLotRepository.delete({ id: organizationPlaceId, deletedBy: userId });
};

export { deleteOrganizationPlaceLot };
