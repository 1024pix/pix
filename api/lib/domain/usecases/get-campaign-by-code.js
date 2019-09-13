const { NotFoundError, InternalError } = require('../../domain/errors');

module.exports = async function getCampaignByCode({
  code,
  campaignRepository,
  organizationRepository
}) {
  const foundCampaign = await campaignRepository.getByCode(code);
  if (foundCampaign === null) {
    return Promise.reject(new NotFoundError(`Campaign with code ${code} not found`));
  }

  const organizationId = foundCampaign.organizationId;
  const foundOrganization = await organizationRepository.get(organizationId);
  if (foundOrganization === null) {
    return Promise.reject(new InternalError(`Organization ${organizationId} not found`));
  }

  foundCampaign.organizationLogoUrl = foundOrganization.logoUrl;
  return foundCampaign;
};
