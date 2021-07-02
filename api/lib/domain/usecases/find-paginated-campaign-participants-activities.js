const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function findPaginatedCampaignParticipantsActivities({
  userId,
  campaignId,
  page,
  campaignRepository,
  campaignParticipantActivityRepository,
}) {

  await _checkUserAccessToCampaign(campaignId, userId, campaignRepository);

  return campaignParticipantActivityRepository.findPaginatedByCampaignId({ page, campaignId });
};

async function _checkUserAccessToCampaign(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }
}
