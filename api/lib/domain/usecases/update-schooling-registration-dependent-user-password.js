const _ = require('lodash');
const { UserNotAuthorizedToUpdatePasswordError } = require('../errors');

module.exports = async function updateSchoolingRegistrationDependentUserPassword({
  userId,
  organizationId,
  schoolingRegistrationId,
  passwordGenerator,
  encryptionService,
  userRepository,
  schoolingRegistrationRepository
}) {
  const userWithMemberships = await userRepository.getWithMemberships(userId);
  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);

  if (!userWithMemberships.hasAccessToOrganization(organizationId) || schoolingRegistration.organizationId !== organizationId) {
    throw new UserNotAuthorizedToUpdatePasswordError(`L'utilisateur ${userId} n'est pas autorisé à modifier le mot de passe des élèves de l'organisation ${organizationId} car il n'y appartient pas.`);
  }

  const userStudent = await userRepository.get(schoolingRegistration.userId);
  if (_.isEmpty(userStudent.username) && _.isEmpty(userStudent.email)) {
    throw new UserNotAuthorizedToUpdatePasswordError(`Le changement de mot de passe n'est possible que si l'élève (utilisateur:  ${schoolingRegistration.userId}) utilise les méthodes d'authentification email ou identifiant.`);
  }

  const generatedPassword = passwordGenerator.generate();
  const hashedPassword = await encryptionService.hashPassword(generatedPassword);

  await userRepository.updatePasswordThatShouldBeChanged(userStudent.id, hashedPassword);

  return generatedPassword;
};

