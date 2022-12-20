module.exports = async function anonymizeUser({
  updatedByUserId,
  userId,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
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
  await certificationCenterMembershipRepository.disableMembershipsByUserId({
    updatedByUserId,
    userId,
  });
  await userRepository.updateUserDetailsForAdministration({
    id: userId,
    userAttributes: anonymizedUser,
  });
  return userRepository.getUserDetailsForAdmin(userId);
};
