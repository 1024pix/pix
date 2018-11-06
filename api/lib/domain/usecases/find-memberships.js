const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function findMemberships({ authenticatedUserId, requestedUserId, membershipRepository }) {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }
  return membershipRepository.findByUserId(requestedUserId);
};
