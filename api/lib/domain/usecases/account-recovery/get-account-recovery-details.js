const getAccountRecoveryDetails = async function ({
  temporaryKey,
  accountRecoveryDemandRepository,
  organizationLearnerRepository,
  userRepository,
  scoAccountRecoveryService,
}) {
  const { id, newEmail, organizationLearnerId } =
    await scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });

  const { firstName } = await organizationLearnerRepository.get(organizationLearnerId);

  return {
    id,
    email: newEmail,
    firstName,
  };
};

export { getAccountRecoveryDetails };
