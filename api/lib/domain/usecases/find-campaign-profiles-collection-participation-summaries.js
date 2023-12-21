const findCampaignProfilesCollectionParticipationSummaries = async function ({
  campaignId,
  page,
  filters,
  campaignProfilesCollectionParticipationSummaryRepository,
}) {
  return campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId, page, filters);
};

export { findCampaignProfilesCollectionParticipationSummaries };
