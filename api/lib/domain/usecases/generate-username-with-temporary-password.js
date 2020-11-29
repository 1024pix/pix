const isEmpty = require('lodash/isEmpty');
const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../errors');

module.exports = async function generateUsernameWithTemporaryPassword({
  schoolingRegistrationId,
  organizationId,
  passwordGenerator,
  encryptionService,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  userRepository,
  schoolingRegistrationRepository,
}) {

  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
  _checkIfStudentHasAccessToOrganization(schoolingRegistration, organizationId);

  const studentAccount = await userRepository.get(schoolingRegistration.userId);
  _checkIfStudentAccountAlreadyHasUsername(studentAccount);

  const username = await userReconciliationService.createUsernameByUser({
    user: schoolingRegistration,
    userRepository,
  });

  const hasStudentAccountAnIdentityProviderPIX = await authenticationMethodRepository.hasIdentityProviderPIX({
    userId: studentAccount.id,
  });

  if (hasStudentAccountAnIdentityProviderPIX) {
    const updatedUser = await userRepository.addUsername(studentAccount.id, username);
    return { username: updatedUser.username };
  } else {
    const generatedPassword = passwordGenerator.generate();
    const hashedPassword = await encryptionService.hashPassword(generatedPassword);

    // and Create Password
    await userService.updateUsernameAndAddPassword({
      userId: studentAccount.id,
      username,
      hashedPassword,
      authenticationMethodRepository,
      userRepository,
    });

    return { username, generatedPassword };
  }
};

function _checkIfStudentHasAccessToOrganization(schoolingRegistration, organizationId) {
  if (schoolingRegistration.organizationId !== organizationId) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(`L'élève avec l'INE ${schoolingRegistration.nationalStudentId} n'appartient pas à l'organisation.`);
  }
}

function _checkIfStudentAccountAlreadyHasUsername(studentAccount) {
  if (!isEmpty(studentAccount.username)) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(`Ce compte utilisateur dispose déjà d'un identifiant: ${studentAccount.username}.`);
  }
}
