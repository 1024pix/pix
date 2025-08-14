import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
export function getOrganizationById({ id, organizationRepository = injectedOrganizationRepository } = {}) {
  return organizationRepository.get(id);
}
