const { UserHasAlreadyLeftSCO } = require('../../errors');

module.exports = async function getAccountRecoveryDetails({
  temporaryKey,
  accountRecoveryDemandRepository,
  schoolingRegistrationRepository,
}) {
  const accountRecoveryDemand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  const schoolingRegistration = await schoolingRegistrationRepository.get(accountRecoveryDemand.schoolingRegistrationId);

  const accountRecoveryDemands = await accountRecoveryDemandRepository.findByUserId(schoolingRegistration.userId);

  if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
    throw new UserHasAlreadyLeftSCO();
  }

  return {
    id: accountRecoveryDemand.id,
    email: accountRecoveryDemand.newEmail,
    firstName: schoolingRegistration.firstName,
  };
};
