module.exports = async function updateUserPassword({
  userId,
  password,
  encryptionService,
  resetPasswordService,
  userRepository,
}) {

  const hashedPassword = await encryptionService.hashPassword(password);
  let user = await userRepository.findUserById(userId);
  user = user.toJSON();

  return resetPasswordService
    .hasUserAPasswordResetDemandInProgress(user.email)
    .then(() => userRepository.updatePassword(user.id, hashedPassword))
    .then(() => resetPasswordService.invalidOldResetPasswordDemand(user.email));
};
