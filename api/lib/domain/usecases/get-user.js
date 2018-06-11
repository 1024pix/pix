const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function({ authenticatedUserId, requestedUserId, userRepository }) {
  if(authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }
  return userRepository.get(requestedUserId);
};
