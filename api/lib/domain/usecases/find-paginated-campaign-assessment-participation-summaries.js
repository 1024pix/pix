const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function findPaginatedCampaignAssessmentParticipationSummaries({
  userId,
  campaignId,
  page,
  filters,
  campaignRepository,
  campaignAssessmentParticipationSummaryRepository,
  badgeAcquisitionRepository,
  targetProfileWithLearningContentRepository,
}) {

  await _checkUserAccessToCampaign(campaignId, userId, campaignRepository);

  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  filters.validatedSkillBoundaries = targetProfile.getSkillsCountBoundariesFromStages(filters.stages);

  const paginatedParticipations = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ page, campaignId, filters });

  const campaignParticipationsIds = paginatedParticipations.campaignAssessmentParticipationSummaries.map((participation) => participation.campaignParticipationId);
  const acquiredBadgesByCampaignParticipations = await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });
  paginatedParticipations.campaignAssessmentParticipationSummaries.forEach((participation) => {
    const badges = acquiredBadgesByCampaignParticipations[participation.campaignParticipationId];
    participation.setBadges(badges);
  });

  return paginatedParticipations;
};

async function _checkUserAccessToCampaign(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }
}
