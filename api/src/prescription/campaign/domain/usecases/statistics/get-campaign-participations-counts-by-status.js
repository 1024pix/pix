import { UserNotAuthorizedToAccessEntityError } from '../../../../../../lib/domain/errors.js';

const getCampaignParticipationsCountsByStatus = async function ({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationsStatsRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaign = await campaignRepository.get(campaignId);

  return campaignParticipationsStatsRepository.countParticipationsByStatus(campaignId, campaign.type);
};

export { getCampaignParticipationsCountsByStatus };
