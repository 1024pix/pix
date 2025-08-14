import * as injectedCampaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
const findCampaignProfilesCollectionParticipationSummaries = async function ({
  campaignId,
  page,
  filters,
  campaignProfilesCollectionParticipationSummaryRepository = injectedCampaignProfilesCollectionParticipationSummaryRepository,
} = {}) {
  return campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId, page, filters);
};

export { findCampaignProfilesCollectionParticipationSummaries };
