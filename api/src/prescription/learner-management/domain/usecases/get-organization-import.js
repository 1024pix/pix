import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
const getOrganizationImport = async function ({
  organizationImportId,
  organizationImportRepository = injectedOrganizationImportRepository,
} = {}) {
  return organizationImportRepository.get(organizationImportId);
};

export { getOrganizationImport };
