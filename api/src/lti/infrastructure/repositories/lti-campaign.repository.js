import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { LtiCampaign } from '../../domain/models/LtiCampaign.js';

export const ltiCampaignRepository = {
  async getLtiCampaigns({ organizationIds, campaignsApi, combinedCourseApi }) {
    const campaigns = await campaignsApi.getCampaignOverviews({ organizationIds });

    const combinedCourseIds = (
      await PromiseUtils.mapSeries(
        organizationIds,
        async (organizationId) => await combinedCourseApi.findCombinedCourseIdsByOrganizationId(organizationId),
      )
    ).flat();

    const campaignIdsFromCombinedCourses =
      combinedCourseIds.length > 0 ? await combinedCourseApi.findCampaignIdsByCombinedCourseIds(combinedCourseIds) : [];

    return campaigns
      .filter((campaign) => !campaignIdsFromCombinedCourses.includes(campaign.id))
      .map((campaign) => new LtiCampaign(campaign));
  },
  async getLtiCampaign({ campaignId, campaignsApi }) {
    const campaign = await campaignsApi.getCampaignOverview({ campaignId });
    return campaign ? new LtiCampaign(campaign) : null;
  },
};
