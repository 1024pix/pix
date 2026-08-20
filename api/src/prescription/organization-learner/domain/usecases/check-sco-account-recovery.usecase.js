import { StudentInformationForAccountRecovery } from '../read-models/StudentInformationForAccountRecovery.js';

const checkScoAccountRecovery = async function ({
  studentInformation,
  organizationLearnerRepository,
  userReconciliationService,
  userRepository,
  organizationRepository,
  scoAccountRecoveryService,
}) {
  const { userId, firstName, lastName, organizationId } = await scoAccountRecoveryService.retrieveOrganizationLearner({
    studentInformation,
    organizationLearnerRepository,
    userReconciliationService,
  });

  const user = await userRepository.get(userId);
  const organization = await organizationRepository.get(organizationId);

  return new StudentInformationForAccountRecovery({
    firstName,
    lastName,
    username: user.username,
    email: user.email,
    latestOrganizationName: organization.name,
  });
};

export { checkScoAccountRecovery };
