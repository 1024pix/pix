const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignProfile({ userId, campaignId, campaignParticipationId, campaignRepository, campaignProfileRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }

  return campaignProfileRepository.findProfile(campaignId, campaignParticipationId);
};
