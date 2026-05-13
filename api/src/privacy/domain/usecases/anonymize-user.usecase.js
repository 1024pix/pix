import { revokedUserAccessRepository } from '../../../identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.anonymizedByUserId
 * @param{string} params.anonymizedByUserRole
 * @param{string} params.client
 * @param{UserRepository} params.userRepository
 * @param{AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param{MembershipRepository} params.membershipRepository
 * @param{CertificationCenterMembershipRepository} params.certificationCenterMembershipRepository
 * @param{LastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository
 * @param{OrganizationLearnerRepository} params.organizationLearnerRepository
 * @param{RefreshTokenRepository} params.refreshTokenRepository
 * @param{ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param{UserLoginRepository} params.userLoginRepository
 * @param{AuditLoggingJobRepository} params.auditLoggingJobRepository
 * @returns {Promise<void>}
 */
const anonymizeUser = async function ({
  userId,
  anonymizedByUserId,
  anonymizedByUserRole,
  client,
  userRepository,
  authenticationMethodRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
  lastUserApplicationConnectionsRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
  auditLoggingJobRepository,
  userAcceptanceRepository,
  learnersApiRepository,
}) {
  await DomainTransaction.execute(async () => {
    const user = await userRepository.get(userId);

    await userRepository.get(anonymizedByUserId);

    await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });

    // await refreshTokenRepository.revokeAllByUserId({ userId });
    await revokedUserAccessRepository.revokeAll(userId)

    if (user.email) {
      await resetPasswordDemandRepository.removeAllByEmail(user.email);
    }

    await _anonymizeOrganizationLearner({
      userId,
      learnersApiRepository,
    });

    await _anonymizeMemberships({ membershipRepository, userId, updatedByUserId: anonymizedByUserId });

    await _anonymizeLastUserApplicationConnections(lastUserApplicationConnectionsRepository, userId);

    await _anonymizeCertificationCenterMemberships(certificationCenterMembershipRepository, userId, anonymizedByUserId);

    await _anonymizeLastUserApplicationConnections(lastUserApplicationConnectionsRepository, userId);

    await userAcceptanceRepository.removeAllByUserId(userId);

    await _anonymizeUserLogin({ userId, userLoginRepository });

    await _anonymizeUser({ user, anonymizedByUserId, userRepository });
  });

  await auditLoggingJobRepository.performAsync(
    AuditLoggingJob.forUser({
      client,
      action: 'ANONYMIZATION',
      userId,
      updatedByUserId: anonymizedByUserId,
      role: anonymizedByUserRole,
    }),
  );
};

async function _anonymizeMemberships({ userId, anonymizedByUserId, membershipRepository }) {
  // Anonymize last accessed at
  const userMemberships = await membershipRepository.findByUserId(userId);

  for (const membership of userMemberships) {
    const anonymizedMembershipLastAccessedAt = anonymizeGeneralizeDate(membership.lastAccessedAt);
    await membershipRepository.updateLastAccessedAt({
      membershipId: membership.id,
      lastAccessedAt: anonymizedMembershipLastAccessedAt,
    });
  }

  // Disable Memberships
  await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId: anonymizedByUserId });
}

async function _anonymizeCertificationCenterMemberships(
  certificationCenterMembershipRepository,
  userId,
  anonymizedByUserId,
) {
  const userCertificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(userId);

  for (const certificationCenterMembership of userCertificationCenterMemberships) {
    const anonymizedCertificationCenterMembershipLastAccessedAt = anonymizeGeneralizeDate(
      certificationCenterMembership.lastAccessedAt,
    );
    await certificationCenterMembershipRepository.updateLastAccessedAt({
      certificationCenterMembershipId: certificationCenterMembership.id,
      lastAccessedAt: anonymizedCertificationCenterMembershipLastAccessedAt,
    });
  }

  await certificationCenterMembershipRepository.disableMembershipsByUserId({
    updatedByUserId: anonymizedByUserId,
    userId,
  });
}

async function _anonymizeLastUserApplicationConnections(lastUserApplicationConnectionsRepository, userId) {
  const lastUserApplicationConnections = await lastUserApplicationConnectionsRepository.findByUserId(userId);

  for (const lastUserApplicationConnection of lastUserApplicationConnections) {
    const anonymized = lastUserApplicationConnection.anonymize();
    await lastUserApplicationConnectionsRepository.upsert(anonymized);
  }
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

async function _anonymizeOrganizationLearner({ userId, learnersApiRepository }) {
  await learnersApiRepository.anonymizeByUserId({ userId });
}

export { anonymizeUser };
