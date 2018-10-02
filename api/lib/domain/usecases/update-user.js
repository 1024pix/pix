module.exports = async function updateUser({
  userId,
  attributesToUpdate: {
    password,
    cguOrga
  },
  encryptionService,
  passwordResetDemandService,
  userRepository,
}) {
  let attributesToUpdate = {};

  if (password) {
    const hashedPassword = await encryptionService.hashPassword(password);
    let user = await userRepository.findUserById(userId);
    user = user.toJSON();

    return passwordResetDemandService
      .hasUserAPasswordResetDemandInProgress(user.email)
      .then(() => userRepository.updatePassword(user.id, hashedPassword))
      .then(() => passwordResetDemandService.invalidOldResetPasswordDemand(user.email));
  }

  if (cguOrga) {
    attributesToUpdate = { cguOrga };
  }

  return userRepository.updateUser({
    id: userId,
    attributes: attributesToUpdate
  });
};
