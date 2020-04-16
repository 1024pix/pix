module.exports = function getUserDetailForAdmin({ userId, userRepository }) {
  return userRepository.getUserDetailForAdmin(userId);
};
