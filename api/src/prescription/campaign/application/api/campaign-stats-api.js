import { usecases } from '../../domain/usecases/index.js';
import { OrganizationStatistics } from './models/OrganizationStatistics.js';

/**
 * @module CampaignStatsApi
 */

/**
 * @function
 * @name getOrganizationParticipantsStatistics
 *
 * @param {number} organizationId
 * @returns {Promise<OrganizationStatistics>}
 */
export const getOrganizationParticipantsStatistics = async (organizationId) => {
  const statistics = await usecases.getOrganizationParticipantsStatistics({ organizationId });
  return new OrganizationStatistics(statistics);
};
