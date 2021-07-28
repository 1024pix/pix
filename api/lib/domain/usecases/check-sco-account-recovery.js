const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  accountRecoveryDemandRepository,
  userRepository,
  checkScoAccountRecoveryService,
  userReconciliationService,
}) {

  const {
    firstName,
    lastName,
    username,
    organizationId,
    email,
  } = await checkScoAccountRecoveryService.retrieveSchoolingRegistration({
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
