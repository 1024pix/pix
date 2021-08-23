module.exports = function getUserWithMemberships({ userId, userRepository }) {
  return userRepository.getWithMemberships(userId);
};
