const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignProfilesCollectionParticipationSummaries({
  userId,
  campaignId,
  campaignRepository,
  CampaignProfilesCollectionParticipationSummaryRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  return CampaignProfilesCollectionParticipationSummaryRepository.findByCampaignId(campaignId);
};
