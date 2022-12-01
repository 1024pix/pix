const _ = require('lodash');
const membershipRepository = require('../../infrastructure/repositories/membership-repository');
const organizationLearnerRepository = require('../../infrastructure/repositories/organization-learner-repository');

module.exports = {
  execute(userId, organizationLearnerId) {
    return organizationLearnerRepository
      .get(organizationLearnerId)
      .then((organizationLearner) =>
        membershipRepository
          .findByUserIdAndOrganizationId({ userId, organizationId: organizationLearner.organizationId })
          .then((memberships) => !_.isEmpty(memberships))
      );
  },
};
