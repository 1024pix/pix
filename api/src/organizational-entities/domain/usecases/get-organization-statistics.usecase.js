/**
 * @typedef {import('./index.js').OrganizationForAdminRepository} OrganizationForAdminRepository
 */

import { OrganizationNotFound } from '../errors.js';

/**
 *
 * @param {Object} params
 * @param {Number} params.organizationId
 * @param {Object} params.campaignStatsApi
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @returns {Promise<{totalParticipantsCount: Number; id: string}>}
 */
export async function getOrganizationStatistics({ organizationId, campaignStatsApi, organizationForAdminRepository }) {
  const organization = await organizationForAdminRepository.exist({ organizationId });
  if (!organization) {
    throw new OrganizationNotFound({ meta: { organizationId } });
  }

  const statistics = await campaignStatsApi.getOrganizationParticipantsStatistics(organizationId);
  return { ...statistics, id: `${statistics.organizationId}_organization_statistics` };
}
