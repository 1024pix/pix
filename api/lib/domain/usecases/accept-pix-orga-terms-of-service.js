const acceptPixOrgaTermsOfService = function ({ userId, userRepository }) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};

export { acceptPixOrgaTermsOfService };
