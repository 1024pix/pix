const _ = require('lodash');
const { AlreadyExistingEntity } = require('../../domain/errors');

module.exports = async function updateStudentNumber({
  schoolingRegistrationRepository,
  student,
  organizationId,
}) {
  const { id, studentNumber } = student;

  const [schoolingRegistration] = await schoolingRegistrationRepository.findOneByOrganizationIdAndStudentNumber(organizationId, studentNumber);

  if (_.isEmpty(schoolingRegistration)) {
    await schoolingRegistrationRepository.updateStudentNumber(id, studentNumber);
  } else {
    const errorMessage = `Le numéro étudiant saisi est déjà utilisé par l’étudiant ${schoolingRegistration.firstName} ${schoolingRegistration.lastName}.`;
    throw new AlreadyExistingEntity(errorMessage);
  }
};

