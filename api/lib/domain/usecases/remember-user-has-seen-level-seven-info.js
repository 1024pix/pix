const rememberUserHasSeenLevelSevenInfo = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenLevelSevenInfoToTrue(userId);
};

export { rememberUserHasSeenLevelSevenInfo };
