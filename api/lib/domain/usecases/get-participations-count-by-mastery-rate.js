import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

const getParticipationsCountByMasteryRate = async function ({
  campaignId,
  userId,
  campaignParticipationsStatsRepository,
  campaignRepository,
}) {
  await _checkUserPermission(campaignId, userId, campaignRepository);
  return campaignParticipationsStatsRepository.countParticipationsByMasteryRate({ campaignId });
};

export { getParticipationsCountByMasteryRate };

async function _checkUserPermission(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
