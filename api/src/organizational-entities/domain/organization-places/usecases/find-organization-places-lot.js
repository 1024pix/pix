const findOrganizationPlacesLot = async function ({ organizationId, organizationPlacesLotRepository }) {
  return organizationPlacesLotRepository.findByOrganizationIdWithJoinedUsers(organizationId);
};

export { findOrganizationPlacesLot };
