const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  accountRecoveryDemandRepository,
  userRepository,
  scoAccountRecoveryService,
  userReconciliationService,
}) {
  const { firstName, lastName, username, organizationId, email } =
    await scoAccountRecoveryService.retrieveSchoolingRegistration({
      studentInformation,
      accountRecoveryDemandRepository,
      schoolingRegistrationRepository,
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
