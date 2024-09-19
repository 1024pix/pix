import { UserAnonymizedEventLoggingJob } from '../../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { config } from '../../../src/shared/config.js';
import { UserNotFoundError } from '../../../src/shared/domain/errors.js';

const anonymizeUser = async function ({
  userId,
  updatedByUserId,
  preventAuditLogging = false,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
  organizationLearnerRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
  adminMemberRepository,
  userAnonymizedEventLoggingJobRepository,
}) {
  const user = await userRepository.get(userId);

  const anonymizedBy = await _getAdminUser({
    adminUserId: updatedByUserId || user.hasBeenAnonymisedBy,
    adminMemberRepository,
  });

  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });

  await refreshTokenRepository.revokeAllByUserId({ userId });

  if (user.email) {
    await resetPasswordDemandRepository.removeAllByEmail(user.email);
  }

  await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId: anonymizedBy?.userId });

  await certificationCenterMembershipRepository.disableMembershipsByUserId({
    updatedByUserId: anonymizedBy?.userId,
    userId,
  });

  await organizationLearnerRepository.dissociateAllStudentsByUserId({ userId });

  await _anonymizeUserLogin({ userId, userLoginRepository });

  await _anonymizeUser({ user, anonymizedByUserId: anonymizedBy?.userId, userRepository });

  if (anonymizedBy && !preventAuditLogging && config.auditLogger.isEnabled) {
    await userAnonymizedEventLoggingJobRepository.performAsync(
      new UserAnonymizedEventLoggingJob({
        userId,
        updatedByUserId: anonymizedBy.userId,
        role: anonymizedBy.role,
      }),
    );
  }
  return null;
};

async function _getAdminUser({ adminUserId, adminMemberRepository }) {
  if (!adminUserId) return undefined;

  const admin = await adminMemberRepository.get({ userId: adminUserId });
  if (!admin) {
    throw new UserNotFoundError(`Admin not found for id: ${adminUserId}`);
  }
  return admin;
}

async function _anonymizeUserLogin({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  if (!userLogin) return;

  const anonymizedUserLogin = userLogin.anonymize();

  await userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
}

async function _anonymizeUser({ user, anonymizedByUserId, userRepository }) {
  const anonymizedUser = user.anonymize(anonymizedByUserId).mapToDatabaseDto();

  await userRepository.updateUserDetailsForAdministration(
    { id: user.id, userAttributes: anonymizedUser },
    { preventUpdatedAt: true },
  );
}

export { anonymizeUser };
