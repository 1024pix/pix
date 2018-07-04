const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, userRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  } else {
    return userRepository.getWithOrganizationsAccesses(requestedUserId)
      .then((user) => {
        return user.organizationsAccesses;
      });
  }

};
