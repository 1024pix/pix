const getOrganizationImportStatus = async function ({ organizationId, organizationImportRepository }) {
  return organizationImportRepository.getLastImportDetailForOrganization(organizationId);
};

export { getOrganizationImportStatus };
