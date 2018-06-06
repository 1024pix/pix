module.exports = function({ userId, userRepository }) {
  return userRepository.get(userId);
};
