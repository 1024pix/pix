const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findPaginatedCampaignAssessmentParticipationSummaries({
  userId,
  campaignId,
  page,
  campaignRepository,
  campaignAssessmentParticipationSummaryRepository,
}) {

  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  const campaignAssessmentParticipationSummariesWithPagination = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ page, campaignId });

  return campaignAssessmentParticipationSummariesWithPagination;
};
