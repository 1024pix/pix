/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('./index.js').VersionsRepository} VersionsRepository
 */

/**
 * @param {object} params
 * @param {Scope} params.scope
 * @param {VersionsRepository} params.versionsRepository
 */
export const getFrameworkAndTargetProfilesHistory = async ({ scope, versionsRepository }) => {
  return versionsRepository.getFullFrameworkHistory({ scope });
};
