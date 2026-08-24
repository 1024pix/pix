import { ArchiveOrganizationsInBatchError } from '../errors.js';

/**
 * @param {Object} params
 * @param {Array} params.organizationIds
 * @param {Number} params.userId
 * @param {Object} params.campaignsApi
 * @param {Object} params.learnersApi
 * @param {Object} params.organizationForAdminRepository
 */
export const archiveOrganizationsInBatch = async function ({
  organizationIds,
  userId,
  campaignsApi,
  learnersApi,
  organizationForAdminRepository,
}) {
  // we don't use a transaction here not to rollback lines 0 to N-1 in case of an error on line N

  for (const [index, organizationId] of organizationIds.entries()) {
    try {
      await organizationForAdminRepository.archive({
        id: organizationId,
        archivedBy: userId,
      });

      await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId });
      await campaignsApi.deleteActiveCampaigns({ userId, organizationId });
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
