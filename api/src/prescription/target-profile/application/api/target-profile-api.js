import { usecases } from '../../domain/usecases/index.js';
import { TargetProfile } from './TargetProfile.js';

/**
 * @module TargetProfileApi
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

/**
 * @function
 * @name getById
 *
 * @param {number} id
 * @returns {Promise<TargetProfile>}
 */
export const getById = async (id) => {
  const targetProfileForAdmin = await usecases.getTargetProfileForAdmin({ targetProfileId: id });

  return new TargetProfile(targetProfileForAdmin);
};
