const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../errors');
const _ = require('lodash');

async function retrieveSchoolingRegistration({
  studentInformation,
  schoolingRegistrationRepository,
  userRepository,
}) {

  const { id, userId, firstName, lastName, organizationId } = await schoolingRegistrationRepository.getSchoolingRegistrationInformation({
    ...studentInformation,
    nationalStudentId: studentInformation.ineIna,
  });
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_.uniqBy(schoolingRegistrations, 'nationalStudentId').length > 1) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }

  const { username, email } = await userRepository.get(userId);

  return { id, userId, firstName, lastName, username, organizationId, email };
}

module.exports = {
  retrieveSchoolingRegistration,
};
