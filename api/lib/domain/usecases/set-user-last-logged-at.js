const setUserLastLoggedAt = function ({ userRepository, userId }) {
  return userRepository.updateLastLoggedAt({ userId });
};

export { setUserLastLoggedAt };
