import { LtiCampaign } from '../../domain/models/LtiCampaign.js';

export const ltiCampaignRepository = {
  async getLtiCampaigns({ organizationIds, campaignsApi }) {
    const campaigns = await campaignsApi.getCampaignOverviews({ organizationIds });

    return campaigns.map((campaign) => new LtiCampaign(campaign));
  },
  async getLtiCampaign({ campaignId, campaignsApi }) {
    const campaign = await campaignsApi.getCampaignOverview({ campaignId });
    return campaign ? new LtiCampaign(campaign) : null;
  },
};
