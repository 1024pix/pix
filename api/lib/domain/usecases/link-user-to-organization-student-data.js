const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function linkUserToOrganizationStudentData({
  campaignCode,
  user,
  campaignRepository,
  studentRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  const organizationId = campaign.organizationId;

  if (user.id === null) {
    throw new UserNotAuthorizedToAccessEntity('User is not part of the organization student list');
  }

  const studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId = await studentRepository
    .findNotLinkedYetByOrganizationIdAndUserBirthdate({ organizationId, birthdate: user.birthdate });

  if (studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId.length === 0) {
    throw new NotFoundError('Not found only 1 student');
  }

  const matchingStudentId = userReconciliationService.findMatchingPretenderIdForGivenUser(studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId, user);

  if (matchingStudentId === null) {
    throw new NotFoundError('Not found only 1 student');
  }

  return studentRepository.associateUserAndStudent({ userId: user.id, studentId: matchingStudentId });
};
