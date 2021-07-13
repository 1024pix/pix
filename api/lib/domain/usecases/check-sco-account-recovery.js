const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../domain/errors');
const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  userRepository,
}) {
  const schoolingRegistrationInformation = await schoolingRegistrationRepository
    .getSchoolingRegistrationInformationByNationalStudentIdFirstNameLastNameAndBirthdate({
      nationalStudentId: studentInformation.ineIna,
      firstName: studentInformation.firstName,
      lastName: studentInformation.lastName,
      birthdate: studentInformation.birthdate,
    });
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId: schoolingRegistrationInformation.userId });

  if (_areThereMultipleStudentForSameAccount(schoolingRegistrations)) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }

  const organization = await organizationRepository.get(schoolingRegistrationInformation.organizationId);
  const user = await userRepository.get(schoolingRegistrationInformation.userId);

  return new StudentInformationForAccountRecovery({
    userId: schoolingRegistrationInformation.userId,
    firstName: schoolingRegistrationInformation.firstName,
    lastName: schoolingRegistrationInformation.lastName,
    username: user.username,
    email: user.email,
    latestOrganizationName: organization.name,
  });
};

function _areThereMultipleStudentForSameAccount(schoolingRegistrations) {
  const firstIne = schoolingRegistrations[0].nationalStudentId;
  const anotherStudentForSameAccount = schoolingRegistrations
    .filter((schoolingRegistration) => schoolingRegistration.nationalStudentId !== firstIne);

  return anotherStudentForSameAccount.length > 0;
}
