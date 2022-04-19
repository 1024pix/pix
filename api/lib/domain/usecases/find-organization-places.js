module.exports = async function findOrganizationPlaces({ organizationId, organizationPlaceRepository }) {
  return organizationPlaceRepository.find(organizationId);
};
