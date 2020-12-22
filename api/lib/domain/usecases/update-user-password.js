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

  await resetPasswordService.hasUserAPasswordResetDemandInProgress(user.email, temporaryKey);

  const updatedUser = await authenticationMethodRepository.updateOnlyPassword({
    userId: user.id,
    hashedPassword,
  });
  await resetPasswordService.invalidateOldResetPasswordDemand(user.email);

  return updatedUser;
};
