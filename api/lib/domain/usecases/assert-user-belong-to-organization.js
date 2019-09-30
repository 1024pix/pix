const { UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function assertUserBelongToOrganization({
  userId,
  campaign,
  organizationRepository,
  studentRepository,
  userRepository,
}) {
  let user;
  const organizationId = campaign.organizationId;

  const foundOrganization = await organizationRepository.get(organizationId);

  if (foundOrganization.isManagingStudents) {
    user = await userRepository.get(userId);
    const userIsPartOfOrganizationStudentList = await studentRepository.checkIfUserIsPartOfStudentListInOrganization({ user, organizationId });

    if (!userIsPartOfOrganizationStudentList) {
      return Promise.reject(new UserNotAuthorizedToAccessEntity('User is not part of the organization student list'));
    }
  }
  return Promise.resolve();
};
