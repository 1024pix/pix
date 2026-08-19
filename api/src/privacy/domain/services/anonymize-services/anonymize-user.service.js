import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { anonymizeGeneralizeDate } from '../../../../shared/infrastructure/utils/date-utils.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.anonymizedByUserId
 * @param{string} params.client
 * @param{UserRepository} params.userRepository
 * @param{CertificationCenterMembershipRepository} params.certificationCenterMembershipRepository
 * @param{LastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository
 * @param{ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param{UserLoginRepository} params.userLoginRepository
 * @returns {Promise<void>}
 */
export const anonymizeUser = async function ({
  userId,
  anonymizedByUserId,
  userRepository,
  certificationCenterMembershipRepository,
  lastUserApplicationConnectionsRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
}) {
  await DomainTransaction.execute(async () => {
    const user = await userRepository.get(userId);

    // TODO Check if it's done before, on pre-handlers
    await userRepository.get(anonymizedByUserId);

    if (user.email) {
      await resetPasswordDemandRepository.removeAllByEmail(user.email);
    }

    await _anonymizeLastUserApplicationConnections(lastUserApplicationConnectionsRepository, userId);

    await _anonymizeCertificationCenterMemberships(certificationCenterMembershipRepository, userId, anonymizedByUserId);

    // TODO: Retirer l'appel en double
    await _anonymizeLastUserApplicationConnections(lastUserApplicationConnectionsRepository, userId);

    await _anonymizeUserLogin({ userId, userLoginRepository });

    await _anonymizeUser({ user, anonymizedByUserId, userRepository });
  });
};

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
