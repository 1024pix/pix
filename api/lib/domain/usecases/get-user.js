const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getUser({ authenticatedUserId, requestedUserId, userRepository }) {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return userRepository.get(requestedUserId);

};
