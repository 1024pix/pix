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
  resetPasswordDemandRepository,
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

  const user = await userRepository.get(userId);

  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });

  await refreshTokenService.revokeRefreshTokensForUserId({ userId });

  if (user.email) {
    await resetPasswordDemandRepository.removeAllByEmail(user.email);
  }

  await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

  await certificationCenterMembershipRepository.disableMembershipsByUserId({
    updatedByUserId,
    userId,
  });

  await organizationLearnerRepository.dissociateAllStudentsByUserId({ userId });

  await userRepository.updateUserDetailsForAdministration({
    id: userId,
    userAttributes: anonymizedUser,
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
