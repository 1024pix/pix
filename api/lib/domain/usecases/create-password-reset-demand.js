module.exports = async function createPasswordResetDemand({
  email,
  locale,
  mailService,
  resetPasswordService,
  authenticationMethodRepository,
  resetPasswordDemandRepository,
  userRepository,
}) {
  const { id: userId } = await userRepository.getByEmail(email);

  const temporaryKey = resetPasswordService.generateTemporaryKey();
  const passwordResetDemand = await resetPasswordDemandRepository.create({ email, temporaryKey });
  await authenticationMethodRepository.updateOnlyShouldChangePassword({
    shouldChangePassword: false,
    userId,
  });

  await mailService.sendResetPasswordDemandEmail(email, locale, temporaryKey);

  return passwordResetDemand;
};
