import DomainTransaction from '../../infrastructure/DomainTransaction';

export default async function anonymizeUser({
  updatedByUserId,
  userId,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
  organizationLearnerRepository,
  refreshTokenService,
}) {
  const anonymizedUser = {
    firstName: `prenom_${userId}`,
    lastName: `nom_${userId}`,
    email: `email_${userId}@example.net`,
    username: null,
    hasBeenAnonymised: true,
    hasBeenAnonymisedBy: updatedByUserId,
    updatedAt: new Date(),
  };

  await DomainTransaction.execute(async (domainTransaction) => {
    await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId, domainTransaction });
    await refreshTokenService.revokeRefreshTokensForUserId({ userId });
    await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId, domainTransaction });
    await certificationCenterMembershipRepository.disableMembershipsByUserId({
      updatedByUserId,
      userId,
      domainTransaction,
    });
    await organizationLearnerRepository.dissociateAllStudentsByUserId({ userId, domainTransaction });
    await userRepository.updateUserDetailsForAdministration({
      id: userId,
      userAttributes: anonymizedUser,
      domainTransaction,
    });
  });
  return userRepository.getUserDetailsForAdmin(userId);
}
