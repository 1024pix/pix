const _ = require('lodash');
const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');

module.exports = {
  execute(userId, organizationId) {
    return membershipRepository
      .findByUserIdAndOrganizationId({ userId, organizationId })
      .then((memberships) => !_.isEmpty(memberships));
  },
};
