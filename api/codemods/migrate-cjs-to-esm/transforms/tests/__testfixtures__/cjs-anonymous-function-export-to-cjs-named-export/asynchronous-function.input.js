module.exports = async function foo({ userId, userRepository }) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};
