import { RevokedPasswordCannotBeReusedError } from '../../../identity-access-management/domain/errors.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

/**
 * @param {{
 *   userId: string,
 *   password: string,
 *   temporaryKey: string,
 *   cryptoService: CryptoService,
 *   resetPasswordService: ResetPasswordService,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   userRepository: UserRepository,
 *   resetPasswordDemandRepository: ResetPasswordDemandRepository,
 * }} params
 * @return {Promise<void>}
 * @throws {UserNotAuthorizedToUpdatePasswordError}
 */
export const updateUserPassword = withTransaction(async function ({
  userId,
  password,
  temporaryKey,
  cryptoService,
  resetPasswordService,
  authenticationMethodRepository,
  userRepository,
  resetPasswordDemandRepository,
}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdatePasswordError();
  }

  await resetPasswordService.assertTemporaryKey(temporaryKey);
  const { email } = await resetPasswordService.verifyDemand(temporaryKey, resetPasswordDemandRepository);
  if (email != user.email) {
    throw new UserNotAuthorizedToUpdatePasswordError();
  }

  const pixAuthenticationComplement =
    await authenticationMethodRepository.getAuthenticationComplementByUserIdAndIdentityProvider({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    });

  if (pixAuthenticationComplement.revokedHashedPassword) {
    const isNewPasswordSameAsRevokedPassword = await cryptoService.matchPassword({
      password,
      passwordHash: pixAuthenticationComplement.revokedHashedPassword,
    });
    if (isNewPasswordSameAsRevokedPassword) {
      throw new RevokedPasswordCannotBeReusedError();
    }
  }

  const hashedPassword = await cryptoService.hashPassword(password);
  await authenticationMethodRepository.updatePassword({
    userId: user.id,
    hashedPassword,
  });

  await resetPasswordService.invalidateAllResetPasswordDemandsByEmail(user.email, resetPasswordDemandRepository);

  await userRepository.updateEmailConfirmed(userId);
});
