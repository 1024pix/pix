const { UserNotAuthorizedToUpdateCampaignError } = require('../errors');

module.exports = async function unarchiveCampaign({ campaignId, userId, campaignRepository }) {
  const isUserCampaignAdmin = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!isUserCampaignAdmin) {
    throw new UserNotAuthorizedToUpdateCampaignError();
  }

  return campaignRepository.update({ id: campaignId, archivedAt: null, archivedBy: null });
};
