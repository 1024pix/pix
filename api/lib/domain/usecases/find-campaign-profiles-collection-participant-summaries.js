const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignProfilesCollectionParticipantSummaries({
  userId,
  campaignId,
  campaignRepository,
  campaignProfilesCollectionParticipantSummaryRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  return campaignProfilesCollectionParticipantSummaryRepository.findByCampaignId(campaignId);
};
