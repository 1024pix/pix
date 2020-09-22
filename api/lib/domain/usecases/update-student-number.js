const _ = require('lodash');
const { AlreadyExistingEntity } = require('../../domain/errors');

module.exports = async function updateStudentNumber({
  schoolingRegistrationId,
  studentNumber,
  organizationId,
  schoolingRegistrationRepository,
}) {
  const foundHigherSchoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId, studentNumber });

  if (_.isEmpty(foundHigherSchoolingRegistrations)) {
    await schoolingRegistrationRepository.updateStudentNumber(schoolingRegistrationId, studentNumber);
  } else {
    const errorMessage = `Le numéro étudiant saisi est déjà utilisé par l’étudiant ${foundHigherSchoolingRegistrations[0].firstName} ${foundHigherSchoolingRegistrations[0].lastName}.`;
    throw new AlreadyExistingEntity(errorMessage);
  }
};

