module.exports = function foo({ userId, userRepository }) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};
