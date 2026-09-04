import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {function} anonymizeUser
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.updatedByUserId
 * @param {UserRepository} params.userRepository
 * @param {LastUserApplicationConnectionsRepository} params.lastUserApplicationConnectionsRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @param {RefreshTokenRepository} params.refreshTokenRepository
 * @param {ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @return {Promise<void>}
 */
export const anonymizeUser = withTransaction(async function ({
  userId,
  updatedByUserId,
  userRepository,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
  userLoginRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
}) {
  await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({ userId });

  await _anonymizeLastApplicationConnection(lastUserApplicationConnectionsRepository, { userId });

  await _anonymizeUserLogin(userLoginRepository, { userId });
  await _anonymizeUser(userRepository, { userId, updatedByUserId }, resetPasswordDemandRepository);

  await refreshTokenRepository.revokeAllByUserId({ userId });
});

async function _anonymizeUser(userRepository, { userId, updatedByUserId }, resetPasswordDemandRepository) {
  const user = await userRepository.get(userId);

  if (user.email) {
    await resetPasswordDemandRepository.removeAllByEmail(user.email);
  }

  const anonymizedUser = user.anonymize(updatedByUserId).mapToDatabaseDto();

  await userRepository.updateUserDetailsForAdministration(
    { id: user.id, userAttributes: anonymizedUser },
    { preventUpdatedAt: true },
  );
}

async function _anonymizeLastApplicationConnection(lastUserApplicationConnectionsRepository, { userId }) {
  const lastUserApplicationConnections = await lastUserApplicationConnectionsRepository.findByUserId(userId);

  for (const lastUserApplicationConnection of lastUserApplicationConnections) {
    const anonymized = lastUserApplicationConnection.anonymize();
    await lastUserApplicationConnectionsRepository.upsert(anonymized);
  }
}

async function _anonymizeUserLogin(userLoginRepository, { userId }) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  if (!userLogin) return;

  const anonymizedUserLogin = userLogin.anonymize();

  await userLoginRepository.update(anonymizedUserLogin, { preventUpdatedAt: true });
}
