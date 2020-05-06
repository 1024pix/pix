module.exports = function acceptPixLastTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.acceptPixLastTermsOfService(userId);
};
