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
  userLoginRepository,
  domainTransaction,
  adminMemberRepository,
}) {
  const anonymizedUser = {
    firstName: '(anonymised)',
    lastName: '(anonymised)',
    email: null,
    emailConfirmedAt: null,
    username: null,
    hasBeenAnonymised: true,
    hasBeenAnonymisedBy: updatedByUserId,
    lastTermsOfServiceValidatedAt: null,
    lastPixOrgaTermsOfServiceValidatedAt: null,
    lastPixCertifTermsOfServiceValidatedAt: null,
    lastDataProtectionPolicySeenAt: null,
  };

  const user = await userRepository.get(userId);

  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId, domainTransaction });

  await refreshTokenService.revokeRefreshTokensForUserId({ userId });

  if (user.email) {
    await resetPasswordDemandRepository.removeAllByEmail(user.email);
  }

  await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId, domainTransaction });

  await certificationCenterMembershipRepository.disableMembershipsByUserId({
    updatedByUserId,
    userId,
    domainTransaction,
  });

  await organizationLearnerRepository.dissociateAllStudentsByUserId({ userId, domainTransaction });

  await _anonymizeUserLogin(user.id, userLoginRepository);

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

async function _anonymizeUserLogin(userId, userLoginRepository) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  if (!userLogin) return;

  const anonymizedUserLogin = userLogin.anonymize();

  await userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
}

export { anonymizeUser };
