import { UserNotAuthorizedToAccessEntityError } from '../../../src/shared/domain/errors.js';

const getCampaignParticipationsCountsByStatus = async function ({
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
};

export { getCampaignParticipationsCountsByStatus };
