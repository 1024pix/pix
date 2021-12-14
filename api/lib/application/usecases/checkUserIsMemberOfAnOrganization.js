const _ = require('lodash');
const membershipRepository = require('../../infrastructure/repositories/membership-repository');

module.exports = {
  execute(userId) {
    return membershipRepository.findByUserId({ userId }).then((memberships) => !_.isEmpty(memberships));
  },
};
