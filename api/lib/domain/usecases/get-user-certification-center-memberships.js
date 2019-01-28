const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, userRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return userRepository.getWithCertificationCenterMemberships(requestedUserId)
    .then((user) => user.certificationCenterMemberships);

};
