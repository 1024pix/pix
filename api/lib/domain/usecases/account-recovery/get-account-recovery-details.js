module.exports = async function getAccountRecoveryDetails({
  temporaryKey,
  accountRecoveryDemandRepository,
  schoolingRegistrationRepository,
  userRepository,
  scoAccountRecoveryService,
}) {
  const { id, newEmail, schoolingRegistrationId } =
    await scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });

  const { firstName } = await schoolingRegistrationRepository.get(schoolingRegistrationId);

  return {
    id,
    email: newEmail,
    firstName,
  };
};
