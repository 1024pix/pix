import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
const getOrganizationImportStatus = async function ({
  organizationId,
  organizationImportRepository = injectedOrganizationImportRepository,
} = {}) {
  return organizationImportRepository.getLastImportDetailForOrganization(organizationId);
};

export { getOrganizationImportStatus };
