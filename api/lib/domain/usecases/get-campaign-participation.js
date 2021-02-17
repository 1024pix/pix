const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getCampaignParticipation({
  campaignParticipationId,
  campaignParticipationRepository,
  campaignRepository,
  options,
  userId,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, options);

  const userIsCampaignOrganizationMember = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignParticipation.campaignId, userId);

  if (userId === campaignParticipation.userId || userIsCampaignOrganizationMember) {
    return campaignParticipation;
  }

  throw new UserNotAuthorizedToAccessEntityError('User does not have access to campaign participation');
};
