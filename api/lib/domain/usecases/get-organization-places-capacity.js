const getOrganizationPlacesCapacity = function ({ organizationId, organizationPlacesCapacityRepository }) {
  return organizationPlacesCapacityRepository.findByOrganizationId(organizationId);
};

export { getOrganizationPlacesCapacity };
