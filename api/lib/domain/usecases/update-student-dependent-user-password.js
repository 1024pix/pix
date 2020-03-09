const _ = require('lodash');

const { UserNotAuthorizedToUpdateStudentPasswordError } = require('../errors');

module.exports = async function updateStudentDependentUserPassword({
  userId, organizationId, studentId, password,
  encryptionService,
  userRepository, studentRepository
}) {

  const userWithMemberships = await userRepository.getWithMemberships(userId);
  const student = await studentRepository.get(studentId);

  if (!userWithMemberships.hasAccessToOrganization(organizationId) || student.organizationId !== organizationId) {
    throw new UserNotAuthorizedToUpdateStudentPasswordError(`Cet Utilisateur ${student.userId} ne peut pas modifier le mot de passe de l'éleve car il n'appartient pas à l'organisation ${organizationId}`);
  }

  const userStudent = await userRepository.get(student.userId);
  if (_.isEmpty(userStudent.username) && _.isEmpty(userStudent.email)) {
    throw new UserNotAuthorizedToUpdateStudentPasswordError(`Cet utilisateur ${student.userId} ne peut pas modifier le mot de passe car il ne dipose pas d'username ni d'email!`);
  }

  const hashedPassword = await encryptionService.hashPassword(password);

  return userRepository.updatePassword(student.userId, hashedPassword);
};
