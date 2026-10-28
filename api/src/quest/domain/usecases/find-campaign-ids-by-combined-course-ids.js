export const findCampaignIdsByCombinedCourseIds = async ({ campaignRepository, combinedCourseIds }) => {
  const campaigns = await campaignRepository.getCampaignsByCombinedCourseIds({ combinedCourseIds });
  return campaigns.map((campaign) => campaign.id);
};
