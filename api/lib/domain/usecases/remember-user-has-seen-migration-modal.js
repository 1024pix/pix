module.exports = async function rememberUserHasSeenMigrationModal({
  userId,
  userRepository
}) {
  const user = await userRepository.get(userId);

  user.hasSeenMigrationModal = true;

  return userRepository.updateUser(user);
};
