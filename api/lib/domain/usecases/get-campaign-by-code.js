const { NotFoundError, InternalError } = require('../../domain/errors');

module.exports = function getCampaignByCode({ code, campaignRepository, organizationRepository }) {
  let campaign;
  let organizationId;
  return campaignRepository.getByCode(code)
    .then((foundCampaign) => {
      if(foundCampaign === null) {
        return Promise.reject(new NotFoundError(`Campaign with code ${code} not found`));
      }
      campaign = foundCampaign;
      organizationId = campaign.organizationId;
      return organizationRepository.get(organizationId);
    })
    .then((foundOrganization) => {
      if (foundOrganization === null) {
        return Promise.reject(new InternalError(`Organization ${organizationId} not found`));
      }
      campaign.organizationLogoUrl = foundOrganization.logoUrl;
      return campaign;
    });
};
