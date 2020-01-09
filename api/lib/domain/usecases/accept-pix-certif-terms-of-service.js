module.exports = function acceptPixCertifTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
};
