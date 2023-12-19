import { usecases } from '../../domain/usecases/index.js';
import { TargetProfile } from './TargetProfile.js';

/**
 * @typedef TargetProfileApi
 * @type {object}
 * @function getByOrganizationId
 */

/**
 * @function
 * @name getByOrganizationId
 *
 * @param {number} organizationId
 * @returns {Promise<Array<TargetProfile>>}
 */
export const getByOrganizationId = async (organizationId) => {
  const targetProfiles = await usecases.getAvailableTargetProfilesForOrganization({ organizationId });

  return targetProfiles.map((targetProfileForSpecifier) => new TargetProfile(targetProfileForSpecifier));
};
