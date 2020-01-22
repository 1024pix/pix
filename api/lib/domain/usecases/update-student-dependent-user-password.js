const _ = require('lodash');

const { UserNotAuthorizedToUpdateStudentPasswordError, DomainError } = require('../errors');

module.exports = async function updateStudentDependentUserPassword({
  userId, organizationId, studentId, password,
  encryptionService,
  userRepository, studentRepository
}) {

  const userWithMemberships = await userRepository.getWithMemberships(userId);
  const student = await studentRepository.get(studentId);

  if (!userWithMemberships.hasAccessToOrganization(organizationId) || student.organizationId !== organizationId) {
    throw new UserNotAuthorizedToUpdateStudentPasswordError();
  }

  const userStudent = await userRepository.get(student.userId);
  if (_.isEmpty(userStudent.username)) {
    throw new DomainError(`User student with ID ${student.userId} have not username !`);
  }

  const hashedPassword = await encryptionService.hashPassword(password);

  return userRepository.updatePassword(student.userId, hashedPassword);
};
