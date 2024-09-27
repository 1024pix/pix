const rememberUserHasSeenLevelSevenInfo = function ({ userId, userRepository }) {
  return userRepository.updateMarkLevelSevenInfoAsSeen({ userId });
};

export { rememberUserHasSeenLevelSevenInfo };
