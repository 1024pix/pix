const rememberUserHasSeenChallengeTooltip = function ({ userId, challengeType, userRepository }) {
  return userRepository.updateHasSeenChallengeTooltip({ userId, challengeType });
};

export { rememberUserHasSeenChallengeTooltip };
