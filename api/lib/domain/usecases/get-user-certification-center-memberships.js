const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, certificationCenterMembershipRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return certificationCenterMembershipRepository.findByUserId(requestedUserId);

};
