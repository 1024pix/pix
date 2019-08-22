module.exports = async ({ userId, userRepository }) => {
  return userRepository.getWithMemberships(userId);
};
