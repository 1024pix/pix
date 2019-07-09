async function createPasswordResetDemand({
  email,
  passwordResetService,
  mailService,
  passwordResetDemandRepository,
  userRepository,
  settings,
}) {
  const user = await userRepository.findByEmail(email);
  const temporaryKey = passwordResetService.generateTemporaryKey(user.id);
  const passwordResetDemandUrl = `http://${settings.app.domain}`;

  const [passwordResetDemand] = await Promise.all([
    passwordResetDemandRepository.create({ email, temporaryKey, used: false }),
    mailService.sendPasswordResetDemandEmail(email, temporaryKey, passwordResetDemandUrl),
  ]);

  return passwordResetDemand;
}

module.exports = createPasswordResetDemand;
