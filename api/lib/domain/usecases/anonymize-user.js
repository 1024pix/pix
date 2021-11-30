module.exports = async function anonymizeUser({ userId, userRepository, authenticationMethodRepository }) {
  const anonymizedUser = {
    firstName: `prenom_${userId}`,
    lastName: `nom_${userId}`,
    email: `email_${userId}@example.net`,
    username: null,
  };

  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });
  return userRepository.updateUserDetailsForAdministration(userId, anonymizedUser);
};
