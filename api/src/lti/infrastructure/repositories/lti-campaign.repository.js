import { LtiCampaign } from '../../domain/models/LtiCampaign.js';

export const ltiCampaignRepository = {
  async getLtiCampaigns({ organizationIds, campaignsApi }) {
    const campaigns = await campaignsApi.getLtiCampaigns({ organizationIds });

    return campaigns.map((campaign) => new LtiCampaign(campaign));
  },
};
