module.exports = function getUserDetail({ userId, userRepository }) {
  return userRepository.get(userId);
};
