import { LtiCampaign } from '../../domain/models/LtiCampaign.js';

export const ltiCampaignRepository = {
  async getLtiCampaigns({ organizationIds, campaignsApi }) {
    const campaigns = await campaignsApi.getCampaignOverviews({ organizationIds });

    return campaigns.map((campaign) => new LtiCampaign(campaign));
  },
};
