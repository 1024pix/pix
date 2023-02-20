export default function getOrganizationPlacesCapacity({ organizationId, organizationPlacesCapacityRepository }) {
  return organizationPlacesCapacityRepository.findByOrganizationId(organizationId);
}
