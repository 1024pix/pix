/**
 * @typedef {import('../../infrastructure/repositories/target-profile-repository.js')} TargetProfileRepository
 */

import { logger } from '../../../../shared/infrastructure/utils/logger.js';

/**
 * @param {object} params
 * @param {number} params.targetProfileId
 * @param {number} params.organizationId
 * @param {TargetProfileRepository} params.targetProfileRepository
 * @returns {Promise<Boolean>}
 */
export async function checkTargetProfileBelongsToOrganization({
  targetProfileId,
  organizationId,
  targetProfileRepository,
}) {
  try {
    const organizationIds = await targetProfileRepository.findOrganizationIds(targetProfileId);
    return organizationIds.includes(organizationId);
  } catch (error) {
    logger.error(error, 'checkTargetProfileBelongsToOrganization');
  }
  return false;
}
