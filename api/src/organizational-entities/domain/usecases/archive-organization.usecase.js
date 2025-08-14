import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';const archiveOrganization = async function(
  { organizationId, userId, organizationForAdminRepository = injectedRepositories.organizationForAdminRepository } = {},
) {
  await organizationForAdminRepository.archive({ id: organizationId, archivedBy: userId });
  return await organizationForAdminRepository.get({ organizationId });
};

export { archiveOrganization };
