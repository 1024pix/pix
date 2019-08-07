const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function rememberUserHasSeenNewProfileInfo({
  authenticatedUserId,
  requestedUserId,
  userRepository
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const user = await userRepository.get(requestedUserId);
  
  user.hasSeenNewProfileInfo = true;

  return userRepository.updateUser(user);
};
