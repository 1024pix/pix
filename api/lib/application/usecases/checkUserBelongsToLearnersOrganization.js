import _ from 'lodash';
import membershipRepository from '../../infrastructure/repositories/membership-repository';
import organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository';

export default {
  async execute(userId, organizationLearnerId) {
    const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);
    const memberships = await membershipRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId: organizationLearner.organizationId,
    });
    return !_.isEmpty(memberships);
  },
};
