const { NotFoundError } = require('../../domain/errors');

module.exports = async function addOrganizationLogoToCampaign({
  campaign,
  organizationRepository
}) {
  const organizationId = campaign.organizationId;
  const foundOrganization = await organizationRepository.get(organizationId);
  if (foundOrganization === null) {
    return Promise.reject(new NotFoundError(`Organization ${organizationId} not found`));
  }
  campaign.organizationLogoUrl = foundOrganization.logoUrl;
  return campaign;
};
