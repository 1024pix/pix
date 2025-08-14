import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js'; /**
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 */

/**
 * @param{number} organizationId
 * @param{OrganizationLearnerRepository} organizationLearnerRepository
 * @returns {Promise<number[]>}
 */
const findOrganizationLearnersBeforeImportFeature = async function ({
  organizationId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
} = {}) {
  return organizationLearnerRepository.findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({
    organizationId,
  });
};

export { findOrganizationLearnersBeforeImportFeature };
