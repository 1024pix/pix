module.exports = function anonymizeUser({
  userId,
  userRepository,
}) {

  const anonymizedUser = {
    firstName: `prenom_${userId}`,
    lastName: `nom_${userId}`,
    email: `email_${userId}@example.net`,
    disabled: true,
  };

  return userRepository.updateUserDetailsForAdministration(userId, anonymizedUser);
};
