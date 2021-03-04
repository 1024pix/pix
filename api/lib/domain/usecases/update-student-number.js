const isEmpty = require('lodash/isEmpty');

const { AlreadyExistingEntityError } = require('../../domain/errors');

module.exports = async function updateStudentNumber({
  schoolingRegistrationId,
  studentNumber,
  organizationId,
  higherSchoolingRegistrationRepository,
}) {
  const foundHigherSchoolingRegistrations = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({
    organizationId,
    studentNumber,
  });

  if (isEmpty(foundHigherSchoolingRegistrations)) {
    await higherSchoolingRegistrationRepository.updateStudentNumber(schoolingRegistrationId, studentNumber);
  } else {
    const errorMessage = 'STUDENT_NUMBER_EXISTS';
    throw new AlreadyExistingEntityError(errorMessage);
  }
};
