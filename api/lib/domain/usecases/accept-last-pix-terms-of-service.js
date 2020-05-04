module.exports = function acceptPixTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.updateLastPixTermsOfServiceAccepted(userId);
};
