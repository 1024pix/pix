import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

const getCampaignAssessmentParticipationResult = async function ({
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
};

export { getCampaignAssessmentParticipationResult };
