import _ from 'lodash';

import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const execute = async function (
  userId,
  organizationLearnerId,
  dependencies = { membershipRepository, organizationLearnerRepository },
) {
  const organizationLearner = await dependencies.organizationLearnerRepository.get(organizationLearnerId);
  const memberships = await dependencies.membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId: organizationLearner.organizationId,
  });
  return !_.isEmpty(memberships);
};

export { execute };
