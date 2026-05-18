/**
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 */

/**
 * @param{number} organizationId
 * @param{OrganizationLearnerRepository} organizationLearnerRepository
 * @returns {Promise<number[]>}
 */
const findOrganizationLearnersBeforeImportFeature = async ({ organizationId, organizationLearnerRepository }) =>
  await organizationLearnerRepository.findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({
    organizationId,
  });

export { findOrganizationLearnersBeforeImportFeature };
