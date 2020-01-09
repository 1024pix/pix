module.exports = function acceptPixOrgaTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};
