const { NotFoundError } = require('../../domain/errors');

module.exports = async function retrieveCampaignInformation({
  code,
  campaignRepository,
  organizationRepository,
}) {
  const foundCampaign = await campaignRepository.getByCode(code);
  if (foundCampaign === null) {
    throw new NotFoundError(`Campaign with code ${code} not found`);
  }

  const organizationId = foundCampaign.organizationId;
  const foundOrganization = await organizationRepository.get(organizationId);
  foundCampaign.organizationLogoUrl = foundOrganization.logoUrl;
  foundCampaign.organizationName = foundOrganization.name;

  if (foundOrganization.isManagingStudents) {
    foundCampaign.isRestricted = true;
  }

  return foundCampaign;
};
