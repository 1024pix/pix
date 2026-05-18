const getOrganizationImport = async ({ organizationImportId, organizationImportRepository }) =>
  await organizationImportRepository.get(organizationImportId);

export { getOrganizationImport };
