module.exports = function disableUser({
  userId,
  userRepository,
}) {

  const disabledUser = {
    firstName: `prenom_${userId}`,
    lastName: `nom_${userId}`,
    email: `email_${userId}@example.net`,
    disabled: true,
  };

  return userRepository.updateUserDetailsForAdministration(userId, disabledUser);
};
