const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../domain/errors');
const _ = require('lodash');
const StudentInformationForAccountRecovery = require('../read-models/StudentInformationForAccountRecovery');

module.exports = async function checkScoAccountRecovery({
  studentInformation,
  schoolingRegistrationRepository,
  organizationRepository,
  userRepository,
}) {
  const userId = await schoolingRegistrationRepository
    .getUserIdByNationalStudentIdFirstNameLastNameAndBirthdate({
      nationalStudentId: studentInformation.ineIna,
      firstName: studentInformation.firstName,
      lastName: studentInformation.lastName,
      birthdate: studentInformation.birthdate,
    });
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_areThereMultipleStudentForSameAccount(schoolingRegistrations)) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }

  const latestOrganizationId = _getLatestOrganization(schoolingRegistrations);
  const organization = await organizationRepository.get(latestOrganizationId);
  const user = await userRepository.get(userId);

  return new StudentInformationForAccountRecovery({
    firstName: user.firstName,
    lastName: user.lastName,
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

function _getLatestOrganization(schoolingRegistrations) {
  const latestSchoolingRegistration = _(schoolingRegistrations)
    .sortBy('updatedAt')
    .reverse()
    .first();
  return latestSchoolingRegistration.organizationId;
}
