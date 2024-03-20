const getOrganizationImportStatus = async function ({ organizationId, organizationImportRepository }) {
  return organizationImportRepository.getLastByOrganizationId(organizationId);
};

export { getOrganizationImportStatus };
