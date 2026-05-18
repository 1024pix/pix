const getOrganizationImportStatus = async ({ organizationId, organizationImportRepository }) =>
  await organizationImportRepository.getLastImportDetailForOrganization(organizationId);

export { getOrganizationImportStatus };
