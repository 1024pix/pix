module.exports = function getOrganizationDetails({ organizationId, organizationRepository }) {
  return organizationRepository.get(organizationId);
};
