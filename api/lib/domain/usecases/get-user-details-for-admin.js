module.exports = function getUserDetailsForAdmin({ userId, userRepository }) {
  return userRepository.getUserDetailsForAdmin(userId);
};
