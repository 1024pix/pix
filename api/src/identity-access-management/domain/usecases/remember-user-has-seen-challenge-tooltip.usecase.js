import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
const rememberUserHasSeenChallengeTooltip = function ({
  userId,
  challengeType,
  userRepository = injectedUserRepository,
} = {}) {
  return userRepository.updateHasSeenChallengeTooltip({ userId, challengeType });
};

export { rememberUserHasSeenChallengeTooltip };
