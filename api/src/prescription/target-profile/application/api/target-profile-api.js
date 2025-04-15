import { usecases } from '../../domain/usecases/index.js';
import { TargetProfile } from './TargetProfile.js';
import { TargetProfileSkill } from './TargetProfileSkill.js';

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
 * @name getByIdForAdmin
 *
 * @param {number} id
 * @returns {Promise<TargetProfile>}
 */
export const getByIdForAdmin = async (id) => {
  const targetProfileForAdmin = await usecases.getTargetProfileForAdmin({ targetProfileId: id });

  return new TargetProfile(targetProfileForAdmin);
};

/**
 * @function
 * @name getById
 *
 * @param {number} id
 * @returns {Promise<TargetProfile>}
 */
export const getById = async (id) => {
  const targetProfile = await usecases.getTargetProfile({ targetProfileId: id });

  return new TargetProfile(targetProfile);
};

/**
 * @function
 * @name findSkillByTargetProfileIds
 *
 * @param {Array<number>} targetProfilsIds
 * @returns {Promise<<Array<TargetProfileSkill>>}
 */
export const findSkillsByTargetProfileIds = async (targetProfileIds) => {
  const skillsData = await usecases.findSkillsByTargetProfileIds({ targetProfileIds });

  return skillsData.map((skill) => new TargetProfileSkill(skill));
};
