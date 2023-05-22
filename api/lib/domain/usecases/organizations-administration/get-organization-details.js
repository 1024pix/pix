const getOrganizationDetails = function ({ organizationId, organizationForAdminRepository }) {
  return organizationForAdminRepository.get(organizationId);
};

export { getOrganizationDetails };
