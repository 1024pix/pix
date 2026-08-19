import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.anonymizedByUserId
 * @param{string} params.client
 * @param{UserRepository} params.userRepository
 * @param{ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param{UserLoginRepository} params.userLoginRepository
 * @returns {Promise<void>}
 */
export const anonymizeUser = async function ({
  userId,
  anonymizedByUserId,
  userRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
}) {
  await DomainTransaction.execute(async () => {
    const user = await userRepository.get(userId);

    if (user.email) {
      await resetPasswordDemandRepository.removeAllByEmail(user.email);
    }

    await _anonymizeUserLogin({ userId, userLoginRepository });

    await _anonymizeUser({ userId, anonymizedByUserId, userRepository });
  });
};

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
