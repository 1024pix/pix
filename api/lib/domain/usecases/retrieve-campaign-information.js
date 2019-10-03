const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function retrieveCampaignInformation({
  code,
  userId,
  campaignRepository,
  organizationRepository,
  studentRepository,
  userRepository,
}) {
  const foundCampaign = await campaignRepository.getByCode(code);
  if (foundCampaign === null) {
    throw new NotFoundError(`Campaign with code ${code} not found`);
  }

  const organizationId = foundCampaign.organizationId;
  const foundOrganization = await organizationRepository.get(organizationId);
  if (foundOrganization === null) {
    throw new NotFoundError(`Organization ${organizationId} not found`);
  }
  foundCampaign.organizationLogoUrl = foundOrganization.logoUrl;

  if (foundOrganization.isManagingStudents) {
    const user = await userRepository.get(userId);
    const userIsPartOfOrganizationStudentList = await studentRepository.checkIfUserIsPartOfStudentListInOrganization({
      user,
      organizationId
    });
    if (!userIsPartOfOrganizationStudentList) {
      throw new UserNotAuthorizedToAccessEntity('User is not part of the organization student list');
    }
  }

  return foundCampaign;
};
