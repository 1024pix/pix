import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { anonymizeGeneralizeDate } from '../../../../shared/infrastructure/utils/date-utils.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.anonymizedByUserId
 * @param{string} params.client
 * @param{UserRepository} params.userRepository
 * @param{CertificationCenterMembershipRepository} params.certificationCenterMembershipRepository
 * @param{ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param{UserLoginRepository} params.userLoginRepository
 * @returns {Promise<void>}
 */
export const anonymizeUser = async function ({
  userId,
  anonymizedByUserId,
  userRepository,
  certificationCenterMembershipRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
}) {
  await DomainTransaction.execute(async () => {
    const user = await userRepository.get(userId);

    if (user.email) {
      await resetPasswordDemandRepository.removeAllByEmail(user.email);
    }

    await _anonymizeCertificationCenterMemberships(certificationCenterMembershipRepository, userId, anonymizedByUserId);

    await _anonymizeUserLogin({ userId, userLoginRepository });

    await _anonymizeUser({ userId, anonymizedByUserId, userRepository });
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

async function _anonymizeUserLogin({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  if (!userLogin) return;

  const anonymizedUserLogin = userLogin.anonymize();

  await userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
}

async function _anonymizeUser({ userId, anonymizedByUserId, userRepository }) {
  const user = await userRepository.get(userId);

  const anonymizedUser = user.anonymize(anonymizedByUserId).mapToDatabaseDto();

  await userRepository.updateUserDetailsForAdministration(
    { id: user.id, userAttributes: anonymizedUser },
    { preventUpdatedAt: true },
  );
}
