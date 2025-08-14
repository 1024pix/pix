import * as injectedOrganizationRepository from '../../infrastructure/repositories/organization-repository.js';
export async function findOrganizations({
  organizationIds,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  return organizationRepository.findByIds(organizationIds);
}
