module.exports = async function rememberUserHasSeenNewProfileInfo({
  userId,
  userRepository
}) {
  const user = await userRepository.get(userId);
  user.hasSeenNewProfileInfo = true;

  return userRepository.updateUser(user);
};
