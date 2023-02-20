export default function rememberUserHasSeenLastDataProtectionPolicyInformation({ userId, userRepository }) {
  return userRepository.updateLastDataProtectionPolicySeenAt({ userId });
}
