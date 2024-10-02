export const getUserDetailsByUserIds = function ({ userIds, userRepository }) {
  return userRepository.getByIds(userIds);
};
