const { AlreadyExistingEntityError } = require('../../domain/errors');

module.exports = async function updateStudentNumber({
  schoolingRegistrationId,
  studentNumber,
  organizationId,
  higherSchoolingRegistrationRepository,
}) {
  const registration = await higherSchoolingRegistrationRepository.findOneByStudentNumber({
    organizationId,
    studentNumber,
  });

  if (registration) {
    throw new AlreadyExistingEntityError('STUDENT_NUMBER_EXISTS');
  }

  await higherSchoolingRegistrationRepository.updateStudentNumber(schoolingRegistrationId, studentNumber);
};
