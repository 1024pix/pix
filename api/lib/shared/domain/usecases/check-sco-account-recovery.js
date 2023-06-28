import { StudentInformationForAccountRecovery } from '../read-models/StudentInformationForAccountRecovery.js';

const checkScoAccountRecovery = async function ({
  studentInformation,
  organizationLearnerRepository,
  organizationRepository,
  accountRecoveryDemandRepository,
  userRepository,
  scoAccountRecoveryService,
  userReconciliationService,
}) {
  const { firstName, lastName, username, organizationId, email } =
    await scoAccountRecoveryService.retrieveOrganizationLearner({
      studentInformation,
      accountRecoveryDemandRepository,
      organizationLearnerRepository,
      userRepository,
      userReconciliationService,
    });

  const { name: latestOrganizationName } = await organizationRepository.get(organizationId);

  return new StudentInformationForAccountRecovery({
    firstName,
    lastName,
    username,
    email,
    latestOrganizationName,
  });
};

export { checkScoAccountRecovery };
