import * as injectedOrganizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
const getOrganizationLearnerActivity = async function ({
  organizationLearnerId,
  organizationLearnerActivityRepository = injectedOrganizationLearnerActivityRepository,
} = {}) {
  return organizationLearnerActivityRepository.get(organizationLearnerId);
};

export { getOrganizationLearnerActivity };
