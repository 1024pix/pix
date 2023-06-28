const rememberUserHasSeenLastDataProtectionPolicyInformation = function ({ userId, userRepository }) {
  return userRepository.updateLastDataProtectionPolicySeenAt({ userId });
};

export { rememberUserHasSeenLastDataProtectionPolicyInformation };
