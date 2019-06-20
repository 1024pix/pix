module.exports = async function updateUserHasSeenMigration({
  userId,
  userRepository
}) {
  const user = await userRepository.get(userId);

  user.hasSeenMigration = true;

  return userRepository.updateUser(user);
};
