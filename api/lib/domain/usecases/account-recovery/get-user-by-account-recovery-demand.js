module.exports = async function getUserByAccountRecoveryDemand({
  temporaryKey,
  accountRecoveryDemandRepository,
  schoolingRegistrationRepository,
  userRepository,
}) {
  const accountRecoveryDemand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  const schoolingRegistration = await schoolingRegistrationRepository.get(accountRecoveryDemand.schoolingRegistrationId);
  const foundUser = await userRepository.get(accountRecoveryDemand.userId);

  foundUser.email = accountRecoveryDemand.newEmail;
  foundUser.firstName = schoolingRegistration.firstName;

  return foundUser;
};
