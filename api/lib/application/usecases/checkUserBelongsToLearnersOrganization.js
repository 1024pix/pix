const _ = require('lodash');
const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');
const organizationLearnerRepository = require('../../infrastructure/repositories/organization-learner-repository.js');

module.exports = {
  async execute(userId, organizationLearnerId, dependencies = { membershipRepository, organizationLearnerRepository }) {
    const organizationLearner = await dependencies.organizationLearnerRepository.get(organizationLearnerId);
    const memberships = await dependencies.membershipRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId: organizationLearner.organizationId,
    });
    return !_.isEmpty(memberships);
  },
};
