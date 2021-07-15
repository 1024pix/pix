const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../domain/errors');
const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  userRepository,
}) {
  const { userId, firstName, lastName, organizationId } = await schoolingRegistrationRepository
    .getSchoolingRegistrationInformationByNationalStudentIdFirstNameLastNameAndBirthdate(studentInformation);
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_areThereMultipleStudentForSameAccount(schoolingRegistrations)) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }

  const { name } = await organizationRepository.get(organizationId);
  const { username, email } = await userRepository.get(userId);

  return new StudentInformationForAccountRecovery({
    firstName,
    lastName,
    username,
    email,
    latestOrganizationName: name,
  });
};

function _areThereMultipleStudentForSameAccount(schoolingRegistrations) {
  const firstIne = schoolingRegistrations[0].nationalStudentId;
  const anotherStudentForSameAccount = schoolingRegistrations
    .filter((schoolingRegistration) => schoolingRegistration.nationalStudentId !== firstIne);

  return anotherStudentForSameAccount.length > 0;
}
