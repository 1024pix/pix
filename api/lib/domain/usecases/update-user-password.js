const { UserNotAuthorizedToUpdatePasswordError } = require('../errors.js');

module.exports = async function updateUserPassword({
  userId,
  password,
  temporaryKey,
  encryptionService,
  resetPasswordService,
  authenticationMethodRepository,
  userRepository,
}) {
  const hashedPassword = await encryptionService.hashPassword(password);
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
