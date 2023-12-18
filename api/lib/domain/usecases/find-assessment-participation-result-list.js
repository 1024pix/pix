import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

async function findAssessmentParticipationResultList({
  userId,
  campaignId,
  filters,
  page,
  campaignAssessmentParticipationResultListRepository,
  campaignRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }
  return campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({ campaignId, filters, page });
}

export { findAssessmentParticipationResultList };
