import { UserNotAuthorizedToAccessEntityError } from '../errors';

export default async function getCampaignParticipationsActivityByDay({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationsStatsRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  return campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);
}
