import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js'; /**
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 */

/**
 * @param{number} userId
 * @param{OrganizationLearnerRepository} organizationLearnerRepository
 * @returns {Promise<boolean>}
 */
const hasBeenLearner = async function ({
  userId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
} = {}) {
  const countOrganizationLearner = await organizationLearnerRepository.countByUserId(userId);

  return countOrganizationLearner > 0;
};

export { hasBeenLearner };
