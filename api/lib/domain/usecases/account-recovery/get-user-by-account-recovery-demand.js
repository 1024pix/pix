module.exports = async function getUserByAccountRecoveryDemand({
  temporaryKey,
  accountRecoveryDemandRepository,
  userRepository,
}) {
  const accountRecoveryDemand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  return userRepository.get(accountRecoveryDemand.userId);
};
