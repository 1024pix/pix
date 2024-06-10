import { UserNotAuthorizedToUpdatePasswordError } from '../../../src/shared/domain/errors.js';

const updateUserPassword = async function ({
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

  return updatedUser;
};

export { updateUserPassword };
