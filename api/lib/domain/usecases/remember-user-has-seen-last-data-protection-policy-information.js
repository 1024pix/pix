module.exports = function rememberUserHasSeenLastDataProtectionPolicyInformation({ userId, userRepository }) {
  return userRepository.updateLastDataProtectionPolicySeenAt({ userId });
};
