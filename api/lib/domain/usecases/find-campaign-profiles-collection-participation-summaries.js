const { UserNotAuthorizedToAccessEntityError } = require('../errors.js');

module.exports = async function findCampaignProfilesCollectionParticipationSummaries({
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
