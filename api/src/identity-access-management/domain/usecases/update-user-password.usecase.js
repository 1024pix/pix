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
 * }} params
 * @return {Promise<*>}
 * @throws {UserNotAuthorizedToUpdatePasswordError}
 */
export const updateUserPassword = async function ({
  userId,
  password,
  temporaryKey,
  cryptoService,
  resetPasswordService,
  authenticationMethodRepository,
  userRepository,
}) {
  const hashedPassword = await cryptoService.hashPassword(password);
  const user = await userRepository.get(userId);

  if (!user.email) {
    throw new UserNotAuthorizedToUpdatePasswordError();
  }

  await resetPasswordService.hasUserAPasswordResetDemandInProgress(user.email, temporaryKey);

  const updatedUser = await authenticationMethodRepository.updateChangedPassword({
    userId: user.id,
    hashedPassword,
  });
  await resetPasswordService.invalidateOldResetPasswordDemand(user.email);
  user.markEmailAsValid();
  await userRepository.update(user.mapToDatabaseDto());

  return updatedUser;
};
