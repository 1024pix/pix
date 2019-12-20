module.exports = function getCurrentUser({ authenticatedUserId, userRepository }) {
  return userRepository.get(authenticatedUserId);
};
