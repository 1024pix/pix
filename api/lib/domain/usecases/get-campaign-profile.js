const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getCampaignProfile({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignProfileRepository,
  locale,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }

  return campaignProfileRepository.findProfile({ campaignId, campaignParticipationId, locale });
};
