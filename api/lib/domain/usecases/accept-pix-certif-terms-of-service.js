const acceptPixCertifTermsOfService = function ({ userId, userRepository }) {
  return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
};

export { acceptPixCertifTermsOfService };
