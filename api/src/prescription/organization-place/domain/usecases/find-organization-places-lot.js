const findOrganizationPlacesLot = async function ({ organizationId, organizationPlacesLotRepository }) {
  return organizationPlacesLotRepository.findByOrganizationId(organizationId);
};

export { findOrganizationPlacesLot };
