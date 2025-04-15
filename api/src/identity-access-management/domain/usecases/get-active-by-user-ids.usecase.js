export const getActiveByUserIds = async function ({ userIds, userRepository }) {
  const users = await userRepository.getByIds(userIds);

  return users.filter((user) => !user.isActive);
};
