module.exports = async function findOrganizationPlacesLot({ organizationId, organizationPlacesLotRepository }) {
  return organizationPlacesLotRepository.findByOrganizationId(organizationId);
};
