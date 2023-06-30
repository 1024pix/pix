import { UserNotAuthorizedToAccessEntityError } from '../../../src/shared/domain/errors.js';

const findCampaignProfilesCollectionParticipationSummaries = async function ({
  userId,
  campaignId,
  page,
  filters,
  campaignRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }
  return campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId, page, filters);
};

export { findCampaignProfilesCollectionParticipationSummaries };
