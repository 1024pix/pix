const isEmpty = require('lodash/isEmpty');
const { UserNotAuthorizedToGenerateUsernamePasswordError } = require('../errors.js');

module.exports = async function generateUsernameWithTemporaryPassword({
  organizationLearnerId,
  organizationId,
  passwordGenerator,
  encryptionService,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  userRepository,
  organizationLearnerRepository,
}) {
  const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);
  _checkIfStudentHasAccessToOrganization(organizationLearner, organizationId);

  const studentAccount = await userRepository.get(organizationLearner.userId);
  _checkIfStudentAccountAlreadyHasUsername(studentAccount);

  const username = await userReconciliationService.createUsernameByUser({
    user: organizationLearner,
    userRepository,
  });

  const hasStudentAccountAnIdentityProviderPIX = await authenticationMethodRepository.hasIdentityProviderPIX({
    userId: studentAccount.id,
  });

  if (hasStudentAccountAnIdentityProviderPIX) {
    const updatedUser = await userRepository.addUsername(studentAccount.id, username);
    return { username: updatedUser.username };
  } else {
    const generatedPassword = passwordGenerator.generateSimplePassword();
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

function _checkIfStudentHasAccessToOrganization(organizationLearner, organizationId) {
  if (organizationLearner.organizationId !== organizationId) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(
      `L'élève avec l'INE ${organizationLearner.nationalStudentId} n'appartient pas à l'organisation.`
    );
  }
}

function _checkIfStudentAccountAlreadyHasUsername(studentAccount) {
  if (!isEmpty(studentAccount.username)) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(
      `Ce compte utilisateur dispose déjà d'un identifiant: ${studentAccount.username}.`
    );
  }
}
