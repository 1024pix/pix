const acceptPixLastTermsOfService = function ({ userId, userRepository }) {
  return userRepository.acceptPixLastTermsOfService(userId);
};

export { acceptPixLastTermsOfService };
