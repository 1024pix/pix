const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, userRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  } else {
    return userRepository.getWithOrganizationAccesses(requestedUserId)
      .then((user) => {
        return user.organizationAccesses;
      });
  }

};
