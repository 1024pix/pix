const _ = require('lodash');
const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../errors');

module.exports = async function generateUsernameWithTemporaryPassword({
  schoolingRegistrationId,
  organizationId,
  passwordGenerator,
  encryptionService,
  userReconciliationService,
  userRepository,
  schoolingRegistrationRepository,
}) {

  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
  _checkIfStudentHasAccessToOrganization(schoolingRegistration, organizationId);

  const studentAccount = await userRepository.get(schoolingRegistration.userId);
  _checkIfStudentAccountAlreadyHasUsername(studentAccount);

  const username = await userReconciliationService.createUsernameByUser({ user: schoolingRegistration , userRepository });

  if (studentAccount.password) {
    const updatedUser = await userRepository.addUsername(studentAccount.id, username);
    return { username: updatedUser.username };
  } else {
    const generatedPassword = passwordGenerator.generate();
    const hashedPassword = await encryptionService.hashPassword(generatedPassword);

    await userRepository.updateUsernameAndPassword(studentAccount.id, username, hashedPassword);
    return { username, generatedPassword };
  }

};

function _checkIfStudentHasAccessToOrganization(schoolingRegistration, organizationId) {
  if (schoolingRegistration.organizationId !== organizationId) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(`L'élève avec l'INE ${schoolingRegistration.nationalStudentId} n'appartient pas à l'organisation.`);
  }
}

function _checkIfStudentAccountAlreadyHasUsername(studentAccount) {
  if (!_.isEmpty(studentAccount.username)) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(`Ce compte utilisateur dispose déjà d'un identifiant: ${studentAccount.username}.`);
  }
}
