import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const execute = async function (
  organizationId,
  organizationLearnerId,
  dependencies = { organizationLearnerRepository },
) {
  const organizationLearner = await dependencies.organizationLearnerRepository.getLearnerInfo(organizationLearnerId);
  return organizationLearner.organizationId === Number(organizationId);
};

export { execute };
