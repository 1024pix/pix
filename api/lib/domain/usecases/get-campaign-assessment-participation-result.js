import { UserNotAuthorizedToAccessEntityError } from '../errors';

export default async function getCampaignAssessmentParticipationResult({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignAssessmentParticipationResultRepository,
  locale,
} = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  return campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
    campaignId,
    campaignParticipationId,
    locale,
  });
}
