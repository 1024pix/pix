import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
const updateOrganizationLearnerName = async ({
  organizationLearnerId,
  firstName,
  lastName,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
} = {}) => {
  const organizationLearner = await organizationLearnerRepository.getLearnerInfo(organizationLearnerId);
  organizationLearner.updateName(firstName, lastName);
  return await organizationLearnerRepository.update(organizationLearner);
};

export { updateOrganizationLearnerName };
