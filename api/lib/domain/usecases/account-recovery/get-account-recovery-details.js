module.exports = async function getAccountRecoveryDetails({
  temporaryKey,
  accountRecoveryDemandRepository,
  schoolingRegistrationRepository,
}) {
  const accountRecoveryDemand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  const schoolingRegistration = await schoolingRegistrationRepository.get(accountRecoveryDemand.schoolingRegistrationId);

  return {
    id: accountRecoveryDemand.id,
    email: accountRecoveryDemand.newEmail,
    firstName: schoolingRegistration.firstName,
  };
};
