const { UserNotAuthorizedToAccessEntityError } = require('../errors');
module.exports = async function({ campaignId, userId, campaignParticipationsStatsRepository, campaignRepository }) {
  await _checkUserPermission(campaignId, userId, campaignRepository);
  return campaignParticipationsStatsRepository.countParticipationsByMasteryRate({ campaignId });
};

async function _checkUserPermission(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
