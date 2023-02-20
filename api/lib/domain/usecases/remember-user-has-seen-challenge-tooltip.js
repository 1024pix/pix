export default function rememberUserHasSeenChallengeTooltip({ userId, challengeType, userRepository }) {
  return userRepository.updateHasSeenChallengeTooltip({ userId, challengeType });
}
