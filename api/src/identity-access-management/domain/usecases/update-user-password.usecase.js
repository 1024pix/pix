import { RevokedPasswordCannotBeReusedError } from '../../../identity-access-management/domain/errors.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
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
  temporaryKey,
  password,
  cryptoService,
  resetPasswordService,
  authenticationMethodRepository,
  userRepository,
  resetPasswordDemandRepository,
}) {
  await resetPasswordService.assertTemporaryKey(temporaryKey);

  const { email } = await resetPasswordService.verifyDemand(temporaryKey, resetPasswordDemandRepository);

  const user = await userRepository.getByEmail(email);

  const userId = user.id;
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
    userId,
    hashedPassword,
  });

  await resetPasswordService.invalidateAllResetPasswordDemandsByEmail(email, resetPasswordDemandRepository);

  await userRepository.updateEmailConfirmed(userId);
});
