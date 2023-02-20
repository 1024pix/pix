export default function getOrganizationDetails({ organizationId, organizationForAdminRepository }) {
  return organizationForAdminRepository.get(organizationId);
}
