const {
  UserNotAuthorizedToUpdateCampaignError,
} = require('../errors');

module.exports = async function archiveCampaign({
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

  return campaignRepository.update({ id: campaignId, archivedAt: new Date() });
};
