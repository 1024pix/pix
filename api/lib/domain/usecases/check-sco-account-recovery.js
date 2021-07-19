const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../domain/errors');
const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  userRepository,
}) {
  const { userId, firstName, lastName, organizationId } = await schoolingRegistrationRepository.getSchoolingRegistrationInformation({
    ...studentInformation,
    nationalStudentId: studentInformation.ineIna,
  });
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_areThereMultipleStudentForSameAccount(schoolingRegistrations)) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }

  const { name: latestOrganizationName } = await organizationRepository.get(organizationId);
  const { username, email } = await userRepository.get(userId);

  return new StudentInformationForAccountRecovery({
    firstName,
    lastName,
    username,
    email,
    latestOrganizationName,
  });
};

function _areThereMultipleStudentForSameAccount(schoolingRegistrations) {
  const firstIne = schoolingRegistrations[0].nationalStudentId;
  const anotherStudentForSameAccount = schoolingRegistrations
    .filter((schoolingRegistration) => schoolingRegistration.nationalStudentId !== firstIne);

  return anotherStudentForSameAccount.length > 0;
}
