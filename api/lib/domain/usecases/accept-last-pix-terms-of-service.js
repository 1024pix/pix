module.exports = function acceptLastPixTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.updateLastPixTermsOfServiceAccepted(userId);
};
