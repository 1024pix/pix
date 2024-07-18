import { UserAnonymized } from '../events/UserAnonymized.js';

const anonymizeUser = async function ({
  updatedByUserId,
  userId,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
  organizationLearnerRepository,
  refreshTokenService,
  domainTransaction,
  adminMemberRepository,
}) {
  const anonymizedUser = {
    firstName: '(anonymised)',
    lastName: '(anonymised)',
    email: null,
    username: null,
    hasBeenAnonymised: true,
    hasBeenAnonymisedBy: updatedByUserId,
    updatedAt: new Date(),
  };

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
  const adminMember = await adminMemberRepository.get({ userId: updatedByUserId });

  const event = new UserAnonymized({
    userId,
    updatedByUserId,
    role: adminMember.role,
  });

  return event;
};

export { anonymizeUser };
