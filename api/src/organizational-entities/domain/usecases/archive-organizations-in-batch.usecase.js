import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import { ArchiveOrganizationsInBatchError } from '../errors.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

/**
 * @param {Object} params
 * @param {Array} params.organizationIds
 * @param {Number} params.userId
 * @param {Object} params.organizationForAdminRepository
 */
export const archiveOrganizationsInBatch = async function(
  {
    organizationIds,
    userId,
    organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository,
  } = {},
) {
  // we don't use a transaction here not to rollback lines 0 to N-1 in case of an error on line N

  for (const [index, organizationId] of organizationIds.entries()) {
    try {
      await organizationForAdminRepository.archive({
        id: organizationId,
        archivedBy: userId,
      });
    } catch {
      throw new ArchiveOrganizationsInBatchError({
        meta: {
          currentLine: index + 1,
          totalLines: organizationIds.length,
        },
      });
    }
  }
};
