const getOrganizationImportStatus = async function ({ organizationId, organizationImportRepository }) {
  return organizationImportRepository.getByOrganizationId(organizationId);
};

export { getOrganizationImportStatus };
