const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, userRepository }) => {

  const authenticatedUser = await userRepository.getWithMemberships(authenticatedUserId);

  if (!authenticatedUser.hasRolePixMaster && authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  return userRepository.getWithMemberships(requestedUserId);

};
