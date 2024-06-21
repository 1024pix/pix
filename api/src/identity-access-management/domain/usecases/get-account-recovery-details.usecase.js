/**
 * @param {{
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   organizationLearnerRepository: OrganizationLearnerRepository,
 *   userRepository: UserRepository,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 * }} params
 * @return {Promise<{firstName: string, id: string, email: string}>}
 */
export const getAccountRecoveryDetails = async function ({
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
