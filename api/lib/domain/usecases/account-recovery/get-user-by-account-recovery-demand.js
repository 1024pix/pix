module.exports = async function getUserByAccountRecoveryDemand({
  temporaryKey,
  accountRecoveryDemandRepository,
  userRepository,
}) {
  const accountRecoveryDemand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  const foundUser = await userRepository.get(accountRecoveryDemand.userId);
  foundUser.email = accountRecoveryDemand.newEmail;
  return foundUser;
};
