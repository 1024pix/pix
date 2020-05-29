const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignProfilesCollectionParticipationSummaries({
  userId,
  campaignId,
  page,
  campaignRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  return campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId, page);
};
