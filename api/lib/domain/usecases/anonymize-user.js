module.exports = async function anonymizeUser({
  updatedByUserId,
  userId,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  refreshTokenService,
}) {
  const anonymizedUser = {
    firstName: `prenom_${userId}`,
    lastName: `nom_${userId}`,
    email: `email_${userId}@example.net`,
    username: null,
  };

  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });
  await refreshTokenService.revokeRefreshTokensForUserId({ userId });
  await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });
  return userRepository.updateUserDetailsForAdministration(userId, anonymizedUser);
};
