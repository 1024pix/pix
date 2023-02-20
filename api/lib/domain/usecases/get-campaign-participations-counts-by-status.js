import { UserNotAuthorizedToAccessEntityError } from '../errors';

export default async function getCampaignParticipationsCountsByStatus({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaign = await campaignRepository.get(campaignId);

  return campaignParticipationRepository.countParticipationsByStatus(campaignId, campaign.type);
}
