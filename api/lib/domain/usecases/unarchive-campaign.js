const {
  UserNotAuthorizedToUpdateCampaignError,
} = require('../errors');

module.exports = async function unarchiveCampaign({
  // Parameters
  campaignId,
  userId,
  // Repositories
  campaignRepository,
}) {
  const isUserCampaignAdmin = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!isUserCampaignAdmin) {
    throw new UserNotAuthorizedToUpdateCampaignError();
  }

  return campaignRepository.update({ id: campaignId, archivedAt: null });
};
