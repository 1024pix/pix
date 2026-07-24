import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../shared/domain/errors.js';

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

  await resetPasswordService.invalidateResetPasswordDemand(user.email, temporaryKey, resetPasswordDemandRepository);

  const hashedPassword = await cryptoService.hashPassword(password);
  await authenticationMethodRepository.updatePassword({
    userId: user.id,
    hashedPassword,
  });

  await resetPasswordService.invalidateAllResetPasswordDemandsByEmail(user.email, resetPasswordDemandRepository);

  await userRepository.updateEmailConfirmed(userId);
});
