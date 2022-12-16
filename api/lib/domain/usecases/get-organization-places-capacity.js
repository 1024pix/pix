module.exports = function getOrganizationPlacesCapacity({ organizationId, organizationPlacesCapacityRepository }) {
  return organizationPlacesCapacityRepository.findByOrganizationId(organizationId);
};
