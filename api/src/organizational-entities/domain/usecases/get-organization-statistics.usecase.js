/**
 * @typedef {import('./index.js').OrganizationForAdminRepository} OrganizationForAdminRepository
 */

import { OrganizationNotFound } from '../errors.js';

/**
 *
 * @param {Object} params
 * @param {Number} params.organizationId
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @returns {Promise<{totalParticipantsCount: Number; id: string}>}
 */
export async function getOrganizationStatistics({ organizationId, organizationForAdminRepository }) {
  const organization = await organizationForAdminRepository.exist({ organizationId });
  if (!organization) {
    throw new OrganizationNotFound({ meta: { organizationId } });
  }

  const statistics = await organizationForAdminRepository.getOrganizationParticipantsStatistics({ organizationId });
  return { ...statistics, id: `${organizationId}_organization_statistics` };
}
