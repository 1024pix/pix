module.exports = async function updateUserPassword({
  userId,
  password,
  temporaryKey,
  encryptionService,
  resetPasswordService,
  userRepository,
}) {

  const hashedPassword = await encryptionService.hashPassword(password);
  const user = (await userRepository.findUserById(userId)).toJSON();

  await resetPasswordService.hasUserAPasswordResetDemandInProgress(user.email, temporaryKey);
  await userRepository.updatePassword(user.id, hashedPassword);
  return resetPasswordService.invalidOldResetPasswordDemand(user.email);
};
