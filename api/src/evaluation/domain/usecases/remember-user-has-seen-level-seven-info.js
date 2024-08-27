const rememberUserHasSeenLevelSevenInfo = function ({ userId, userRepository }) {
  return userRepository.update({ userId });
};

export { rememberUserHasSeenLevelSevenInfo };
