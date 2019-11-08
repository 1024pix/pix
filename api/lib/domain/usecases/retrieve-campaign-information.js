const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function retrieveCampaignInformation({
  code,
  userId,
  campaignRepository,
  organizationRepository,
  studentRepository,
}) {
  const foundCampaign = await campaignRepository.getByCode(code);
  if (foundCampaign === null) {
    throw new NotFoundError(`Campaign with code ${code} not found`);
  }

  const organizationId = foundCampaign.organizationId;
  const foundOrganization = await organizationRepository.get(organizationId);
  foundCampaign.organizationLogoUrl = foundOrganization.logoUrl;

  if (foundOrganization.isManagingStudents && foundOrganization.type === 'SCO') {
    foundCampaign.isRestricted = true;

    if (userId) {
      const student = await studentRepository.findOneByUserId({ userId });

      if (student && student.organizationId !== organizationId) {
        throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
      }
    }
  }

  return foundCampaign;
};
