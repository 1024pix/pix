module.exports = async function getUserWithMemberships({ userId, userRepository }) {
  return userRepository.getWithMemberships(userId);
};
