module.exports = function getOrganizationDetails({ organizationId, organizationForAdminRepository }) {
  return organizationForAdminRepository.get(organizationId);
};
